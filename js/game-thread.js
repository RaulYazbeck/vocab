// ── GAME: VERB THREAD ─────────────────────────
// The reverse of Conjugation Slots: a form is given — "serons", "as
// été", "liest" — and you unravel it, one column at a time:
//
//     Who?   je · tu · il/elle/on · nous · vous · ils/elles
//     When?  the tenses of your level, in timeline order
//     Means  the same form in your language — "nosotros seremos" /
//            "you read" (Spanish in the French app, English in German)
//
// In each column you pick EVERY option that fits, then ⏎ Check (Enter
// on a keyboard). A column is right only with all of them and nothing
// else: "liest" is du AND er/sie/es, and means "you read" AND "he
// reads"; "parle" is je and il. The point for the form needs all three
// columns right. The meanings stay blurred until it's their turn — they
// would give the person and the tense away.
//
// Each checked column is joined to the last by threads between their
// right answers. Then the form splits into its parts in colour — the
// person ending in one colour, the tense marker in the tense's own
// colour (the same colours as ⏳ Timeline Drop) — so you learn to read
// any form by its pieces: -ons is nous, the r is futur, "hatte" is
// Plusquamperfekt.
//
// From 🥇 Gold, near-twins come up (allons / allions, serons / serions)
// and the infinitive is no longer shown; from 💠 Platinum some forms are
// only heard (🎧) — then every person that SOUNDS the same is right too:
// parle · parles · parlent are je, tu, il and ils.
//
// Verbs you've met, tenses of your level (verb-lab.js). Grammar, not
// word stages (credit: null); a miss on a form one of your French
// conjugation cards asks flags that card for review. Weak tenses come
// up more (S.games.vt).

const THREAD_ROWS = ["p", "t", "m"];
const THREAD_ROW_LABEL = { p: "Who?", t: "When?", m: "Means" };

function threadTenses() { return vlLevelTenses(); }
function threadVerbs(pool) { return vlVerbs(pool, threadTenses()); }

