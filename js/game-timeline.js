// ── GAME: TIMELINE DROP ───────────────────────
// Your own example sentences, one at a time: drag each onto the
// timeline (or tap a station) — when does it happen, and how?
//
//     ⏮ Before that   Plus-que-parfait · Plusquamperfekt
//     ⏪ Back then     Passé composé ● · Imparfait 〰  /  Präteritum ✎ · Perfekt ●
//     ◉ Now           Présent · Präsens
//     ⏩ Ahead         Futur proche ➝ · Futur ✦  /  Futur I ✦
//     ☁ What if…      Conditionnel · Konjunktiv II
//
// Tenses are taught as time, not as labels: a station sits where its
// tense lives, two tenses that share a time sit side by side, and an
// answer in the right time but the wrong tense counts as "close" with
// the difference explained (finished event vs background; written vs
// spoken past). After each answer the verb lights up in its tense's
// colour — the same colours as 🧵 Verb Thread — and the time words
// (hier, gestern, déjà, schon…) are underlined.
//
// Sentences come from the cards you've met; verb-lab.js only tags one
// when it is sure of its tense (one tense, no passive, no imperative,
// no "Je pars demain"). Only your level's tenses. Grammar, not word
// stages (credit: null); weak tenses come up more (S.games.tl).

function timelineTenses() { return vlLevelTenses(); }
// Every taggable example of the words you've met (the round's pool first).
function timelineSentences(pool) {
  const tenses = timelineTenses();
  const inPool = new Set((pool || []).map(wordKey));
  const words = [...(pool || [])];
  const seenW = new Set(words.map(wordKey));
  if (typeof buildGamePool === "function") buildGamePool(null).forEach(w => { if (!seenW.has(wordKey(w))) { seenW.add(wordKey(w)); words.push(w); } });
  const out = [], seen = new Set();
  words.forEach(w => (w.examples || []).forEach(ex => {
    const text = String(ex[WORD_KEY] || "").trim();
    if (!text || seen.has(text)) return;
    const r = vlSentence(text);
    if (!r || !tenses.includes(r.t)) return;
    // Präteritum before its full lesson: sentences of Präteritum I only.
    if (r.t === "pt" && typeof vxPt1Sentence === "function" && !vxPt1Sentence(r)) return;
    seen.add(text);
    out.push({ w, text, tr: String(ex.en || ""), r, inPool: inPool.has(wordKey(w)) });
  }));
  return out;
}
const _tlMemo = new WeakMap();
function timelineSentencesMemo(pool) {
  if (!_tlMemo.has(pool)) _tlMemo.set(pool, timelineSentences(pool));
  return _tlMemo.get(pool);
}

