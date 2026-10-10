// ── GRAMMAR: SHEETS, QUIZZES, THE VERB MAP ────
// The screens of the verb track (verb-track.js), German app only:
//
//   • The sheet viewer — one sheet in bites: structure → rules → the
//     table → examples & the trap → the quiz. Swipe or ←/→ between
//     them; the quiz is 3–5 questions (pick, type, put in order, which
//     rule?). Every miss shows why and comes back at the end of the quiz.
//     The same viewer runs inside a Today session (a 📖 lesson item),
//     in ☰ › 📐 Grammar and, read-only, over a verb exercise.
//   • ☰ › 📐 Grammar — the ten tenses in order (🔒 with the day they
//     open · 📖 lesson · 🔁 practising · ✅ solid), their sheets, and
//     the verb ledger level by level.
//   • The switch screen — what turning the new system on changes, on
//     your own numbers, before anything changes.
//   • Today's verb cards — a new verb item, a typed verb exercise and
//     its feedback (the form split into its coloured parts, the rule).
// ─────────────────────────────────────────────

// ── MARKUP ────────────────────────────────────
// **bold** · [[verb]] in the tense colour · ~~struck~~ · *italic*
function gsMd(s) {
  return escapeHtml(String(s || ""))
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\[\[(.+?)\]\]/g, `<b class="gs-v">$1</b>`)
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:!?]|$)/g, "$1<i>$2</i>");
}
function gsUnitOf(sheet) { return VX_UNIT[sheet.unit] || { hue: 38, sign: "•", name: "" }; }
function gsStructHtml(sh) {
  // A "+" only between two real pieces — never next to "…", an arrow or "!".
  const loose = (t, k) => k === "mid" || /^[,.…!→(]/.test(t) || /^[!…]$/.test(t);
  return `<div class="gs-struct" aria-label="Structure">${sh.struct.map(([t, k], i) => {
    const plus = i && !loose(t, k) && !loose(...sh.struct[i - 1]);
    return `${plus ? `<span class="gs-plus" aria-hidden="true">+</span>` : ""}<span class="gs-blk k-${k}">${gsMd(t)}</span>`;
  }).join("")}</div>`;
}
// Your own verbs that follow the sheet's rule (met, in the order met).
function gsMineList(kind, n = 14) {
  if (typeof vxVerbs !== "function" || !vxAvailable()) return [];
  const test = {
    regular: x => !x.k.irregular && !x.k.stem && !x.k.glue && !x.F.sep && !x.F.refl,
    glue: x => x.k.glue && !x.k.stem && !x.k.irregular,
    stem: x => x.k.stem, sep: x => !!x.F.sep, refl: x => !!x.F.refl,
    sein: x => x.F.aux === "sein", strong: x => x.k.strongPt && !x.k.irregular, mixed: x => x.k.mixed,
    prefix: x => (!!x.F.sep || !!x.F.insep || x.k.ieren) && !x.F.strong, etoi: x => !!x.F.eToI,
    weakpt: x => x.k.ptWeak,
  }[kind];
  if (!test) return [];
  return vxVerbs().filter(x => test(x) && vxLemma(x).st > 0)
    .sort((a, b) => (vxLemma(a).met || "").localeCompare(vxLemma(b).met || "")).slice(0, n).map(x => x.inf);
}
function gsMineHtml(sh) {
  const list = sh.mine ? gsMineList(sh.mine) : [];
  return list.length ? `<div class="gs-mine"><span>Your verbs that do this</span>${list.map(v => `<i>${escapeHtml(v)}</i>`).join("")}</div>` : "";
}
function gsTableHtml(sh) {
  if (sh.table) {
    const t = sh.table;
    return `<div class="gs-table-wrap"><table class="gs-table"><thead><tr>${t.head.map(h => `<th>${gsMd(h)}</th>`).join("")}</tr></thead>
      <tbody>${t.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${gsMd(c)}</td>` : `<th scope="row">${gsMd(c)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  if (sh.lines) return `<div class="gs-lines">${sh.lines.map(([l, x]) => `<div class="gs-line"><b>${gsMd(l)}</b><span>${gsMd(x)}</span></div>`).join("")}</div>`;
  return "";
}
function gsExamplesHtml(sh) {
  return `<div class="gs-ex">${(sh.ex || []).map(([de, en]) => `<div class="gs-ex-row">
      <button class="gs-say" type="button" onclick="gsSpeak(this)" data-say="${escapeHtml(de.replace(/\[\[|\]\]/g, ""))}" aria-label="Listen">🔊</button>
      <div><div class="gs-ex-de">${gsMd(de)}</div><div class="gs-ex-en">${escapeHtml(en)}</div></div></div>`).join("")}</div>`;
}
function gsSpeak(btn) { if (typeof speak === "function" && typeof audioOk === "function" && audioOk()) speak(btn.dataset.say); }
function gsBuildsHtml(sh) {
  // Sheets this one leans on: the earlier sheets of the units it requires.
  const u = VX_UNIT[sh.unit];
  if (!u || !u.req.length) return "";
  const names = u.req.map(r => VX_UNIT[r] && VX_UNIT[r].name).filter(Boolean);
  return `<div class="gs-builds">Builds on: ${names.map(n => `<b>${escapeHtml(n)}</b>`).join(" · ")}</div>`;
}
// The reading bites of a sheet (the quiz comes after them).
function gsSteps(sh) {
  const steps = [];
  steps.push({ id: "struct", label: "Structure", html: `${gsStructHtml(sh)}<p class="gs-why">🧠 ${gsMd(sh.why)}</p>${gsBuildsHtml(sh)}` });
  if (sh.rules && sh.rules.length) steps.push({ id: "rules", label: "Rules", html: `<ol class="gs-rules">${sh.rules.map(r => `<li>${gsMd(r)}</li>`).join("")}</ol>` });
  const tbl = gsTableHtml(sh), mine = gsMineHtml(sh);
  if (tbl || mine) steps.push({ id: "table", label: sh.table ? "Table" : "List", html: `${tbl}${mine}` });
  steps.push({ id: "ex", label: "Examples", html: `${gsExamplesHtml(sh)}<div class="gs-trap"><b>⚠️ The trap</b><span>${gsMd(sh.trap)}</span></div>` });
  return steps;
}

// ── THE VIEWER ────────────────────────────────
// One viewer at a time. host: the element it draws into.
//   opts.mode  "path" (in Today) · "menu" · "peek" (read only)
//   opts.onDone(result) — after the quiz: { passed, score, all }
let _gs = null;
function gsOpen(host, id, opts = {}) {
  const sh = vxSheet(id);
  if (!sh || !host) return;
  _gs = { host, sh, steps: gsSteps(sh), step: 0, mode: opts.mode || "menu", onDone: opts.onDone || null, quiz: null };
  if (typeof migrateVerb === "function") { migrateVerb(); S.verb.sr[id] = 1; }
  gsRender();
}
function gsClose() { _gs = null; }
function gsRender(dir = "") {
  const g = _gs;
  if (!g) return;
  const sh = g.sh, u = gsUnitOf(sh);
  const reading = g.step < g.steps.length;
  const total = g.steps.length + (g.mode === "peek" ? 0 : 1);
  const dots = Array.from({ length: total }, (_, i) => `<i class="${i === g.step ? "on" : i < g.step ? "done" : ""}${i === g.steps.length ? " q" : ""}"></i>`).join("");
  const n = vxSheetIds(sh.unit).indexOf(sh.id) + 1, of = vxSheetIds(sh.unit).length;
  const head = `<div class="gs-head" style="${vxUnitStyle(sh.unit)}">
      <span class="gs-unit"><span class="gs-sign">${u.sign}</span>${escapeHtml(u.name)} · ${n}/${of}</span>
      <h2 class="gs-title">${escapeHtml(sh.title)}</h2>
      <div class="gs-dots" aria-hidden="true">${dots}</div>
    </div>`;
  const body = reading ? `<div class="gs-step ${dir}" id="gs-step"><div class="gs-step-label">${escapeHtml(g.steps[g.step].label)}</div>${g.steps[g.step].html}</div>`
    : `<div class="gs-step ${dir}" id="gs-step">${gsQuizHtml()}</div>`;
  const last = g.step === g.steps.length - 1;
  const nav = reading ? `<div class="gs-nav">
      ${g.step > 0 ? `<button class="g-sec-btn gs-prev" onclick="gsGo(-1)" aria-label="Back">‹</button>` : `<span></span>`}
      ${g.mode === "peek" && last ? `<button class="g-big-btn gs-next" onclick="gsPeekClose()">Back to the exercise</button>`
        : `<button class="g-big-btn gs-next" id="gs-next" onclick="gsGo(1)">${last ? "Quiz ▶" : "Next ›"}</button>`}
    </div>` : "";
  g.host.innerHTML = `<div class="gs-viewer" style="${vxUnitStyle(sh.unit)}" id="gs-viewer">${head}${body}${nav}</div>`;
  if (!reading) gsQuizBind();
  gsBindSwipe();
  const nx = document.getElementById("gs-next");
  if (nx && g.mode !== "path") try { nx.focus({ preventScroll: true }); } catch (e) {}
}
function gsGo(d) {
  const g = _gs;
  if (!g) return;
  const max = g.steps.length + (g.mode === "peek" ? -1 : 0);
  const to = Math.max(0, Math.min(max, g.step + d));
  if (to === g.step) return;
  g.step = to;
  if (g.step === g.steps.length && !g.quiz) gsQuizStart();
  gsRender(d > 0 ? "fwd" : "back");
  const v = document.getElementById("gs-viewer");
  if (v && v.getBoundingClientRect().top < 0) v.scrollIntoView({ block: "start", behavior: "smooth" });
}
function gsBindSwipe() {
  const el = document.getElementById("gs-step");
  if (!el || !_gs || _gs.step >= _gs.steps.length) return;
  let x0 = null, y0 = null;
  el.addEventListener("touchstart", e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
  el.addEventListener("touchend", e => {
    if (x0 === null) return;
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) gsGo(dx < 0 ? 1 : -1);
  }, { passive: true });
}
// Keys: ←/→ between bites · Enter = next / check · digits pick.
function gsKey(e) {
  const g = _gs;
  if (!g || !document.getElementById("gs-viewer")) return false;
  const inInput = e.target && e.target.tagName === "INPUT";
  if (g.step < g.steps.length) {
    if (e.key === "ArrowRight" || (e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON"))) { e.preventDefault(); if (g.mode === "peek" && g.step === g.steps.length - 1) gsPeekClose(); else gsGo(1); return true; }
    if (e.key === "ArrowLeft") { e.preventDefault(); gsGo(-1); return true; }
    return false;
  }
  const q = g.quiz;
  if (!q) return false;
  if (q.done) { if (e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")) { e.preventDefault(); gsQuizFinish(); return true; } return false; }
  if (e.key === "Enter") {
    if (e.target && e.target.tagName === "BUTTON" && !e.target.disabled) return false;
    e.preventDefault();
    if (q.answered) gsQuizNext(); else gsQuizCheck();
    return true;
  }
  const cur = q.list[q.i];
  if (!inInput && !q.answered && cur && (cur.q.k === "pick" || cur.q.k === "odd" || cur.q.k === "why")) {
    const d = parseInt(e.key, 10);
    if (d >= 1 && d <= cur.q.o.length) { e.preventDefault(); gsQuizPick(cur.order[d - 1]); return true; }
  }
  return false;
}
document.addEventListener("keydown", e => {
  // The Today session routes its keys itself (mode-path.js).
  if (!_gs || _gs.mode === "path") return;
  if (document.querySelector(".modal-overlay:not(#gs-peek)")) return;
  gsKey(e);
});

// ── THE QUIZ ──────────────────────────────────
// Every question once; a miss shows why and comes back at the end (until
// it's right, three rounds at most). Score = right on the first try.
function gsQuizStart() {
  const g = _gs;
  const list = g.sh.quiz.map((q, i) => ({ q, i, order: gsOrderOf(q), first: true, picked: [] }));
  g.quiz = { list, i: 0, firstRight: 0, n: list.length, answered: false, done: false };
}
// Blocks / options in a shuffled order (blocks never already in order).
function gsOrderOf(q) {
  const src = q.k === "order" ? q.a : q.o;
  if (!src) return [];
  const idx = src.map((_, i) => i);
  for (let t = 0; t < 8; t++) { shuffle(idx); if (q.k !== "order" || idx.some((v, i) => q.a[v] !== q.a[i])) break; }
  return idx;
}
function gsQuizHtml() {
  const q = _gs.quiz;
  if (!q) return "";
  if (q.done) return gsQuizResultHtml();
  const cur = q.list[q.i], Q = cur.q;
  const pos = `<div class="gs-qpos">Question ${Math.min(q.i + 1, q.list.length)} of ${q.list.length}${cur.first ? "" : " · one more try"}</div>`;
  let body = "";
  if (Q.k === "type") {
    body = `<div class="gs-qtext">${gsMd(Q.q)}</div>
      <input type="text" class="german-input gs-input" id="gs-input" placeholder="type it…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
      ${typeof accentBarHtml === "function" ? accentBarHtml("gs-input") : ""}`;
  } else if (Q.k === "order") {
    body = `<div class="gs-qtext">${gsMd(Q.q)}</div>
      <div class="gs-built" id="gs-built" aria-label="Your sentence">${cur.picked.map((bi, j) => `<button class="gs-tok on" data-j="${j}">${escapeHtml(Q.a[bi])}</button>`).join("") || `<span class="gs-built-ph">tap the words in order</span>`}</div>
      <div class="gs-bank" id="gs-bank">${cur.order.map(bi => `<button class="gs-tok" data-b="${bi}" ${cur.picked.includes(bi) ? "disabled" : ""}>${escapeHtml(Q.a[bi])}</button>`).join("")}</div>`;
  } else {
    body = `<div class="gs-qtext">${gsMd(Q.q)}</div>
      <div class="gs-opts">${cur.order.map((oi, j) => `<button class="g-opt gs-opt" data-o="${oi}"><span class="g-key">${j + 1}</span><span class="g-opt-text">${gsMd(Q.o[oi])}</span></button>`).join("")}</div>`;
  }
  const check = Q.k === "type" || Q.k === "order";
  return `<div class="gs-quiz">${pos}${body}<div class="gs-qfb" id="gs-qfb" aria-live="polite"></div>
    <div class="gs-qact" id="gs-qact">${check ? `<button class="g-big-btn" id="gs-check" onclick="gsQuizCheck()">Check</button>` : ""}</div></div>`;
}
function gsQuizBind() {
  const q = _gs && _gs.quiz;
  if (!q || q.done) return;
  const cur = q.list[q.i];
  if (cur.q.k === "type") {
    const inp = document.getElementById("gs-input");
    if (inp) {
      inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (q.answered) gsQuizNext(); else gsQuizCheck(); } });
      setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 60);
    }
  } else if (cur.q.k === "order") {
    document.querySelectorAll("#gs-bank .gs-tok").forEach(b => b.onclick = () => { if (q.answered) return; cur.picked.push(+b.dataset.b); gsRefreshOrder(); });
    document.querySelectorAll("#gs-built .gs-tok").forEach(b => b.onclick = () => { if (q.answered) return; cur.picked.splice(+b.dataset.j, 1); gsRefreshOrder(); });
  } else {
    document.querySelectorAll(".gs-opt").forEach(b => b.onclick = () => gsQuizPick(+b.dataset.o));
  }
}
function gsRefreshOrder() {
  const step = document.getElementById("gs-step");
  if (!step) return;
  step.innerHTML = gsQuizHtml();
  gsQuizBind();
}
function gsQuizPick(oi) {
  const q = _gs.quiz, cur = q.list[q.i];
  if (q.answered) return;
  const ok = oi === cur.q.a;
  document.querySelectorAll(".gs-opt").forEach(b => {
    const o = +b.dataset.o;
    b.disabled = true;
    if (o === cur.q.a) b.classList.add("right");
    else if (o === oi) b.classList.add("wrong");
  });
  gsQuizAnswered(ok, cur.q.o[oi]);
}
function gsQuizCheck() {
  const q = _gs && _gs.quiz;
  if (!q || q.answered || q.done) return;
  const cur = q.list[q.i], Q = cur.q;
  if (Q.k === "type") {
    const inp = document.getElementById("gs-input"), val = inp ? inp.value : "";
    if (!val.trim()) { if (inp) shakeEl(inp); return; }
    const v = normalize(val.replace(/!+$/, "").replace(/\s*[,·]\s*/g, " "));
    const ok = Q.a.some(a => normalize(a) === v);
    if (!ok && isNearMiss(val, Q.a) && !cur.near) {
      cur.near = true;
      inp.classList.add("near");
      document.getElementById("gs-qfb").innerHTML = `<div class="p-near">≈ Almost — check the spelling and try again</div>`;
      setTimeout(() => { inp.classList.remove("near"); inp.select(); }, 600);
      return;
    }
    inp.disabled = true;
    inp.classList.add(ok ? "correct" : "wrong");
    gsQuizAnswered(ok, val);
  } else if (Q.k === "order") {
    if (cur.picked.length < Q.a.length) { shakeEl(document.getElementById("gs-built")); return; }
    const ok = cur.picked.every((bi, j) => Q.a[bi] === Q.a[j]);
    document.querySelectorAll("#gs-built .gs-tok").forEach(b => { b.disabled = true; });
    document.getElementById("gs-built").classList.add(ok ? "ok" : "bad");
    gsQuizAnswered(ok, cur.picked.map(bi => Q.a[bi]).join(" "));
  }
}
function gsQuizAnswered(ok, given) {
  const g = _gs, q = g.quiz, cur = q.list[q.i], Q = cur.q;
  q.answered = true;
  if (ok && cur.first) q.firstRight++;
  // A miss comes back at the end — up to twice more.
  if (!ok) { cur.missed = true; if (q.list.filter(x => x.i === cur.i).length < 3) q.list.push({ ...cur, first: false, missed: false, picked: [], order: gsOrderOf(Q), near: false }); }
  const right = Q.k === "type" ? Q.a[0] : Q.k === "order" ? Q.a.join(" ") : Q.o[Q.a];
  const fb = document.getElementById("gs-qfb");
  if (fb) fb.innerHTML = ok ? `<div class="p-ok">✓ Right</div><div class="gs-qwhy">${gsMd(Q.why)}</div>`
    : `<div class="p-bad">✗ ${Q.k === "type" || Q.k === "order" ? `Answer: <strong>${escapeHtml(right)}</strong>` : "Not this one"}</div><div class="gs-qwhy">${gsMd(Q.why)}</div><div class="gs-qback">It comes back at the end.</div>`;
  const act = document.getElementById("gs-qact");
  if (act) act.innerHTML = `<button class="g-big-btn" id="gs-qnext" onclick="gsQuizNext()">${q.i + 1 >= q.list.length ? "See result" : "Next ›"}</button>`;
  if (ok) { if (typeof playSuccess === "function") playSuccess(); if (typeof haptic === "function") haptic("select"); }
  else { if (typeof playFailure === "function") playFailure(); if (typeof haptic === "function") haptic("miss"); if (typeof holdAfterMistake === "function") holdAfterMistake("gs-qnext"); }
  // The answer counts like any other in Today (the day's plan, quests).
  if (typeof logEvent === "function") logEvent("answer", { m: g.mode === "path" ? "path:quiz" : "grammar:quiz", ok, typed: Q.k === "type" });
  if (g.mode === "path" && typeof questEvent === "function") questEvent("answer", { mode: "path", ok, typed: Q.k === "type" });
  if (g.mode === "path" && pathSession) { pathSession.stats.answered++; if (ok) { pathSession.stats.correct++; addExp(3); } else pathSession.stats.wrong++; }
  if (!ok && typeof _learnDay === "function") _learnDay("mk", Q.k === "order" ? "order" : Q.k === "type" ? "verbform" : "recognition");
  const btn = document.getElementById("gs-qnext");
  if (btn && g.mode !== "path") setTimeout(() => { try { btn.focus({ preventScroll: true }); } catch (e) {} }, 30);
}
function gsQuizNext() {
  const q = _gs && _gs.quiz;
  if (!q || !q.answered) return;
  if (typeof mistakeHeld === "function" && mistakeHeld("gs-qfb")) return;
  q.answered = false;
  q.i++;
  if (q.i >= q.list.length) q.done = true;
  const step = document.getElementById("gs-step");
  if (step) { step.innerHTML = gsQuizHtml(); step.className = "gs-step fwd"; }
  gsQuizBind();
  if (q.done) gsQuizSettle();
}
// The quiz is over: record it once.
function gsQuizSettle() {
  const g = _gs, q = g.quiz;
  if (q.settled) return;
  q.settled = true;
  const score = q.n ? q.firstRight / q.n : 0;
  // Every question right in the end: the last attempt at each was right.
  const lastOf = new Map();
  q.list.forEach(it => lastOf.set(it.i, it));
  const all = [...lastOf.values()].every(it => !it.missed);
  q.result = { score, all, passed: false };
  if (g.mode !== "peek") q.result.passed = vxSheetResult(g.sh.id, score, all, g.mode);
  const step = document.getElementById("gs-step");
  if (step) step.innerHTML = gsQuizHtml();
  if (q.result.passed && typeof confettiBurst === "function") confettiBurst(30);
}
function gsQuizResultHtml() {
  const g = _gs, q = g.quiz, r = q.result || { score: 0, passed: false };
  const pct = Math.round(r.score * 100);
  const unitDone = r.passed && vxUnitOpen(g.sh.unit) && vxUnitSheetsPassed(g.sh.unit);
  const next = gsNextSheetOf(g.sh);
  return `<div class="gs-result ${r.passed ? "ok" : "bad"}">
    <div class="gs-result-icon">${r.passed ? (unitDone ? VX_UNIT[g.sh.unit].sign : "✅") : "📖"}</div>
    <div class="gs-result-title">${r.passed ? (unitDone ? `${escapeHtml(VX_UNIT[g.sh.unit].name)} unlocked!` : "Sheet passed") : "Not yet"}</div>
    <div class="gs-result-sub">${q.firstRight}/${q.n} right first time (${pct}%)${r.passed ? "" : ` · you need ${Math.ceil(VX_PASS_RE * q.n)}/${q.n} and every question right in the end`}</div>
    ${unitDone ? `<div class="gs-result-note">It joins your reviews and the verb games from now on.</div>` : ""}
    <div class="gs-result-act">
      ${r.passed ? "" : `<button class="g-sec-btn" onclick="gsRestart()">Read it again</button>`}
      ${g.mode === "path" ? `<button class="g-big-btn" id="gs-done" onclick="gsQuizFinish()">${r.passed ? "Continue ▶" : "Later ▶"}</button>`
        : next && r.passed ? `<button class="g-big-btn" onclick="renderGrammarSheet('${next.id}')">Next sheet ›</button>`
        : `<button class="g-big-btn" onclick="renderGrammarUnit('${g.sh.unit}')">Done ✓</button>`}
    </div></div>`;
}
function gsNextSheetOf(sh) { const ids = vxSheetIds(sh.unit); const i = ids.indexOf(sh.id); return i >= 0 && ids[i + 1] ? vxSheet(ids[i + 1]) : null; }
function gsRestart() { if (!_gs) return; _gs.quiz = null; _gs.step = 0; gsRender("back"); }
function gsQuizFinish() {
  const g = _gs;
  if (!g || !g.quiz || !g.quiz.done) return;
  const res = g.quiz.result, cb = g.onDone;
  if (cb) cb(res);
}

// ── A SHEET OVER AN EXERCISE (read only) ──────
function gsPeek(id) {
  if (!vxSheet(id)) return;
  const prev = _gs;
  const m = document.createElement("div");
  m.className = "modal-overlay"; m.id = "gs-peek";
  m.innerHTML = `<div class="modal-sheet gs-peek-sheet" role="dialog" aria-modal="true"><button class="set-close gs-peek-x" onclick="gsPeekClose()" aria-label="Close">✕</button><div id="gs-peek-host"></div></div>`;
  m.onclick = e => { if (e.target === m) gsPeekClose(); };
  document.body.appendChild(m);
  _gsPeekPrev = prev;
  gsOpen(document.getElementById("gs-peek-host"), id, { mode: "peek" });
  if (typeof logEvent === "function") logEvent("vx_peek", { id });
}
let _gsPeekPrev = null;
function gsPeekClose() {
  const m = document.getElementById("gs-peek");
  if (m) m.remove();
  _gs = _gsPeekPrev; _gsPeekPrev = null;
  const inp = document.getElementById("p-input");
  if (inp && document.getElementById("p-typed") && document.getElementById("p-typed").style.display !== "none") try { inp.focus({ preventScroll: true }); } catch (e) {}
}
document.addEventListener("keydown", e => {
  if (!document.getElementById("gs-peek")) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); gsPeekClose(); return; }
  if (_gs && _gs.mode === "peek") { gsKey(e); e.stopPropagation(); }
}, true);

// ── ☰ › 📐 GRAMMAR ────────────────────────────
function renderGrammar() {
  showGameScreen();
  gsClose();
  migrateVerb();
  if (vxOn()) vxUnitsTick(true);
  const on = vxOn();
  const scan = pathScan();
  const L = on ? vxLedger() : null;
  const passed = GS_SHEETS.filter(s => vxSheetPassed(s.id)).length;
  const open = VX_UNITS.filter(u => vxUnitOpen(u.id)).length;
  const pend = vxPendingSheets();
  const next = pend.length ? vxSheet(pend[0]) : null;
  const units = VX_UNITS.map(u => gsUnitRowHtml(u, scan)).join("");
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar">
    <div class="screen-top"><div class="screen-label">📐 Grammar · Verbs</div>${backBtnHtml()}</div>
    ${on ? "" : vxSwitchCardHtml()}
    <div class="gr-sum">
      <div><b>${on ? open : "—"}</b><span>/ 10 tenses open</span></div>
      <div><b>${passed}</b><span>/ ${GS_SHEETS.length} sheets</span></div>
      <div><b>${L ? L.all.done : "—"}</b><span>/ ${vxVerbs().length} verbs complete</span></div>
    </div>
    ${next ? `<button class="gr-next" onclick="renderGrammarSheet('${next.id}')" style="${vxUnitStyle(next.unit)}">
      <span class="gr-next-k">📖 Your next lesson — also comes in Today</span>
      <span class="gr-next-t">${VX_UNIT[next.unit].sign} ${escapeHtml(VX_UNIT[next.unit].name)} · ${escapeHtml(next.title)}</span></button>` : ""}
    <div class="gr-h">The tenses, in the order you learn them</div>
    <div class="gr-units">${units}</div>
    ${L ? gsLedgerHtml(L) : ""}
    <details class="gr-how"><summary>ℹ️ How the verb track works</summary>
      <p><b>Tenses open in order</b> — each one only after the tenses it is built from, and when your Path gets that far (so your finish date sets the day). A new tense starts with its sheets in Today, one or two a day; pass each quiz and the tense joins your reviews and the verb games.</p>
      <p><b>Rules, not lists.</b> Each rule is one item in your reviews, asked every time with another verb you've met — A1 verbs first, the regular ones before the exceptions. Verbs you can't build by rule (ging, ist gegangen, fährt, nimm!) get their own item.</p>
      <p><b>The ledger</b> checks every verb: its meaning Known, its irregular forms Known, and its Präsens, Präteritum and Perfekt produced right at least once — the three every other tense is built from.</p>
    </details>
    ${on ? `<div class="gr-foot"><button class="g-link-btn" onclick="vxConfirmOff()">Switch back to the old verb cards</button></div>` : ""}
  </div>`;
  if (typeof logScreen === "function") logScreen("grammar");
}
function gsUnitRowHtml(u, scan) {
  const st = vxOn() ? vxUnitState(u.id) : 0;
  const ids = vxSheetIds(u.id), done = ids.filter(vxSheetPassed).length;
  const eta = st === 0 && vxOn() ? vxUnitEta(u, scan) : null;
  const waits = st === 0 && vxOn() ? u.req.filter(r => !vxUnitOpen(r)).map(r => VX_UNIT[r].name) : [];
  const chip = !vxOn() ? `<span class="gr-st">${done}/${ids.length} read</span>`
    : st === 3 ? `<span class="gr-st solid">✅ Solid</span>`
    : st === 2 ? `<span class="gr-st open">🔁 Practising</span>`
    : st === 1 ? `<span class="gr-st lesson">📖 Lesson ${done}/${ids.length}</span>`
    : `<span class="gr-st lock">🔒 ${eta ? "≈ " + fmtShortDate(eta) : waits.length ? "after " + escapeHtml(waits[0]) : "soon"}</span>`;
  return `<button class="gr-unit s${st}" style="${vxUnitStyle(u.id)}" onclick="renderGrammarUnit('${u.id}')">
    <span class="gr-sign">${u.sign}</span>
    <span class="gr-name">${escapeHtml(u.name)}<small>${escapeHtml(u.sub)}</small></span>
    ${chip}
    <span class="gr-dots">${ids.map(id => `<i class="${vxSheetPassed(id) ? "on" : ""}"></i>`).join("")}</span>
  </button>`;
}
function renderGrammarUnit(id) {
  const u = VX_UNIT[id];
  if (!u) return renderGrammar();
  showGameScreen();
  gsClose();
  const st = vxOn() ? vxUnitState(id) : 0;
  const ids = vxSheetIds(id);
  const rules = VX_RULES.filter(r => r.unit === id);
  const items = vxOn() ? vxCatalog().filter(it => it.unit === id) : [];
  const known = items.filter(it => { const ws = S.words[vxKey(it.id)]; return ws && ws.st >= STAGE_KNOWN; }).length;
  const met = items.filter(it => { const ws = S.words[vxKey(it.id)]; return ws && ws.st; }).length;
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar" style="${vxUnitStyle(id)}">
    <div class="screen-top"><div class="screen-label">📐 Grammar</div><button class="back-btn" onclick="renderGrammar()">← Tenses</button></div>
    <div class="gr-uhead"><span class="gr-sign big">${u.sign}</span><div><h2>${escapeHtml(u.name)}</h2><p>${escapeHtml(u.sub)}</p></div></div>
    ${st === 0 && vxOn() ? `<div class="set-note">🔒 This tense opens ${vxUnitEta(u) ? `around <b>${fmtShortDate(vxUnitEta(u))}</b>` : "soon"}${u.req.some(r => !vxUnitOpen(r)) ? ` — after ${u.req.filter(r => !vxUnitOpen(r)).map(r => `<b>${escapeHtml(VX_UNIT[r].name)}</b>`).join(" and ")}` : ""}. You can read its sheets now; passing every quiz opens it early.</div>` : ""}
    <div class="gr-sheets">${ids.map((sid, i) => { const sh = vxSheet(sid), p = vxSheetPassed(sid);
      return `<button class="gr-sheet ${p ? "done" : ""}" onclick="renderGrammarSheet('${sid}')"><span class="gr-sn">${p ? "✓" : i + 1}</span><span class="gr-stt">${escapeHtml(sh.title)}</span>${p ? `<span class="gr-sc">${S.verb.sh[sid]}%</span>` : ""}<span class="set-chev">›</span></button>`; }).join("")}</div>
    ${rules.length ? `<div class="gr-h">In your reviews</div><div class="gr-rules">${rules.map(r => { const ws = S.words[vxKey("r:" + r.id)];
      return `<div class="gr-rule"><b>${escapeHtml(r.title)}</b><span>${escapeHtml(r.chip)}</span>${ws && ws.st ? `${tierBadgeHtml(ws)}` : `<small>${st >= 2 ? "comes as a new item" : "after the lesson"}</small>`}</div>`; }).join("")}</div>` : ""}
    ${items.length > rules.length ? `<div class="gr-items">+ ${items.length - rules.length} verbs with their own item · ${met} started · ${known} 🌳 Known</div>` : ""}
  </div>`;
  scrollPageTop();
}
function renderGrammarSheet(id) {
  const sh = vxSheet(id);
  if (!sh) return renderGrammar();
  showGameScreen();
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">📐 Grammar</div><button class="back-btn" onclick="renderGrammarUnit('${sh.unit}')">← ${escapeHtml(VX_UNIT[sh.unit].name)}</button></div>
    <div id="gs-host"></div></div>`;
  gsOpen(document.getElementById("gs-host"), id, { mode: "menu", onDone: () => renderGrammarUnit(sh.unit) });
  scrollPageTop();
  if (typeof logEvent === "function") logEvent("vx_open", { id, where: "menu" });
}
// The ledger: level by level, then the verbs themselves.
function gsLedgerHtml(L) {
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  return `<div class="gr-h">The verb ledger</div>
    <div class="gr-ledger">${L.levels.map(l => `<button class="gr-lv" onclick="renderGrammarVerbs('${l.id}')">
      <span class="gr-lv-n">${l.id.toUpperCase()}</span>
      <span class="gr-lv-bar"><i style="width:${pct(l.done, l.verbs)}%"></i></span>
      <span class="gr-lv-t"><b>${l.done}</b> / ${l.verbs} verbs</span>
      <small>forms ${l.cellsDone}/${l.cells} · irregular items ${l.itemsKnown}/${l.items} Known</small></button>`).join("")}</div>`;
}
function renderGrammarVerbs(level) {
  showGameScreen();
  const xs = vxVerbs().filter(x => x.level === level).map(vxVerbRow)
    .sort((a, b) => (b.lemma.st > 0) - (a.lemma.st > 0) || (a.lemma.met || "9").localeCompare(b.lemma.met || "9") || a.x.i - b.x.i);
  const cell = (r, t) => r.cells[t] === undefined ? `<i class="na"></i>` : `<i class="${r.cells[t] ? "on" : ""}" title="${VX_TENSE_LABEL[t]}"></i>`;
  const rows = xs.map(r => {
    const done = r.lemma.st >= STAGE_KNOWN && Object.values(r.cells).every(Boolean) && r.items.every(i => i.st >= STAGE_KNOWN);
    return `<div class="gr-verb ${r.lemma.st ? "" : "unmet"} ${done ? "done" : ""}">
      <span class="gr-vinf">${escapeHtml(r.x.inf)}<small>${escapeHtml(vlGloss(r.x.v))}</small></span>
      <span class="gr-vlem">${r.lemma.st ? tierOfStage(r.lemma.st).icon : "·"}</span>
      <span class="gr-vcells">${cell(r, "pr")}${cell(r, "pt")}${cell(r, "pf")}</span>
      <span class="gr-vitems">${r.items.map(i => `<b class="k-${i.kind}" title="${escapeHtml(i.id)}">${tierOfStage(i.st).icon}</b>`).join("")}</span>
    </div>`; }).join("");
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar">
    <div class="screen-top"><div class="screen-label">📒 ${level.toUpperCase()} verbs</div><button class="back-btn" onclick="renderGrammar()">← Grammar</button></div>
    <div class="gr-vlegend"><span>meaning</span><span>Präsens · Präteritum · Perfekt</span><span>own items</span></div>
    <div class="gr-verbs">${rows}</div>
    <p class="p-sub">Dots fill when you produce that tense right (in Today, in Conjugation Slots, or on a card). A verb is complete with its meaning 🌳 Known, its own items 🌳 Known and all three dots.</p>
  </div>`;
  scrollPageTop();
}

// ── THE SWITCH ────────────────────────────────
function vxSwitchCardHtml() {
  return `<button class="vx-switch-card" onclick="renderVerbSwitch()">
    <span class="vx-sc-i">🧩</span><span class="vx-sc-t"><b>The new verb system is ready</b><small>See exactly what changes for you — nothing changes until you switch.</small></span><span class="set-chev">›</span></button>`;
}
function renderVerbSwitch() {
  showGameScreen();
  const el = document.getElementById("main-screen");
  el.innerHTML = `<div class="screen grammar"><div class="screen-top"><div class="screen-label">🧩 New verb system</div>${backBtnHtml()}</div><div class="vx-calc">Working it out on your own progress…</div></div>`;
  setTimeout(() => {
    let p;
    try { p = vxPreview(); } catch (e) { console.error(e); el.querySelector(".vx-calc").textContent = "Couldn't work out the preview: " + e.message; return; }
    const ret = Object.entries(p.retired), retN = ret.reduce((a, [, n]) => a + n, 0);
    const name = d => (getDeck(d) || { name: d }).name;
    const lessons = p.units.filter(u => u.st === 1).map(u => VX_UNIT[u.id].name);
    const prac = p.units.filter(u => u.st >= 2).map(u => VX_UNIT[u.id].name);
    const st = p.after.status;
    el.innerHTML = `<div class="screen grammar vx-switch">
      <div class="screen-top"><div class="screen-label">🧩 New verb system</div>${backBtnHtml()}</div>
      <h2 class="vx-h">What changes for you</h2>
      <div class="vx-cmp">
        <div><small>New words a day</small><b>${p.before.pace} → ${p.after.pace}</b></div>
        <div><small>Finish date</small><b>${pathDeadlineOn() ? fmtShortDate(S.path.deadline) : "—"}</b><span class="${st.ok ? "ok" : "warn"}">${pathDeadlineOn() ? (st.ok ? "✓ still on time" : "≈ " + fmtShortDate(st.eta)) : ""}</span></div>
        <div><small>Verb work a day</small><b>${p.after.q.items} items · ${p.after.q.cells} drills</b></div>
      </div>
      <ul class="vx-list">
        <li><b>Tenses in order.</b> Open now: ${prac.map(n => `<b>${escapeHtml(n)}</b>`).join(", ") || "—"}. ${lessons.length ? `Your next lessons: ${lessons.map(n => `<b>${escapeHtml(n)}</b>`).join(", then ")} — their sheets open your Today sessions, two a day, starting with your next session.` : ""} The verb games stop using tenses you haven't been taught.</li>
        <li><b>${p.after.items.toLocaleString()} verb items</b> over the whole journey (rules + verbs you can't build by rule), starting from what you've shown: ${p.seeds.rules} rules and ${p.seeds.items} verb items start where your cards are, ${p.seeds.cells} forms are already in your ledger.</li>
        <li><b>${retN} old form cards retired</b> — ones you haven't met yet. They are never introduced again; each mirrors the item that covers it, so your totals and achievements stay whole. ${ret.length ? `<details><summary>Which decks</summary>${ret.map(([d, n]) => `<div class="vx-ret">${escapeHtml(name(d))} <b>${n}</b></div>`).join("")}</details>` : ""}</li>
        <li><b>Nothing you've learned is lost.</b> Every card you've met keeps its stage and its reviews. Your level, XP and streak don't move. Today's plan target stays as it is; the new daily numbers start with tomorrow morning's plan.</li>
      </ul>
      <div class="vx-act">
        <button class="g-big-btn" onclick="vxSwitchGo()">Switch to the new system ✓</button>
        <button class="g-sec-btn" onclick="vxSwitchLater()">Not now</button>
      </div>
      <p class="p-sub">You can switch back from 📐 Grammar at any time — your cards stay as they are.</p>
    </div>`;
    if (typeof logEvent === "function") logEvent("vx_preview", { pace: [p.before.pace, p.after.pace], ret: retN, items: p.after.items, cells: p.after.cells });
  }, 30);
}
function vxSwitchGo() {
  vxSwitchOn();
  showCelebrateToast("🧩", "New verb system on", "Your first lesson comes in Today");
  renderGrammar();
}
function vxSwitchLater() { S.verb.offered = studyToday(); saveState(); if (typeof logEvent === "function") logEvent("vx_later", {}); backToMenu(); }
function vxConfirmOff() {
  appConfirm({ title: "Switch back to the old verb cards?", body: "Your verb items and the ledger's progress are removed; every card you've met stays as it is. The retired cards come back as new words.", ok: "Switch back", cancel: "Keep the new system", danger: true })
    .then(yes => { if (yes) { vxSwitchOff(); renderGrammar(); } });
}

// ── THE TODAY CARD ────────────────────────────
// One line: the switch offer, or today's lesson.
function vxTodayHtml() {
  if (typeof vxAvailable !== "function" || !vxAvailable()) return "";
  migrateVerb();
  if (!vxOn()) return S.verb.offered === studyToday() ? "" : `<button class="tc-vx" onclick="renderVerbSwitch()">🧩 <b>New verb system ready</b> — see what changes ›</button>`;
  const pend = vxPendingSheets();
  if (!pend.length) return "";
  const sh = vxSheet(pend[0]), u = VX_UNIT[sh.unit];
  const ids = vxSheetIds(sh.unit), done = ids.filter(vxSheetPassed).length;
  return `<button class="tc-vx lesson" style="${vxUnitStyle(sh.unit)}" onclick="showScreen('grammar')">📖 <b>${escapeHtml(u.name)}</b> lesson ${done}/${ids.length} · next sheet in your session</button>`;
}

// ── TODAY: VERB CARDS ─────────────────────────
// The answer with its parts in colour (engine tenses), or plain.
function vxFormHtml(ex) {
  // Engine tenses split into coloured parts (Verb Thread's colours).
  const t = { pr: 1, pt: 1, pf: 1, pq: 1, fu: 1 }[ex.kind] ? ex.kind : ex.kind === "k2w" || ex.kind === "k2o" ? "k2" : ex.kind === "p2" ? "pf" : null;
  const pron = ex.p === "Sie" ? "" : (PERSON_LABEL[ex.p] || ex.p).split("/")[0] + " ";
  if (t && typeof vlCell === "function" && ex.x.v.tenses.includes(t)) {
    const c = vlCell(ex.x.v, t, ex.p);
    if (c) return `<span class="vx-pron">${escapeHtml(pron)}</span>${vlPartsHtml(c.parts, t, ex.p, false)}`;
  }
  if (ex.kind === "sc") return `du <b>${escapeHtml(ex.x.F.pr.du)}</b> · er <b>${escapeHtml(ex.x.F.pr.er)}</b>`;
  if (ex.kind === "im" || ex.kind === "imfull") return `<b>${escapeHtml(ex.form.ans)}</b>${ex.form.tail && ex.form.tail !== "!" ? " " + escapeHtml(String(ex.form.tail).replace(/!$/, "")) : ""}!`;
  return `<span class="vx-pron">${escapeHtml(pron)}</span><b>${escapeHtml(ex.form.ans)}</b>`;
}
// The question: tense chip, the person, gaps, the verb and its meaning.
function vxPromptHtml(ex) {
  const t = ex.tense, u = VX_TENSE_UNIT[t] || "pr", tl = VX_TENSE_LABEL[t] || "";
  const gap = n => Array.from({ length: n }, () => `<span class="vx-gap"></span>`).join(" ");
  let line;
  if (ex.kind === "sc") line = `du ${gap(1)} · er ${gap(1)}`;
  else if (ex.kind === "im") line = `<span class="vx-pron">(${ex.p === "Sie" ? "Sie" : ex.p})</span> ${gap(1)}${ex.p === "Sie" ? " Sie" : ""}${ex.form.tail && ex.form.tail !== "!" ? ` <span class="vx-tail">${escapeHtml(ex.form.tail.replace(/!$/, "").replace(/^Sie ?/, ""))}</span>` : ""} !`;
  else {
    const pron = ex.kind === "pvpr" || ex.kind === "pvpt" || ex.kind === "pvmod" ? (ex.p === "sie" ? "sie (they)" : "es") : (PERSON_LABEL[ex.p] || ex.p).split("/")[0];
    const tail = ex.form.tail ? ` <span class="vx-tail">${escapeHtml(String(ex.form.tail).replace(/^… /, "").replace(/!$/, ""))}</span>` : "";
    line = `<span class="vx-pron">${escapeHtml(pron)}</span> ${gap(ex.form.n)}${tail}`;
  }
  const rule = ex.rule ? VX_RULE[ex.rule] : null;
  const mod = ex.kind === "pvmod" ? ` · with <b>${escapeHtml(ex.modal)}</b>` : "";
  const gloss = typeof vlGloss === "function" ? vlGloss(ex.x.v) : "";
  return `<div class="vx-q" style="${vxUnitStyle(u)}">
    <div class="vx-chips"><span class="vx-tense">${(VX_UNIT[u] || {}).sign || ""} ${escapeHtml(tl)}</span>${rule ? `<span class="vx-rule">${escapeHtml(rule.title)}</span>` : ex.cell ? `<span class="vx-rule">📒 ${ex.x.level.toUpperCase()} verb</span>` : ""}</div>
    <div class="vx-line">${line}</div>
    <div class="vx-verb"><b>${escapeHtml(ex.x.inf)}</b>${gloss ? ` · ${escapeHtml(gloss)}` : ""}${mod}</div>
    <div class="vx-fmt">${speakOn() ? "🗣️ Say" : "✍️ Type"} <b>${ex.kind === "sc" ? "both forms" : ex.form.n === 1 ? "one word" : ex.form.n + " words"}</b>${ex.kind === "prsep" ? " — the prefix too" : ex.kind === "prrefl" ? " — with the pronoun" : ""}</div>
  </div>`;
}
function vxItemLabel(ex) {
  if (ex.rule) return `🧩 Rule · ${VX_RULE[ex.rule].title}`;
  if (ex.cell) return `📒 Ledger · ${ex.x.level.toUpperCase()} verbs`;
  return `🧩 ${VX_ITEM_KINDS[ex.item.split(":")[0]].title} · ${ex.x.inf}`;
}
// A new verb item: what it is, before its first typed check.
function renderPathVerbLearn(it) {
  const s = pathSession, w = it.w, ex = w.vx;
  if (vxIntroduce(ex)) s.met.push(w);
  pathShowTyped(false);
  let body = "";
  if (ex.rule) {
    const r = VX_RULE[ex.rule];
    const xs = vxRuleVerbs(ex.rule).slice(0, 6);
    const exs = [];
    for (const x of xs) {
      if (exs.length >= 3) break;
      const ps = r.persons(x);
      const p = ps[exs.length % ps.length];
      const form = vxForm(x, r.kind, p, { modal: "müssen" });
      if (form) exs.push({ x, p, form, kind: r.kind, tense: ex.tense });
    }
    body = `<div class="vx-learn-t">${escapeHtml(r.title)}</div><div class="vx-learn-chip">${escapeHtml(r.chip)}</div>
      <div class="vx-learn-ex">${exs.map(e => `<div>${vxFormHtml(e)} <small>(${escapeHtml(e.x.inf)})</small></div>`).join("")}</div>
      <div class="p-sub">One review, a different verb each time — your verbs, in order.</div>`;
  } else {
    const k = ex.item.split(":")[0];
    const extra = k === "pt" ? `<div><span class="vx-pron">wir</span> <b>${escapeHtml(ex.x.F.pt.wir)}</b></div>` : k === "p2" ? `<div class="p-sub">Präteritum: er ${escapeHtml(ex.x.F.pt.er)}</div>` : "";
    body = `<div class="vx-learn-t">${escapeHtml(ex.x.inf)} <small>· ${escapeHtml(vlGloss(ex.x.v))}</small></div>
      <div class="vx-learn-chip">${escapeHtml(VX_ITEM_KINDS[k].title)} — not built by rule, so it has its own card</div>
      <div class="vx-learn-ex big"><div>${vxFormHtml(ex)}</div>${extra}</div>`;
  }
  document.getElementById("p-card").innerHTML = `
    <div class="p-learn vx-learn" style="${vxUnitStyle(VX_TENSE_UNIT[ex.tense] || "pr")}">
      <div class="p-kicker">🧩 New verb item</div>
      ${body}
      ${ex.sheet ? `<button class="g-link-btn vx-sheet-btn" onclick="gsPeek('${ex.sheet}')">📖 The sheet: ${escapeHtml(vxSheet(ex.sheet) ? vxSheet(ex.sheet).title : "")}</button>` : ""}
    </div>`;
  pathSetActions(`<button class="g-big-btn p-main" id="p-go" onclick="pathNext()">Got it →</button>`);
  if (audioOk() && ex.form) setTimeout(() => { if (pathSession && pathSession.cur === it) speak(ex.kind === "sc" ? `du ${ex.x.F.pr.du}, er ${ex.x.F.pr.er}` : ex.form.ans); }, 250);
  saveState();
}
// A typed verb exercise (a due item, a new item's check, a ledger drill).
function renderPathVerb(it) {
  const s = pathSession, w = it.w, ex = w.vx;
  const ws = ex.item ? S.words[vxKey(ex.item)] : null;
  s.typedSeen++;
  const badge = ws && ws.st && !it.fresh ? `${tierBadgeHtml(ws)} ${pipsHtml(ws)}` : ex.cell ? `<span class="tier-badge tier-learning">📒 new form</span>` : `<span class="tier-badge tier-learning">🌱 New</span>`;
  const kicker = it.repair ? `<div class="p-kicker repair">🩹 Repair round — one more try</div>`
    : ws && ws.rp ? `<div class="p-kicker repair">🩹 Repair — get it right to keep its badge</div>`
    : ws && ws.fl ? `<div class="p-kicker flag">⚠️ Quick check</div>`
    : it.reask ? `<div class="p-kicker">↻ Once more</div>` : it.fresh ? `<div class="p-kicker">🌱 From memory</div>` : "";
  document.getElementById("p-card").innerHTML = `<div class="p-meta"><span class="p-deck">${escapeHtml(vxItemLabel(ex))}</span>${badge}</div>${kicker}${vxPromptHtml(ex)}<div id="p-hint"></div>`;
  if (speakOn()) {
    it.said = false; it.revealed = false;
    const t = document.getElementById("p-typed"); if (t) t.style.display = "none";
    pathSetActions(`<button class="g-big-btn p-main" id="p-show" onclick="pathVerbReveal()">Show ▶</button>`);
    return;
  }
  pathShowTyped(true, ex.kind === "sc" ? "du … er …" : ex.form.n > 1 ? `${ex.form.n} words…` : "the form…");
  pathSetActions(`
    <button class="hint-btn" id="p-hint-btn" onclick="pathVerbHint()">💡 Hint</button>
    <button class="dontknow-btn" onclick="pathGradeVerb('', false)">? Don't know</button>
    <button class="g-big-btn p-main" id="p-check" onclick="pathCheckTyped()">Check</button>`);
  pathPreventBlur();
}
// 💡 the first letters — the answer then counts as a look (no step up).
function pathVerbHint() {
  const s = pathSession;
  if (!s || s.answered || !s.cur || !s.cur.w.vx) return;
  const ex = s.cur.w.vx;
  s.cur.usedHint = true;
  const first = ex.form.ans.split(" ").map(x => x.slice(0, 2) + "…").join(" ");
  document.getElementById("p-hint").innerHTML = `<div class="hint-wrap"><div class="examples-title">💡 It starts with</div><div class="hint-sentence">${escapeHtml(first)}</div></div>`;
  const b = document.getElementById("p-hint-btn"); if (b) b.disabled = true;
}
function pathCheckVerb() {
  const s = pathSession;
  if (!s || s.answered) return;
  const input = document.getElementById("p-input");
  const val = input ? input.value : "";
  if (!val.trim()) { shakeEl(input); if (input) input.focus({ preventScroll: true }); return; }
  pathGradeVerb(val, vxGrade(val, s.cur.w.vx));
}
// Say-it mode: Show, hear it, ✗ / ✓.
function pathVerbReveal() {
  const s = pathSession;
  if (!s || s.answered || !s.cur) return;
  const ex = s.cur.w.vx;
  s.cur.revealed = true;
  document.getElementById("p-fb").innerHTML = `<div class="p-fb-main"><div class="vx-answer">${vxFormHtml(ex)}</div></div>`;
  pathSetActions(`<button class="g-sec-btn" onclick="pathGradeVerb('', false)">✗ Not yet</button><button class="g-big-btn p-main" onclick="pathGradeVerb('', true, true)">✓ I said it</button>`);
  speak(ex.kind === "sc" ? `du ${ex.x.F.pr.du}, er ${ex.x.F.pr.er}` : ex.form.ans);
}
// ok: true / "near" / false. said: graded by yourself (Say-it).
function pathGradeVerb(val, ok, said = false) {
  const s = pathSession, it = s && s.cur;
  if (!s || s.answered || !it || !it.w.vx) return;
  const w = it.w, ex = w.vx;
  const input = document.getElementById("p-input");
  if (ok === "near") {
    // One slip: no step either way, one more try at the end.
    s.answered = true;
    s.stats.near++; s.stats.answered++;
    if (ex.item) { const ws = getWS(VX_DECK, ex.item); ws.lastAnsweredAt = Date.now(); ws.near = (ws.near || 0) + 1; pathMissed(w); }
    if (input) input.classList.add("near");
    logEvent("answer", { m: ex.cell ? "path:cell" : "path:verb", ok: false, near: true, typed: true, ms: Date.now() - s.shownAt });
    document.getElementById("p-fb").innerHTML = `<div class="p-near">≈ Almost — check the spelling</div><div class="p-diff">${diffHtml(val, ex.form.ans)}</div><div class="p-sub">No step up, no step down — one more try at the end of this session.</div>`;
    pathSetActions(`<button class="g-big-btn p-main" id="p-go" onclick="pathGo()">Next →</button>`);
    holdAfterMistake("p-go");
    saveState();
    return;
  }
  s.answered = true;
  const hint = !!it.usedHint;
  const kind = hint ? "recognition" : "recall";
  let res = null, from = 0;
  vxRecordAnswer(ex, ok === true, { given: val, hint });
  if (ex.item) {
    const ws = getWS(VX_DECK, ex.item);
    from = stageOf(ws);
    if (ok === true) {
      if (it.practice) { ws.lastAnsweredAt = Date.now(); ws.correct++; S.totalCorrect++; }
      else res = applyCorrect(ws, { quiet: true, kind, w, ms: Date.now() - s.shownAt });
      if (it.repair && !(ws.lrn || ws.rp || ws.fl)) s.repairFixed = (s.repairFixed || 0) + 1;
    } else {
      res = applyWrong(ws, { w });
      pathMissed(w);
    }
    pathRecordMove(w, from, res);
  } else if (ok !== true && !it.reask) {
    // A missed drill: once more a few items later (another person).
    const again = vxCellExercise({ x: ex.x, t: ex.tense });
    if (again) { let pos = s.i + 1, n = 0; while (pos < s.items.length && n < 4) { if (s.items[pos].t !== "learn" && s.items[pos].t !== "bonus" && s.items[pos].t !== "sheet") n++; pos++; }
      s.items.splice(pos, 0, { t: "typed", w: vxWord(again), reask: true }); }
  }
  if (ex.cell && ok === true && !hint) s.vxCells = (s.vxCells || 0) + 1;
  if (ok === true) {
    sessionConsecutive++; sessionCorrect++; s.stats.correct++;
    if (Date.now() - s.startedAt < 300000) s.ok5++;
    addExp(5); checkDrillMilestone();
    pathGolden(it);
    playSuccess(); haptic("select");
    if (input) input.classList.add("correct");
  } else {
    sessionConsecutive = 0; s.stats.wrong++;
    playFailure(); haptic("miss");
    if (input) input.classList.add("wrong");
  }
  s.stats.answered++;
  logEvent("answer", { m: ex.cell ? "path:cell" : "path:verb", ok: ok === true, typed: !said, hint, ms: Date.now() - s.shownAt });
  questEvent("answer", { mode: "path", ok: ok === true, typed: !said, st: from, w, it: "verb", hint, ms: Date.now() - s.shownAt, said });
  saveState();
  // Feedback: the form in colour, the rule behind it, the whole row.
  const evs = res ? res.events : [];
  const chip = evs.includes("known") ? `<span class="p-chip ok">🌳 Known!</span>`
    : res && res.promoted ? `<span class="p-chip ok">↑ ${tierOfStage(res.to).icon} ${tierOfStage(res.to).name}</span>`
    : evs.includes("repaired") ? `<span class="p-chip ok">🩹 Repaired</span>`
    : evs.includes("confirmed") ? `<span class="p-chip ok">✓ Scheduled</span>`
    : evs.includes("repair") ? `<span class="p-chip warn">🩹 Badge kept — repair it next time</span>`
    : evs.includes("dropped") ? `<span class="p-chip warn">↓ back to ${tierOfStage(res.to).name}</span>`
    : ex.cell && ok === true && !hint ? `<span class="p-chip ok">📒 ${escapeHtml(ex.x.inf)} · ${escapeHtml(VX_TENSE_LABEL[ex.tense])} ✓</span>`
    : hint && ok === true ? `<span class="p-chip">💡 with hint — no step up</span>` : "";
  const engineT = { pr: 1, pt: 1, pf: 1, pq: 1, fu: 1, im: 1 }[ex.kind] ? ex.kind : ex.kind === "p2" ? "pf" : ex.kind === "sc" ? "pr" : ex.kind === "k2w" || ex.kind === "k2o" ? "k2" : null;
  const why = engineT ? verbRuleHtml(ex.x.F, engineT, engineT === "im" ? "du" : ex.p) : ex.rule ? `📏 ${escapeHtml(VX_RULE[ex.rule].chip)}` : "";
  const row = engineT && engineT !== "im" ? verbRowHtml(ex.x.F, engineT, ex.p) : "";
  const head = ok === true ? `<div class="p-ok">✓ Correct!</div>` : `<div class="p-bad">${val.trim() ? "✗ Answer:" : "Answer:"}</div>`;
  document.getElementById("p-fb").innerHTML = `
    <div class="p-fb-main">${head}<div class="vx-answer">${vxFormHtml(ex)}</div>${chip}</div>
    ${ok !== true && val.trim() ? `<div class="p-diff">${diffHtml(val, ex.form.ans)}</div>` : ""}
    ${why ? `<div class="p-sub vx-why">${why}</div>` : ""}${row}`;
  pathSetActions(`
    ${ex.sheet ? `<button class="audio-btn" onclick="gsPeek('${ex.sheet}')" title="Open the sheet">📖</button>` : ""}
    ${audioOk() ? `<button class="audio-btn" onclick="speak('${escapeHtml(ex.kind === "sc" ? `du ${ex.x.F.pr.du}, er ${ex.x.F.pr.er}` : ex.form.ans).replace(/'/g, "")}')">🔊</button>` : ""}
    <button class="g-big-btn p-main" id="p-go" onclick="pathGo()">Next →</button>`);
  pathPreventBlur();
  if (ok !== true) holdAfterMistake("p-go");
  if (!said) speak(ex.kind === "sc" ? `du ${ex.x.F.pr.du}, er ${ex.x.F.pr.er}` : ex.form.ans);
  if (input) input.focus({ preventScroll: true });
}
// A 📖 lesson inside a Today session: the sheet, then its quiz.
function renderPathSheet(it) {
  const s = pathSession;
  pathShowTyped(false);
  pathSetActions("");
  if (!it.counted) { it.counted = true; vxRollDay(); S.verb.ns++; saveState(); }
  gsOpen(document.getElementById("p-card"), it.sheet, { mode: "path", onDone: () => { gsClose(); pathNext(); } });
  if (typeof logEvent === "function") logEvent("vx_open", { id: it.sheet, where: "path" });
  void s;
}
