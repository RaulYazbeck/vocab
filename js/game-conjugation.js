// ── GAME: CONJUGATION SLOTS ───────────────────
// Three reels spin — a person, a verb and (German) a tense — and you
// type the form. A line under the reels says what shape the answer
// takes ("auxiliary + Partizip II", "one word"…); typing the pronoun
// too is accepted.
//
// Two sources of spins:
//   • DECK CARDS from the conjugation decks ("sein — ich ___"): as
//     before, a right form gives recall credit on that card.
//   • UNLIMITED (German): any verb of the A1–B1 lists × any person ×
//     Präsens, Präteritum, Perfekt, Plusquamperfekt, Futur I,
//     Konjunktiv II, Imperativ — conjugated by grammar-de.js, which only
//     serves verbs/tenses it reproduced from the decks' own data.
//     These spins never touch word stages, your decks or the plan, and
//     nothing about them is shown as progress — your decks are the one
//     track. Behind the scenes a small record per verb × tense
//     (S.games.vf: level 0–5, last day) steers what comes up: weak and
//     unpractised forms more, solid ones less. A form you miss also
//     comes back later in the same round. "+ all B1 verbs" mixes in
//     verbs you haven't met yet (meaning shown).
//
// Clock: never inside a Today session (bonus) or a Daily / Mix round —
// this is a thinking game. In the Games hub a clock per spin starts at
// 🥈 Silver, sized for reading three reels and typing two words (45 s
// down to 25 s at 💎). From 🥇 Gold, verbs you know show their MEANING
// on the reel ("to be") instead of the infinitive.

const CONJ_DECK_RE = /conj|praet|präter|imparfait|futur|passe|passé|perfekt/i;
const CONJ_RE = /^(.+?)\s+—\s+(.+?)(?:\s+___\s*(.*))?$/;
const _conjCache = new Map();
_gameCacheClearers.push(() => _conjCache.clear());
function conjItem(w) {
  const k = wordKey(w) + "|" + w.en + "|" + w[WORD_KEY];
  if (_conjCache.has(k)) return _conjCache.get(k);
  let res = null;
  if (CONJ_DECK_RE.test(w.deckId || "") && typeof w.en === "string") {
    const m = w.en.match(CONJ_RE);
    const ans = String(w[WORD_KEY] || "").trim();
    if (m && ans && ans.length <= 30) {
      const verb = m[1].trim(), pron = m[2].trim(), tail = (m[3] || "").trim();
      const meaning = String(w.hint || "").replace(/^[^—–]{1,14}\s+[—–]\s+(?=to\s)/i, "").split(/[,—–]/)[0].trim();
      res = { verb, pron, tail, ans, meaning: meaning && meaning.length <= 24 && !/sg\.|pl\./.test(meaning) ? meaning : "" };
    }
  }
  _conjCache.set(k, res);
  return res;
}
function conjWords(pool) { return dedupeWords(pool.filter(w => conjItem(w))); }