registerGame({
  id: "timeline", name: "Timeline Drop", icon: "⏳", skill: "Grammar · tenses in context", credit: null,
  ranks: [
    { hl: true },
    { hl: false },
    { twins: true },
    { twins: true, ear: 0.34 },
    { twins: true, ear: 0.5 },
  ],
  twists: ["golden", "sudden"],
  howTo: () => [
    "Drag each sentence onto the timeline — or tap the tense where it belongs.",
    "Right time but the other tense of that time counts as close — the card says what tells them apart.",
    "Sentences from the cards you've met, tenses of your level.",
  ],
  requirement(pool) {
    const s = timelineSentencesMemo(pool);
    const ts = new Set(s.map(x => x.r.t));
    if (s.length < 6) return { ok: false, reason: `Needs 6 example sentences from cards you've met — you have ${s.length}` };
    return ts.size >= 2 ? { ok: true } : { ok: false, reason: "Needs sentences in two different tenses — meet a few more cards" };
  },
  stars: [70, 115, 150], // 3★ forgives one slip at 🥉 (a clean round is ~190)
  start(ctx) {
    const rp = ctx.rp;
    const tenses = timelineTenses();
    const all = timelineSentencesMemo(ctx.pool);
    const byT = {};
    all.forEach(s => (byT[s.r.t] = byT[s.r.t] || []).push(s));
    const live = tenses.filter(t => byT[t] && byT[t].length);
    const total = Math.min(ctx.rounds(10, 6, 6), all.length);
    const earOk = !!rp.ear && ctx.size === "full" && typeof audioOk === "function" && audioOk();
    let r = 0, score = 0, combo = 0, maxCombo = 0, correct = 0, wrong = 0, close = 0, cur = null, lastT = "", autoNext = 0;
    const used = new Set(), tally = {}, retryT = [];
    const done = () => ctx.finish({
      score, correct, wrong, maxCombo, goalCorrect: correct,
      cleared: ctx.size === "bonus" ? correct >= bonusGoal("timeline") : true,
      note: `⏳ ${correct}/${r} on the right spot${close ? ` · ${close} close` : ""}${weakestNote(tally)}`,
    });

    const pickNext = () => {
      let t = null;
      if (retryT.length && retryT[0].at <= r) t = retryT.shift().t;
      if (!t || !byT[t]) {
        const cands = live.filter(x => x !== lastT && byT[x].some(s => !used.has(s.text)));
        const pool = cands.length ? cands : live.filter(x => byT[x].some(s => !used.has(s.text)));
        if (!pool.length) return null;
        t = weightedPickDistinct(pool, 1, x => (1.25 - vlTenseAcc("tl", x)) * (rp.twins && VL_TENSES.filter(y => y.zone === VL_T[x].zone).length > 1 ? 2 : 1))[0];
      }
      const list = byT[t].filter(s => !used.has(s.text));
      const s = weightedPickDistinct(list.length ? list : byT[t], 1, s => (s.inPool ? 3 : 1) * Math.sqrt(wordWeakness(s.w)))[0];
      if (s) used.add(s.text);
      return s;
    };

    const zonesHtml = () => VL_ZONES.map(z => {
      const ts = VL_TENSES.filter(t => t.zone === z.id && tenses.includes(t.id));
      if (!ts.length) return "";
      return `<div class="tl-zone" data-zone="${z.id}">
        <div class="tl-zone-head"><i class="tl-dot"></i><span>${z.sign} ${escapeHtml(z.name)}</span></div>
        <div class="tl-chips">${ts.map(t => `<button class="tl-chip" data-t="${t.id}" style="${vlTenseStyle(t.id)}"><span class="vt-sign">${t.sign}</span><span class="tl-chip-name">${escapeHtml(t.name)}</span><span class="tl-pins" id="tl-pins-${t.id}"></span></button>`).join("")}</div>
      </div>`;
    }).join("");
    ctx.stage.innerHTML = `
      <div class="tl-wrap" id="tl-wrap">
        <div class="tl-card" id="tl-card"></div>
        <div class="tl-line" id="tl-line">${zonesHtml()}</div>
      </div>`;
    const cardEl = document.getElementById("tl-card");
    const chips = () => [...document.querySelectorAll(".tl-chip")];
    const pins = {};

    const round = () => {
      gClearTimeout(autoNext); autoNext = 0;
      if (r >= total) { done(); return; }
      cur = pickNext();
      if (!cur) { done(); return; }
      r++;
      lastT = cur.r.t;
      cur.ear = earOk && Math.random() < rp.ear;
      ctx.teach("");
      ctx.setBar((r - 1) / total, "progress");
      ctx.setRound(r, total);
      chips().forEach(c => { c.disabled = false; c.classList.remove("ok", "bad", "near", "right", "hover"); });
      const hl = !!rp.hl || ctx.size !== "full";
      const sent = hl ? cur.r.tokens.map((tk, i) => cur.r.verb.includes(i) ? `<b class="tl-verb pre">${escapeHtml(tk)}</b>` : escapeHtml(tk)).join("") : escapeHtml(cur.text);
      cardEl.className = "tl-card g-enter";
      cardEl.innerHTML = `
        <div class="g-q-label">When is this?${ctx.tag(cur.w)}</div>
        ${cur.ear ? `<button class="vt-ear" id="tl-ear" aria-label="Hear it again">🎧 <span>Listen</span></button><div class="tl-sent vt-hidden" id="tl-sent" aria-hidden="true">${sent}</div>`
          : `<div class="tl-sent" id="tl-sent">${sent}</div>`}
        <div class="tl-trans" id="tl-trans"></div>
        <div class="tl-grip">${r <= 2 && (S.games.plays.timeline || 0) < 3 ? "⠿ Drag me onto the timeline — or tap a tense" : "⠿"}</div>`;
      if (cur.ear) { gTimeout(() => speak(cur.text), 250); document.getElementById("tl-ear").onclick = () => speak(cur.text, 0.7); }
      ctx.busy = false;
    };

    const answer = (t, chip) => {
      if (!cur || ctx.busy || ctx.finished || ctx.paused || ctx.waiting) return;
      ctx.busy = true;
      const s = cur, right = s.r.t;
      const ok = t === right;
      const near = !ok && VL_T[t] && VL_T[right] && VL_T[t].zone === VL_T[right].zone;
      vlTenseRecord("tl", right, ok);
      const tl = tally[right] || (tally[right] = [0, 0]); if (ok) tl[0]++; tl[1]++;
      chips().forEach(c => c.disabled = true);
      const rightChip = chips().find(c => c.dataset.t === right);
      if (chip) chip.classList.add(ok ? "ok" : near ? "near" : "bad");
      if (!ok && rightChip) rightChip.classList.add("right");
      // A pin on the station where it really belongs.
      pins[right] = (pins[right] || 0) + 1;
      const pe = document.getElementById("tl-pins-" + right);
      if (pe) pe.innerHTML = "•".repeat(Math.min(pins[right], 6));
      // Reveal: the verb in its colour, the time words underlined, the translation.
      const sentEl = document.getElementById("tl-sent");
      if (sentEl) { sentEl.classList.remove("vt-hidden"); sentEl.removeAttribute("aria-hidden"); sentEl.innerHTML = vlSentenceHtml(s.r, true); }
      const ear = document.getElementById("tl-ear"); if (ear) ear.remove();
      const tr = document.getElementById("tl-trans"); if (tr && s.tr) tr.textContent = s.tr;
      cardEl.classList.add(ok ? "ok" : near ? "near" : "bad");
      if (!s.ear) speak(s.text);
      const verbTxt = s.r.verb.map(i => s.r.tokens[i]).join(" … ");
      const sense = t2 => VL_TENSE_SENSE[t2] ? escapeHtml(VL_TENSE_SENSE[t2]) : "";
      const head = `<div class="g-teach-main"><b class="tl-verb" style="${vlTenseStyle(right)}">${escapeHtml(verbTxt)}</b> → ${VL_T[right].sign} ${escapeHtml(vlTenseName(right))}</div><div class="g-teach-rule">${sense(right)}</div>`;
      const anchors = s.r.anchors.map(i => s.r.tokens[i]);
      const anchorLine = anchors.length ? `<div class="g-teach-sub">⏱ Time word: <u>${escapeHtml(anchors.join(", "))}</u></div>` : "";
      if (ok) {
        correct++; combo++; maxCombo = Math.max(maxCombo, combo);
        const pts = ctx.award(s.w, 12 + (s.ear ? 4 : 0) + Math.min(combo - 1, 5) * 2);
        score += pts;
        floatScore(chip || cardEl, "+" + pts, ctx.isGolden(s.w) ? "gold" : "");
        if (combo >= 3) playCombo(combo); else playSuccess();
        haptic("correct");
        ctx.say(`Right — ${vlTenseName(right)}`);
        ctx.teach(head + anchorLine, "ok");
        autoNext = gTimeout(round, 2400);
      } else {
        if (near) close++; else wrong++;
        if (!near) combo = ctx.comboAfterMiss(combo, s.w);
        const pts = near ? 4 : -Math.round(4 * ctx.cost(s.w));
        score = Math.max(0, score + pts);
        floatScore(chip || cardEl, (pts > 0 ? "+" : "−") + Math.abs(pts), pts > 0 ? "" : "bad");
        if (near) playPop(); else playMiss();
        haptic(near ? "select" : "miss");
        if (chip && !near) shakeEl(chip);
        retryT.push({ t: right, at: r + 3 });
        // A conjugation card's own example: that card comes back for review.
        if (!near && typeof CONJ_DECK_RE !== "undefined" && CONJ_DECK_RE.test(s.w.deckId || "") && vlIsMet(s.w)) ctx.missed(s.w, { type: "tense", given: "" });
        const vs = `<div class="g-teach-sub">${near ? "Right time, other tense. " : ""}Yours, <b>${escapeHtml(vlTenseName(t))}</b>: ${sense(t)}.</div>`;
        ctx.say(`It's ${vlTenseName(right)}`);
        ctx.teach(head + vs + anchorLine, near ? "near" : "bad");
        ctx.waitContinue(ctx.sudden && !near ? done : round);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    // ── Drag the card (a small tag follows the finger) or tap a station ──
    let drag = null;
    const chipAt = (x, y) => chips().find(c => !c.disabled && pointIn(c, x, y, 6)) || null;
    gListen(cardEl, "pointerdown", e => {
      if (e.button !== undefined && e.button !== 0) return;
      if (!cur || ctx.busy || ctx.waiting || e.target.closest("button")) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ghost: null, over: null };
    });
    gListen(window, "pointermove", e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.ghost) {
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
        const g = document.createElement("div");
        g.className = "tl-ghost";
        g.textContent = cur.ear ? "🎧 …" : cur.text.length > 34 ? cur.text.slice(0, 32) + "…" : cur.text;
        document.body.appendChild(g);
        drag.ghost = g;
        cardEl.classList.add("lifted");
        document.body.classList.add("g-drag-active");
        haptic("select");
      }
      e.preventDefault();
      drag.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -120%)`;
      const c = chipAt(e.clientX, e.clientY);
      if (c !== drag.over) {
        if (drag.over) drag.over.classList.remove("hover");
        if (c) { c.classList.add("hover"); if (gameSfxOn()) playNotes([{ freq: 1100, at: 0, dur: 0.03 }], 0.04); }
        drag.over = c;
      }
      if (e.clientY > window.innerHeight - 50) window.scrollBy(0, 10);
    }, { passive: false });
    const endDrag = (e, cancel) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      cardEl.classList.remove("lifted");
      document.body.classList.remove("g-drag-active");
      if (d.over) d.over.classList.remove("hover");
      if (!d.ghost) return;
      _dragJustEnded = Date.now();
      if (!cancel && d.over) {
        const to = d.over.getBoundingClientRect();
        d.ghost.classList.add("land");
        d.ghost.style.transform = `translate(${to.left + to.width / 2}px, ${to.top + to.height / 2}px) translate(-50%, -50%) scale(0.3)`;
        setTimeout(() => d.ghost.remove(), 220);
        haptic("drop");
        answer(d.over.dataset.t, d.over);
      } else d.ghost.remove();
    };
    gListen(window, "pointerup", e => endDrag(e, false));
    gListen(window, "pointercancel", e => endDrag(e, true));
    gListen(ctx.stage, "click", e => {
      if (Date.now() - _dragJustEnded < 350) return;
      const c = e.target.closest(".tl-chip");
      if (c && !c.disabled) { answer(c.dataset.t, c); return; }
      if (e.target.closest("#tl-card") && autoNext && !ctx.waiting) { gClearTimeout(autoNext); autoNext = 0; round(); }
    });
    gListen(document.getElementById("g-teach"), "click", e => {
      if (e.target.closest("button")) return;
      if (autoNext && !ctx.waiting) { gClearTimeout(autoNext); autoNext = 0; round(); }
    });
    ctx.onKey = e => {
      if (e.key === "Enter" && autoNext && !ctx.waiting) { e.preventDefault(); gClearTimeout(autoNext); autoNext = 0; round(); return; }
      const cs = chips();
      const i = digitKey(e, cs.length);
      if (i >= 0) { e.preventDefault(); answer(cs[i].dataset.t, cs[i]); }
    };
    ctx.setScore(0);
    round();
  },
});