registerGame({
  id: "thread", name: "Verb Thread", icon: "🧵", skill: "Grammar · reading verb forms", credit: null,
  ranks: [
    { tOpts: 3, mOpts: 3, inf: true },
    { tOpts: 4, mOpts: 4, inf: true },
    { tOpts: 5, mOpts: 4, twins: true },
    { tOpts: 6, mOpts: 4, twins: true, ear: 0.34 },
    { tOpts: 7, mOpts: 4, twins: true, ear: 0.5 },
  ],
  twists: ["golden", "sudden"],
  howTo: () => [
    "A verb form appears. In each column — Who? · When? · Means — tap EVERY option that fits, then ⏎ Check (Enter on a keyboard).",
    "A column counts only with all the right ones and nothing else: \"liest\" is du and er/sie/es.",
    "Then the form splits into colours: the person ending, the tense marker. Read any form by its pieces.",
    `Verbs you've met, tenses of your level. The meanings are in ${VL_FR ? "Spanish" : "English"}.`,
  ],
  requirement(pool) {
    const n = threadVerbs(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 verbs you've met — you have ${n}` };
  },
  stars: [60, 100, 140], // 3★ forgives one slip at 🥉 (a clean round is ~170)
  start(ctx) {
    const rp = ctx.rp;
    const tenses = threadTenses();
    const verbs = threadVerbs(ctx.pool);
    const total = ctx.rounds(8, 5, 6);
    const earOk = !!rp.ear && ctx.size === "full" && typeof audioOk === "function" && audioOk();
    let r = 0, score = 0, combo = 0, maxCombo = 0, clean = 0, wrong = 0, item = null, lastInf = "", lastT = "";
    // col: the open column (0 Who · 1 When · 2 Means, 3 = all checked);
    // exact[i]: column i was checked with exactly the right options.
    let col = 0, exact = [], firstBad = "", autoNext = 0, sets = null;
    const tally = {};
    const retry = [];
    const done = () => ctx.finish({
      score, correct: clean, wrong, maxCombo, goalCorrect: clean,
      cleared: ctx.size === "bonus" ? clean >= bonusGoal("thread") : true,
      note: `🧵 ${clean}/${r} threads clean${weakestNote(tally)}`,
    });

    // ── Choosing what to unravel ──
    const weightV = v => (vlInPool(v, ctx.pool) ? 3 : 1) * Math.sqrt(v.word ? wordWeakness(v.word) : 1);
    const pickTense = (v) => {
      const ts = tenses.filter(t => v.tenses.includes(t) && vlMeaning(v, t, vlPersonsOf(v)[0]) && (typeof vxTenseOkFor !== "function" || vxTenseOkFor(v.inf, t)));
      const cand = ts.filter(t => t !== lastT);
      return weightedPickDistinct(cand.length ? cand : ts, 1, t => 1.25 - vlTenseAcc("vt", t))[0];
    };
    // A retry comes back in another person — and never as the same form
    // ("aime" missed as je must not return as il: it's the same thread).
    const makeItem = (v, t, notP, notForm) => {
      const ps = shuffle(vlPersonsOf(v).filter(p => p !== notP));
      const ear = earOk && Math.random() < rp.ear;
      let best = null;
      for (const p of ps) {
        const fem = VL_FR && Math.random() < 0.3 && p !== "nous" && p !== "vous";
        const it = vlItem(v, t, p, tenses, { ear, fem });
        if (!it || it.form === notForm || (ear && it.form.replace(/\s/g, "").length < 4)) continue;
        if (!best) best = it;
        if (!rp.twins || it.twins.length) { best = it; break; }
      }
      return best;
    };
    const nextItem = () => {
      if (retry.length && (retry[0].at <= r || r >= total - 1)) {
        const m = retry.shift();
        const it = makeItem(m.v, m.t, m.p, m.form);
        if (it) return it;
      }
      for (let tries = 0; tries < 8; tries++) {
        const pool = verbs.filter(v => v.inf !== lastInf);
        const v = weightedPickDistinct(pool.length ? pool : verbs, 1, weightV)[0];
        if (!v) return null;
        const t = pickTense(v);
        const it = t && makeItem(v, t);
        if (it) return it;
      }
      return null;
    };

    // ── Board ──
    const chipsHtml = (rowId, opts) => opts.map((o, i) => {
      const key = `<span class="g-key">${i + 1}</span>`;
      if (rowId === "t") return `<button class="vt-chip vt-tchip" data-row="t" data-v="${o}" style="${vlTenseStyle(o)}" aria-pressed="false">${key}<span class="vt-sign">${VL_T[o].sign}</span>${escapeHtml(VL_T[o].short)}</button>`;
      if (rowId === "p") return `<button class="vt-chip vt-pchip" data-row="p" data-v="${o}" aria-pressed="false">${key}${escapeHtml(vlPersonLabel(o, item.form))}</button>`;
      return `<button class="vt-chip vt-mchip" data-row="m" data-v="${escapeHtml(o)}" aria-pressed="false">${key}<span>${escapeHtml(o)}</span></button>`;
    }).join("");
    const render = () => {
      const it = item, w = it.v.word;
      const f = w ? ctx.fmt(w) : { rookie: false };
      const rookie = !!f.rookie;
      const nT = rookie ? 3 : rp.tOpts, nM = rookie ? 3 : rp.mOpts;
      it.tOpts = vlTenseOptions(it, tenses, Math.max(2, Math.min(nT, tenses.length)));
      it.mOpts = vlMeaningOptions(it, nM);
      const showInf = rp.inf || rookie || ctx.size !== "full";
      const firstPlays = (S.games.plays.thread || 0) < 3 && r <= 2;
      const formHtml = it.ear
        ? `<button class="vt-ear" id="vt-ear" aria-label="Hear it again">🎧 <span>Listen</span></button><div class="vt-form vt-hidden" id="vt-form" aria-hidden="true">${escapeHtml(it.form)}</div>`
        : `<div class="vt-form" id="vt-form">${escapeHtml(it.form)}</div>`;
      ctx.stage.innerHTML = `
        <div class="vt-wrap" id="vt-wrap">
          <svg class="vt-svg" id="vt-svg" aria-hidden="true"></svg>
          <div class="vt-card g-enter" id="vt-card">
            <div class="g-q-label">${it.ear ? "Listen — then unravel" : "Unravel this form"}${w ? ctx.tag(w) : ""}</div>
            ${formHtml}
            <div class="vt-verb">${showInf ? `${escapeHtml(vlInfLabel(it.v))} <span>· ${escapeHtml(vlGloss(it.v))}</span>` : `<span>which verb? the meaning row knows</span>`}</div>
          </div>
          <div class="vt-cols">
          ${THREAD_ROWS.map((rid, i) => `
            <div class="vt-row${i === 0 ? " on" : ""}" data-row="${rid}" id="vt-row-${rid}">
              <div class="vt-row-label">${THREAD_ROW_LABEL[rid]}</div>
              <div class="vt-chips">${chipsHtml(rid, rid === "p" ? VL_PERSONS : rid === "t" ? it.tOpts : it.mOpts)}</div>
            </div>`).join("")}
          </div>
          <div class="vt-actions">
            <div class="vt-hint" id="vt-hint">${firstPlays ? "Tap every one that fits — then Check" : ""}</div>
            <button class="g-big-btn vt-check" id="vt-check" disabled>${checkLabel()}</button>
          </div>
        </div>`;
      if (it.ear) {
        gTimeout(() => speak(it.form), 250);
        document.getElementById("vt-ear").onclick = () => speak(it.form, 0.7);
      }
      gListen(document.getElementById("vt-check"), "pointerdown", e => e.preventDefault());
      drawThread();
    };
    const checkLabel = () => col > 2 ? "" : `Check ${THREAD_ROW_LABEL[THREAD_ROWS[col]].replace("?", "")} ⏎`;
    const round = () => {
      gClearTimeout(autoNext); autoNext = 0;
      if (r >= total) { done(); return; }
      item = nextItem();
      if (!item) { done(); return; }
      r++;
      lastInf = item.v.inf; lastT = item.t;
      col = 0; exact = []; firstBad = "";
      sets = vlSets(item);
      ctx.teach("");
      ctx.setBar((r - 1) / total, "progress");
      ctx.setRound(r, total);
      render();
      ctx.busy = false;
    };

    // ── Threads between checked columns (SVG) ──
    // From every right answer of one column to every right answer of the
    // next — out of a chip's right edge, into the next one's left: never
    // across a label. Solid when you got the column right, dashed when
    // it shows you the answer.
    const pt = (el, wrap, side) => {
      const a = el.getBoundingClientRect(), b = wrap.getBoundingClientRect();
      return { x: (side === "r" ? a.right : a.left) - b.left, y: a.top - b.top + a.height / 2 };
    };
    const curve = (a, b) => {
      const f = n => n.toFixed(1), mx = (a.x + b.x) / 2;
      return `M${f(a.x)},${f(a.y)} C${f(mx)},${f(a.y)} ${f(mx)},${f(b.y)} ${f(b.x)},${f(b.y)}`;
    };
    const rightChips = rid => [...(rowEl(rid) || document.createElement("i")).querySelectorAll(".vt-chip")].filter(c => isRight(rid, c.dataset.v));
    const drawThread = (animate = -1) => {
      const wrap = document.getElementById("vt-wrap"), svg = document.getElementById("vt-svg");
      if (!wrap || !svg) return;
      const b = wrap.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
      svg.setAttribute("width", b.width); svg.setAttribute("height", b.height);
      let out = "";
      for (let k = 1; k < Math.min(col, 3); k++) {
        const from = rightChips(THREAD_ROWS[k - 1]), to = rightChips(THREAD_ROWS[k]);
        const style = THREAD_ROWS[k] === "t" && to[0] ? vlTenseStyle(to[0].dataset.v) : THREAD_ROWS[k - 1] === "t" && from[0] ? vlTenseStyle(from[0].dataset.v) : "";
        from.forEach(a => to.forEach(c => {
          const p0 = pt(a, wrap, "r"), p1 = pt(c, wrap, "l");
          out += `<path class="vt-line${exact[k] && exact[k - 1] ? "" : " fixed"}${animate === k ? " draw" : ""}" style="${style}" d="${curve(p0, p1)}"/>`;
          out += `<circle class="vt-dot${exact[k] ? "" : " fixed"}" cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" r="4"/>`;
        }));
      }
      svg.innerHTML = out;
    };

    // ── Picking and checking ──
    const rowEl = rid => document.getElementById("vt-row-" + rid);
    const isRight = (rid, v) => sets && sets[rid].has(v);
    const setCol = i => {
      THREAD_ROWS.forEach((rid, j) => { const e = rowEl(rid); if (e) { e.classList.toggle("on", j === i); e.classList.toggle("done", j < i); } });
      const btn = document.getElementById("vt-check");
      if (btn) { btn.textContent = checkLabel(); btn.disabled = true; }
      // All three checked: the hint and the button make way for the lesson.
      const acts = btn && btn.parentElement;
      if (acts) acts.classList.toggle("vt-done", i > 2);
    };
    const selected = rid => [...rowEl(rid).querySelectorAll(".vt-chip.sel")];
    const toggle = el => {
      if (!item || ctx.busy || ctx.finished || ctx.paused || ctx.waiting || col > 2) return;
      const rid = THREAD_ROWS[col];
      if (el.dataset.row !== rid) {
        // A column that isn't open yet: point at the one that is.
        const c = rowEl(rid);
        c.classList.remove("nudge"); void c.offsetWidth; c.classList.add("nudge");
        haptic("select");
        return;
      }
      const on = !el.classList.contains("sel");
      el.classList.toggle("sel", on);
      el.setAttribute("aria-pressed", on ? "true" : "false");
      if (gameSfxOn()) playNotes([{ freq: on ? 990 : 660, at: 0, dur: 0.05 }], 0.06);
      haptic("select");
      const btn = document.getElementById("vt-check");
      if (btn) btn.disabled = !selected(rid).length;
    };
    const check = () => {
      if (!item || ctx.busy || ctx.finished || ctx.paused || ctx.waiting || col > 2) return;
      const rid = THREAD_ROWS[col];
      const chips = [...rowEl(rid).querySelectorAll(".vt-chip")];
      const picked = chips.filter(c => c.classList.contains("sel"));
      if (!picked.length) { const b = document.getElementById("vt-check"); if (b) shakeEl(b); return; }
      let ok = true;
      chips.forEach(c => {
        const right = isRight(rid, c.dataset.v), sel = c.classList.contains("sel");
        c.classList.remove("sel");
        if (sel && right) c.classList.add("ok");
        else if (sel) { c.classList.add("bad"); shakeEl(c); ok = false; }
        else if (right) { c.classList.add("right"); ok = false; } // one you left out
        c.disabled = true;
      });
      exact[col] = ok;
      if (!ok && !firstBad) firstBad = rid;
      if (ok) { haptic("select"); if (gameSfxOn()) playNotes([{ freq: [523, 659, 784][col] || 880, at: 0, dur: 0.11 }], 0.13); }
      else { haptic("miss"); playMiss(); }
      ctx.say(`${THREAD_ROW_LABEL[rid]} ${ok ? "right" : "— " + [...sets[rid]].map(v => rid === "p" ? vlPersonLabel(v, item.form) : rid === "t" ? vlTenseName(v) : v).join(", ")}`);
      col++;
      setCol(col);
      drawThread(col - 1);
      if (col === 3) finishItem();
    };
    const finishItem = () => {
      ctx.busy = true;
      drawThread();
      const it = item;
      const perfect = exact.length === 3 && exact.every(Boolean);
      vlTenseRecord("vt", it.t, perfect);
      // Read right: recognition credit for the verb items behind the form.
      if (typeof vxGameHit === "function" && !VL_FR) vxGameHit(ctx, it.v.inf, it.t, it.p, perfect, "recognition");
      const t = tally[it.t] || (tally[it.t] = [0, 0]); if (perfect) t[0]++; t[1]++;
      // The colour split.
      const formEl = document.getElementById("vt-form");
      const samePT = VL_PERSONS.filter(p => it.valid.some(x => x.p === p && x.t === it.t));
      if (formEl) { formEl.classList.remove("vt-hidden"); formEl.removeAttribute("aria-hidden"); formEl.innerHTML = vlPartsHtml(it.parts, it.t, it.p, true, samePT); formEl.classList.add("split"); }
      const ear = document.getElementById("vt-ear"); if (ear) ear.remove();
      const card = document.getElementById("vt-card"); if (card) card.classList.add(perfect ? "ok" : "bad");
      speak(it.full);
      // The whole answer: every person, every tense, every meaning.
      const ps = VL_PERSONS.filter(p => sets.p.has(p)), ts = VL_TENSES.map(x => x.id).filter(x => sets.t.has(x));
      const head = `<div class="g-teach-main">${escapeHtml(vlInfLabel(it.v))} · ${ts.map(x => `<span style="${vlTenseStyle(x)}" class="vl-tc">${escapeHtml(vlTenseName(x))}</span>`).join(" / ")} · ${ps.map(p => escapeHtml(vlPersonLabel(p, it.form))).join(" + ")}</div>
        <div class="g-teach-sub">→ ${[...sets.m].map(m => `<b>${escapeHtml(m)}</b>`).join(" · ")}</div>`;
      const why = `<div class="g-teach-rule">${vlWhyHtml(it)}</div>`;
      const many = ps.length > 1 ? `<div class="g-teach-sub">${it.ear ? "🎧 These all sound the same" : "One form, " + ps.length + " persons"}: ${ps.map(p => `<b>${escapeHtml(vlPersonLabel(p, it.form))}</b>`).join(", ")} — pick them all.</div>` : "";
      const twin = it.twins[0];
      const twinLine = twin ? `<div class="g-teach-sub">Twin: <b class="vl-twin">${escapeHtml(twin.form)}</b> → ${escapeHtml(vlTenseName(twin.t))}</div>` : "";
      if (perfect) {
        clean++; combo++; maxCombo = Math.max(maxCombo, combo);
        const w = it.v.word;
        const pts = ctx.award(w, 15 + (ps.length > 1 ? 3 : 0) + (it.ear ? 5 : 0) + (it.twins.length && rp.twins ? 3 : 0) + Math.min(combo - 1, 5) * 2);
        score += pts;
        floatScore(formEl || card, "+" + pts, w && ctx.isGolden(w) ? "gold" : "");
        if (combo >= 3) playCombo(combo); else playSuccess();
        haptic("correct");
        ctx.say("Thread complete");
        ctx.teach(`${head}${why}${many}`, "ok");
        autoNext = gTimeout(round, 2600);
      } else {
        wrong++;
        combo = ctx.comboAfterMiss(combo, it.v.word);
        const pts = exact.filter(Boolean).length * 3;
        score += pts;
        if (pts) floatScore(formEl || card, "+" + pts);
        const card2 = vlCardFor(it.v, it.t, it.p);
        if (card2) ctx.missed(card2, { type: { p: "person", t: "tense", m: "recognition" }[firstBad] || "verbform", given: "", expected: [it.form] });
        if (!retry.some(x => x.v === it.v)) retry.push({ v: it.v, t: it.t, p: it.p, form: it.form, at: r + 3 });
        ctx.teach(`${head}${why}${many}${twinLine}`, "bad");
        ctx.waitContinue(ctx.sudden ? done : round);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    // ── Input: taps, ⏎ Check, keys ──
    gListen(ctx.stage, "click", e => {
      const c = e.target.closest(".vt-chip");
      if (c) { toggle(c); return; }
      if (e.target.closest("#vt-check")) { check(); return; }
      if (e.target.closest("#vt-ear")) return;
      if (!ctx.waiting && autoNext && col > 2) { gClearTimeout(autoNext); autoNext = 0; round(); }
    });
    // Tap the teaching card to move on sooner after a clean thread.
    gListen(document.getElementById("g-teach"), "click", e => {
      if (e.target.closest("button")) return;
      if (autoNext && !ctx.waiting) { gClearTimeout(autoNext); autoNext = 0; round(); }
    });
    gListen(window, "resize", () => drawThread());
    ctx.onKey = e => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (col <= 2) check();
        else if (autoNext) { gClearTimeout(autoNext); autoNext = 0; round(); }
        return;
      }
      if (!item || col > 2) return;
      const chips = rowEl(THREAD_ROWS[col]).querySelectorAll(".vt-chip");
      const i = digitKey(e, chips.length);
      if (i >= 0) { e.preventDefault(); toggle(chips[i]); }
    };
    ctx.setScore(0);
    round();
  },
});

// "· trickiest: Imparfait" from a round's per-tense tally.
function weakestNote(tally) {
  const ks = Object.keys(tally).filter(k => tally[k][1] >= 2 && tally[k][0] < tally[k][1]);
  if (!ks.length) return "";
  ks.sort((a, b) => tally[a][0] / tally[a][1] - tally[b][0] / tally[b][1]);
  return ` · trickiest: ${vlTenseName(ks[0])}`;
}