// ── The unlimited verb track ──────────────────
const CONJ_TENSE_IDS = () => (typeof TENSES !== "undefined" ? TENSES.map(t => t.id) : []);
function conjTenses() {
  const all = CONJ_TENSE_IDS();
  const on = Array.isArray(S.games.conjTenses) ? S.games.conjTenses.filter(t => all.includes(t)) : all;
  return on.length ? on : all;
}
function conjUnlimitedOn() { return typeof GR_DE !== "undefined" && GR_DE && verbBank().verbs.length >= 4; }
// Inside a Today session (bonus rounds) the machine is a learning tool:
// only verbs you've met, only the tenses of the level you're on —
//   A1: Präsens, Perfekt, Imperativ · A2: + Präteritum, Futur I,
//   Konjunktiv II · B1 and beyond: all of them.
// The Games hub keeps the full machine (all tenses, "+ all B1 verbs").
const CONJ_LEVEL_TENSES = { a1: ["pr", "pf", "im"], a2: ["pr", "pf", "im", "pt", "fu", "k2"] };
function conjLevelTenses() {
  const fg = typeof pathFrontier === "function" ? pathFrontier() : null;
  const all = CONJ_TENSE_IDS();
  const lv = fg && CONJ_LEVEL_TENSES[fg.id];
  return lv ? lv.filter(t => all.includes(t)) : all;
}
function conjRoundTenses(size) {
  if (size !== "bonus") return conjTenses();
  const lv = conjLevelTenses();
  const on = conjTenses().filter(t => lv.includes(t));
  return on.length ? on : lv;
}
// Met verbs that have at least one of these tenses.
function conjMineFor(pool, tenses) { return conjVerbSplit(pool).mine.filter(v => v.tenses.some(t => tenses.includes(t))); }
const CONJ_CARD_TENSE = it => /präteritum/i.test(it.verb) ? "pt" : "pr";
// Verbs you've met (a word record exists for the verb's own card, or it
// is in the game pool) vs the rest of the A1–B1 list.
function conjVerbSplit(pool) {
  const bank = verbBank().verbs;
  const inPool = new Set(pool.map(wordKey));
  const mine = [], extra = [];
  bank.forEach(v => {
    const w = v.word;
    const ws = w ? S.words[w.deckId + "_" + w.idx] : null;
    if (w && (inPool.has(w.deckId + "_" + w.idx) || (ws && ws.st))) mine.push(v); else extra.push(v);
  });
  return { mine, extra };
}
// ── Hidden practice record (steers the spins; never displayed) ──
// S.games.vf[inf] = { l: one digit 0–5 per tense, d: last day, b: tenses
// already moved up that day }. Right: +1 (once a day per tense). Wrong: −1.
function vfRec(inf) {
  const m = S.games.vf || (S.games.vf = {});
  const n = CONJ_TENSE_IDS().length;
  let r = m[inf];
  if (!r || typeof r.l !== "string") r = m[inf] = { l: "0".repeat(n), d: "", b: 0 };
  if (r.l.length < n) r.l = r.l.padEnd(n, "0");
  return r;
}
function vfLevel(inf, tense) { const r = (S.games.vf || {})[inf]; return r ? +(r.l[CONJ_TENSE_IDS().indexOf(tense)] || 0) : 0; }
function vfRecord(inf, tense, ok) {
  const r = vfRec(inf), i = CONJ_TENSE_IDS().indexOf(tense), today = todayISO();
  if (i < 0) return;
  if (r.d !== today) { r.d = today; r.b = 0; }
  let lv = +r.l[i];
  if (ok) { if (!(r.b & (1 << i))) { lv = Math.min(5, lv + 1); r.b |= 1 << i; } }
  else lv = Math.max(0, lv - 1);
  r.l = r.l.slice(0, i) + lv + r.l.slice(i + 1);
}
// Weight of a verb × tense: low levels and forms not practised today weigh more.
function vfWeight(inf, tense) {
  const r = (S.games.vf || {})[inf];
  const lv = vfLevel(inf, tense);
  const today = r && r.d === todayISO();
  return (6 - lv) * (today ? 0.6 : 1.4);
}
// Pick the next unlimited spin: weak / unpractised forms and verbs you
// find hard in your decks come up more.
function conjPickSpin(verbs, tenses, lastInf) {
  if (!verbs || !verbs.length) return null;
  const cands = weightedPickDistinct(verbs.filter(v => v.inf !== lastInf && v.tenses.some(t => tenses.includes(t))), 1, v => {
    const ts = v.tenses.filter(t => tenses.includes(t));
    const w = ts.reduce((s, t) => s + vfWeight(v.inf, t), 0) / Math.max(1, ts.length);
    return w * (v.word ? Math.sqrt(wordWeakness(v.word)) : 1);
  });
  const v = cands[0] || verbs[0];
  return conjSpinFor(v, tenses);
}
function conjSpinFor(v, tenses, notPerson = "") {
  const ts = v.tenses.filter(t => tenses.includes(t));
  const tense = weightedPickDistinct(ts.length ? ts : v.tenses, 1, t => vfWeight(v.inf, t))[0];
  let persons = tense === "im" ? ["du", "ihr", "Sie"] : PERSONS.slice();
  persons = persons.filter(p => verbCell(v.F, tense, p) && p !== notPerson);
  if (!persons.length) return null;
  const person = persons[Math.floor(Math.random() * persons.length)];
  const cell = verbCell(v.F, tense, person);
  return cell ? { v, tense, person, cell } : null;
}

