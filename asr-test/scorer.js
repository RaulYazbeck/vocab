// TEMPORARY — part of the asr-test/ page (delete the whole folder when testing is done).
//
// "Answer-aware" checking with Whisper: instead of letting the model guess any word,
// ask it how likely the audio is to be each of a few candidate phrases (the expected
// word, its two other-article variants, and a few similar-sounding words) and compare.
//
// Works on top of transformers.js' Whisper ONNX models. The audio is encoded once, the
// fixed prompt (<|startoftranscript|><|de|><|transcribe|><|notimestamps|>) is run once, and its
// cache (which also holds the audio's cross-attention keys/values) is reused for every
// candidate, so each candidate only costs a few decoder tokens.
//
// The same file is imported by the page and by the Node verification script.

export const PROMPT = { sot: 50258, lang_de: 50261, transcribe: 50359, notimestamps: 50363, eot: 50257 };

// log-softmax of one row of a [rows, vocab] logits array
function logSoftmaxRow(data, row, vocab) {
  const off = row * vocab;
  let mx = -Infinity;
  for (let i = 0; i < vocab; i++) { const v = data[off + i]; if (v > mx) mx = v; }
  let s = 0;
  for (let i = 0; i < vocab; i++) s += Math.exp(data[off + i] - mx);
  const lse = mx + Math.log(s), out = new Float32Array(vocab);
  for (let i = 0; i < vocab; i++) out[i] = data[off + i] - lse;
  return out;
}
const logSumExp = a => { const m = Math.max(...a); return m + Math.log(a.reduce((s, x) => s + Math.exp(x - m), 0)); };

export class AnswerScorer {
  /** @param tjs the imported transformers.js module  @param opts {repo, dtype, prompt, progress_callback, device} */
  constructor(tjs, { repo, dtype = "q8", prompt = PROMPT, progress_callback, device } = {}) {
    this.tjs = tjs; this.repo = repo; this.dtype = dtype; this.prompt = prompt; this.progress_callback = progress_callback; this.device = device;
  }

  /** @param featureExtractor optional ready-made WhisperFeatureExtractor (used by the Node test); the page leaves it out */
  async load({ featureExtractor } = {}) {
    const { AutoProcessor, WhisperForConditionalGeneration } = this.tjs;
    const opts = { progress_callback: this.progress_callback };
    this.fe = featureExtractor || (await AutoProcessor.from_pretrained(this.repo, opts)).feature_extractor;   // log-mel front end
    this.model = await WhisperForConditionalGeneration.from_pretrained(this.repo, { ...opts, dtype: this.dtype, ...(this.device ? { device: this.device } : {}) });
    return this;
  }

  // Some newer exports of the merged decoder also take `cache_position`; the standard browser files don't. Supply it only when asked.
  _extra(start, len) {
    const names = this.model.sessions["decoder_model_merged"].inputNames;
    return names.includes("cache_position") ? { cache_position: new this.tjs.Tensor("int64", BigInt64Array.from({ length: len }, (_, i) => BigInt(start + i)), [len]) } : {};
  }

  _ids(arr) { return new this.tjs.Tensor("int64", BigInt64Array.from(arr, x => BigInt(x)), [1, arr.length]); }

  /** audio: Float32Array, mono 16 kHz → encoder hidden states (Tensor) */
  async encode(audio) {
    const { input_features } = await this.fe(audio);
    const out = await this.model.sessions["model"].run({ input_features: input_features.ort_tensor });
    return new this.tjs.Tensor(out.last_hidden_state);
  }

  /** run the fixed prompt once; returns the reusable cache and the log-probs of the first real token */
  async runPrompt(enc) {
    const p = this.prompt, ids = [p.sot, p.lang_de, p.transcribe, p.notimestamps];
    const out = await this.model.forward({ encoder_outputs: enc, decoder_input_ids: this._ids(ids), ...this._extra(0, ids.length) });
    const V = out.logits.dims[2];
    return { past: this.model.getPastKeyValues(out, undefined), firstLP: logSoftmaxRow(out.logits.data, ids.length - 1, V), V, n: ids.length };
  }

  // Build the "next" cache without ever disposing the parent's (siblings in the walk below still need it).
  _nextPast(out, past) {
    const p = Object.create(null);
    for (const name in out) {
      if (!name.startsWith("present")) continue;
      const key = name.replace("present", "past_key_values");
      p[key] = name.includes("encoder") ? past[key] : out[name];     // encoder (audio) keys/values never change
    }
    return p;
  }

  /**
   * log P(form + <eot> | audio, prompt) for many token sequences at once.
   * IMPORTANT: the decoder is fed ONE token per pass. Feeding several new tokens at once with a cache gave wrong scores with the
   * real browser model files (their cached-decoder graph does not mask future tokens; measured on a real iPhone run), while
   * single-token passes are exact. Sequences that share a beginning share the passes (prefix tree).
   */
  async scoreForms(enc, pr, forms) {
    const root = { kids: new Map(), ends: [] };
    forms.forEach((ids, fi) => {
      let n = root;
      for (const t of ids) { if (!n.kids.has(t)) n.kids.set(t, { kids: new Map(), ends: [] }); n = n.kids.get(t); }
      n.ends.push(fi);
    });
    const scores = new Array(forms.length).fill(0), eot = this.prompt.eot; let passes = 0;
    const walk = async (node, past, lp, acc, pos) => {
      for (const fi of node.ends) scores[fi] = acc + lp[eot];
      for (const [t, child] of node.kids) {
        const out = await this.model.forward({ encoder_outputs: enc, decoder_input_ids: this._ids([t]), past_key_values: past, ...this._extra(pos, 1) });
        passes++; if (this.yield) await this.yield();
        const V = out.logits.dims[2];
        await walk(child, this._nextPast(out, past), logSoftmaxRow(out.logits.data, 0, V), acc + lp[t], pos + 1);
      }
    };
    await walk(root, pr.past, pr.firstLP, 0, pr.n);
    this.lastPasses = passes;
    return scores;
  }

  /**
   * audio16k: Float32Array.  cands: [{text, role, forms:[[ids…], …]}].  articleFirst: {der:[idCap,idLow], die:[…], das:[…]}.
   * Returns per-candidate scores (log-sum-exp over its spoken spellings) and the article log-probs of the very first token.
   */
  async scoreAll(audio16k, cands, articleFirst) {
    const t0 = performance.now();
    const enc = await this.encode(audio16k); const t1 = performance.now();
    const pr = await this.runPrompt(enc);
    // one prefix tree over every spelling of every candidate
    const flat = [], where = [];
    cands.forEach((c, ci) => c.forms.forEach((ids, fi) => { flat.push(ids); where.push([ci, fi]); }));
    const sc = await this.scoreForms(enc, pr, flat);
    const res = cands.map(c => ({ text: c.text, role: c.role, formScores: new Array(c.forms.length), score: 0 }));
    where.forEach(([ci, fi], k) => { res[ci].formScores[fi] = sc[k]; });
    res.forEach(r => { r.score = logSumExp(r.formScores); });
    const calls = this.lastPasses;
    const artLP = {};
    if (articleFirst) for (const a of Object.keys(articleFirst)) artLP[a] = logSumExp(articleFirst[a].map(id => pr.firstLP[id]));
    return { cands: res, artLP, calls, encMs: Math.round(t1 - t0), totalMs: Math.round(performance.now() - t0) };
  }
}
