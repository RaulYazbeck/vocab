// ── GRAMMAR: SHEETS, QUIZZES, THE VERB MAP ────
// The screens of the verb track (verb-track.js), in both apps — the
// French app's in Spanish (vxT, verb-track-fr.js):
//
//   • The sheet viewer — one sheet in bites: structure → rules → the
//     table → examples & the trap → the quiz. Swipe or ←/→ between
//     them; then the quiz (grammar-quiz.js): every point of the sheet,
//     3–10 questions, 100% first time to pass. A miss shows why, opens
//     that part of the sheet and comes back once at the end.
//     The same viewer runs inside a Today session (a 📖 lesson item),
//     in ☰ › 📐 Grammar and, read-only, over a verb exercise.
//   • 🏆 Mastery — per tense, once all its sheets are passed: optional,
//     outside the daily plan, 100% to master.
//   • ☰ › 📐 Grammar — the ten tenses in order (🔒 with the day they
//     open · 📖 lesson · 🔁 practising · ✅ solid), their sheets, and
//     the verb ledger level by level.
//   • The switch screen — what turning the new system on changes, on
//     your own numbers, before anything changes.
//   • Today's verb cards — a new verb item, a typed verb exercise and
//     its feedback (the form split into its coloured parts, the rule).
// ─────────────────────────────────────────────

