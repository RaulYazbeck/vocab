// ── GAME: VERB THREAD ─────────────────────────
// The reverse of Conjugation Slots: a form is given — "serons", "as
// été", "gingen" — and you unravel it. One stroke of the finger across
// three columns, like lines drawn on paper (or three taps):
//
//     Who?   je · tu · il/elle/on · nous · vous · ils/elles
//     When?  the tenses of your level, in timeline order
//     Means  the same form in your language — "nosotros seremos" /
//            "we went" (Spanish in the French app, English in German)
//
// A chip locks when the finger leaves its column to the right, so
// sliding up and down a column only changes your mind — no chip is
// ever picked by passing over it.
//
// Each knot locks as you pass it. Then the form splits into its parts
// in colour — the person ending in one colour, the tense marker in the
// tense's own colour (the same colours as ⏳ Timeline Drop) — so you
// learn to read any form by its pieces: -ons is nous, the r is futur,
// "hatte" is Plusquamperfekt.
//
// Forms that fit more than one person are part of the lesson: "parle"
// is je and il, "geht" is er and ihr — any right reading counts and the
// others light up. From 🥇 Gold, near-twins come up (allons / allions,
// serons / serions) and the infinitive is no longer shown; from 💠
// Platinum some forms are only heard (🎧) — then "parle", "parles" and
// "parlent" all fit, because they sound the same.
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
    "A verb form appears. Thread it: draw one line across Who? → When? → Means — or tap one chip per column.",
    "Then the form splits into colours: the person ending, the tense marker. Read any form by its pieces.",
    `Verbs you've met, tenses of your level. The meanings are in ${VL_FR ? "Spanish" : "English"}.`,
  ],
  requirement(pool) {
    const n = threadVerbs(pool).length;
    return n >= 4 ? { ok: true } : { ok: false, reason: `Needs 4 verbs you've met — you have ${n}` };
  },
  stars: [70, 120, 165],
  start(ctx) {
    const rp = ctx.rp;
    const tenses = threadTenses();
    const verbs = threadVerbs(ctx.pool);
    const total = ctx.rounds(8, 5, 6);
    const earOk = !!rp.ear && ctx.size === "full" && typeof audioOk === "function" && audioOk();
    let r = 0, score = 0, combo = 0, maxCombo = 0, clean = 0, wrong = 0, knots = 0, item = null, lastInf = "", lastT = "";
    let row = 0, picks = {}, missed = false, firstBad = "", autoNext = 0;
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
      const ts = tenses.filter(t => v.tenses.includes(t) && vlMeaning(v, t, vlPersonsOf(v)[0]));
      const cand = ts.filter(t => t !== lastT);
      return weightedPickDistinct(cand.length ? cand : ts, 1, t => 1.25 - vlTenseAcc("vt", t))[0];
    };
    const makeItem = (v, t, notP) => {
      const ps = shuffle(vlPersonsOf(v).filter(p => p !== notP));
      const ear = earOk && Math.random() < rp.ear;
      let best = null;
      for (const p of ps) {
        const fem = VL_FR && Math.random() < 0.3 && p !== "nous" && p !== "vous";
        const it = vlItem(v, t, p, tenses, { ear, fem });
        if (!it || (ear && it.form.replace(/\s/g, "").length < 4)) continue;
        if (!best) best = it;
        if (!rp.twins || it.twins.length) { best = it; break; }
      }
      return best;
    };
    const nextItem = () => {
      if (retry.length && (retry[0].at <= r || r >= total - 1)) {
        const m = retry.shift();
        const it = makeItem(m.v, m.t, m.p);
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
      if (rowId === "t") return `<button class="vt-chip vt-tchip" data-row="t" data-v="${o}" style="${vlTenseStyle(o)}"><span class="g-key">${i + 1}</span><span class="vt-sign">${VL_T[o].sign}</span>${escapeHtml(VL_T[o].short)}</button>`;
      if (rowId === "p") return `<button class="vt-chip vt-pchip" data-row="p" data-v="${o}"><span class="g-key">${i + 1}</span>${escapeHtml(vlPersonLabel(o))}</button>`;
      return `<button class="vt-chip vt-mchip" data-row="m" data-v="${escapeHtml(o)}"><span class="g-key">${i + 1}</span>${escapeHtml(o)}</button>`;
    }).join("");
    const render = () => {
      const it = item, w = it.v.word;
      const f = w ? ctx.fmt(w) : { rookie: false };
      const rookie = !!f.rookie;
      const nT = rookie ? 3 : rp.tOpts, nM = rookie ? 3 : rp.mOpts;
      it.tOpts = vlTenseOptions(it, tenses, Math.max(2, Math.min(nT, tenses.length)));
      it.mOpts = vlMeaningOptions(it, nM);
      const showInf = rp.inf || rookie || ctx.size !== "full";
      const persons = vlPersonsOf(it.v);
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
            <i class="vt-knot" id="vt-knot0"></i>
          </div>
          <div class="vt-cols">
          ${THREAD_ROWS.map((rid, i) => `
            <div class="vt-row${i === 0 ? " on" : ""}" data-row="${rid}" id="vt-row-${rid}">
              <div class="vt-row-label">${THREAD_ROW_LABEL[rid]}</div>
              <div class="vt-chips">${chipsHtml(rid, rid === "p" ? persons : rid === "t" ? it.tOpts : it.mOpts)}</div>
            </div>`).join("")}
          </div>
          <div class="vt-hint" id="vt-hint">${r <= 1 && ctx.size === "full" ? "☝️ Draw one line across: Who → When → Means — or tap" : ""}</div>
        </div>`;
      if (it.ear) {
        gTimeout(() => speak(it.form), 250);
        document.getElementById("vt-ear").onclick = () => speak(it.form, 0.7);
      }
      drawThread();
    };
    const round = () => {
      gClearTimeout(autoNext); autoNext = 0;
      if (r >= total) { done(); return; }
      item = nextItem();
      if (!item) { done(); return; }
      r++;
      lastInf = item.v.inf; lastT = item.t;
      row = 0; picks = {}; missed = false; firstBad = "";
      ctx.teach("");
      ctx.setBar((r - 1) / total, "progress");
      ctx.setRound(r, total);
      render();
      ctx.busy = false;
    };

    // ── The thread (SVG) ──
    const pt = (el, wrap, where = "c") => {
      const a = el.getBoundingClientRect(), b = wrap.getBoundingClientRect();
      const x = where === "l" ? a.left - b.left : where === "r" ? a.right - b.left : a.left - b.left + a.width / 2;
      const y = where === "top" ? a.top - b.top : where === "bot" ? a.bottom - b.top : a.top - b.top + a.height / 2;
      return { x, y };
    };
    // Vertical S-curve out of the card, horizontal S-curves between columns.
    const curve = (a, b, vertical) => {
      const f = n => n.toFixed(1);
      if (vertical) { const my = (a.y + b.y) / 2; return `M${f(a.x)},${f(a.y)} C${f(a.x)},${f(my)} ${f(b.x)},${f(my)} ${f(b.x)},${f(b.y)}`; }
      const mx = (a.x + b.x) / 2; return `M${f(a.x)},${f(a.y)} C${f(mx)},${f(a.y)} ${f(mx)},${f(b.y)} ${f(b.x)},${f(b.y)}`;
    };
    let live = null; // finger position while drawing
    const drawThread = (animateLast = false) => {
      const wrap = document.getElementById("vt-wrap"), svg = document.getElementById("vt-svg");
      if (!wrap || !svg) return;
      const b = wrap.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
      svg.setAttribute("width", b.width); svg.setAttribute("height", b.height);
      const knot0 = document.getElementById("vt-knot0");
      let prev = knot0 ? pt(knot0, wrap) : { x: b.width / 2, y: 0 };
      let out = "";
      // The thread runs chip to chip — into the first from the top, then
      // in on each chip's left edge and out on its right: never across a label.
      const inAt = (el, i) => pt(el, wrap, i === 0 ? "top" : "l");
      THREAD_ROWS.forEach((rid, i) => {
        const pk = picks[rid];
        if (!pk) return;
        if (pk.bad) out += `<path class="vt-line bad" d="${curve(prev, inAt(pk.bad, i), i === 0)}"/>`;
        const a = inAt(pk.el, i);
        const last = animateLast && i === row - 1;
        out += `<path class="vt-line${pk.ok ? "" : " fixed"}${last ? " draw" : ""}" style="${rid === "t" ? vlTenseStyle(pk.v) : ""}" d="${curve(prev, a, i === 0)}"/>`;
        out += `<circle class="vt-dot${pk.ok ? "" : " fixed"}" cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="5"/>`;
        prev = pt(pk.el, wrap, "r");
      });
      if (live && row < 3) out += `<path class="vt-line live" d="${curve(prev, live, row === 0)}"/><circle class="vt-dot live" cx="${live.x.toFixed(1)}" cy="${live.y.toFixed(1)}" r="7"/>`;
      svg.innerHTML = out;
    };

    // ── Picking a knot ──
    const rowEl = rid => document.getElementById("vt-row-" + rid);
    const setRow = i => {
      THREAD_ROWS.forEach((rid, j) => { const e = rowEl(rid); if (e) { e.classList.toggle("on", j === i); e.classList.toggle("done", j < i); } });
    };
    const knotSound = (i, ok) => {
      if (!gameSfxOn()) return;
      if (ok) playNotes([{ freq: [523, 659, 784][i] || 880, at: 0, dur: 0.11 }], 0.13);
      else playMiss();
    };
    const commit = (el) => {
      if (!item || ctx.busy || ctx.finished || ctx.paused || ctx.waiting || row > 2) return;
      const rid = THREAD_ROWS[row];
      if (!el || el.dataset.row !== rid) return;
      const v = el.dataset.v;
      let ok;
      if (rid === "p") ok = vlPersonOk(item, v);
      else if (rid === "t") ok = vlTenseOk(item, v, picks.p && picks.p.ok ? picks.p.v : item.p);
      else ok = vlMeaningOk(item, v);
      const chips = [...rowEl(rid).querySelectorAll(".vt-chip")];
      let target = el;
      if (ok) {
        el.classList.add("ok");
        knots++;
        // Every other reading of the form lights up too ("also").
        if (rid === "p") chips.forEach(c => { if (c !== el && vlPersonOk(item, c.dataset.v)) c.classList.add("also"); });
      } else {
        missed = true;
        if (!firstBad) firstBad = rid;
        el.classList.add("bad"); shakeEl(el);
        const pP = picks.p && picks.p.ok ? picks.p.v : item.p;
        const right = rid === "p" ? chips.find(c => c.dataset.v === item.p)
          : rid === "t" ? (chips.find(c => c.dataset.v === item.t && vlTenseOk(item, c.dataset.v, pP)) || chips.find(c => vlTenseOk(item, c.dataset.v, pP)))
          : chips.find(c => vlMeaningOk(item, c.dataset.v));
        if (right) { right.classList.add("right"); target = right; }
        haptic("miss");
      }
      if (ok) haptic("select");
      knotSound(row, ok);
      picks[rid] = { el: target, v: target.dataset.v, ok, bad: ok ? null : el };
      chips.forEach(c => c.disabled = true);
      row++;
      setRow(row);
      drawThread(true);
      if (row === 3) finishItem();
    };
    const finishItem = () => {
      ctx.busy = true;
      live = null; drawThread();
      const it = item;
      const perfect = !missed;
      const k = it.t;
      vlTenseRecord("vt", k, perfect);
      const t = tally[k] || (tally[k] = [0, 0]); if (perfect) t[0]++; t[1]++;
      // The colour split.
      const formEl = document.getElementById("vt-form");
      if (formEl) { formEl.classList.remove("vt-hidden"); formEl.removeAttribute("aria-hidden"); formEl.innerHTML = vlPartsHtml(it.parts, it.t, it.p, true); formEl.classList.add("split"); }
      const ear = document.getElementById("vt-ear"); if (ear) ear.remove();
      const card = document.getElementById("vt-card"); if (card) card.classList.add(perfect ? "ok" : "bad");
      speak(it.full);
      const others = it.valid.filter(x => !(x.p === it.p && x.t === it.t));
      const alsoLine = others.length ? `<div class="g-teach-sub">${it.ear ? "🎧 Sounds the same" : "Also fits"}: ${others.map(x => `<b>${escapeHtml(vlPersonLabel(x.p))}</b>${x.t !== it.t ? " · " + escapeHtml(vlTenseName(x.t)) : ""}`).join(", ")}</div>` : "";
      const twin = it.twins[0];
      const twinLine = twin ? `<div class="g-teach-sub">Twin: <b class="vl-twin">${escapeHtml(twin.form)}</b> → ${escapeHtml(vlTenseName(twin.t))}</div>` : "";
      const head = `<div class="g-teach-main">${escapeHtml(vlInfLabel(it.v))} · <span style="${vlTenseStyle(it.t)}" class="vl-tc">${escapeHtml(vlTenseName(it.t))}</span> · ${escapeHtml(vlPersonLabel(it.p))} → ${escapeHtml(it.meaning)}</div>`;
      const why = `<div class="g-teach-rule">${vlWhyHtml(it)}</div>`;
      if (perfect) {
        clean++; combo++; maxCombo = Math.max(maxCombo, combo);
        const w = it.v.word;
        const pts = ctx.award(w, 15 + (it.ear ? 5 : 0) + (it.twins.length && rp.twins ? 3 : 0) + Math.min(combo - 1, 5) * 2);
        score += pts;
        floatScore(formEl || card, "+" + pts, w && ctx.isGolden(w) ? "gold" : "");
        if (combo >= 3) playCombo(combo); else playSuccess();
        haptic("correct");
        ctx.say("Thread complete");
        ctx.teach(`${head}${why}${alsoLine}`, "ok");
        autoNext = gTimeout(round, 2300);
      } else {
        wrong++;
        combo = ctx.comboAfterMiss(combo, it.v.word);
        const right = Object.values(picks).filter(p => p.ok).length;
        const pts = right * 3;
        score += pts;
        if (pts) floatScore(formEl || card, "+" + pts);
        const card2 = vlCardFor(it.v, it.t, it.p);
        if (card2) ctx.missed(card2, { type: { p: "person", t: "tense", m: "recognition" }[firstBad] || "verbform", given: "", expected: [it.form] });
        if (!retry.some(x => x.v === it.v)) retry.push({ v: it.v, t: it.t, p: it.p, at: r + 3 });
        ctx.say(`${it.form}: ${vlPersonLabel(it.p)}, ${vlTenseName(it.t)}`);
        ctx.teach(`${head}${why}${twinLine}${alsoLine}`, "bad");
        ctx.waitContinue(ctx.sudden ? done : round);
      }
      ctx.setScore(score); ctx.setCombo(combo);
    };

    // ── One stroke (or taps) ──
    // The pick in a column is the LAST chip where the line turned by 40°+
    // (a corner, measured over ~16 px either side) or where the finger
    // rested 160 ms. A line straight through a column picks the chip whose
    // centre it passes closest to — not one it only clipped at a corner.
    // Samples outside the active column's chips don't count.
    const strokePick = pts => {
      const on = pts.filter(q => q.c);
      if (!on.length) return null;
      const back = (i, d) => { for (let j = i - 1; j >= 0; j--) if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) >= d) return pts[j]; return null; };
      const fwd = (i, d) => { for (let j = i + 1; j < pts.length; j++) if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) >= d) return pts[j]; return null; };
      let pick = null;
      pts.forEach((q, i) => {
        if (!q.c) return;
        const a = back(i, 16), b = fwd(i, 16);
        let turn = 0;
        if (a && b) {
          const v1x = q.x - a.x, v1y = q.y - a.y, v2x = b.x - q.x, v2y = b.y - q.y;
          const cos = (v1x * v2x + v1y * v2y) / (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) || 1);
          turn = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
        }
        let k = i; while (k + 1 < pts.length && Math.hypot(pts[k + 1].x - q.x, pts[k + 1].y - q.y) < 10) k++;
        const rest = pts[k].t - q.t;
        if (turn >= 40 || rest >= 160) pick = q.c;
      });
      if (pick) return pick;
      // No corner: the chip the line runs through most centrally.
      let best = null, bestD = Infinity;
      on.forEach(q => {
        const r = q.c.getBoundingClientRect();
        const d = Math.hypot((q.x - (r.left + r.width / 2)) / r.width, (q.y - (r.top + r.height / 2)) / r.height);
        if (d < bestD) { bestD = d; best = q.c; }
      });
      return best;
    };
    // Bound once on the stage: every new form re-renders inside it.
    const bindStroke = () => {
      const wrapEl = () => document.getElementById("vt-wrap");
      let drawing = null;
      const chipAt = (x, y) => {
        if (row > 2) return null;
        const chips = rowEl(THREAD_ROWS[row]).querySelectorAll(".vt-chip");
        for (const c of chips) if (pointIn(c, x, y, 4)) return c;
        return null;
      };
      const hoverOn = el => {
        ctx.stage.querySelectorAll(".vt-chip.hover").forEach(c => c !== el && c.classList.remove("hover"));
        if (el && !el.classList.contains("hover")) { el.classList.add("hover"); if (gameSfxOn()) playNotes([{ freq: 1100, at: 0, dur: 0.03 }], 0.04); }
      };
      gListen(ctx.stage, "pointerdown", e => {
        if (e.button !== undefined && e.button !== 0) return;
        if (!item || ctx.busy || ctx.waiting || row > 2 || !e.target.closest("#vt-wrap") || e.target.closest(".vt-ear")) return;
        drawing = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, pts: [] };
      });
      gListen(window, "pointermove", e => {
        if (!drawing || e.pointerId !== drawing.id) return;
        if (!drawing.moved && Math.hypot(e.clientX - drawing.x0, e.clientY - drawing.y0) < 8) return;
        drawing.moved = true;
        e.preventDefault();
        const wrap = wrapEl();
        if (!wrap) return;
        const b = wrap.getBoundingClientRect();
        live = { x: e.clientX - b.left, y: e.clientY - b.top };
        const c = chipAt(e.clientX, e.clientY);
        if (c) hoverOn(c);
        drawing.pts.push({ x: e.clientX, y: e.clientY, t: performance.now(), c });
        // Leaving the active column to the right locks the chip where your
        // line turned (or rested) — never one it merely passed over.
        if (row <= 2) {
          const cr = rowEl(THREAD_ROWS[row]).getBoundingClientRect();
          if (e.clientX > cr.right + 2 && !c) {
            const pick = strokePick(drawing.pts);
            drawing.pts = [{ x: e.clientX, y: e.clientY, t: performance.now(), c: null }];
            hoverOn(null);
            if (pick) commit(pick);
          }
        }
        drawThread();
      }, { passive: false });
      const end = e => {
        if (!drawing || e.pointerId !== drawing.id) return;
        const d = drawing; drawing = null;
        live = null; hoverOn(null);
        if (d.moved) {
          _dragJustEnded = Date.now();
          // Lifting on a chip picks it; lifting in a gap keeps the turn.
          const on = chipAt(e.clientX, e.clientY);
          const pick = on || strokePick(d.pts);
          if (pick) commit(pick);
          drawThread();
        }
      };
      gListen(window, "pointerup", end);
      gListen(window, "pointercancel", e => { if (drawing && e.pointerId === drawing.id) { drawing = null; live = null; hoverOn(null); drawThread(); } });
      // Taps (a stroke never also counts as a tap).
      gListen(ctx.stage, "click", e => {
        if (Date.now() - _dragJustEnded < 350) return;
        const c = e.target.closest(".vt-chip");
        if (c) { commit(c); return; }
        if (!ctx.waiting && autoNext && row > 2) { gClearTimeout(autoNext); autoNext = 0; round(); }
      });
    };
    // Tap the teaching card to move on sooner after a clean thread.
    gListen(document.getElementById("g-teach"), "click", e => {
      if (e.target.closest("button")) return;
      if (autoNext && !ctx.waiting) { gClearTimeout(autoNext); autoNext = 0; round(); }
    });
    gListen(window, "resize", () => drawThread());
    ctx.onKey = e => {
      if (!item || row > 2) { if (e.key === "Enter" && autoNext) { e.preventDefault(); gClearTimeout(autoNext); autoNext = 0; round(); } return; }
      const chips = rowEl(THREAD_ROWS[row]).querySelectorAll(".vt-chip");
      const i = digitKey(e, chips.length);
      if (i >= 0) { e.preventDefault(); commit(chips[i]); }
    };
    bindStroke();
    ctx.setScore(0);
    round();
  },
});

// "· weakest: Imparfait" from a round's per-tense tally.
function weakestNote(tally) {
  const ks = Object.keys(tally).filter(k => tally[k][1] >= 2 && tally[k][0] < tally[k][1]);
  if (!ks.length) return "";
  ks.sort((a, b) => tally[a][0] / tally[a][1] - tally[b][0] / tally[b][1]);
  return ` · trickiest: ${vlTenseName(ks[0])}`;
}