// The ✗ / ✓ buttons of a Say-it spin call in here.
let _conjSayGrade = null;
function conjSayGrade(v) { if (_conjSayGrade) _conjSayGrade(v); }

registerGame({
  id: "conj", name: "Conjugation Slots", icon: "🎰", get skill() { return speakOn() ? "Grammar · verb forms (said)" : "Grammar · verb forms (typed)"; },
  ranks: [
    { clock: 0 }, { clock: 45000 }, { clock: 35000, meaning: true }, { clock: 30000, meaning: true }, { clock: 25000, meaning: true },
  ],
  twists: ["golden", "turbo", "sudden"],
  howTo: () => [(speakOn() ? "Say" : "Type") + (IS_FRENCH_APP ? " the verb form for the person shown" : " the verb form for the person and tense shown") + (speakOn() ? ", then tap Show." : "."),
    ...(IS_FRENCH_APP ? [] : ["Type only the verb part — the pronoun is optional. The line under the reels shows the shape: <em>habe gespielt</em> (Perfekt), <em>werde spielen</em> (Futur), <em>spiel</em> (Imperativ)…"]),
    "In a Today session: verbs you've met, tenses of your level, no clock. In the Games hub: every tense, extra verbs, and a clock per spin from 🥈 Silver."],
  requirement(pool, size) {
    // Today: only with 4 verbs you've met (or 4 deck cards) — never a
    // machine full of verbs you've never seen.
    if (size === "bonus") {
      const on = conjUnlimitedOn(), ts = on ? conjRoundTenses("bonus") : [];
      const n = on ? conjMineFor(pool, ts).length : 0;
      const cards = conjWords(pool).filter(w => !on || ts.includes(CONJ_CARD_TENSE(conjItem(w)))).length;
      return n >= 4 || cards >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 verbs you've met — you have ${Math.max(n, cards)}` };
    }
    if (conjUnlimitedOn()) return { ok: true };
    const n = conjWords(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 verb forms from the conjugation decks — you have ${n}` };
  },
  stars: [90, 150, 200],
  start(ctx) {
    const rp = ctx.rp;
    const unlimited = conjUnlimitedOn();
    const learning = ctx.size === "bonus"; // Today: met verbs, your level's tenses
    const tenses = () => conjRoundTenses(ctx.size);
    const eligible = conjWords(ctx.pool).filter(w => !learning || !unlimited || tenses().includes(CONJ_CARD_TENSE(conjItem(w))));
    const split = !unlimited ? { mine: [], extra: [] } : learning ? { mine: conjMineFor(ctx.pool, tenses()), extra: [] } : conjVerbSplit(ctx.pool);
    // Today with fewer than 4 met verbs (it opened on deck cards): cards only.
    const cardsOnly = !unlimited || (learning && split.mine.length < 4);
    const total = cardsOnly && learning ? Math.min(ctx.rounds(10, 5, 6), eligible.length) : ctx.rounds(10, 5, 6);
    // Deck cards keep their share (and their credit): up to 40% of spins.
    const nCards = cardsOnly ? total : Math.min(eligible.length, Math.round(total * 0.4));
    const cards = sampleWords(eligible, nCards);
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, goal = 0, cur = null, helped = false, spinT = 0, lastInf = "";
    const perSpin = ctx.size === "full" && rp.clock ? rp.clock * ctx.timeScale : 0;
    // Speak, don't spell: say the form, Show, then ✗ / ✓ (say-it.js).
    const sayMode = speakOn();
    let revealed = false, shownAtMs = 0, revealAtMs = 0;
    // Deck cards and verbs you know count toward the daily goal; extra
    // B1 verbs are practice only.
    const done = () => ctx.finish({ score, correct, wrong, maxCombo, typedCorrect: correct, goalCorrect: goal,
      cleared: ctx.size === "bonus" ? correct >= 4 : true });
    const retry = []; // missed verb × tense: back later this round, another person
    // Which spins come from cards: spread through the round.
    const plan = [];
    for (let i = 0; i < total; i++) plan.push(i < cards.length ? "card" : "gen");
    const order = unlimited ? shuffle(plan) : plan;

    // Tense chips and "+ all B1 verbs" belong to the Games hub; in Today
    // a quiet line names the tenses in play instead.
    const chips = () => unlimited && learning ? `<div class="cj-level">${escapeHtml(tenses().map(t => TENSE_BY_ID[t].name).join(" · "))}</div>`
      : unlimited ? `<div class="cj-chips" id="cj-chips">
        ${TENSES.map(t => `<button class="cj-chip ${conjTenses().includes(t.id) ? "on" : ""}" data-t="${t.id}">${t.name}</button>`).join("")}
        <button class="cj-chip all ${S.games.conjAll !== false ? "on" : ""}" data-all="1" title="Mix in verbs you haven't met yet — practice only, never added to your decks">+ all B1 verbs</button>
      </div>` : "";
    ctx.stage.innerHTML = `
      ${chips()}
      <div class="cj-machine ${unlimited ? "three" : ""}" id="cj-machine">
        <div class="cj-reel pron" id="cj-pron"><span></span></div>
        <div class="cj-reel" id="cj-verb"><span></span></div>
        ${unlimited ? `<div class="cj-reel tense" id="cj-tense"><span></span></div>` : ""}
      </div>
      <div class="cj-meaning" id="cj-meaning"></div>
      <div class="cj-tail" id="cj-tail"></div>
      <div class="cj-format" id="cj-format"></div>
      <div class="g-typed-wrap">
        <input type="text" class="german-input" id="cj-input" placeholder="the verb form…" ${sayMode ? `style="display:none" tabindex="-1"` : ""}
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
        ${sayMode ? `<div class="cj-say-label">${sayStepsHtml("form")}</div>` : accentBarHtml("cj-input")}
        <div class="g-typed-actions" id="cj-actions">
          <button class="hint-btn" id="cj-hint" aria-label="Hint: first letter">💡</button>
          <button class="dontknow-btn" id="cj-skip">? Don't know</button>
          <button class="g-big-btn" id="cj-go">${sayMode ? "Show ▶" : "Check"}</button>
        </div>
        <div id="cj-say"></div>
      </div>
      <div class="tr-fb" id="cj-fb"></div>`;
    const input = document.getElementById("cj-input");
    const verbEl = document.querySelector("#cj-verb span"), pronEl = document.querySelector("#cj-pron span");
    const tenseEl = document.querySelector("#cj-tense span");
    const fb = document.getElementById("cj-fb");
    const reelPool = eligible.map(conjItem);
    const genPool = () => (S.games.conjAll !== false ? split.mine.concat(split.extra) : split.mine);
    const reelVerbs = [...reelPool.map(x => x.verb), ...genPool().slice(0, 60).map(v => v.inf)];
    const reelProns = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

    // One spin → cur = { kind: "card", w, it } | { kind: "gen", v, tense, person, cell, extra }
    const nextSpin = () => {
      const k = order[r - 1];
      if (k === "card" && cards.length) {
        const w = cards.shift();
        return { kind: "card", w, it: conjItem(w) };
      }
      // A form missed earlier this round comes back (another person).
      if (retry.length && (retry[0].at <= r || r >= total - 1)) {
        const m = retry.shift();
        const again = conjSpinFor(m.v, [m.tense], m.person);
        if (again) { lastInf = m.v.inf; return { kind: "gen", ...again, extra: m.extra }; }
      }
      // Mine first (~65%), extra B1 verbs mixed in when switched on.
      const useExtra = !learning && S.games.conjAll !== false && split.extra.length && (split.mine.length < 4 || Math.random() < 0.35);
      const list = useExtra ? split.extra : split.mine.length >= 4 || learning ? split.mine : split.mine.concat(split.extra);
      const pick = conjPickSpin(list, tenses(), lastInf) || conjPickSpin(learning ? split.mine : verbBank().verbs, tenses(), "");
      if (!pick) return null;
      lastInf = pick.v.inf;
      return { kind: "gen", ...pick, extra: useExtra || !split.mine.includes(pick.v) };
    };

    const spin = () => {
      if (r >= total) { done(); return; }
      r++;
      cur = nextSpin();
      if (!cur) { done(); return; }
      helped = false;
      input.value = ""; input.className = "german-input";
      fb.innerHTML = "";
      if (sayMode) {
        revealed = false;
        document.getElementById("cj-say").innerHTML = "";
        document.getElementById("cj-actions").style.display = "";
        document.querySelector(".cj-say-label").style.display = "";
      }
      ctx.teach("");
      ctx.setBar((r - 1) / total, "progress");
      if (!perSpin) ctx.setRound(r, total);
      let verbTxt, pronTxt, tenseTxt = "", tail = "", meaning = "";
      if (cur.kind === "card") {
        const it = cur.it, f = ctx.fmt(cur.w);
        const useMeaning = !!rp.meaning && ctx.size === "full" && f.st >= 3 && !!it.meaning;
        verbTxt = useMeaning ? `“${it.meaning}”` : unlimited ? it.verb.replace(/\s*\((Präteritum|Präsens)\)/i, "") : it.verb;
        pronTxt = it.pron;
        tenseTxt = /präteritum/i.test(it.verb) ? "Präteritum" : "Präsens";
        tail = it.tail ? `… ___ ${escapeHtml(it.tail)}` : "";
        tail += ctx.tag(cur.w);
      } else {
        const { v, tense, person, cell } = cur;
        const known = !cur.extra && v.word && wordStage(v.word) >= 3;
        const useMeaning = !!rp.meaning && ctx.size === "full" && known && v.en && v.en.length <= 28;
        verbTxt = useMeaning ? `“${v.en.replace(/\s*\(.*?\)\s*/g, " ").trim()}”` : v.inf;
        pronTxt = tense === "im" ? (person === "Sie" ? "Sie (formal)" : person + " — command") : PERSON_LABEL[person];
        tenseTxt = TENSE_BY_ID[tense].name;
        tail = cell.tail ? `___ ${escapeHtml(cell.tail)}` : "";
        if (!useMeaning) meaning = `${cur.extra ? `<span class="cj-new">🆕 new verb</span> ` : ""}${escapeHtml(v.en || "")}`;
      }
      document.getElementById("cj-tail").innerHTML = tail;
      document.getElementById("cj-meaning").innerHTML = meaning;
      const fmt = formatOf(cur);
      document.getElementById("cj-format").innerHTML = fmt.html;
      input.placeholder = fmt.placeholder;
      const machine = document.getElementById("cj-machine");
      machine.classList.add("spinning");
      ctx.busy = true;
      let n = 0;
      const tick = () => {
        if (ctx.finished) return;
        verbEl.textContent = reelVerbs[Math.floor(Math.random() * reelVerbs.length)] || "";
        pronEl.textContent = reelProns[Math.floor(Math.random() * reelProns.length)];
        if (tenseEl) tenseEl.textContent = TENSES[Math.floor(Math.random() * TENSES.length)].name;
        if (++n < (REDUCED_MOTION ? 1 : 7)) gTimeout(tick, 60);
        else {
          verbEl.textContent = verbTxt; pronEl.textContent = pronTxt;
          if (tenseEl) tenseEl.textContent = tenseTxt;
          machine.classList.remove("spinning");
          if (gameSfxOn()) playNotes([{ freq: 660, at: 0, dur: 0.06 }, { freq: 880, at: 0.06, dur: 0.1 }], 0.12);
          ctx.busy = false;
          spinT = ctx.clock.elapsed();
          shownAtMs = Date.now();
          if (!sayMode) try { input.focus({ preventScroll: true }); } catch (e) {}
        }
      };
      tick();
    };
    const answersOf = c => c.kind === "card" ? [c.it.ans] : verbCellAnswers(c.cell);
    // Typing the pronoun too ("ich habe gespielt", "spielen Sie!") is
    // fine: it's stripped before grading if the bare form doesn't match.
    const gradeConj = (val, c) => {
      const answers = answersOf(c);
      const res = gradeTyped(val, answers);
      if (res === true) return res;
      const bare = String(val).trim().replace(/!+$/, "").replace(/^(ich|du|er|sie|es|wir|ihr|je|tu|il|elle|on|nous|vous|ils|elles)\s+|^j[’']\s*/i, "").replace(/\s+Sie$/, "").trim();
      if (bare && bare !== String(val).trim()) { const r2 = gradeTyped(bare, answers); if (r2) return r2; }
      return res;
    };
    // What shape the answer takes, with an example from another verb
    // for the same person and tense (so the example never gives it away).
    const formatOf = c => {
      if (c.kind === "card") {
        const nw = c.it.ans.trim().split(/\s+/).length;
        return { html: `${sayMode ? "🗣️ Say" : "✍️ Type"} <strong>${nw === 1 ? "one word" : nw + " words"}</strong> — the verb form only, no pronoun needed`, placeholder: "the verb form…" };
      }
      if (IS_FRENCH_APP) return { html: "", placeholder: "the verb form…" };
      const F = c.v.F, t = c.tense;
      const own = t === "k2" && F.k2special;
      const shape = { pr: "one word", pt: "one word", pf: "haben/sein + Partizip II", pq: "hatte/war + Partizip II",
        fu: "werden + infinitive", k2: own ? "one word — its own form (no würde)" : "würde + infinitive", im: "the command form — no du / ihr" }[t];
      let ex = null;
      if (!own) {
        const exV = ["spielen", "machen", "kaufen", "lernen"].map(i => verbBank().byInf.get(i)).find(v => v && v.inf !== c.v.inf);
        const cell = exV ? verbCell(exV.F, t, c.person) : null;
        if (cell) ex = cell.ans;
      }
      const notes = [];
      if (/…/.test(c.cell.tail || "")) notes.push("the prefix is shown, no need to type it");
      if (F.refl && ["pf", "pq", "fu", "k2"].includes(t) && !own) notes.push("mich / dich / sich… after the first word is optional");
      const two = ["pf", "pq", "fu"].includes(t) || (t === "k2" && !own);
      return {
        html: `${sayMode ? "🗣️ Say" : "✍️ Type"}: <strong>${escapeHtml(shape)}</strong>${ex ? ` — e.g. <em>${escapeHtml(ex)}</em>` : ""}${notes.length ? `<div class="cj-format-note">${escapeHtml(notes.join(" · "))}</div>` : ""}`,
        placeholder: two ? "two words…" : "one word…", // the example is on the line above
      };
    };
    const shownOf = c => c.kind === "card" ? `${c.it.pron} <strong>${escapeHtml(c.it.ans)}</strong>${c.it.tail ? " " + escapeHtml(c.it.tail) : ""}`
      : `${c.tense === "im" ? "" : escapeHtml(PERSON_LABEL[c.person].split("/")[0]) + " "}<strong>${escapeHtml(c.cell.ans)}</strong>${c.cell.tail ? " " + escapeHtml(c.cell.tail.replace(/^… /, "")) : ""}`;
    const sayOf = c => c.kind === "card" ? `${c.it.pron.split("/")[0]} ${c.it.ans}` : `${c.tense === "im" ? "" : PERSON_LABEL[c.person].split("/")[0] + " "}${c.cell.ans}${c.cell.tail ? " " + c.cell.tail.replace(/^… /, "").replace(/!$/, "") : ""}`;
    const reveal = () => {
      if (!sayMode || revealed || !cur || ctx.busy || ctx.finished || ctx.paused || ctx.waiting) return;
      revealed = true; revealAtMs = Date.now();
      document.getElementById("cj-actions").style.display = "none";
      document.querySelector(".cj-say-label").style.display = "none";
      document.getElementById("cj-say").innerHTML = sayRevealHtml(cur.kind === "card" ? cur.w : null,
        { html: shownOf(cur), audio: sayOf(cur), noSentence: true, ask: "short" }) + sayGradeHtml("conjSayGrade", { close: false });
      speak(sayOf(cur));
    };
    _conjSayGrade = v => { if (sayMode && revealed && !ctx.busy && !ctx.finished) submit(v !== true, v === true); };
    // said: true = ✓ Got it (right without typing).
    const submit = (skip, said = false) => {
      if (ctx.waiting) { ctx.continueNow(); return; }
      if (!cur || ctx.busy || ctx.finished || ctx.paused) return;
      if (sayMode && !revealed && !skip) { reveal(); return; }
      const val = input.value;
      if (!sayMode && !skip && !val.trim()) { shakeEl(input); return; }
      if (sayMode) {
        document.getElementById("cj-say").innerHTML = "";
        if (said && sayKind(shownAtMs, revealAtMs, helped) === "recognition") helped = true;
      }
      const res = skip ? false : sayMode ? said : gradeConj(val, cur);
      if (res === "near") {
        input.classList.add("near");
        fb.innerHTML = `<span class="g-near">≈ Almost — ${diffHtml(val, answersOf(cur)[0])}</span>`;
        gTimeout(() => { input.classList.remove("near"); input.select(); }, 700);
        return;
      }
      ctx.busy = true;
      const gen = cur.kind === "gen";
      if (gen) vfRecord(cur.v.inf, cur.tense, res === true && !helped);
      if (gen && res !== true && !retry.some(x => x.v === cur.v)) retry.push({ v: cur.v, tense: cur.tense, person: cur.person, extra: cur.extra, at: r + 3 });
      if (res === true) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        if (!gen || !cur.extra) goal++;
        if (!gen) ctx.hit(cur.w, helped ? "recognition" : "recall");
        const pts = ctx.award(gen ? null : cur.w, (helped ? 8 : 15) + Math.min(combo - 1, 5) * 2);
        score += pts;
        input.classList.add("correct");
        fb.innerHTML = `<span class="bb-ok">✓ ${shownOf(cur)}</span>`;
        floatScore(input, "+" + pts, !gen && ctx.isGolden(cur.w) ? "gold" : "");
        if (combo >= 3) playCombo(combo); else playSuccess();
        haptic("select");
        if (!revealed) speak(sayOf(cur));
        gTimeout(spin, 900);
      } else {
        wrong++;
        combo = gen ? 0 : ctx.comboAfterMiss(combo, cur.w);
        const pen = Math.round(6 * (gen ? 1 : ctx.cost(cur.w)));
        score = Math.max(0, score - pen);
        if (!gen) ctx.missed(cur.w); // deck cards only — generated forms never flag a word
        input.classList.add("wrong");
        fb.innerHTML = `<span class="bb-bad">${val.trim() ? `<s>${escapeHtml(val.trim())}</s> → ` : ""}${shownOf(cur)}</span>`;
        playMiss(); haptic("miss");
        if (!revealed) speak(sayOf(cur));
        if (gen) ctx.teach(`<div class="g-teach-main">${escapeHtml(cur.v.inf)} · ${TENSE_BY_ID[cur.tense].name}${cur.v.en ? ` <span class="g-teach-pl">— ${escapeHtml(cur.v.en)}</span>` : ""}</div>${verbRowHtml(cur.v.F, cur.tense, cur.person)}<div class="g-teach-rule">${verbRuleHtml(cur.v.F, cur.tense, cur.person)}</div>`, "bad");
        else {
          // A deck card whose verb the engine knows: show its whole row too.
          const inf = cur.it.verb.replace(/\s*\(.*?\)\s*/g, " ").trim();
          const v = unlimited ? verbBank().byInf.get(inf) : null;
          const tense = /präteritum/i.test(cur.it.verb) ? "pt" : "pr";
          const person = { "ich": "ich", "du": "du", "er/sie/es": "er", "wir": "wir", "ihr": "ihr", "sie/Sie": "sie" }[cur.it.pron];
          ctx.teach(v && person && v.tenses.includes(tense)
            ? `<div class="g-teach-main">${escapeHtml(v.inf)} · ${TENSE_BY_ID[tense].name}${v.en ? ` <span class="g-teach-pl">— ${escapeHtml(v.en)}</span>` : ""}</div>${verbRowHtml(v.F, tense, person)}<div class="g-teach-rule">${verbRuleHtml(v.F, tense, person)}</div>`
            : wordLessonHtml(cur.w), "bad");
        }
        ctx.waitContinue(ctx.sudden ? done : spin);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };
    if (!sayMode) ["cj-go", "cj-skip", "cj-hint"].forEach(id => gListen(document.getElementById(id), "pointerdown", e => e.preventDefault()));
    else sayKeys = { root: "cj-machine", close: false, state: () => ctx.waiting ? "done" : !revealed ? "prompt" : "revealed",
      reveal, grade: v => _conjSayGrade(v), next: () => { if (ctx.waiting) ctx.continueNow(); } };
    document.getElementById("cj-go").onclick = () => submit(false);
    document.getElementById("cj-skip").onclick = () => submit(true);
    document.getElementById("cj-hint").onclick = () => {
      if (!cur || ctx.busy || helped || ctx.waiting) return;
      helped = true;
      if (sayMode) fb.innerHTML = `<span class="g-near">💡 It starts with <b>${escapeHtml(answersOf(cur)[0].slice(0, 1))}</b>…</span>`;
      else if (!input.value) input.value = answersOf(cur)[0][0];
      floatScore(document.getElementById("cj-hint"), "help", "bad");
      if (!sayMode) try { input.focus({ preventScroll: true }); } catch (e) {}
    };
    gListen(input, "keydown", e => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); submit(false); } });
    // Tense chips and the "+ all B1 verbs" switch apply from the next spin.
    const chipBox = document.getElementById("cj-chips");
    if (chipBox) gListen(chipBox, "click", e => {
      const b = e.target.closest(".cj-chip"); if (!b) return;
      e.preventDefault();
      if (b.dataset.all) { S.games.conjAll = S.games.conjAll === false; b.classList.toggle("on", S.games.conjAll !== false); }
      else {
        const t = b.dataset.t, on = conjTenses();
        const nextOn = on.includes(t) ? on.filter(x => x !== t) : [...on, t];
        if (!nextOn.length) { shakeEl(b); return; }
        S.games.conjTenses = nextOn;
        chipBox.querySelectorAll(".cj-chip[data-t]").forEach(c => c.classList.toggle("on", nextOn.includes(c.dataset.t)));
      }
      saveState();
      try { input.focus({ preventScroll: true }); } catch (err) {}
    });
    gListen(chipBox || document.body, "pointerdown", e => { if (e.target.closest && e.target.closest(".cj-chip")) e.preventDefault(); });

    if (perSpin) gInterval(() => {
      if (ctx.finished || ctx.paused) return;
      if (ctx.busy || ctx.waiting || (sayMode && revealed)) return;
      const left = Math.max(0, perSpin - (ctx.clock.elapsed() - spinT));
      ctx.setClock(Math.ceil(left / 1000) + "s", left < 4000);
      if (left <= 0) submit(true);
    }, 150);

    ctx.setScore(0);
    spin();
  },
});