// ── MARKUP ────────────────────────────────────
// **bold** (in a table: the ending) · [[verb]] in the tense colour ·
// {{ä}} a changed vowel · ((mich)) a pronoun · ~~struck~~ · *italic*
function gsMd(s) {
  return escapeHtml(String(s || ""))
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\{\{(.+?)\}\}/g, `<u class="gs-ch">$1</u>`)
    .replace(/\(\((.+?)\)\)/g, `<span class="gs-pr">$1</span>`)
    .replace(/\[\[(.+?)\]\]/g, `<b class="gs-v">$1</b>`)
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:!?]|$)/g, "$1<i>$2</i>");
}
function gsUnitOf(sheet) {
  if (sheet.cx && typeof cxSection === "function") { const sec = cxSection(sheet.sec), st = sec && cxStage(sec.stage); return { hue: 38, sign: "📖", name: sec ? sec.title : "", stage: st ? "Course · " + st.name.split(" · ")[0] : "Course" }; }
  return VX_UNIT[sheet.unit] || { hue: 38, sign: "•", name: "" };
}
// A sheet of the verb track, or of the course (course-de.js): the same
// viewer and quiz for both.
function gsSheetOf(id) { return vxSheet(id) || (typeof cxSheet === "function" ? cxSheet(id) : null); }
function gsStyleOf(sh) { return sh.cx && typeof cxSecStyle === "function" ? cxSecStyle(sh.sec) : vxUnitStyle(sh.unit); }
function gsSheetDone(sh) { return sh.cx ? cxSheetPassed(sh.id) : vxSheetPassed(sh.id); }
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
  const test = VX_FR ? VXF.gqSets[kind] : {
    regular: x => !x.k.irregular && !x.k.stem && !x.k.glue && !x.F.sep && !x.F.refl,
    glue: x => x.k.glue && !x.k.stem && !x.k.irregular,
    stem: x => x.k.stem, sep: x => !!x.F.sep, refl: x => !!x.F.refl,
    sein: x => x.F.aux === "sein", strong: x => x.k.strongPt && !x.k.irregular, mixed: x => x.k.mixed,
    prefix: x => (!!x.F.sep || !!x.F.insep || x.k.ieren) && !x.F.strong, etoi: x => !!x.F.eToI,
    weakpt: x => x.k.ptWeak, k2own: x => vxNeedsItem(x, "k2s"),
  }[kind];
  if (!test) return [];
  return vxVerbs().filter(x => test(x) && vxLemma(x).st > 0)
    .sort((a, b) => (vxLemma(a).met || "").localeCompare(vxLemma(b).met || "")).slice(0, n);
}
// Hover (or tap) a verb for its meaning; a tap also says it.
function gsMineHtml(sh) {
  const list = sh.mine ? gsMineList(sh.mine) : [];
  return list.length ? `<div class="gs-mine"><span>${vxT("Your verbs that do this · tap for the meaning")}</span>${list.map(x => {
    const gl = typeof vlGloss === "function" ? vlGloss(x.v) : "";
    return `<button type="button" class="gs-chip" data-gloss="${escapeHtml(gl)}" title="${escapeHtml(x.inf + (gl ? " — " + gl : ""))}" data-say="${escapeHtml(x.inf)}" onclick="gsSpeak(this)">${escapeHtml(x.inf)}</button>`;
  }).join("")}</div>` : "";
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
// What a sheet example's 🔊 says: the sentence without its markup. The
// voice packs record exactly this (tools/audio/runtime.mjs).
function gsSayText(s) { return String(s || "").replace(/\*+|\{\{|\}\}|\(\(|\)\)|\[\[|\]\]|~~/g, "").replace(/\s+/g, " ").trim(); }
function gsExamplesHtml(sh) {
  return `<div class="gs-ex">${(sh.ex || []).map(([de, en]) => `<div class="gs-ex-row">
      <button class="gs-say" type="button" onclick="gsSpeak(this)" data-say="${escapeHtml(gsSayText(de))}" aria-label="${vxT("Listen")}">🔊</button>
      <div><div class="gs-ex-de">${gsMd(de)}</div><div class="gs-ex-en">${escapeHtml(en)}</div></div></div>`).join("")}</div>`;
}
function gsSpeak(btn) { if (typeof speak === "function" && typeof audioOk === "function" && audioOk()) speak(btn.dataset.say); }
function gsBuildsHtml(sh) {
  // Sheets this one leans on: the earlier sheets of the units it requires.
  const u = VX_UNIT[sh.unit];
  if (!u || !u.req.length) return "";
  const names = u.req.map(r => VX_UNIT[r] && VX_UNIT[r].name).filter(Boolean);
  return `<div class="gs-builds">${vxT("Builds on:")} ${names.map(n => `<b>${escapeHtml(n)}</b>`).join(" · ")}</div>`;
}
// The reading bites of a sheet (the quiz comes after them).
// hl: a point to light up (after a quiz miss) — { id, li?, trap? }.
function gsSteps(sh, hl = null) {
  const steps = [], on = (id, extra) => hl && hl.id === id && (extra === undefined || extra) ? " gs-hl" : "";
  steps.push({ id: "struct", label: vxT("Structure"), html: `${gsStructHtml(sh)}<p class="gs-why${on("struct")}">🧠 ${gsMd(sh.why)}</p>${gsBuildsHtml(sh)}` });
  if (sh.rules && sh.rules.length) steps.push({ id: "rules", label: vxT("Rules"), html: `<ol class="gs-rules">${sh.rules.map((r, i) => `<li class="${on("rules", hl && hl.li === i + 1)}">${gsMd(r)}</li>`).join("")}</ol>` });
  const tbl = gsTableHtml(sh), mine = gsMineHtml(sh);
  if (tbl || mine) steps.push({ id: "table", label: sh.table ? vxT("Table") : vxT("List"), html: `<div class="${on("table")}">${tbl}</div>${mine}` });
  steps.push({ id: "ex", label: vxT("Examples"), html: `${gsExamplesHtml(sh)}<div class="gs-trap${on("ex", hl && hl.trap)}"><b>${vxT("⚠️ The trap")}</b><span>${gsMd(sh.trap)}</span></div>` });
  return steps;
}

// ── THE VIEWER ────────────────────────────────
// One viewer at a time. host: the element it draws into.
//   opts.mode  "path" (in Today) · "menu" · "peek" (read only)
//   opts.onDone(result) — after the quiz: { passed, score, all }
let _gs = null;
function gsOpen(host, id, opts = {}) {
  const sh = gsSheetOf(id);
  if (!sh || !host) return;
  _gs = { host, sh, steps: gsSteps(sh), step: 0, mode: opts.mode || "menu", onDone: opts.onDone || null, quiz: null };
  if (typeof migrateVerb === "function" && !sh.cx) { migrateVerb(); S.verb.sr[id] = 1; }
  gsRender();
}
// A tense's mastery quiz in the same viewer: no reading steps, the quiz
// straight away (questions from every sheet of the tense).
function gsOpenMastery(host, unit, opts = {}) {
  const u = VX_UNIT[unit];
  if (!u || !host) return;
  const sh = { id: "m:" + unit, unit, title: vxT("Mastery quiz"), mastery: true, quiz: [] };
  _gs = { host, sh, steps: [], step: 0, mode: opts.mode || "menu", onDone: opts.onDone || null, quiz: null, mastery: unit };
  gsQuizStart();
  gsRender();
  if (typeof logEvent === "function") logEvent("vx_open", { id: sh.id, where: "menu" });
}
function gsClose() { _gs = null; }
function gsRender(dir = "") {
  const g = _gs;
  if (!g) return;
  if (g.review) return gsRenderReview(dir);
  const sh = g.sh, u = gsUnitOf(sh);
  const reading = g.step < g.steps.length;
  const total = g.steps.length + (g.mode === "peek" ? 0 : 1);
  const dots = Array.from({ length: total }, (_, i) => `<i class="${i === g.step ? "on" : i < g.step ? "done" : ""}${i === g.steps.length ? " q" : ""}"></i>`).join("");
  const sibs = sh.cx ? cxSection(sh.sec).sheets : vxSheetIds(sh.unit);
  const n = sibs.indexOf(sh.id) + 1, of = sibs.length;
  const head = `<div class="gs-head" style="${gsStyleOf(sh)}">
      <span class="gs-unit"><span class="gs-sign">${u.sign}</span>${sh.cx ? escapeHtml(u.stage || "Course") + (of > 1 ? ` · ${n}/${of}` : "") : `${escapeHtml(u.name)} · ${g.mastery ? vxT("🏆 optional") : `${n}/${of}`}`}</span>
      <h2 class="gs-title">${escapeHtml(sh.title)}</h2>
      ${g.mastery ? "" : `<div class="gs-dots" aria-hidden="true">${dots}</div>`}
    </div>`;
  const body = reading ? `<div class="gs-step ${dir}" id="gs-step"><div class="gs-step-label">${escapeHtml(g.steps[g.step].label)}</div>${g.steps[g.step].html}</div>`
    : `<div class="gs-step ${dir}" id="gs-step">${gsQuizHtml()}</div>`;
  const last = g.step === g.steps.length - 1;
  const nav = reading ? `<div class="gs-nav">
      ${g.step > 0 ? `<button class="g-sec-btn gs-prev" onclick="gsGo(-1)" aria-label="${vxT("Back")}">‹</button>` : `<span></span>`}
      ${g.mode === "peek" && last ? `<button class="g-big-btn gs-next" onclick="gsPeekClose()">${vxT("Back to the exercise")}</button>`
        : `<button class="g-big-btn gs-next" id="gs-next" onclick="gsGo(1)">${last ? vxT("Quiz ▶") : vxT("Next ›")}</button>`}
    </div>` : "";
  g.host.innerHTML = `<div class="gs-viewer" style="${gsStyleOf(sh)}" id="gs-viewer">${head}${body}${nav}</div>`;
  if (!reading) gsQuizBind();
  gsBindSwipe();
  const nx = document.getElementById("gs-next");
  if (nx && g.mode !== "path") try { nx.focus({ preventScroll: true }); } catch (e) {}
}
// After a miss: the exact part of the sheet the question tested, lit up,
// with the rest of that sheet a swipe away — then back to the quiz.
function gsQuizReview() {
  const g = _gs, q = g && g.quiz;
  if (!q || !q.answered) return;
  const Q = q.list[q.i].q, sh = gsSheetOf(Q.sid);
  if (!sh) return;
  const hl = gqPointStep(Q.at), steps = gsSteps(sh, hl);
  g.review = { sh, steps, step: Math.max(0, steps.findIndex(st => st.id === hl.id)) };
  gsRender("fwd");
  if (typeof logEvent === "function") logEvent("vx_review", { id: Q.sid, at: Q.at });
}
function gsRenderReview(dir = "") {
  const g = _gs, r = g.review, sh = r.sh, u = gsUnitOf(sh);
  const step = r.steps[r.step];
  g.host.innerHTML = `<div class="gs-viewer" style="${gsStyleOf(sh)}" id="gs-viewer">
    <div class="gs-head"><span class="gs-unit"><span class="gs-sign">${u.sign}</span>${escapeHtml(u.name)} · ${vxT("back to the sheet")}</span>
      <h2 class="gs-title">${escapeHtml(sh.title)}</h2></div>
    <div class="gs-step ${dir}" id="gs-step"><div class="gs-step-label">${escapeHtml(step.label)}</div>${step.html}</div>
    <div class="gs-nav gs-nav3">
      ${r.steps.length > 1 ? `<button class="g-sec-btn gs-prev" onclick="gsReviewGo(-1)" aria-label="${vxT("Previous part")}" ${r.step ? "" : "disabled"}>‹</button>` : "<span></span>"}
      <button class="g-big-btn gs-next" id="gs-back-quiz" onclick="gsReviewBack()">${vxT("Back to the quiz ▶")}</button>
      ${r.steps.length > 1 ? `<button class="g-sec-btn gs-prev" onclick="gsReviewGo(1)" aria-label="${vxT("Next part")}" ${r.step < r.steps.length - 1 ? "" : "disabled"}>›</button>` : ""}
    </div></div>`;
  const v = document.getElementById("gs-viewer");
  if (v && v.getBoundingClientRect().top < 0) v.scrollIntoView({ block: "start", behavior: "smooth" });
}
function gsReviewGo(d) {
  const r = _gs && _gs.review;
  if (!r) return;
  const to = Math.max(0, Math.min(r.steps.length - 1, r.step + d));
  if (to !== r.step) { r.step = to; gsRenderReview(d > 0 ? "fwd" : "back"); }
}
function gsReviewBack() {
  const g = _gs;
  if (!g || !g.review) return;
  g.review = null;
  gsRender("back");
  // The answer and its why stay on screen; Next carries on.
  gsQuizShowAnswered();
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
  if (g.review) {
    if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); gsReviewBack(); return true; }
    if (e.key === "ArrowRight") { e.preventDefault(); gsReviewGo(1); return true; }
    if (e.key === "ArrowLeft") { e.preventDefault(); gsReviewGo(-1); return true; }
    return false;
  }
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
// The questions come from grammar-quiz.js: every point of the sheet (or,
// for a mastery quiz, of the whole tense), drawn fresh each time. A miss
// shows why, offers that part of the sheet, and the same question comes
// back once at the end. Passing = every question right the first time.
function gsQuizStart() {
  const g = _gs;
  const qs = g.mastery ? gqMasteryQuiz(g.mastery) : gqSheetQuiz(g.sh);
  const list = qs.map((q, i) => ({ q, i, order: gsOrderOf(q), first: true, picked: [] }));
  // Its answers count in the day's plan and quests: in Today, and on the
  // grammar screen while the sheet isn't passed yet (decided here: the
  // last right answer passes it) — up to the sheet's questions once a
  // day (vxSheetPlanTake). A retake of a passed sheet and the mastery
  // quiz are practice outside the plan.
  const plan = g.mode === "path" || (g.mode === "menu" && !g.mastery && !gsSheetDone(g.sh));
  g.quiz = { list, i: 0, firstRight: 0, n: list.length, answered: false, done: false, missed: [], plan };
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
  const from = _gs.mastery && Q.sid ? ` · ${escapeHtml((gsSheetOf(Q.sid) || {}).title || "")}` : "";
  const pos = `<div class="gs-qpos">${cur.first ? vxT("Question {0} of {1}", q.i + 1, q.n) : vxT("Once more — the one you missed")}${from}</div>`;
  let body = "";
  if (Q.k === "type") {
    body = `<div class="gs-qtext">${gsMd(Q.q)}</div>
      <input type="text" class="german-input gs-input" id="gs-input" placeholder="${vxT("type it…")}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
      ${typeof accentBarHtml === "function" ? accentBarHtml("gs-input") : ""}`;
  } else if (Q.k === "order") {
    body = `<div class="gs-qtext">${gsMd(Q.q)}</div>
      <div class="gs-built" id="gs-built" aria-label="${vxT("Your sentence")}">${cur.picked.map((bi, j) => `<button class="gs-tok on" data-j="${j}">${escapeHtml(Q.a[bi])}</button>`).join("") || `<span class="gs-built-ph">${vxT("tap the words in order")}</span>`}</div>
      <div class="gs-bank" id="gs-bank">${cur.order.map(bi => `<button class="gs-tok" data-b="${bi}" ${cur.picked.includes(bi) ? "disabled" : ""}>${escapeHtml(Q.a[bi])}</button>`).join("")}</div>`;
  } else {
    body = `<div class="gs-qtext">${gsMd(Q.q)}</div>
      <div class="gs-opts">${cur.order.map((oi, j) => `<button class="g-opt gs-opt" data-o="${oi}"><span class="g-key">${j + 1}</span><span class="g-opt-text">${gsMd(Q.o[oi])}</span></button>`).join("")}</div>`;
  }
  const check = Q.k === "type" || Q.k === "order";
  return `<div class="gs-quiz">${pos}${body}<div class="gs-qfb" id="gs-qfb" aria-live="polite"></div>
    <div class="gs-qact" id="gs-qact">${check ? `<button class="g-big-btn" id="gs-check" onclick="gsQuizCheck()">${vxT("Check")}</button>` : ""}</div></div>`;
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
// A typed quiz answer: a pronoun typed in front (du spielst) is fine, as
// in Today; so is an umlaut left out, and a few words of context around
// the right form (only for a question about one verb: its other forms
// never count as context). The feedback shows the spelling / says so.
// The verb a typed question is about: its own field, else the one named
// in brackets in the question (du ___ (fahren)).
function gsQuizVerb(Q) {
  const named = Q.inf || (Q.chk && Q.chk[0]);
  if (named) return vxVerb(named);
  const m = String(Q.q || "").match(/\(((?:sich )?[a-zäöüß]+)\)/i);
  return m ? vxVerb(m[1]) : null;
}
function gsQuizGrade(val, Q) {
  const tries = vxGradeTries(val, vxIsCommand(Q));
  const uml = vxUmlautOnly(val, Q.a, vxIsCommand(Q));
  if (uml || tries.some(t => Q.a.some(a => vxEq(a, t)))) return { ok: true, uml, extra: false };
  const x = gsQuizVerb(Q);
  const extra = !!x && vxExtraOk(tries, Q.a, x);
  return { ok: extra, uml: false, extra };
}
function gsQuizCheck() {
  const q = _gs && _gs.quiz;
  if (!q || q.answered || q.done) return;
  const cur = q.list[q.i], Q = cur.q;
  if (Q.k === "type") {
    const inp = document.getElementById("gs-input"), val = inp ? inp.value : "";
    if (!val.trim()) { if (inp) shakeEl(inp); return; }
    // A course question (course-de.js): its own checker — tolerant of
    // capitals, ß/ss and a missing umlaut, strict on the grammar.
    if (Q.cx && typeof cxCheck === "function") {
      const res = cxCheck(Q, val, cxSection(_gs.sh.sec));
      if (!res.ok && res.near && !cur.near) { cur.near = true; inp.classList.add("near"); document.getElementById("gs-qfb").innerHTML = `<div class="p-near">≈ Almost — check the spelling — try again</div>`; setTimeout(() => { inp.classList.remove("near"); inp.select(); }, 600); return; }
      cur.uml = res.ok && res.soft.length > 0; cur.extra = false;
      inp.disabled = true; inp.classList.add(res.ok ? "correct" : "wrong");
      gsQuizAnswered(res.ok, val);
      return;
    }
    if (vxUmlautAsking(document.getElementById("gs-qfb"))) return;
    const x = gsQuizVerb(Q);
    // Only an umlaut off, on a verb where it changes the form: 1 or 2.
    const ch = x ? vxUmlautChoice(val, Q.a, x, vxIsCommand(Q)) : null;
    // An umlaut typed that makes it another real form (drücke for drucke): a miss.
    if (ch && ch.wrong) { cur.uml = false; cur.extra = false; inp.disabled = true; inp.classList.add("wrong"); gsQuizAnswered(false, val); return; }
    if (ch) {
      inp.disabled = true;
      vxUmlautAsk(document.getElementById("gs-qfb"), ch, (ok, picked) => {
        if (!_gs || _gs.quiz !== q || q.list[q.i] !== cur || q.answered) return;
        cur.uml = false; cur.extra = false;
        inp.value = picked;
        inp.classList.add(ok ? "correct" : "wrong");
        gsQuizAnswered(ok, picked);
      });
      return;
    }
    const { ok, uml, extra } = gsQuizGrade(val, Q);
    cur.uml = uml; cur.extra = extra;
    // Another real form of the verb (wasche for wäscht) is a wrong
    // conjugation, never "Almost" — as in Today.
    const near = x ? vxNearTryAcc(val, Q.a, x, vxIsCommand(Q)) : isNearMiss(val, Q.a);
    if (!ok && near && !cur.near) {
      cur.near = true;
      inp.classList.add("near");
      document.getElementById("gs-qfb").innerHTML = `<div class="p-near">${vxT("≈ Almost — {0} — try again", vxT("check the spelling"))}</div>`;
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
  cur.ok = ok; cur.given = given;
  if (ok && cur.first) q.firstRight++;
  // A miss comes back once at the end, after you've seen why.
  if (!ok && cur.first) { q.missed.push(cur); q.list.push({ ...cur, first: false, picked: [], order: gsOrderOf(Q), near: false, ok: undefined }); }
  gsQuizShowAnswered();
  if (ok) { if (typeof playSuccess === "function") playSuccess(); if (typeof haptic === "function") haptic("select"); }
  else { if (typeof playFailure === "function") playFailure(); if (typeof haptic === "function") haptic("miss"); if (typeof holdAfterMistake === "function") holdAfterMistake("gs-qnext"); }
  // The answer counts like any other (the day's plan, quests) — see gsQuizStart.
  if (typeof logEvent === "function") logEvent("answer", { m: g.mastery ? "grammar:mastery" : g.sh.cx ? "course:quiz" : g.mode === "path" ? "path:quiz" : "grammar:quiz", ok, typed: Q.k === "type", sid: Q.sid, at: Q.at, first: cur.first });
  if (g.sh.cx) { if (typeof cxQuizAnswer === "function") cxQuizAnswer(Q, ok, cur.first); }
  else if (typeof vxQuizAnswer === "function") vxQuizAnswer(Q, ok, given, cur.first);
  if (q.plan && (g.sh.cx ? cxPlanTake("sheet:" + g.sh.id, q.n, ok) : vxSheetPlanTake(g.sh.id, q.n, ok)) && typeof questEvent === "function") questEvent("answer", { mode: g.mode === "path" ? "path" : "grammar", ok, typed: Q.k === "type" });
  if (g.mode === "path" && pathSession) { pathSession.stats.answered++; if (ok) { pathSession.stats.correct++; addExp(3); } else pathSession.stats.wrong++; }
  if (!ok && typeof _learnDay === "function") _learnDay("mk", g.sh.cx ? "grammar" : Q.k === "order" ? "order" : Q.k === "type" ? "verbform" : "recognition");
  const btn = document.getElementById("gs-qnext");
  if (btn && g.mode !== "path") setTimeout(() => { try { btn.focus({ preventScroll: true }); } catch (e) {} }, 30);
}
// The feedback of the answered question: right or wrong, why, and after a
// miss the way back into the sheet. (Drawn again after a review.)
function gsQuizShowAnswered() {
  const g = _gs, q = g && g.quiz;
  if (!q || !q.answered) return;
  const cur = q.list[q.i], Q = cur.q, ok = cur.ok;
  const right = Q.k === "type" ? Q.a[0] : Q.k === "order" ? Q.a.join(" ") : Q.o[Q.a];
  const why = `<div class="gs-qwhy">${gsMd(Q.why)}${Q.whyHtml ? `<div class="gs-qrule">${Q.whyHtml}</div>` : ""}</div>`;
  const sh = gsSheetOf(Q.sid);
  const where = sh ? `${gqPointName(Q.at)}${g.mastery ? ` ${VX_FR ? "de" : "of"} “${escapeHtml(sh.title)}”` : ""}` : "";
  const fb = document.getElementById("gs-qfb");
  if (fb) fb.innerHTML = ok ? `<div class="p-ok">${vxT("✓ Right")}${cur.uml ? ` <span class="vx-uml">${vxT("— spelt {0}", `<b>${escapeHtml(right)}</b>`)}</span>` : ""}${cur.extra ? ` <span class="vx-uml">${vxT("— only the verb was needed")}</span>` : ""}</div>${why}`
    : `<div class="p-bad">${vxT("✗ Answer:")} <strong>${escapeHtml(right)}</strong></div>${why}
      ${sh ? `<button class="gs-qsee" onclick="gsQuizReview()">${vxT("📖 See it in the sheet — {0}", where)}</button>` : ""}
      ${cur.first ? `<div class="gs-qback">${vxT("This question comes back once at the end.")}</div>` : ""}`;
  // Show the inputs as answered (after a review the question is redrawn).
  const built = document.getElementById("gs-built");
  if (built && Q.k === "order") { built.classList.add(ok ? "ok" : "bad"); built.querySelectorAll(".gs-tok").forEach(t => { t.disabled = true; }); document.querySelectorAll("#gs-bank .gs-tok").forEach(t => { t.disabled = true; }); }
  const inp = document.getElementById("gs-input");
  if (inp) { inp.value = cur.given || inp.value; inp.disabled = true; inp.classList.add(ok ? "correct" : "wrong"); }
  if (Q.k !== "type" && Q.k !== "order") document.querySelectorAll(".gs-opt").forEach(b => {
    const o = +b.dataset.o; b.disabled = true;
    if (o === Q.a) b.classList.add("right"); else if (!ok && Q.o[o] === cur.given) b.classList.add("wrong");
  });
  const act = document.getElementById("gs-qact");
  if (act) act.innerHTML = `<button class="g-big-btn" id="gs-qnext" onclick="gsQuizNext()">${q.i + 1 >= q.list.length ? vxT("See result") : vxT("Next ›")}</button>`;
}
function gsQuizNext() {
  const q = _gs && _gs.quiz;
  if (!q || !q.answered) return;
  if (typeof mistakeHeld === "function" && mistakeHeld("gs-qfb")) return;
  q.answered = false;
  q.i++;
  if (q.i >= q.list.length) q.done = true;
  if (_gs.mode === "path" && typeof pathProgress === "function" && pathSession) pathProgress();
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
  q.result = { score, all: q.firstRight === q.n, passed: false };
  if (g.mastery) q.result.passed = vxMasteryResult(g.mastery, q.firstRight, q.n);
  else if (g.mode !== "peek") q.result.passed = g.sh.cx ? cxSheetResult(g.sh.id, score, q.result.all, g.mode) : vxSheetResult(g.sh.id, score, q.result.all, g.mode);
  const step = document.getElementById("gs-step");
  if (step) step.innerHTML = gsQuizHtml();
  if (q.result.passed && typeof confettiBurst === "function") confettiBurst(30);
}
// What you missed, each with the way back into its sheet.
function gsMissedHtml(q) {
  if (!q.missed.length) return "";
  return `<div class="gs-missed"><b>${vxT("To look at again")}</b>${q.missed.map((m, j) => { const sh = gsSheetOf(m.q.sid);
    return `<button class="gs-miss" onclick="gsOpenPoint('${m.q.sid}','${m.q.at}')"><span>${gsMd(m.q.q)}</span><small>${escapeHtml(gqPointName(m.q.at))}${_gs.mastery && sh ? ` · ${escapeHtml(sh.title)}` : ""} ›</small></button>`; }).join("")}</div>`;
}
// From the result screen: that point of the sheet, then back here.
function gsOpenPoint(sid, at) {
  const g = _gs, sh = gsSheetOf(sid);
  if (!g || !sh) return;
  const hl = gqPointStep(at), steps = gsSteps(sh, hl);
  g.review = { sh, steps, step: Math.max(0, steps.findIndex(st => st.id === hl.id)), fromResult: true };
  gsRender("fwd");
}
function gsMasteryResultHtml() {
  const g = _gs, q = g.quiz, r = q.result || { passed: false }, u = VX_UNIT[g.mastery];
  return `<div class="gs-result ${r.passed ? "ok" : "bad"}">
    <div class="gs-result-icon">${r.passed ? "🏆" : u.sign}</div>
    <div class="gs-result-title">${r.passed ? vxT("{0} mastered!", escapeHtml(u.name)) : vxT("Not yet")}</div>
    <div class="gs-result-sub">${vxT("{0}/{1} right first time", q.firstRight, q.n)}${r.passed ? "" : vxT(" · mastery takes every question right the first time")}</div>
    ${gsMissedHtml(q)}
    <div class="gs-result-act">
      <button class="g-sec-btn" onclick="gsQuizRetake()">${r.passed ? vxT("Take it again") : vxT("Retake — new questions")}</button>
      <button class="g-big-btn" onclick="gsQuizFinish()">${vxT("Done ✓")}</button>
    </div></div>`;
}
function gsQuizRetake() { if (!_gs) return; _gs.review = null; gsQuizStart(); gsRender("fwd"); }
function gsQuizResultHtml() {
  const g = _gs, q = g.quiz, r = q.result || { score: 0, passed: false };
  if (g.mastery) return gsMasteryResultHtml();
  const pct = Math.round(r.score * 100);
  if (g.sh.cx) return gsCxResultHtml(r, pct);
  const unitDone = r.passed && vxUnitOpen(g.sh.unit) && vxUnitSheetsPassed(g.sh.unit);
  const next = gsNextSheetOf(g.sh);
  return `<div class="gs-result ${r.passed ? "ok" : "bad"}">
    <div class="gs-result-icon">${r.passed ? (unitDone ? VX_UNIT[g.sh.unit].sign : "✅") : "📖"}</div>
    <div class="gs-result-title">${r.passed ? (unitDone ? vxT("{0} unlocked!", escapeHtml(VX_UNIT[g.sh.unit].name)) : vxT("Sheet passed")) : vxT("Not yet")}</div>
    <div class="gs-result-sub">${vxT("{0}/{1} right first time", q.firstRight, q.n)} (${pct}%)${r.passed ? "" : vxT(" · passing takes every question right the first time")}</div>
    ${unitDone ? `<div class="gs-result-note">${vxT("It joins your reviews and the verb games from now on.")}${typeof vxMasteryOpen === "function" && vxMasteryOpen(g.sh.unit) ? vxT(" Its 🏆 mastery quiz is open in 📐 Grammar (optional).") : ""}</div>` : ""}
    ${r.passed ? "" : gsMissedHtml(q)}
    ${!r.passed && g.mode === "path" ? `<div class="gs-result-note">${vxT("The sheet comes back in a later session, with new questions.")}</div>` : ""}
    <div class="gs-result-act">
      ${r.passed ? "" : `<button class="g-sec-btn" onclick="gsRestart()">${vxT("Read it again")}</button>${g.mode === "path" ? "" : `<button class="g-sec-btn" onclick="gsQuizRetake()">${vxT("Retake")}</button>`}`}
      ${g.mode === "path" ? `<button class="g-big-btn" id="gs-done" onclick="gsQuizFinish()">${r.passed ? vxT("Continue ▶") : vxT("Later ▶")}</button>`
        : next && r.passed ? `<button class="g-big-btn" onclick="renderGrammarSheet('${next.id}')">${vxT("Next sheet ›")}</button>`
        : `<button class="g-big-btn" onclick="renderGrammarUnit('${g.sh.unit}')">${vxT("Done ✓")}</button>`}
    </div></div>`;
}
// A course sheet's result: its drill comes next.
function gsCxResultHtml(r, pct) {
  const g = _gs, q = g.quiz, sec = g.sh.sec;
  return `<div class="gs-result ${r.passed ? "ok" : "bad"}">
    <div class="gs-result-icon">${r.passed ? "✅" : "📖"}</div>
    <div class="gs-result-title">${r.passed ? "Sheet passed" : "Not yet"}</div>
    <div class="gs-result-sub">${q.firstRight}/${q.n} right first time (${pct}%)${r.passed ? "" : " · passing takes every question right the first time"}</div>
    ${r.passed ? `<div class="gs-result-note">Its rules join your reviews. ${g.mode === "path" ? "Its drill comes next." : "Now drill it — or it comes in Today."}</div>` : gsMissedHtml(q)}
    ${!r.passed && g.mode === "path" ? `<div class="gs-result-note">The sheet comes back in a later session, with new questions.</div>` : ""}
    <div class="gs-result-act">
      ${r.passed ? "" : `<button class="g-sec-btn" onclick="gsRestart()">Read it again</button>${g.mode === "path" ? "" : `<button class="g-sec-btn" onclick="gsQuizRetake()">Retake</button>`}`}
      ${g.mode === "path" ? `<button class="g-big-btn" id="gs-done" onclick="gsQuizFinish()">${r.passed ? "Continue ▶" : "Later ▶"}</button>`
        : r.passed ? `<button class="g-big-btn" onclick="renderCourseDrill('${sec}')">Drill it ▶</button>` : `<button class="g-big-btn" onclick="renderCourseSection('${sec}')">Done ✓</button>`}
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
  if (!gsSheetOf(id)) return;
  const prev = _gs;
  const m = document.createElement("div");
  m.className = "modal-overlay"; m.id = "gs-peek";
  m.innerHTML = `<div class="modal-sheet gs-peek-sheet" role="dialog" aria-modal="true"><button class="set-close gs-peek-x" onclick="gsPeekClose()" aria-label="${vxT("Close")}">✕</button><div id="gs-peek-host"></div></div>`;
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
    <div class="screen-top"><div class="screen-label">${vxT("📐 Grammar · Verbs")}</div>${backBtnHtml()}</div>
    <div class="gr-sum">
      <div><b>${on ? open : "—"}</b><span>${vxT("/ {0} tenses open", VX_UNITS.length)}</span></div>
      <div><b>${passed}</b><span>${vxT("/ {0} sheets", GS_SHEETS.length)}</span></div>
      <div><b>${L ? L.all.done : "—"}</b><span>${vxT("/ {0} verbs complete", vxVerbs().length)}</span></div>
    </div>
    ${next ? `<button class="gr-next" onclick="renderGrammarSheet('${next.id}')" style="${vxUnitStyle(next.unit)}">
      <span class="gr-next-k">${vxSheetsToday().includes(next.id) ? vxT("📖 Your next lesson — also comes in Today") : vxT("📖 Your next lesson — in Today tomorrow, or read it now")}</span>
      <span class="gr-next-t">${VX_UNIT[next.unit].sign} ${escapeHtml(VX_UNIT[next.unit].name)} · ${escapeHtml(next.title)}</span></button>` : ""}
    <div class="gr-h">${vxT("The tenses, in the order you learn them")}</div>
    <div class="gr-units">${units}</div>
    ${L ? gsLedgerHtml(L) : ""}
    <details class="gr-how"><summary>${vxT("ℹ️ How the verb track works")}</summary>
      ${VX_FR ? VXF.how : `<p><b>Tenses open in order</b> — each one only after the tenses it is built from, and when your Path gets that far (so your finish date sets the day). A new tense starts with its sheets in Today, one or two a day; pass each quiz and the tense joins your reviews and the verb games.</p>
      <p><b>Rules, not lists.</b> Each rule is one item in your reviews, asked every time with another verb you've met — A1 verbs first, the regular ones before the exceptions. Verbs you can't build by rule (ging, ist gegangen, fährt, nimm!) get their own item.</p>
      <p><b>The ledger</b> checks every verb: its meaning Known, its irregular forms Known, and its Präsens, Präteritum and Perfekt produced right at least once — the three every other tense is built from.</p>`}
    </details>
  </div>`;
  if (typeof logScreen === "function") logScreen("grammar");
}
function gsUnitRowHtml(u, scan) {
  const st = vxOn() ? vxUnitState(u.id) : 0;
  const ids = vxSheetIds(u.id), done = ids.filter(vxSheetPassed).length;
  const eta = st === 0 && vxOn() ? vxUnitEta(u, scan) : null;
  const waits = st === 0 && vxOn() ? u.req.filter(r => !vxUnitOpen(r)).map(r => VX_UNIT[r].name) : [];
  const chip = !vxOn() ? `<span class="gr-st">${vxT("{0}/{1} read", done, ids.length)}</span>`
    : vxMastered(u.id) ? `<span class="gr-st solid">${vxT("🏆 Mastered")}</span>`
    : st === 3 ? `<span class="gr-st solid">${vxT("✅ Solid")}</span>`
    : st === 2 ? `<span class="gr-st open">${vxT("🔁 Practising")}</span>`
    : st === 1 ? `<span class="gr-st lesson">${vxT("📖 Lesson {0}/{1}", done, ids.length)}</span>`
    : `<span class="gr-st lock">🔒 ${eta ? "≈ " + fmtShortDate(eta) : waits.length ? vxT("after {0}", escapeHtml(waits[0])) : vxT("soon")}</span>`;
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
    <div class="screen-top"><div class="screen-label">${vxT("📐 Grammar")}</div><button class="back-btn" onclick="renderGrammar()">${vxT("← Tenses")}</button></div>
    <div class="gr-uhead"><span class="gr-sign big">${u.sign}</span><div><h2>${escapeHtml(u.name)}</h2><p>${escapeHtml(u.sub)}</p></div></div>
    ${st === 0 && vxOn() ? `<div class="set-note">${vxT("🔒 This tense opens {0}{1}. You can read its sheets now; passing every quiz opens it early.",
      vxUnitEta(u) ? vxT("around <b>{0}</b>", fmtShortDate(vxUnitEta(u))) : vxT("soon"),
      u.req.some(r => !vxUnitOpen(r)) ? vxT(" — after {0}", u.req.filter(r => !vxUnitOpen(r)).map(r => `<b>${escapeHtml(VX_UNIT[r].name)}</b>`).join(vxT(" and "))) : "")}</div>` : ""}
    ${vxOn() ? `<div class="gr-unote">${st === 1 ? vxT("📌 These sheets come into Today by themselves, up to two a day — each ends with a short check.")
      : st >= 2 ? (ids.every(vxSheetPassed) ? vxT("All sheets done — reread any time.") : vxT("You already use this tense: the sheets are here to read when you want, nothing is due.")) : ""}</div>` : ""}
    <div class="gr-sheets">${ids.map((sid, i) => { const sh = vxSheet(sid), p = vxSheetPassed(sid), due = st === 1 && !p;
      return `<button class="gr-sheet ${p ? "done" : ""}" onclick="renderGrammarSheet('${sid}')"><span class="gr-sn">${p ? "✓" : i + 1}</span><span class="gr-stt">${escapeHtml(sh.title)}</span>${p ? `<span class="gr-sc">${S.verb.sh[sid]}%</span>` : due ? `<span class="gr-due">${vxT("in Today")}</span>` : ""}<span class="set-chev">›</span></button>`; }).join("")}</div>
    ${gsMasteryCardHtml(id)}
    ${typeof gsDrillCardHtml === "function" ? gsDrillCardHtml(id) : ""}
    ${rules.length ? `<div class="gr-h">${vxT("In your reviews")}</div><div class="gr-unote">${vxT("Each rule is one review card in Today: one form to type, a different verb each time.")}</div>
      <div class="gr-rules">${rules.map(r => `<div class="gr-rule"><b>${escapeHtml(r.title)}</b><span>${escapeHtml(r.chip)}</span>${gsRuleStatusHtml(S.words[vxKey("r:" + r.id)], st)}</div>`).join("")}</div>` : ""}
    ${items.length > rules.length ? `<div class="gr-items">${vxT("+ {0} verbs with their own item · {1} started · {2} 🌳 Known", items.length - rules.length, met, known)}</div>` : ""}
  </div>`;
  scrollPageTop();
}
// The tense's mastery quiz: optional, opens once every sheet is passed.
function gsMasteryCardHtml(unit) {
  const ids = vxSheetIds(unit), done = ids.filter(vxSheetPassed).length, open = vxMasteryOpen(unit);
  const m = (S.verb && S.verb.ma && S.verb.ma[unit]) || null, n = gqMasterySize(unit);
  const state = vxMastered(unit) ? `${vxT("🏆 Mastered")}${m && m.at ? ` · ${fmtShortDate(new Date(m.at))}` : ""}` : m && m.tries ? vxT("Best {0}% — 100% to master", m.best) : vxT("{0} questions · 100% to master", n);
  return `<button class="gr-mastery ${open ? "" : "locked"} ${vxMastered(unit) ? "done" : ""}" ${open ? `onclick="renderGrammarMastery('${unit}')"` : "disabled"}>
    <span class="gr-m-ico">${open ? "🏆" : "🔒"}</span>
    <span class="gr-m-t"><b>${vxT("Mastery quiz")}</b><small>${open ? state : vxT("Opens when all {0} sheets are passed ({1}/{0})", ids.length, done)}${vxT(" · optional, outside your daily plan")}</small></span>
    ${open ? `<span class="set-chev">›</span>` : ""}</button>`;
}
function renderGrammarMastery(unit) {
  if (!vxMasteryOpen(unit)) return renderGrammarUnit(unit);
  showGameScreen();
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">${vxT("📐 Grammar · 🏆 Mastery")}</div><button class="back-btn" onclick="renderGrammarUnit('${unit}')">← ${escapeHtml(VX_UNIT[unit].name)}</button></div>
    <div id="gs-host"></div></div>`;
  gsOpenMastery(document.getElementById("gs-host"), unit, { mode: "menu", onDone: () => renderGrammarUnit(unit) });
  scrollPageTop();
}
// Where a rule (or verb item) stands, in plain words — the app's stage
// names ("Strong") would read like grammar terms here.
const GS_STAGE_WORD = ["", "Learning", "Learning", "Familiar", "Familiar", "Known", "Known well", "Locked in"];
function gsRuleStatusHtml(ws, unitSt) {
  if (!ws || !ws.st) return `<small>${unitSt >= 2 ? vxT("New — not in your cards yet; starts in Today") : vxT("Starts after the lesson")}</small>`;
  const t = tierOfStage(ws.st), days = ws.dueAt ? Math.round((ws.dueAt - Date.now()) / 864e5) : 0;
  const next = ws.rp || ws.fl || ws.lrn ? vxT("to practise") : days <= 0 ? vxT("due now") : days === 1 ? vxT("next check tomorrow") : vxT("next check in {0} days", days);
  return `<div class="gr-rst"><b class="tier-${t.id}">${t.icon} ${vxT(GS_STAGE_WORD[ws.st] || t.name)}</b><small>${ws.seed ? vxT("from your cards · ") : ""}${next}</small></div>`;
}
function renderGrammarSheet(id) {
  const sh = vxSheet(id);
  if (!sh) return renderGrammar();
  showGameScreen();
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">${vxT("📐 Grammar")}</div><button class="back-btn" onclick="renderGrammarUnit('${sh.unit}')">← ${escapeHtml(VX_UNIT[sh.unit].name)}</button></div>
    <div id="gs-host"></div></div>`;
  gsOpen(document.getElementById("gs-host"), id, { mode: "menu", onDone: () => renderGrammarUnit(sh.unit) });
  scrollPageTop();
  if (typeof logEvent === "function") logEvent("vx_open", { id, where: "menu" });
}
// The ledger: level by level, then the verbs themselves.
function gsLedgerHtml(L) {
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  return `<div class="gr-h">${vxT("The verb ledger")}</div>
    <div class="gr-ledger">${L.levels.map(l => `<button class="gr-lv" onclick="renderGrammarVerbs('${l.id}')">
      <span class="gr-lv-n">${l.id.toUpperCase()}</span>
      <span class="gr-lv-bar"><i style="width:${pct(l.done, l.verbs)}%"></i></span>
      <span class="gr-lv-t">${vxT("{0} / {1} verbs", `<b>${l.done}</b>`, l.verbs)}</span>
      <small>${vxT("forms {0}/{1} · irregular items {2}/{3} Known", l.cellsDone, l.cells, l.itemsKnown, l.items)}</small></button>`).join("")}</div>`;
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
      <span class="gr-vcells">${VX_CORE.map(t => cell(r, t)).join("")}</span>
      <span class="gr-vitems">${r.items.map(i => `<b class="k-${i.kind}" title="${escapeHtml(i.id)}">${tierOfStage(i.st).icon}</b>`).join("")}</span>
    </div>`; }).join("");
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar">
    <div class="screen-top"><div class="screen-label">${vxT("📒 {0} verbs", level.toUpperCase())}</div><button class="back-btn" onclick="renderGrammar()">${vxT("← Grammar")}</button></div>
    <div class="gr-vlegend"><span>${vxT("meaning")}</span><span>${VX_CORE_LABEL}</span><span>${vxT("own items")}</span></div>
    <div class="gr-verbs">${rows}</div>
    <p class="p-sub">${vxT("Dots fill when you produce that tense right (in Today, in Conjugation Slots, or on a card). A verb is complete with its meaning 🌳 Known, its own items 🌳 Known and all three dots.")}</p>
  </div>`;
  scrollPageTop();
}

// ── THE TODAY CARD ────────────────────────────
// One line: today's lesson.
function vxTodayHtml() {
  if (typeof vxAvailable !== "function" || !vxAvailable()) return "";
  migrateVerb();
  if (!vxOn()) return "";
  const pend = vxSheetsToday();
  if (!pend.length) return "";
  const sh = vxSheet(pend[0]), u = VX_UNIT[sh.unit];
  const ids = vxSheetIds(sh.unit), done = ids.filter(vxSheetPassed).length;
  return `<button class="tc-vx lesson" style="${vxUnitStyle(sh.unit)}" onclick="showScreen('grammar')">${vxT("📖 <b>{0}</b> lesson {1}/{2} · next sheet in your session", escapeHtml(u.name), done, ids.length)}</button>`;
}

// ── TODAY: VERB CARDS ─────────────────────────
// The answer with its parts in colour (engine tenses), or plain.
function vxFormHtml(ex) {
  const html = VX_FR ? vxFormHtmlFr(ex) : vxFormHtmlBase(ex);
  return ex.form && ex.form.ctx ? `${html} <span class="vx-ctx">${escapeHtml(ex.form.ctx)}</span>` : html;
}
function vxFormHtmlBase(ex) {
  // Engine tenses split into coloured parts (Verb Thread's colours).
  const t = { pr: 1, pt: 1, pf: 1, pq: 1, fu: 1 }[ex.kind] ? ex.kind : ex.kind === "sc" ? "pr" : ex.kind === "k2w" || ex.kind === "k2o" ? "k2" : ex.kind === "p2" ? "pf" : null;
  const pron = ex.p === "Sie" ? "" : ex.p === "er" && vxItVerb(ex.x) ? "es " : (PERSON_LABEL[ex.p] || ex.p).split("/")[0] + " ";
  // (The coloured parts already carry a separable prefix: fährst … ab.)
  if (t && typeof vlCell === "function" && ex.x.v.tenses.includes(t)) {
    const c = vlCell(ex.x.v, t, ex.p);
    if (c) return `<span class="vx-pron">${escapeHtml(pron)}</span>${vlPartsHtml(c.parts, t, ex.p, false)}`;
  }
  if (ex.kind === "imsep") return `<b>${escapeHtml(ex.form.ans)}</b>!`;
  if (ex.kind === "im" || ex.kind === "imfull") return `<b>${escapeHtml(ex.form.ans)}</b>!`;
  return `<span class="vx-pron">${escapeHtml(pron)}</span><b>${escapeHtml(ex.form.ans)}</b>`;
}
// French: "j'" + aime, "que nous" + prenions, "en" + lisant, "Lève-toi !",
// the engine tenses in Verb Thread's colours.
function vxPronHtml(pron) { return pron ? `<span class="vx-pron">${escapeHtml(pron)}</span>${/'$/.test(pron) ? "" : " "}` : ""; }
function vxFormHtmlFr(ex) {
  const k = ex.kind, base = VXF_FEM[ex.p] || ex.p, pron = VXF.pron(k, ex.p, ex.form.ans);
  if (["pr", "im", "fu", "co", "fp", "pc", "pq"].includes(k) && typeof vlCell === "function") {
    const c = vlCell(ex.x.v, k, base, { fem: ex.p === "elle" || ex.p === "elles" });
    if (c && vxEq(c.form, ex.form.ans)) return `${vxPronHtml(pron)}${vlPartsHtml(c.parts, k, base, false)}`;
  }
  if (k === "ip") return `<b>${escapeHtml(ex.form.ans)}</b> !`;
  return `${vxPronHtml(pron)}<b>${escapeHtml(ex.form.ans)}</b>`;
}
// What to say aloud for an answer.
function vxSayText(ex) { return VX_FR ? VXF.say(ex) : ex.form.ans; }
// The question: the tense as its title, the person and one gap, the
// verb and its meaning. Nothing else competes with the tense: the rule
// it practises is in the label above the card.
function vxTenseTitleHtml(t, cls = "") {
  const u = VX_TENSE_UNIT[t] || "pr";
  return `<span class="vx-tt ${cls}" style="${vxUnitStyle(u)}">${(VX_UNIT[u] || {}).sign || ""} ${escapeHtml(VX_TENSE_LABEL[t] || "")}</span>`;
}
function vxPromptHtml(ex) {
  const t = ex.tense, u = VX_TENSE_UNIT[t] || "pr";
  // One blank for the whole verb: no word count, no prefix, pronoun or
  // Sie shown — those are part of what you produce. Only context that
  // isn't the answer (mit Anna) is shown.
  const gap = `<span class="vx-gap wide"></span>`;
  const ctx = ex.form.ctx ? ` <span class="vx-tail">${escapeHtml(ex.form.ctx)}</span>` : "";
  let line;
  // "sie" alone could be she: the plural says so (vxPronText).
  const cmd = VX_FR ? ex.kind === "ip" : ex.kind === "im" || ex.kind === "imsep" || ex.kind === "imfull";
  if (cmd) line = `<span class="vx-pron">${escapeHtml(vxPronText(ex))}</span> ${gap}${ctx} !`;
  else if (VX_FR) line = `${vxPronHtml(vxPronText(ex))}${gap}${ctx}`;
  else line = `<span class="vx-pron">${escapeHtml(vxPronText(ex))}</span> ${gap}${ctx}`;
  const mod = ex.kind === "pvmod" ? ` · with <b>${escapeHtml(ex.modal)}</b>` : "";
  // Only what it means (and that it is reflexive): the verb itself (its
  // infinitive) is yours to find.
  const gloss = vxMeaningCue(ex.x);
  return `<div class="vx-q" style="${vxUnitStyle(u)}">
    <div class="vx-tt-row" id="vx-tt">${vxTenseTitleHtml(t)}</div>
    <div class="vx-line">${line}</div>
    <div class="vx-verb">${escapeHtml(gloss)}${mod}</div>
    ${speakOn() ? `<div class="vx-fmt">🗣️ ${vxT("Say")} <b>${vxT("the full form")}</b></div>` : ""}
  </div>`;
}
function vxItemLabel(ex) {
  if (ex.rule) return vxT("🧩 Rule · {0}", VX_RULE[ex.rule].title);
  if (ex.cell) return vxT("📒 Ledger · {0} verbs", ex.x.level.toUpperCase());
  return `🧩 ${VX_ITEM_KINDS[ex.item.split(":")[0]].title}`; // (not the verb: that's the answer)
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
      const ps = vxRulePersons(r, x);
      const p = ps[exs.length % ps.length];
      const form = vxForm(x, r.kind, p, { modal: "müssen" });
      if (form) exs.push({ x, p, form, kind: r.kind, tense: ex.tense });
    }
    body = `<div class="vx-learn-t">${escapeHtml(r.title)}</div><div class="vx-learn-chip">${escapeHtml(r.chip)}</div>
      <div class="vx-learn-ex">${exs.map(e => `<div>${vxFormHtml(e)} <small>(${escapeHtml(e.x.inf)})</small></div>`).join("")}</div>
      <div class="p-sub">${vxT("One review, a different verb each time — your verbs, in order.")}</div>`;
  } else {
    const k = ex.item.split(":")[0];
    // The intro shows whole forms too (riefen an, triffst dich) — in
    // French the whole row it belongs to (ils font, que nous fassions…).
    const other = ex.p === "du" ? "er" : "du";
    const whole = (kind, p) => { const f = vxForm(ex.x, kind, p); return f ? escapeHtml(f.ans) : ""; };
    const extra = VX_FR ? vxRowTableHtml(VXF.rowCells(ex.x, ex.kind, ex.p)) : k === "sc" ? `<div><span class="vx-pron">${other}</span> <b>${whole("sc", other)}</b></div>`
      : k === "pt" ? `<div><span class="vx-pron">wir</span> <b>${whole("pt", "wir")}</b></div>`
      : k === "p2" ? `<div class="p-sub">Präteritum: er ${whole("pt", "er")}</div>`
      : k === "ir" || k === "p1" ? vxRowTableHtml(vxRowCellsDe(ex.x.F, k === "ir" ? "pr" : "pt", ex.p))
      : k === "k2s" ? vxRowTableHtml(PERSONS.map(p => { const f = vxForm(ex.x, "k2s", p); return f && { pron: PERSON_LABEL[p].split("/")[0], form: f.ans, on: p === ex.p }; }).filter(Boolean))
        + `<div class="p-sub">${ex.p} ${whole("k2w", ex.p)} — right too</div>` : "";
    body = `<div class="vx-learn-t">${escapeHtml(ex.x.inf)} <small>· ${escapeHtml(vlGloss(ex.x.v))}</small></div>
      <div class="vx-learn-chip">${escapeHtml(VX_ITEM_KINDS[k].title)}${vxT(" — not built by rule, so it has its own card")}</div>
      <div class="vx-learn-ex big"><div>${vxFormHtml(ex)}</div>${extra}</div>`;
  }
  document.getElementById("p-card").innerHTML = `
    <div class="p-learn vx-learn" style="${vxUnitStyle(VX_TENSE_UNIT[ex.tense] || "pr")}">
      <div class="p-kicker">${vxT("🧩 New verb item")}</div>
      <div class="vx-tt-row">${vxTenseTitleHtml(ex.tense, "md")}</div>
      ${body}
      ${ex.sheet ? `<button class="g-link-btn vx-sheet-btn" onclick="gsPeek('${ex.sheet}')">${vxT("📖 The sheet: {0}", escapeHtml(vxSheet(ex.sheet) ? vxSheet(ex.sheet).title : ""))}</button>` : ""}
    </div>`;
  pathSetActions(`<button class="g-big-btn p-main" id="p-go" onclick="pathNext()">${vxT("Got it →")}</button>`);
  if (audioOk() && ex.form) setTimeout(() => { if (pathSession && pathSession.cur === it) speak(vxSayText(ex)); }, 250);
  saveState();
}
// A typed verb exercise (a due item, a new item's check, a ledger drill).
function renderPathVerb(it) {
  const s = pathSession, w = it.w, ex = w.vx;
  const ws = ex.item ? S.words[vxKey(ex.item)] : null;
  s.typedSeen++;
  const badge = ws && ws.st && !it.fresh ? `${tierBadgeHtml(ws)} ${pipsHtml(ws)}` : ex.cell ? `<span class="tier-badge tier-learning">${vxT("📒 new form")}</span>` : `<span class="tier-badge tier-learning">${vxT("🌱 New")}</span>`;
  const kicker = it.repair ? `<div class="p-kicker repair">${vxT("🩹 Repair round — one more try")}</div>`
    : ws && ws.rp ? `<div class="p-kicker repair">${vxT("🩹 Repair — get it right to keep its badge")}</div>`
    : ws && ws.fl ? `<div class="p-kicker flag">${vxT("⚠️ Quick check")}</div>`
    : it.drillCheck ? `<div class="p-kicker flag">${vxT("🎯 Missed in a drill — a check")}</div>`
    : it.reask ? `<div class="p-kicker">${vxT("↻ Once more")}</div>` : "";
  document.getElementById("p-card").innerHTML = `<div class="p-meta"><span class="p-deck">${escapeHtml(vxItemLabel(ex))}</span>${badge}</div>${kicker}${vxPromptHtml(ex)}<div id="p-hint"></div>`;
  if (speakOn()) {
    it.said = false; it.revealed = false;
    const t = document.getElementById("p-typed"); if (t) t.style.display = "none";
    pathSetActions(`<button class="g-big-btn p-main" id="p-show" onclick="pathVerbReveal()">${vxT("Show ▶")}</button>`);
    return;
  }
  pathShowTyped(true, vxT("{0} — the full form…", VX_TENSE_LABEL[ex.tense] || ""));
  pathSetActions(`
    <button class="hint-btn" id="p-hint-btn" onclick="pathVerbHint()">${vxT("💡 Hint")}</button>
    <button class="dontknow-btn" onclick="pathGradeVerb('', false)">${vxT("? Don't know")}</button>
    <button class="g-big-btn p-main" id="p-check" onclick="pathCheckTyped()">${vxT("Check")}</button>`);
  pathPreventBlur();
}
// 💡 the first letters — the answer then counts as a look (no step up).
function pathVerbHint() {
  const s = pathSession;
  if (!s || s.answered || !s.cur || !s.cur.w.vx) return;
  const ex = s.cur.w.vx;
  s.cur.usedHint = true;
  const first = ex.form.ans.split(" ").map(x => x.slice(0, 2) + "…").join(" ");
  document.getElementById("p-hint").innerHTML = `<div class="hint-wrap"><div class="examples-title">${vxT("💡 It starts with")}</div><div class="hint-sentence">${escapeHtml(first)}</div></div>`;
  const b = document.getElementById("p-hint-btn"); if (b) b.disabled = true;
}
function pathCheckVerb() {
  const s = pathSession;
  if (!s || s.answered) return;
  const input = document.getElementById("p-input");
  const val = input ? input.value : "";
  if (!val.trim()) { shakeEl(input); if (input) input.focus({ preventScroll: true }); return; }
  const ex = s.cur.w.vx;
  // Only an umlaut off, on a verb where it changes the form: 1 or 2.
  const ch = vxUmlautChoice(val, ex.form.acc, ex.x, vxIsCommand(ex));
  if (ch && !ch.wrong) { pathVerbUmlautAsk(ch, val); return; }
  const g = vxGrade(val, ex);
  // The right verb and person in another tense (er kommt for the
  // Perfekt): never graded — the tense is pointed out, try again, as often
  // as it takes (a stray second Enter never turns it into a miss). The
  // way out is the asked tense, another answer, or ? Don't know.
  const other = g !== true ? vxOtherTense(val, ex)
    : vxUmlautOnly(val, ex.form.acc, vxIsCommand(ex)) ? vxOtherTense(val, ex, true) : null;
  if (other) { pathVerbTenseRetry(other, val); return; }
  // An umlaut typed that makes it another real form (drücke for drucke):
  // a miss, not a forgiven umlaut.
  pathGradeVerb(val, ch && ch.wrong ? false : g);
}
function pathVerbUmlautAsk(ch, val) {
  const s = pathSession, it = s.cur;
  if (vxUmlautAsking(document.getElementById("p-fb"))) return;
  const input = document.getElementById("p-input");
  if (input) input.disabled = true;
  pathSetActions("");
  vxUmlautAsk(document.getElementById("p-fb"), ch, (ok, picked) => {
    if (pathSession !== s || s.cur !== it) return;
    if (input) { input.disabled = false; input.value = picked; }
    pathGradeVerb(ok ? ch.right : picked, ok);
  });
  void val;
}
function pathVerbTenseRetry(other, val) {
  const s = pathSession, it = s.cur, ex = it.w.vx;
  const again = !!it.tenseRetry;
  it.tenseRetry = other;
  const input = document.getElementById("p-input");
  if (again) shakeEl(input);
  else if (typeof logEvent === "function") logEvent("vx_tense_slip", { want: ex.tense, got: other, inf: ex.x.inf });
  // (k2w: würde + infinitive for a card that asks the verb's own form.)
  document.getElementById("p-fb").innerHTML = other === "k2w"
    ? `<div class="vx-fb"><div class="vx-retry">↺ würde + infinitive is right too — this card asks for the verb's <b>own</b> ${vxTenseTitleHtml(ex.tense, "sm")}.</div>
    <div class="vx-retry-sub">One word, like wäre or hätte: one more try.</div></div>`
    : `<div class="vx-fb"><div class="vx-retry">${vxT("↺ That's the {0} — this one asks for the {1}.", vxTenseTitleHtml(other, "sm"), vxTenseTitleHtml(ex.tense, "sm"))}</div>
    <div class="vx-retry-sub">${vxT("Right verb, other tense: one more try.")}</div></div>`;
  const tt = document.getElementById("vx-tt");
  if (tt) { tt.classList.remove("vx-flash"); void tt.offsetWidth; tt.classList.add("vx-flash"); }
  if (input) { input.classList.add("retry"); input.select(); input.focus({ preventScroll: true }); input.addEventListener("input", () => input.classList.remove("retry"), { once: true }); }
  haptic("select");
  void val;
}
// ── THE UMLAUT CHOICE (1 / 2) ─────────────────
// Drawn into host. 1 / 2 (1–3 when three forms fit) or a tap picks; Enter and Space never pick or
// skip (you may still be pressing Enter after typing) — they point at
// 1 / 2. Keys are taken before anything else (capture), and given back
// once picked or once host has left the page. onPick(right, picked).
// Is a choice showing now (in root)? (Not a flag: a redraw — the mic
// toggled, the card drawn again — removes the box, and then it asks anew.)
function vxUmlautAsking(root) { const b = (root || document).querySelector(".vx-uml-ask"); return !!(b && b.offsetParent && !b.querySelector(".g-opt:disabled")); }
function vxUmlautAsk(host, ch, onPick) {
  if (!host) return false;
  const opts = [{ t: ch.right, ok: true }, ...(ch.others || [ch.other]).map(t => ({ t, ok: false }))];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  host.innerHTML = `<div class="vx-uml-ask">
    <div class="vx-uml-q">Which one? <span>with or without umlaut — ${opts.length > 2 ? "all" : "both"} are real forms</span></div>
    <div class="g-options vx-uml-opts">${opts.map((o, i) => `<button class="g-opt${o.t.length > 12 ? " long" : ""}" data-u="${i}"><span class="g-key">${i + 1}</span><span class="g-opt-text">${escapeHtml(o.t)}</span></button>`).join("")}</div>
    <div class="vx-uml-hint" aria-live="polite"></div></div>`;
  const box = host.querySelector(".vx-uml-ask");
  let done = false;
  const off = () => window.removeEventListener("keydown", key, true);
  const pick = i => {
    if (done) return;
    done = true; off();
    box.querySelectorAll(".g-opt").forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
    onPick(opts[i].ok, opts[i].t);
  };
  const key = e => {
    // Gone or hidden (the session left, another screen): let go of the keys.
    if (done || !box.isConnected || !box.offsetParent) { off(); return; }
    // A dialog on top (Leave the session?…) or another text box owns the keys.
    if (document.querySelector(".modal-overlay") || (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !e.target.disabled)) return;
    const d = parseInt(e.key, 10);
    if (d >= 1 && d <= opts.length) { e.preventDefault(); e.stopImmediatePropagation(); pick(d - 1); }
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); e.stopImmediatePropagation();
      box.querySelector(".vx-uml-hint").textContent = opts.length > 2 ? `Pick 1–${opts.length}` : "Pick 1 or 2";
      if (typeof shakeEl === "function") shakeEl(box.querySelector(".vx-uml-opts"));
    }
  };
  window.addEventListener("keydown", key, true);
  box.querySelectorAll(".g-opt").forEach((b, i) => { b.onclick = () => pick(i); });
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  return true;
}
// Say-it mode: Show, hear it, ✗ / ✓.
function pathVerbReveal() {
  const s = pathSession;
  if (!s || s.answered || !s.cur) return;
  const ex = s.cur.w.vx;
  s.cur.revealed = true;
  document.getElementById("p-fb").innerHTML = `<div class="vx-fb"><div class="vx-answer">${vxFormHtml(ex)}</div></div>`;
  pathSetActions(`<button class="g-sec-btn" onclick="pathGradeVerb('', false)">${vxT("✗ Not yet")}</button><button class="g-big-btn p-main" onclick="pathGradeVerb('', true, true)">${vxT("✓ I said it")}</button>`);
  speak(vxSayText(ex));
}
// ok: true / "near" / false. said: graded by yourself (Say-it).
function pathGradeVerb(val, ok, said = false) {
  const s = pathSession, it = s && s.cur;
  if (!s || s.answered || !it || !it.w.vx) return;
  const w = it.w, ex = w.vx;
  const input = document.getElementById("p-input");
  if (input) input.classList.remove("retry");
  // The private "my typo" override (Shift+Enter ×3, or the ✗ / ≈ tapped
  // ×3) can turn a typed answer around: snapshot what it touches.
  const typoOk = ok !== true && !said && !!String(val || "").trim();
  if (typoOk) pathVerbSnap(val, ok === "near", ex);
  const mark = sign => typoOk ? `<span class="p-typo" onpointerdown="event.preventDefault();pathSecretTap()">${sign}</span>` : sign;
  if (ok === "near") {
    // One slip: no step either way, one more try at the end.
    s.answered = true;
    s.stats.near++; s.stats.answered++;
    if (ex.item) { const ws = getWS(VX_DECK, ex.item); ws.lastAnsweredAt = Date.now(); ws.near = (ws.near || 0) + 1; }
    pathMissed(w); // a drill too: its try in the repair round
    if (input) input.classList.add("near");
    logEvent("answer", { m: ex.cell ? "path:cell" : "path:verb", ok: false, near: true, typed: true, ms: Date.now() - s.shownAt });
    document.getElementById("p-fb").innerHTML = `<div class="vx-fb"><div class="vx-res near">${mark("≈")} ${vxT("Almost")} — ${vxT("check the spelling")}</div>
      <div class="vx-answer">${vxFormHtml(ex)}</div><div class="p-diff">${vxDiffHtml(val, ex.form.ans)}</div>
      <div class="vx-note">${vxT("No step up, no step down — one more try at the end of this session.")}</div></div>`;
    pathSetActions(`<button class="g-big-btn p-main" id="p-go" onclick="pathGo()">${vxT("Next →")}</button>`);
    holdAfterMistake("p-go");
    saveState();
    return;
  }
  s.answered = true;
  const hint = !!it.usedHint;
  const kind = hint ? "recognition" : "recall";
  // Was it waiting for a repair (for the quests)?
  const fixWs = ex.item ? S.words[vxKey(ex.item)] : null, wasFix = !!(fixWs && (fixWs.rp || fixWs.fl || fixWs.lrn));
  let res = null, from = 0;
  vxRecordAnswer(ex, ok === true, { given: val, hint, repair: !!it.repair });
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
  } else if (ok !== true) {
    // A missed drill waits for the repair round like every mistake — the
    // session's count never grows (another person of the same tense then).
    pathMissed(w);
  } else if (it.repair && !hint) s.repairFixed = (s.repairFixed || 0) + 1;
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
  questEvent("answer", { mode: "path", ok: ok === true, typed: !said, st: from, w, it: "verb", hint, ms: Date.now() - s.shownAt, said, fix: wasFix || !!it.repair, retried: !!it.tenseRetry });
  saveState();
  // Feedback: the form in colour, the rule behind it, the whole row.
  const evs = res ? res.events : [];
  const chip = evs.includes("known") ? `<span class="p-chip ok">${vxT("🌳 Known!")}</span>`
    : res && res.promoted ? `<span class="p-chip ok">↑ ${tierOfStage(res.to).icon} ${tierOfStage(res.to).name}</span>`
    : evs.includes("repaired") ? `<span class="p-chip ok">${vxT("🩹 Repaired")}</span>`
    : evs.includes("confirmed") ? `<span class="p-chip ok">${vxT("✓ Scheduled")}</span>`
    : evs.includes("repair") ? `<span class="p-chip warn">${vxT("🩹 Badge kept — repair it next time")}</span>`
    : evs.includes("dropped") ? `<span class="p-chip warn">${vxT("↓ back to {0}", tierOfStage(res.to).name)}</span>`
    : ex.cell && ok === true && !hint ? `<span class="p-chip ok">📒 ${escapeHtml(ex.x.inf)} · ${escapeHtml(VX_TENSE_LABEL[ex.tense])} ✓</span>`
    : hint && ok === true ? `<span class="p-chip">${vxT("💡 with hint — no step up")}</span>` : "";
  const { why, row } = vxWhyRow(ex);
  const umlNote = ok === true && val && vxUmlautOnly(val, ex.form.acc, vxIsCommand(ex));
  const extraNote = ok === true && val && !umlNote && vxExtraOnly(val, ex);
  const head = ok === true ? `<div class="vx-res ok">${vxT("✓ Correct!")}${umlNote ? ` <span class="vx-uml">${vxT("— spelt {0}", `<b>${escapeHtml(ex.form.ans)}</b>`)}</span>` : ""}${extraNote ? ` <span class="vx-uml">${vxT("— only the verb was needed")}</span>` : ""}</div>`
    : `<div class="vx-res bad">${val.trim() ? `${mark("✗")} ${vxT("Answer:")}` : vxT("Answer:")}</div>`;
  // One centred column: verdict, the form in colour, what you typed,
  // the step it took, the rule, the whole row.
  document.getElementById("p-fb").innerHTML = `<div class="vx-fb">
    ${head}<div class="vx-answer">${vxFormHtml(ex)}</div>
    ${ok !== true && val.trim() ? `<div class="p-diff">${vxDiffHtml(val, ex.form.ans)}</div>` : ""}
    ${chip ? `<div class="vx-chip">${chip}</div>` : ""}
    ${why ? `<div class="vx-why">${why}</div>` : ""}${row}</div>`;
  pathSetActions(`
    ${ex.sheet ? `<button class="audio-btn" onclick="gsPeek('${ex.sheet}')" title="${vxT("Open the sheet")}">📖</button>` : ""}
    ${audioOk() ? `<button class="audio-btn" onclick="vxSayCur()">🔊</button>` : ""}
    <button class="g-big-btn p-main" id="p-go" onclick="pathGo()">${vxT("Next →")}</button>`);
  pathPreventBlur();
  if (ok !== true) holdAfterMistake("p-go");
  if (!said) speak(vxSayText(ex));
  if (input) input.focus({ preventScroll: true });
}
// After an answer: the rule behind the form, and its whole row.
function vxWhyRow(ex) {
  const engineT = VX_FR ? null : { pr: 1, pt: 1, pf: 1, pq: 1, fu: 1, im: 1 }[ex.kind] ? ex.kind : ex.kind === "p2" ? "pf" : ex.kind === "sc" ? "pr" : ex.kind === "k2w" || ex.kind === "k2o" ? "k2" : null;
  // A separable verb: the prefix rule too, whatever else the form shows.
  const sepWhy = (engineT === "pr" || engineT === "pt" || engineT === "im") && ex.x.F.sep && !/Separable/.test(verbRuleHtml(ex.x.F, engineT, ex.p))
    ? ` <br>📏 Separable: <strong>${escapeHtml(ex.x.F.sep)}-</strong> goes to the end.` : "";
  const why = VX_FR ? VXF.ruleHtml(ex.x, ex.kind, ex.p) || (ex.rule ? `📏 ${escapeHtml(VX_RULE[ex.rule].chip)}` : "")
    : engineT ? verbRuleHtml(ex.x.F, engineT, ex.p) + sepWhy : ex.rule ? `📏 ${escapeHtml(VX_RULE[ex.rule].chip)}` : "";
  const row = vxRowTableHtml(VX_FR ? VXF.rowCells(ex.x, ex.kind, ex.p) : engineT && engineT !== "im" ? vxRowCellsDe(ex.x.F, engineT, ex.p) : []);
  return { why, row };
}
// The private "my typo" override for a verb card (see pathSecretOk):
// everything a wrong or near answer touches, to roll it back.
function pathVerbSnap(val, near, ex) {
  const s = pathSession, w = s.cur.w, Q = S.quests, J = o => o === undefined || o === null ? null : JSON.stringify(o);
  const rk = ex.cell ? vxCellRuleItem(ex) : null;
  const keys = [ex.item, rk].filter(Boolean).map(vxKey);
  let mk = null;
  try { mk = J(usageDay().mk); } catch (e) {}
  s.undo = { verb: true, val, near,
    ws: keys.map(k => [k, J(S.words[k])]),
    vstate: J(S.verb), lv: S.learn && S.learn.verbs ? J(S.learn.verbs[ex.x.inf]) : null, mk,
    consec: sessionConsecutive, stats: { ...s.stats }, move: s.moves.get(wordKey(w)),
    wasMissed: s.missed.some(x => sameWord(x, w)),
    qm: Q && Q.m ? JSON.stringify(Q.m) : null, qw: Q && Q.week ? JSON.stringify(Q.week) : null };
}
function pathVerbSecretOk(u) {
  const s = pathSession, it = s.cur, w = it.w, ex = w.vx;
  const put = (obj, json) => { Object.keys(obj).forEach(k => delete obj[k]); Object.assign(obj, JSON.parse(json)); };
  u.ws.forEach(([k, j]) => { if (j === null) delete S.words[k]; else if (S.words[k]) put(S.words[k], j); else S.words[k] = JSON.parse(j); });
  if (u.vstate && S.verb) put(S.verb, u.vstate);
  if (S.learn && S.learn.verbs) { if (u.lv === null) delete S.learn.verbs[ex.x.inf]; else S.learn.verbs[ex.x.inf] = JSON.parse(u.lv); }
  try { const d = usageDay(); if (u.mk === null) delete d.mk; else d.mk = JSON.parse(u.mk); } catch (e) {}
  sessionConsecutive = u.consec;
  Object.assign(s.stats, u.stats);
  const Q = S.quests;
  if (Q && u.qm && Q.m) put(Q.m, u.qm);
  if (Q && u.qw && Q.week) put(Q.week, u.qw);
  if (!u.wasMissed) s.missed = s.missed.filter(x => !sameWord(x, w));
  const k = wordKey(w);
  if (u.move) s.moves.set(k, u.move); else s.moves.delete(k);
  if (typeof invalidatePathScan === "function") invalidatePathScan();
  // …and grade it as right.
  s.answered = false;
  const input = document.getElementById("p-input");
  if (input) input.classList.remove("wrong", "near");
  pathGradeVerb(u.val, true);
  _mistakeHoldUntil = 0; // a success now: Next must not wait on the old miss
  const ok = document.querySelector("#p-fb .vx-res.ok");
  if (ok) ok.innerHTML = ok.innerHTML.replace(vxT("✓ Correct!"), vxT("✓ Counted"));
}
// The whole row of a German form as cells (verbRowHtml's content).
function vxRowCellsDe(F, tense, person) {
  return PERSONS.map(p => {
    const c = verbCell(F, tense, p);
    if (!c) return null;
    const tail = String(c.tail || "").replace(/^… /, "").replace(/!$/, "").trim();
    // (Sie is asked with the sie form: its row lights up.)
    return { pron: PERSON_LABEL[p].split("/")[0], form: [c.ans, tail].filter(Boolean).join(" "), on: p === person || (person === "Sie" && p === "sie") };
  }).filter(Boolean);
}
// The row as a table: pronouns right-aligned against their forms;
// singular | plural side by side when the forms are short enough.
function vxRowTableHtml(cells) {
  if (!cells || cells.length < 2) return "";
  const pairs = cells.length === 6 && cells.every(c => (c.pron + " " + c.form).length <= 19);
  const list = pairs ? [0, 3, 1, 4, 2, 5].map(i => cells[i]) : cells;
  return `<div class="vx-row ${pairs ? "pairs" : ""}">${list.map(c => `<span class="vx-rp${c.on ? " on" : ""}">${escapeHtml(c.pron)}</span><span class="vx-rf${c.on ? " on" : ""}">${escapeHtml(c.form)}</span>`).join("")}</div>`;
}
// The typed answer against the right one (ui-helpers.js), its words ours.
function vxDiffHtml(val, ans) { return diffHtml(val, ans).replace(/>you typed /, `>${vxT("you typed")} `); }
// 🔊 on the feedback: the current exercise's answer (an apostrophe —
// j'aime — can't go through an onclick string).
function vxSayCur() { const s = pathSession; if (s && s.cur && s.cur.w && s.cur.w.vx) speak(vxSayText(s.cur.w.vx)); }
// A 📖 lesson inside a Today session: the sheet, then its quiz.
function renderPathSheet(it) {
  const s = pathSession;
  pathShowTyped(false);
  pathSetActions("");
  // Passed on the grammar screen since the session began: already counted.
  if (!it.counted) { it.counted = true; if (!vxSheetPassed(it.sheet)) { vxSheetUse(it.sheet); saveState(); } }
  gsOpen(document.getElementById("p-card"), it.sheet, { mode: "path", onDone: () => { gsClose(); pathNext(); } });
  if (typeof logEvent === "function") logEvent("vx_open", { id: it.sheet, where: "path" });
  void s;
}
