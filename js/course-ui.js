// ── THE COURSE: THE DRILL RUNNER & THE SCREENS ─
// (course-de.js holds the model.) German app only.
//
//   • The drill runner — one card, several questions: a test-out, a day's
//     drill, rule reviews, a writing prompt. Every exercise format of
//     PLAN.md §7: pick · type · transform (tiles first, then typed) ·
//     compose · answer · translate · write/open (model + checklist, you
//     grade yourself) · respond/order. A miss names its rule, shows the
//     sheet's why, opens the sheet, and comes back once at the end.
//     The same runner works inside a Today session (one card of the
//     session) and in ☰ › 📖 Course.
//   • ☰ › 📖 Course — the planner, the stages and their sections (built,
//     coming, linked to the verb track), each section's sheet, rules and
//     drills; 🧩 Drills (weak rules, mixed, a chosen section); the 📚
//     book map with the blueprint's coverage.
// ─────────────────────────────────────────────

const CX_STAGE_HUE = [38, 200, 280, 150, 330];
function cxStyle(stage) { return `--th:${CX_STAGE_HUE[stage] !== undefined ? CX_STAGE_HUE[stage] : 38}`; }
function cxSecStyle(secId) { const s = cxSection(secId); return cxStyle(s ? s.stage : 0); }

// ── THE RUNNER ────────────────────────────────
// opts: { mode: "path" | "menu", kind: "testout" | "drill" | "review" |
// "warm" | "write" | "practice", sec, title, sub, partKey, onDone(res) }
let _cx = null;
function cxModeFor(e) {
  const set = cxSet(e.set), k = cxItemKind(set, e.item);
  if (k !== "transform" && k !== "compose") return "typed";
  if (e.testout) return "typed";
  if (e.review) { const ws = cxRuleWS(e.rule); return ws && ws.st >= 3 ? "typed" : "tiles"; }
  const ds = S.course.ds[set.id];
  return ds && ds[0] >= 2 ? "typed" : "tiles";
}
function cxRun(host, list, opts = {}) {
  if (!host) return;
  const entries = list.filter(Boolean).map(e => ({ ...e, first: true, picked: [], mode: cxModeFor(e) }));
  _cx = { host, list: entries, i: 0, n: entries.length, firstRight: 0, answered: false, done: false, missed: [], opts, moves: [] };
  if (!entries.length) { _cx.done = true; }
  cxRender();
}
function cxClose() { _cx = null; }
// Questions answered for the first time so far (the Today count).
function cxPartAt(it) {
  if (it.part === "sheet") {
    const q = typeof _gs !== "undefined" && _gs && _gs.mode === "path" ? _gs.quiz : null;
    return q ? q.list.slice(0, q.i).filter(x => x.first).length : 0;
  }
  if (!_cx || _cx.opts.it !== it) return 0;
  return _cx.list.slice(0, _cx.i + (_cx.answered ? 1 : 0)).filter(e => e.first).length;
}
function cxGapHtml(s) { return gsMd(s).replace(/___/g, `<span class="cx-gap">___</span>`); }
function cxQHtml(item) {
  let h = cxGapHtml(item.q || "");
  if (item.hl) { const m = gsMd(item.hl); h = h.replace(m, `<mark class="cx-hl">${m}</mark>`); }
  return h;
}
const CX_PART_LABEL = { testout: "Test-out", checkpoint: "Checkpoint", drill: "Drill", review: "Review", warm: "Warm-up · yesterday's slips", write: "Writing", practice: "Practice", contrast: "Contrast day · mixed" };
function cxRender() {
  const r = _cx;
  if (!r) return;
  const o = r.opts;
  const head = `<div class="gs-head"><span class="gs-unit"><span class="gs-sign">📖</span>${escapeHtml(o.title || "Course")} · ${escapeHtml(CX_PART_LABEL[o.kind] || "")}</span>
    ${o.sub ? `<h2 class="gs-title">${escapeHtml(o.sub)}</h2>` : ""}</div>`;
  if (r.list[r.i] && !r.list[r.i].shownAt) r.list[r.i].shownAt = Date.now();
  if (r.done) { r.host.innerHTML = `<div class="gs-viewer cx-run" style="${o.sec ? cxSecStyle(o.sec) : cxStyle(0)}" id="cx-run">${head}${cxResultHtml()}</div>`; cxBindResult(); return; }
  const cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, k = cxItemKind(set, item);
  // (the book's exercise number only outside Today — in a session it's noise)
  const src = [o.sub === set.title ? "" : set.title, o.mode !== "path" && set.ex ? "Übung " + set.ex : ""].filter(Boolean).join(" · ");
  const pos = `<div class="gs-qpos">${cur.first ? `Question ${r.i + 1 - r.list.slice(0, r.i).filter(e => !e.first).length} of ${r.n}` : "Once more — the one you missed"}${src ? ` · <span class="cx-src">${escapeHtml(src)}</span>` : ""}</div>`;
  const how = `<div class="cx-how">${gsMd(set.how || "")}</div>`;
  let body = "";
  const input = (ph = "type it…") => `<input type="text" class="german-input gs-input" id="cx-input" placeholder="${ph}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>${typeof accentBarHtml === "function" ? accentBarHtml("cx-input") : ""}`;
  if (k === "pick" || k === "respond") {
    const opts = item.o || set.o || [];
    if (!cur.order) cur.order = k === "pick" && !item.o ? opts.map((_, i) => i) : shuffle(opts.map((_, i) => i));
    body = `<div class="gs-qtext">${cxQHtml(item)}</div><div class="gs-opts">${cur.order.map((oi, j) => `<button class="g-opt gs-opt" data-o="${oi}"><span class="g-key">${j + 1}</span><span class="g-opt-text">${escapeHtml(opts[oi])}</span></button>`).join("")}</div>`;
  } else if (k === "write" || k === "open") {
    body = `<div class="gs-qtext">${gsMd(item.q)}</div><textarea class="german-input cx-text" id="cx-text" rows="3" placeholder="Write it here…" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false"></textarea>`;
  } else if (k === "order") {
    // Lines of a conversation to put in order: tap them one by one.
    if (!cur.bank) { cur.bank = item.a.map((w, i) => ({ w, i })); for (let t = 0; t < 8; t++) { shuffle(cur.bank); if (cur.bank.some((b, i) => b.i !== i)) break; } }
    body = `<div class="gs-qtext">${gsMd(item.q || "Put the lines in order.")}</div><div class="gs-built cx-lines" id="cx-built" aria-label="Your order">${cur.picked.map((bi, j) => `<button class="gs-tok on" data-j="${j}">${escapeHtml(cur.bank[bi].w)}</button>`).join("") || `<span class="gs-built-ph">tap the lines in order</span>`}</div>
      <div class="gs-bank cx-lines" id="cx-bank">${cur.bank.map((t, bi) => `<button class="gs-tok" data-b="${bi}" ${cur.picked.includes(bi) ? "disabled" : ""}>${escapeHtml(t.w)}</button>`).join("")}</div>`;
  } else if ((k === "transform" || k === "compose") && cur.mode === "tiles") {
    if (!cur.bank) { const { tiles, extra } = cxTiles(set, item); cur.bank = shuffle([...tiles, ...extra].map((w, i) => ({ w, i }))); }
    const cue = k === "compose" ? `<div class="cx-cue">${(item.w || []).map(w => `<span class="gs-chip">${escapeHtml(w)}</span>`).join("")}</div>` : `<div class="gs-qtext">${cxQHtml(item)}</div>`;
    body = `${cue}<div class="gs-built" id="cx-built" aria-label="Your sentence">${cur.picked.map((bi, j) => `<button class="gs-tok on" data-j="${j}">${escapeHtml(cur.bank[bi].w)}</button>`).join("") || `<span class="gs-built-ph">tap the words in order</span>`}</div>
      <div class="gs-bank" id="cx-bank">${cur.bank.map((t, bi) => `<button class="gs-tok" data-b="${bi}" ${cur.picked.includes(bi) ? "disabled" : ""}>${escapeHtml(t.w)}</button>`).join("")}</div>`;
  } else if (k === "compose") {
    body = `<div class="cx-cue">${(item.w || []).map(w => `<span class="gs-chip">${escapeHtml(w)}</span>`).join("")}</div>${input("your sentence…")}`;
  } else if (k === "translate") {
    body = `<div class="gs-qtext cx-en">🇬🇧 ${gsMd(item.q)}</div>${input("in German…")}`;
  } else if (k === "answer") {
    body = `<div class="gs-qtext">💬 ${gsMd(item.q)}</div>${input("Nein, …")}`;
  } else {
    body = `<div class="gs-qtext">${cxQHtml(item)}</div>${input(k === "type" ? "type it…" : "the whole sentence…")}`;
  }
  const check = k !== "pick" && k !== "respond";
  const actLabel = k === "write" || k === "open" ? "Show the model" : "Check";
  r.host.innerHTML = `<div class="gs-viewer cx-run" style="${cxSecStyle(set.sec)}" id="cx-run">${head}
    <div class="gs-step fwd" id="cx-step"><div class="gs-quiz">${pos}${how}${body}<div class="gs-qfb" id="cx-fb" aria-live="polite"></div>
      <div class="gs-qact" id="cx-act">${check ? `<button class="g-big-btn" id="cx-check" onclick="cxCheckCur()">${actLabel}</button>` : ""}${cur.mode === "tiles" ? `<button class="tc-link cx-typeit" onclick="cxTypeInstead()">⌨️ type it instead</button>` : ""}</div></div></div></div>`;
  cxBind();
}
function cxBind() {
  const r = _cx, cur = r && r.list[r.i];
  if (!cur) return;
  const inp = document.getElementById("cx-input") || document.getElementById("cx-text");
  if (inp) {
    inp.addEventListener("keydown", e => { if (e.key === "Enter" && !(inp.tagName === "TEXTAREA" && e.shiftKey)) { e.preventDefault(); e.stopPropagation(); if (r.answered) cxNext(); else cxCheckCur(); } });
    if (r.opts.mode !== "path" || inp.tagName === "INPUT") setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) {} }, 60);
  }
  document.querySelectorAll("#cx-run .gs-opt").forEach(b => b.onclick = () => cxPick(+b.dataset.o));
  document.querySelectorAll("#cx-bank .gs-tok").forEach(b => b.onclick = () => { if (r.answered) return; cur.picked.push(+b.dataset.b); cxRefreshTiles(); });
  document.querySelectorAll("#cx-built .gs-tok").forEach(b => b.onclick = () => { if (r.answered) return; cur.picked.splice(+b.dataset.j, 1); cxRefreshTiles(); });
}
function cxRefreshTiles() {
  const r = _cx, cur = r.list[r.i];
  const built = document.getElementById("cx-built"), bank = document.getElementById("cx-bank");
  if (!built || !bank) return;
  built.innerHTML = cur.picked.map((bi, j) => `<button class="gs-tok on" data-j="${j}">${escapeHtml(cur.bank[bi].w)}</button>`).join("") || `<span class="gs-built-ph">tap the words in order</span>`;
  bank.querySelectorAll(".gs-tok").forEach(b => { b.disabled = cur.picked.includes(+b.dataset.b); });
  cxBind();
}
function cxTypeInstead() { const r = _cx; if (!r || r.answered) return; const cur = r.list[r.i]; cur.mode = "typed"; cur.picked = []; cxRender(); }
function cxPick(oi) {
  const r = _cx;
  if (!r || r.answered) return;
  const cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, opts = item.o || set.o || [];
  const ok = opts[oi] === item.a[0];
  document.querySelectorAll("#cx-run .gs-opt").forEach(b => {
    const o = +b.dataset.o; b.disabled = true;
    if (opts[o] === item.a[0]) b.classList.add("right"); else if (o === oi) b.classList.add("wrong");
  });
  const res = ok ? { ok: true, soft: [], right: item.a[0] } : cxCheck(item, opts[oi], cxSection(set.sec));
  cxAnswered(ok, opts[oi], res, false);
}
function cxCheckCur() {
  const r = _cx;
  if (!r || r.answered || r.done) return;
  const cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, k = cxItemKind(set, item), sec = cxSection(set.sec);
  if (k === "write" || k === "open") return cxShowModel();
  if (k === "order") {
    if (cur.picked.length < item.a.length) { shakeEl(document.getElementById("cx-built")); return; }
    const okO = cur.picked.every((bi, j) => cur.bank[bi].i === j);
    document.getElementById("cx-built").classList.add(okO ? "ok" : "bad");
    document.querySelectorAll("#cx-run .gs-tok").forEach(t => { t.disabled = true; });
    return cxAnswered(okO, cur.picked.map(bi => cur.bank[bi].w).join(" / "), { ok: okO, soft: [], right: item.a.join(" / "), rule: (item.r || [])[0] }, false);
  }
  let val = "";
  if (cur.mode === "tiles" && (k === "transform" || k === "compose")) {
    if (!cur.picked.length) { shakeEl(document.getElementById("cx-built")); return; }
    val = cur.picked.map(bi => cur.bank[bi].w).join(" ");
  } else {
    const inp = document.getElementById("cx-input");
    val = inp ? inp.value : "";
    if (!val.trim()) { if (inp) shakeEl(inp); return; }
  }
  const res = cxCheck(item, val, sec);
  if (!res.ok && res.near && !cur.near) {
    cur.near = true;
    const inp = document.getElementById("cx-input");
    if (inp) { inp.classList.add("near"); setTimeout(() => { inp.classList.remove("near"); inp.select(); }, 600); }
    document.getElementById("cx-fb").innerHTML = `<div class="p-near">≈ Almost — check the spelling and try again</div>`;
    return;
  }
  const inp = document.getElementById("cx-input");
  if (inp) { inp.disabled = true; inp.classList.add(res.ok ? "correct" : "wrong"); }
  const built = document.getElementById("cx-built");
  if (built) { built.classList.add(res.ok ? "ok" : "bad"); document.querySelectorAll("#cx-run .gs-tok").forEach(t => { t.disabled = true; }); }
  cxAnswered(res.ok, val, res, cur.mode !== "tiles");
}
// Write / open: the model and its checklist; you say how it went.
function cxShowModel() {
  const r = _cx, cur = r.list[r.i], item = cur.item;
  const ta = document.getElementById("cx-text");
  const val = ta ? ta.value : "";
  if (ta) ta.disabled = true;
  cur.given = val;
  document.getElementById("cx-fb").innerHTML = `<div class="cx-model"><b>A model answer</b>${(item.model || []).map(m => `<div class="gs-ex-de">${gsMd(m)}</div>`).join("")}</div>
    <div class="cx-check"><b>Check yours</b>${(item.check || []).map((c, i) => `<label class="cx-tick"><input type="checkbox" id="cx-tick-${i}"> ${gsMd(c)}</label>`).join("")}</div>`;
  document.getElementById("cx-act").innerHTML = `<div class="cx-self"><button class="g-sec-btn" id="cx-self-no" onclick="cxSelf(false)">✗ Not yet</button><button class="g-big-btn" id="cx-self-ok" onclick="cxSelf(true)">✓ Mine works</button></div>`;
}
function cxSelf(ok) {
  const r = _cx;
  if (!r || r.answered) return;
  const cur = r.list[r.i];
  cxAnswered(ok, cur.given || "", { ok, soft: [], right: (cur.item.model || [])[0] || "", rule: (cur.item.r || [])[0] }, true, true);
}
function cxAnswered(ok, given, res, typed, self = false) {
  const r = _cx, o = r.opts, cur = r.list[r.i];
  r.answered = true;
  cur.ok = ok; cur.given = given; cur.res = res;
  if (ok && cur.first) r.firstRight++;
  if (!ok && cur.first && !self) { r.missed.push(cur); r.list.push({ ...cur, first: false, picked: [], bank: null, order: null, near: false, ok: undefined, mode: cur.mode }); }
  if (cur.first) {
    // Your own writing never counts against a rule unless you say so —
    // and then it's a miss like any other (PLAN.md §7).
    const kk = cxItemKind(cxSet(cur.set), cur.item);
    const mv = cxRecordAnswer(cur, ok, res, { typed, given, where: o.kind, self, kind: kk === "pick" || kk === "respond" ? "recognition" : "recall", ms: cur.shownAt ? Date.now() - cur.shownAt : 0 });
    if (mv && mv.rule) { r.moves.push(mv); cur.mv = mv; }
    if (typeof questEvent === "function" && (!o.partKey || cxPlanTake(o.partKey, r.n, ok)))
      questEvent("answer", { mode: o.mode === "path" ? "path" : "grammar", ok: !!ok, typed: !!typed });
    if (o.mode === "path" && typeof pathSession !== "undefined" && pathSession) {
      pathSession.stats.answered++;
      if (ok) { pathSession.stats.correct++; sessionCorrect++; sessionConsecutive++; addExp(3); } else { pathSession.stats.wrong++; sessionConsecutive = 0; }
    }
  }
  if (ok) { if (typeof playSuccess === "function") playSuccess(); if (typeof haptic === "function") haptic("select"); }
  else { if (typeof playFailure === "function") playFailure(); if (typeof haptic === "function") haptic("miss"); if (typeof holdAfterMistake === "function") holdAfterMistake("cx-next"); }
  cxShowAnswered();
  if (o.mode === "path" && typeof pathProgress === "function" && typeof pathSession !== "undefined" && pathSession) pathProgress();
}
const CX_SOFT = { umlaut: "mind the umlaut", ss: "mind the ß", caps: "nouns and Sie take a capital" };
function cxShowAnswered() {
  const r = _cx, cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, res = cur.res || {}, ok = cur.ok;
  const k = cxItemKind(set, item);
  const rule = cxRule(res.rule || (item.r || [])[0]);
  const fb = document.getElementById("cx-fb");
  const self = k === "write" || k === "open";
  const also = (item.a || []).filter(a => a !== res.right);
  // The rule, and why: what this answer got wrong — or, when nothing
  // more precise is known, the rule as the sheet says it.
  const ruleBox = rule ? `<div class="cx-rule"><b>📏 ${escapeHtml(rule.title)}</b>${res.msg ? `<div class="cx-diag">${gsMd(res.msg)}</div>` : `<div class="cx-rtext">${gsMd(rule.text)}</div>`}
      <button class="gs-qsee" onclick="gsPeek('${rule.sheet}')">📖 See it in the sheet — ${escapeHtml(gqPointName(rule.at))}</button></div>` : "";
  let html;
  if (self) html = ok ? `<div class="p-ok">✓ Noted — well done</div>` : `<div class="p-bad">✗ Noted — it goes back to its rule</div>${ruleBox}`;
  else if (ok) html = `<div class="p-ok">✓ Right${res.soft && res.soft.length ? ` <span class="vx-uml">— ${res.soft.map(s => CX_SOFT[s]).join(", ")}: <b>${escapeHtml(res.right)}</b></span>` : ""}</div>${also.length ? `<div class="cx-also">Also right: ${also.map(a => `<i>${escapeHtml(a)}</i>`).join(" · ")}</div>` : ""}${cxMoveHtml(cur)}`;
  else html = `<div class="p-bad">✗ Answer: <strong>${escapeHtml(res.right || (item.a || [])[0] || "")}</strong></div>
      ${cur.given && k !== "pick" ? `<div class="p-diff">${diffHtml(cur.given, res.right || "")}</div>` : ""}
      ${item.note ? `<div class="cx-note">${gsMd(item.note)}</div>` : ""}${ruleBox}
      ${cur.first ? `<div class="gs-qback">This one comes back once at the end.</div>` : ""}`;
  if (fb) fb.innerHTML = html;
  const act = document.getElementById("cx-act");
  if (act) act.innerHTML = `<button class="g-big-btn" id="cx-next" onclick="cxNext()">${r.i + 1 >= r.list.length ? "See result" : "Next ›"}</button>`;
  if (r.opts.mode !== "path") setTimeout(() => { const b = document.getElementById("cx-next"); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }, 30);
}
// A right review: where its rule stands now.
function cxMoveHtml(cur) {
  const mv = cur.mv;
  if (!cur.first || !mv || !mv.rule) return "";
  const ws = cxRuleWS(mv.rule);
  if (!ws || !ws.st) return "";
  const ev = mv.events || [];
  const what = ev.includes("up") ? `↑ ${tierOfStage(ws.st).icon} up a step` : ev.includes("confirmed") ? "✓ in your reviews from tomorrow" : ev.includes("repaired") || ev.includes("unflagged") ? "🩹 fixed" : "";
  return what ? `<div class="cx-move">📏 ${escapeHtml(cxRule(mv.rule).title)} — ${what}</div>` : "";
}
function cxNext() {
  const r = _cx;
  if (!r || !r.answered) return;
  if (typeof mistakeHeld === "function" && mistakeHeld("cx-fb")) return;
  r.answered = false;
  r.i++;
  if (r.i >= r.list.length) { r.done = true; cxSettle(); }
  cxRender();
  const v = document.getElementById("cx-run");
  if (v && v.getBoundingClientRect().top < 0) v.scrollIntoView({ block: "start", behavior: "smooth" });
}
function cxSettle() {
  const r = _cx, o = r.opts;
  if (r.settled) return;
  r.settled = true;
  r.result = { right: r.firstRight, n: r.n };
  if (o.kind === "testout") r.result.passed = cxTestoutResult(o.sec, r.firstRight, r.n);
  if (o.kind === "checkpoint") r.result.passed = cxCheckpointResult(o.sec, r.firstRight, r.n);
  if (o.kind === "drill") cxDrillDone(o.sec, r.firstRight, r.n);
  if (typeof logEvent === "function") logEvent("cx_part", { k: o.kind, sec: o.sec || "", right: r.firstRight, n: r.n, where: o.mode });
  if (r.result.passed && typeof confettiBurst === "function") confettiBurst(30);
}
function cxResultHtml() {
  const r = _cx, o = r.opts, res = r.result || { right: 0, n: 0 };
  const pct = res.n ? Math.round(res.right / res.n * 100) : 0;
  let icon = pct >= 80 ? "✅" : "📖", title = `${res.right}/${res.n} right first time`, note = "";
  if (!res.n) { icon = "✓"; title = "Nothing to do here right now"; }
  if (o.kind === "testout") {
    const sec = cxSection(o.sec);
    icon = res.passed ? "🎓" : "📖";
    title = res.passed ? "Tested out!" : "Not yet — the sheet first";
    note = res.passed ? `“${escapeHtml(sec.title)}” is done: its rules join your reviews, lightly. The sheet and drills stay open in 📖 Course.`
      : `${res.right}/${res.n} right. ${o.mode === "path" ? "The sheet comes next, then its drill." : "Read the sheet, pass its quiz, then drill it."}`;
  } else if (o.kind === "checkpoint") {
    const sec = cxSection(o.sec), need = Math.round(((sec.checkpoint || {}).pass || 0.8) * 100);
    icon = res.passed ? "🏁" : "📖";
    const on = !res.passed && cxSecDone(o.sec);
    title = res.passed ? `${escapeHtml((cxStage(sec.stage) || {}).name || "Stage")} — passed!` : on ? `${pct}% — moving on anyway` : `${pct}% — ${need}% moves on`;
    note = res.passed ? "On to the next stage. Its rules keep coming back in your reviews."
      : on ? "Third try: the next stage starts, so your finish date holds. The rules you missed come first in your reviews until they hold."
      : "The rules you missed come first in your next sessions; the checkpoint comes back tomorrow.";
  } else if (o.kind === "drill") {
    const sec = cxSection(o.sec), some = sec && sec.sheets.some(cxSheetPassed) && !sec.sheets.every(cxSheetPassed);
    note = cxSecDone(o.sec) ? "The section is done for today. Its rules come back in your reviews until each holds — right twice, on separate days."
      : some ? "Done for today. Tomorrow: this section's next sheet."
      : "Good practice. The sheet comes back tomorrow — pass its quiz and the section is done.";
  }
  else if (o.kind === "review" || o.kind === "warm") {
    const up = r.moves.filter(m => (m.events || []).includes("up")).length, miss = r.list.filter(e => e.first && e.ok === false).length;
    note = `${up ? `${up} rule${up > 1 ? "s" : ""} up a step. ` : ""}${miss ? `${miss} slip${miss > 1 ? "s" : ""} — back to their rule, they return soon.` : ""}`;
  }
  const missed = r.missed.length ? `<div class="gs-missed"><b>To look at again</b>${r.missed.map(m => { const ru = cxRule((m.res && m.res.rule) || (m.item.r || [])[0]);
    return `<button class="gs-miss" ${ru ? `onclick="gsPeek('${ru.sheet}')"` : ""}><span>${cxQHtml(m.item.q ? m.item : { q: (m.item.w || []).join(" / ") })}</span><small>${ru ? escapeHtml(ru.title) + " ›" : ""}</small></button>`; }).join("")}</div>` : "";
  const btn = o.mode === "path" ? `<button class="g-big-btn" id="cx-done" onclick="cxFinish()">Continue ▶</button>`
    : `${o.again ? `<button class="g-sec-btn" onclick="(${o.again})()">Again — other items</button>` : ""}<button class="g-big-btn" id="cx-done" onclick="cxFinish()">Done ✓</button>`;
  return `<div class="gs-result ${pct >= 80 || res.passed ? "ok" : "bad"}"><div class="gs-result-icon">${icon}</div><div class="gs-result-title">${title}</div>
    ${note ? `<div class="gs-result-note">${note}</div>` : ""}${missed}<div class="gs-result-act">${btn}</div></div>`;
}
function cxBindResult() { if (_cx && _cx.opts.mode !== "path") setTimeout(() => { const b = document.getElementById("cx-done"); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }, 30); }
function cxFinish() {
  const r = _cx;
  if (!r || !r.done) return;
  const cb = r.opts.onDone, res = r.result;
  if (cb) cb(res || {});
}
// Keys: Enter = check / next · digits pick.
function cxKey(e) {
  const r = _cx;
  if (!r || !document.getElementById("cx-run")) return false;
  if (r.done) { if (e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")) { e.preventDefault(); cxFinish(); return true; } return false; }
  if (e.key === "Enter") {
    if (e.target && e.target.tagName === "BUTTON" && !e.target.disabled) return false;
    if (e.target && e.target.tagName === "TEXTAREA") return false;
    e.preventDefault();
    if (r.answered) cxNext(); else cxCheckCur();
    return true;
  }
  const cur = r.list[r.i], k = cur && cxItemKind(cxSet(cur.set), cur.item);
  if (!r.answered && (k === "pick" || k === "respond") && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) {
    const d = parseInt(e.key, 10);
    if (d >= 1 && cur.order && d <= cur.order.length) { e.preventDefault(); cxPick(cur.order[d - 1]); return true; }
  }
  return false;
}
document.addEventListener("keydown", e => {
  if (!_cx || _cx.opts.mode === "path") return;
  if (document.querySelector(".modal-overlay")) return;
  cxKey(e);
});

// ── WHAT EACH PART ASKS ───────────────────────
// (cxPartList: course-de.js)
function cxPartTitle(p) {
  const sec = p.sec && cxSection(p.sec);
  if (sec) return { title: sec.title, sub: p.part === "testout" ? "Do you know it already?" : p.part === "checkpoint" ? "Everything of this stage, mixed" : "Today's drill" };
  if (p.part === "warm") return { title: "Grammar", sub: "Yesterday's slips" };
  if (p.part === "write") return { title: "Writing", sub: (cxJournalPick(0) || { de: "Write it yourself" }).de };
  return { title: "Grammar", sub: p.contrast ? "Mixed: tell them apart" : "Rules due today" };
}

// ── IN A TODAY SESSION ────────────────────────
// One card of the session per part (path.js buildPathQueue).
function renderPathCx(it) {
  pathShowTyped(false);
  pathSetActions("");
  const host = document.getElementById("p-card");
  if (!cxPartLive(it)) { it.qn = 0; pathProgress(); pathNext(); return; }
  cxPartBegin(it);
  if (it.part === "sheet") {
    gsOpen(host, it.sheet, { mode: "path", onDone: res => { gsClose(); if (res && res.passed) cxPartDone(it); pathNext(); } });
    if (typeof logEvent === "function") logEvent("cx_open", { id: it.sheet, where: "path" });
    return;
  }
  if (it.part === "write") { cxJournalOpen(host, { mode: "path", onDone: () => { cxPartDone(it); pathNext(); } }); return; }
  const list = cxPartList(it).slice(0, it.qn || 99);
  if (!list.length) { cxPartDone(it); it.qn = 0; pathProgress(); pathNext(); return; }
  if (list.length < it.qn) { it.qn = list.length; pathProgress(); }
  const t = cxPartTitle(it);
  cxRun(host, list, { mode: "path", kind: it.part === "review" && it.contrast ? "contrast" : it.part, sec: it.sec, title: t.title, sub: t.sub, it,
    partKey: it.part + ":" + (it.sec || ""), onDone: () => { cxPartDone(it); cxClose(); pathNext(); } });
}

// ── THE WRITING JOURNAL ───────────────────────
// A situation, at least N words, a live count; saved as it is — "good
// job", done — and it waits in the learning log for Claude to correct.
// The draft survives a ✕ (this device only).
let _cj = null;
const CX_JDRAFT = "cx-jdraft";
function cxJDraft(p, t) {
  try {
    if (t === undefined) { const d = JSON.parse(localStorage.getItem(CX_JDRAFT) || "null"); return d && d.p === p ? String(d.t || "") : ""; }
    if (t) localStorage.setItem(CX_JDRAFT, JSON.stringify({ p, t })); else localStorage.removeItem(CX_JDRAFT);
  } catch (e) {}
  return "";
}
// opts: { mode: "path" | "menu", onDone, prompt? (an id) }
function cxJournalOpen(host, opts = {}) {
  cxClose();
  const p = (opts.prompt && cxJournalPrompt(opts.prompt)) || cxJournalPick(0);
  if (!host || !p) { if (opts.onDone) opts.onDone(); return; }
  _cj = { host, opts, p, skip: 0, saved: null };
  cxJournalRender();
}
function cxJournalRender() {
  const j = _cj;
  if (!j) return;
  const p = j.p, min = cxJournalMin(p);
  const head = `<div class="gs-head"><span class="gs-unit"><span class="gs-sign">✍️</span>Writing · ${escapeHtml(p.lv)}</span><h2 class="gs-title">${escapeHtml(p.de)}</h2></div>`;
  if (j.saved) {
    const n = cxJournalList().filter(e => !e.c).length;
    j.host.innerHTML = `<div class="gs-viewer cx-run cx-journal" style="${cxStyle(0)}" id="cx-journal">${head}
      <div class="gs-result ok"><div class="gs-result-icon">🌟</div><div class="gs-result-title">Good job — ${j.saved.w} words!</div>
        <div class="gs-result-note">Saved for correction. It's in your learning log${n > 1 ? ` with ${n - 1} other text${n > 2 ? "s" : ""}` : ""}: copy the log into your German project in Claude and ask for corrections.</div>
        <div class="gs-result-act">${j.opts.mode === "path" ? `<button class="g-big-btn" id="cx-jdone" onclick="cxJournalDone()">Continue ▶</button>` : `<button class="g-big-btn" id="cx-jdone" onclick="cxJournalDone()">Done ✓</button>`}</div></div></div>`;
    setTimeout(() => { const b = document.getElementById("cx-jdone"); if (b && j.opts.mode !== "path") try { b.focus({ preventScroll: true }); } catch (e) {} }, 30);
    return;
  }
  const draft = cxJDraft(p.id);
  j.host.innerHTML = `<div class="gs-viewer cx-run cx-journal" style="${cxStyle(0)}" id="cx-journal">${head}
    <div class="gs-quiz">
      <div class="gs-qpos">At least ${min} words · saved for Claude to correct · no score</div>
      <div class="gs-qtext cx-en">${escapeHtml(p.t)}</div>
      ${(p.help || []).length ? `<div class="cx-cue">${p.help.map(h => `<span class="gs-chip">${escapeHtml(h)}</span>`).join("")}</div>` : ""}
      <textarea class="german-input cx-text cx-jtext" id="cx-jtext" rows="6" placeholder="Schreib hier…" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" lang="de">${escapeHtml(draft)}</textarea>
      <div class="cx-wc" id="cx-wc" aria-live="polite"></div>
      <div class="gs-qact"><button class="g-big-btn" id="cx-jsave" onclick="cxJournalSubmit()">Save</button><button class="tc-link cx-typeit" onclick="cxJournalOther()">↻ another topic</button></div>
    </div></div>`;
  const ta = document.getElementById("cx-jtext");
  ta.addEventListener("input", () => { cxJDraft(p.id, ta.value); cxJournalCount(); });
  cxJournalCount();
  if (j.opts.mode !== "path") setTimeout(() => { try { ta.focus({ preventScroll: true }); } catch (e) {} }, 60);
}
function cxJournalCount() {
  const j = _cj, ta = document.getElementById("cx-jtext"), wc = document.getElementById("cx-wc"), btn = document.getElementById("cx-jsave");
  if (!j || !ta || !wc) return;
  const n = cxWordCount(ta.value), min = cxJournalMin(j.p), ok = n >= min;
  wc.textContent = ok ? `${n} words ✓` : `${n} / ${min} words`;
  wc.classList.toggle("ok", ok);
  if (btn) btn.disabled = !ok;
}
function cxJournalOther() {
  const j = _cj;
  if (!j || j.saved) return;
  j.skip++;
  const p = cxJournalPick(j.skip);
  if (p) { j.p = p; cxJournalRender(); }
}
function cxJournalSubmit() {
  const j = _cj, ta = document.getElementById("cx-jtext");
  if (!j || j.saved || !ta || cxWordCount(ta.value) < cxJournalMin(j.p)) return;
  const e = cxJournalSave(j.p.id, ta.value);
  if (!e) return;
  cxJDraft(j.p.id, "");
  j.saved = e;
  cxJournalRender();
}
function cxJournalCopy() {
  const text = cxJournalCopyText();
  copyTextToClipboard(text)
    .then(() => showCelebrateToast("✍️", "Your texts are copied", "Paste them into your German project in Claude"))
    .catch(() => { window.prompt("Copy your texts:", text); });
}
function cxJournalDone() { const j = _cj; _cj = null; if (j && j.opts.onDone) j.opts.onDone(); else if (j && j.opts.mode !== "path") renderJournal(); }

// ☰ › 📖 Course › ✍️ My writing: what I wrote, what's corrected.
function renderJournal() {
  if (typeof cxOn !== "function" || !cxOn()) return;
  showGameScreen();
  cxClose(); _cj = null;
  migrateCourse();
  const list = cxJournalList().slice().reverse(), open = list.filter(e => !e.c).length;
  const next = cxJournalPick(0);
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">✍️ My writing</div>${backBtnHtml()}</div>
    <div class="gr-unote">Write freely about everyday situations. Nothing is graded here, and every text is kept with its date. The ones to correct are in your <b>learning log</b> too${open ? ` — <b>${open}</b> waiting now` : ""}: paste either into Claude, then tick them here.</div>
    <div class="cx-links">
      ${next ? `<button class="cx-chip" onclick="cxJournalOpen(document.getElementById('main-screen'),{mode:'menu'})">✍️ Write one now</button>` : ""}
      ${list.length ? `<button class="cx-chip" onclick="cxJournalCopy()">📋 Copy my texts</button>` : ""}
    </div>
    ${list.length ? `<div class="cx-jlist">${list.map(e => { const p = cxJournalPrompt(e.p);
      return `<details class="cx-jentry ${e.c ? "done" : ""}"><summary><span class="cx-jd">${escapeHtml(fmtShortDate(e.d))}</span><span class="cx-jt">${escapeHtml(p ? p.de : e.p)}<small>${e.w} words · ${e.c ? "corrected ✓" : "to correct"}</small></span></summary>
        <div class="cx-jbody">${escapeHtml(e.t)}</div>
        <button class="g-sec-btn" onclick="cxJournalMark('${e.id}', ${e.c ? "false" : "true"});renderJournal()">${e.c ? "↺ Not corrected yet" : "✓ Corrected with Claude"}</button></details>`; }).join("")}</div>`
      : `<div class="gr-unote">Nothing yet — your first text comes in Today, or write one now.</div>`}
  </div>`;
  if (typeof logScreen === "function") logScreen("writing");
}

// ── THE TODAY CARD ────────────────────────────
function cxTodayHtml() {
  if (typeof cxOn !== "function" || !cxOn()) return "";
  const c = cxTodayCounts();
  if (!c.parts) return "";
  const sec = c.lesson && cxSection(c.lesson.sec);
  const what = sec ? `📖 Grammar: <b>${escapeHtml(sec.title)}</b> — in your session`
    : c.due ? `📏 Grammar: <b>${c.due} rule${c.due === 1 ? "" : "s"}</b> to review — in your session`
    : `✍️ Writing: <b>${escapeHtml((cxJournalPick(0) || { de: "a few lines" }).de)}</b> — for Claude to correct`;
  return `<button class="tc-vx lesson cx-today" style="${sec ? cxSecStyle(sec.id) : cxStyle(0)}" onclick="showScreen('course')">${what}</button>`;
}

// ── ☰ › 📖 COURSE ─────────────────────────────
const CX_ST_CHIP = { done: "Done", tested: "Tested out 🎓", sheet: "Sheet passed — its drill next", coming: "Coming" };
function cxSecStatus(s) {
  if (s.verb && s.verb.length) {
    const n = s.verb.filter(id => vxSheetPassed(id)).length;
    return n === s.verb.length ? { k: "done", txt: "Done · verb track" } : { k: "later", txt: `Verb track · ${n}/${s.verb.length} sheets` };
  }
  if (!cxLearnable(s)) return { k: "coming", txt: CX_ST_CHIP.coming };
  if (s.checkpoint) {
    const st = cxSecState(s.id) || {};
    return st.st >= 3 ? { k: "done", txt: `Passed · ${st.cp}%` } : cxCheckpointReady(s) ? { k: "now", txt: `Checkpoint — ${Math.round(s.checkpoint.pass * 100)}% moves on${st.cp ? ` · best ${st.cp}%` : ""}` } : { k: "later", txt: "After the stage's sections" };
  }
  const st = cxSecState(s.id) || {};
  if (st.st >= 3) return { k: "done", txt: st.to >= 0 && !(st.sh > 0) ? CX_ST_CHIP.tested : CX_ST_CHIP.done };
  if (st.st === 2) return { k: "now", txt: CX_ST_CHIP.sheet };
  if (cxNextSections(1)[0] !== s) return { k: "now", txt: "Ready" };
  const on = cxNextLessonDay();
  return { k: "now", txt: on <= studyToday() ? "Next — comes in Today" : `Next — in Today on ${fmtShortDate(on)}` };
}
// One line: on track or not, and by when.
function cxPlannerHtml() {
  const P = cxPlanner();
  const dot = { green: "🟢", amber: "🟠", red: "🔴", none: "⚪" }[P.status];
  // At my own pace (the last 4 weeks), when it says something new.
  const mine = P.mine && P.left && P.status !== "none" ? (P.late ? ` · at your pace: ${fmtShortDate(P.eta)}` : "") : "";
  const line = P.status === "none" ? "Set a finish date (⚙️ Study plan) and the course plans its sheets to it"
    : P.status === "green" ? `On track · ${P.left} sheets ahead, a new one ${cxGap() === 1 ? "every day" : `every ${cxGap()} days`} · all passed by <b>${fmtShortDate(P.target)}</b>${mine}`
    : P.status === "amber" ? `Tight · ${P.left} sheets ahead · a sheet every day to pass them by <b>${fmtShortDate(P.target)}</b>${mine}`
    : `Behind · ${P.left} sheets ahead, ${Math.max(0, P.days)} days to <b>${fmtShortDate(P.target)}</b> — a second sheet every other day${P.need > 1.5 ? ", and still short: a later finish date" : ""}${mine}`;
  return `<div class="cx-plan ${P.status}">${dot} ${line}</div>`;
}
const CX_SEC_ICON = { done: "✓", now: "📖", later: "📐", coming: "·" };
function renderCourse() {
  if (typeof cxOn !== "function" || !cxOn()) { if (typeof renderGrammar === "function") renderGrammar(); return; }
  showGameScreen();
  if (typeof gsClose === "function") gsClose();
  cxClose();
  migrateCourse();
  const next = cxNextSections(1)[0], nextOn = cxNextLessonDay();
  const { fix, due } = cxDueRules();
  const learned = Object.keys(CX.rules).filter(cxRuleLearned).length;
  const openStage = next ? next.stage : 0;
  // A row per section: what's built stands out, what's coming stays quiet.
  const stages = CX.stages.map(st => {
    const secs = CX.sections.filter(s => s.stage === st.id);
    const done = secs.filter(s => cxSecStatus(s).k === "done").length;
    return `<details class="cx-stage" style="${cxStyle(st.id)}" ${st.id === openStage ? "open" : ""}>
      <summary><span class="gr-sign">${st.id === 4 ? "✦" : st.id}</span><span class="gr-name">${escapeHtml(st.name)}<small>${escapeHtml(st.sub)}</small></span><span class="gr-st">${done}/${secs.length}</span></summary>
      <div class="gr-sheets">${secs.map(s => { const ss = cxSecStatus(s), coming = ss.k === "coming";
        return `<button class="gr-sheet cx-sec ${ss.k}" onclick="renderCourseSection('${s.id}')"><span class="gr-sn">${s.checkpoint && ss.k !== "done" ? "🏁" : CX_SEC_ICON[ss.k]}</span><span class="gr-stt">${escapeHtml(s.title)}${coming ? "" : `<small>${ss.txt}</small>`}</span>${coming ? "" : `<span class="set-chev">›</span>`}</button>`; }).join("")}</div>
    </details>`;
  }).join("");
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">📖 Course</div>${backBtnHtml()}</div>
    ${next ? `<button class="gr-next" onclick="renderCourseSection('${next.id}')" style="${cxStyle(next.stage)}"><span class="gr-next-k">📖 Next — ${nextOn <= studyToday() ? "it comes in Today" : `in Today on ${escapeHtml(fmtShortDate(nextOn))} (or open it now)`}</span><span class="gr-next-t">${escapeHtml(next.title)}</span></button>` : ""}
    ${cxPlannerHtml()}
    <div class="gr-sum">
      <div><b>${CX.sections.filter(s => cxSecStatus(s).k === "done").length}</b><span>/ ${CX.sections.length} sections</span></div>
      <div><b>${learned}</b><span>rules learned</span></div>
      <div><b>${fix.length + due.length}</b><span>rules due</span></div>
    </div>
    <div class="cx-links four">
      <button class="cx-chip" onclick="renderDrills()">🧩 Drills</button>
      <button class="cx-chip" onclick="renderCourseBook()">📚 Book map</button>
      <button class="cx-chip" onclick="renderGrammar()">📐 Verbs</button>
      <button class="cx-chip" onclick="renderJournal()">✍️ Writing</button>
    </div>
    ${stages}
    <details class="gr-how"><summary>ℹ️ How the course works</summary>
      <p><b>Spread to your finish date</b>: a new section every few days, inside Today (the days between bring its reviews, mixed practice and writing). An earlier date brings them closer, a later one further apart; a break evens itself out. Each section: a short test-out for the A1 basics (pass it and the section is done), else the sheet and its 3-question quiz, then the section's drill — 10 to 14 items climbing from picking to building and writing sentences.</p>
      <p><b>Rules, not lists.</b> Each rule of a sheet is a review card on the same stages as your words. A miss names the rule, shows why, and sends it back to review; a rule is learned once it's right twice on separate days, and keeps coming back less and less.</p>
      <p><b>The book is the backbone</b>: every exercise of the grammar book is mirrored by a drill set of our own sentences, generated, or skipped on purpose — the 📚 book map shows where each one stands. Sections marked · arrive with the next build sessions; they already count in the plan.</p>
    </details>
  </div>`;
  if (typeof logScreen === "function") logScreen("course");
}
// A rule: its title and where it stands (its words are on the sheet).
function cxRuleRowHtml(r) {
  const rule = cxRule(r), ws = cxRuleWS(r);
  return `<div class="gr-rule"><b>${escapeHtml(rule.title)}</b>${cxRuleLearned(r) ? `<span class="cx-learned">✓ learned — right on two days</span>` : `<span></span>`}${typeof gsRuleStatusHtml === "function" ? gsRuleStatusHtml(ws, 0) : ""}</div>`;
}
// The book sections it draws on, by chapter: "ch 5: Negation, Nicht · ch 28: Negation".
function cxBookLine(s) {
  const by = {};
  (s.book || []).forEach(([ch, h]) => { (by[ch] = by[ch] || []).push(h || "opening"); });
  return Object.entries(by).map(([ch, hs]) => `${ch.replace(/^c/, "ch ").replace(/^app/, "appendix ")}: ${hs.join(", ")}`).join(" · ");
}
function renderCourseSection(id) {
  const s = cxSection(id);
  if (!s) return renderCourse();
  showGameScreen();
  cxClose();
  migrateCourse();
  const ss = cxSecStatus(s), st = cxSecState(id) || {};
  const book = cxBookLine(s);
  let body = "";
  if (s.verb && s.verb.length) {
    body = `<div class="gr-unote">Taught by the verb track — its sheets come into Today with their tense.</div>
      <div class="gr-sheets">${s.verb.map((v, i) => { const sh = vxSheet(v), p = vxSheetPassed(v);
        return `<button class="gr-sheet ${p ? "done" : ""}" onclick="renderGrammarSheet('${v}')"><span class="gr-sn">${p ? "✓" : i + 1}</span><span class="gr-stt">${escapeHtml(sh ? sh.title : v)}</span><span class="set-chev">›</span></button>`; }).join("")}</div>`;
  } else if (s.checkpoint) {
    const ready = cxCheckpointReady(s);
    body = `<div class="gr-unote">🏁 ${s.checkpoint.n} questions from every rule of this stage, mixed. ${Math.round(s.checkpoint.pass * 100)}% right first time moves you on; below, your weakest rules come first in the next days and it comes back.</div>
      ${ready ? `<button class="gr-next" onclick="renderCourseDrill('${id}', null, 'checkpoint')" style="${cxStyle(s.stage)}"><span class="gr-next-k">🏁 Take it now — or it comes in Today</span><span class="gr-next-t">${s.checkpoint.n} questions</span></button>` : `<div class="set-note">Opens once every other section of the stage is done.</div>`}`;
  } else if (!cxLearnable(s)) {
    body = `<div class="set-note">⏳ Coming with a later build session — already counted in the grammar plan.</div>`;
  } else {
    body = `<div class="gr-sheets">${s.sheets.map((sid, i) => { const sh = cxSheet(sid), p = cxSheetPassed(sid);
        return `<button class="gr-sheet ${p ? "done" : ""}" onclick="renderCourseSheet('${sid}')"><span class="gr-sn">${p ? "✓" : "📖"}</span><span class="gr-stt">The sheet<small>${p ? `passed · ${(st.ok && st.ok[sid]) || st.sh || 100}%` : "read it, then its 3-question quiz"}${st.to !== undefined ? ` · test-out ${st.to}%` : ""}</small></span><span class="set-chev">›</span></button>`; }).join("")}</div>
      <div class="gr-h">Rules — in your reviews</div><div class="gr-rules">${s.rules.map(cxRuleRowHtml).join("")}</div>`;
  }
  const sets = s.sets.map(cxSet).filter(Boolean);
  const drills = sets.length ? `<div class="gr-h">🧩 Drills</div>
    ${s.sheets.length ? `<button class="gr-next" onclick="renderCourseDrill('${id}')" style="${cxStyle(s.stage)}"><span class="gr-next-k">🎯 Mixed — a few from every set</span><span class="gr-next-t">12 items, climbing to production</span></button>` : ""}
    <details class="cx-sets" ${s.sheets.length ? "" : "open"}><summary>${sets.length} drill set${sets.length > 1 ? "s" : ""} — pick one</summary>
    <div class="gr-sheets">${sets.map(d => { const ds = S.course.ds[d.id] || [0, 0];
      return `<button class="gr-sheet cx-set" onclick="renderCourseDrill('${id}','${d.id}')"><span class="gr-sn">${d.gen ? "⚙" : CX_PRODUCTION.has(d.t) ? "✍" : "•"}</span><span class="gr-stt">${escapeHtml(d.title)}<small>${d.ex ? `Übung ${escapeHtml(d.ex)} · ` : ""}${d.gen ? "generated" : (d.items || []).length + " items"}${ds[1] ? ` · ${Math.round(ds[0] / ds[1] * 100)}% of ${ds[1]}` : ""}</small></span><span class="set-chev">›</span></button>`; }).join("")}</div></details>` : "";
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course" style="${cxStyle(s.stage)}">
    <div class="screen-top"><div class="screen-label">📖 Course</div><button class="back-btn" onclick="renderCourse()">← Course</button></div>
    <div class="gr-uhead"><span class="gr-sign big">${escapeHtml(s.level)}</span><div><h2>${escapeHtml(s.title)}</h2><p>${ss.txt}${s.prio === "C" ? " · post-B1" : ""}</p></div></div>
    ${book ? `<div class="gr-unote">📚 ${escapeHtml(book)}</div>` : ""}
    ${body}${drills}
  </div>`;
  scrollPageTop();
}
function renderCourseSheet(id) {
  const sh = cxSheet(id);
  if (!sh) return renderCourse();
  showGameScreen();
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">📖 Course</div><button class="back-btn" onclick="renderCourseSection('${sh.sec}')">← ${escapeHtml(cxSection(sh.sec).title)}</button></div>
    <div id="gs-host"></div></div>`;
  gsOpen(document.getElementById("gs-host"), id, { mode: "menu", onDone: () => renderCourseSection(sh.sec) });
  scrollPageTop();
  if (typeof logEvent === "function") logEvent("cx_open", { id, where: "menu" });
}
// Practice outside Today: a section's mixed drill, one set, weak rules
// or everything done. Answers count like any other (rules due move).
function renderCourseDrill(secId, setId, kind = "practice") {
  showGameScreen();
  migrateCourse();
  const sec = secId && cxSection(secId), set = setId && cxSet(setId);
  let list = [], title = "Grammar", sub = "";
  if (kind === "checkpoint") {
    list = cxCheckpointPlan(secId);
    title = sec ? sec.title : "Grammar"; sub = "Everything of this stage, mixed";
  } else if (kind === "weak") {
    const { fix, due } = cxDueRules();
    const weak = [...fix, ...due, ...Object.keys(CX.rules).filter(r => { const ws = cxRuleWS(r); return ws && ws.st && !cxRuleLearned(r); })];
    const avoid = new Set();
    list = [...new Set(weak)].slice(0, 12).map(r => { const e = cxReviewFor(r, avoid); if (e) avoid.add(e.set + "#" + e.i); return e; }).filter(Boolean);
    sub = "Your weak rules";
  } else if (kind === "mixed") {
    const done = CX.sections.filter(s => s.built && s.sheets.length && (cxSecDone(s.id) || cxSheetPassed(s.sheets[0])));
    done.forEach(s => list.push(...cxDrillPlan(s.id, 6).filter(e => !["write", "open"].includes(cxItemKind(cxSet(e.set), e.item)))));
    list = shuffle(list).slice(0, 12);
    sub = "Mixed practice";
  } else {
    list = cxPracticePlan(secId, setId, set && set.gen ? 10 : 12);
    title = sec ? sec.title : "Grammar"; sub = set ? set.title : "Mixed drill";
  }
  const back = sec ? `renderCourseSection('${secId}')` : "renderDrills()";
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">🧩 Drill</div><button class="back-btn" onclick="${back}">← Back</button></div>
    <div id="cx-host"></div></div>`;
  const again = `() => renderCourseDrill(${secId ? `'${secId}'` : "null"}, ${setId ? `'${setId}'` : "null"}, '${kind}')`;
  cxRun(document.getElementById("cx-host"), list, { mode: "menu", kind: kind === "checkpoint" ? "checkpoint" : "practice", sec: secId || "", title, sub, again: kind === "checkpoint" ? "" : again, onDone: () => { cxClose(); if (sec) renderCourseSection(secId); else renderDrills(); } });
  scrollPageTop();
}
// ☰ › 🧩 Drills: weak rules · mixed practice · a chosen section.
function renderDrills() {
  if (typeof cxOn !== "function" || !cxOn()) return;
  showGameScreen();
  cxClose();
  migrateCourse();
  const weak = Object.keys(CX.rules).filter(r => { const ws = cxRuleWS(r); return ws && ws.st && !cxRuleLearned(r); });
  const { fix, due } = cxDueRules();
  const secs = CX.sections.filter(s => s.built && s.sets.length);
  const anyDone = secs.some(s => s.sheets.length && (cxSecDone(s.id) || cxSheetPassed(s.sheets[0])));
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">🧩 Drills</div>${backBtnHtml()}</div>
    <div class="gr-unote">Practice outside your daily plan — as much as you like. A rule that's due moves just as in Today.</div>
    <div class="gr-sheets">
      <button class="gr-sheet" ${weak.length || fix.length || due.length ? `onclick="renderCourseDrill(null,null,'weak')"` : "disabled"}><span class="gr-sn">📏</span><span class="gr-stt">Weak rules<small>${weak.length || fix.length || due.length ? `${new Set([...weak, ...fix, ...due]).size} not holding yet` : "none right now"}</small></span><span class="set-chev">›</span></button>
      <button class="gr-sheet" ${anyDone ? `onclick="renderCourseDrill(null,null,'mixed')"` : "disabled"}><span class="gr-sn">🔀</span><span class="gr-stt">Mixed practice<small>${anyDone ? "items from every section you've done" : "after your first section"}</small></span><span class="set-chev">›</span></button>
    </div>
    <div class="gr-h">A chosen section</div>
    <div class="gr-sheets">${secs.map(s => `<button class="gr-sheet" onclick="renderCourseSection('${s.id}')"><span class="gr-sn">${escapeHtml(s.level)}</span><span class="gr-stt">${escapeHtml(s.title)}<small>${s.sets.length} drill set${s.sets.length > 1 ? "s" : ""}</small></span><span class="set-chev">›</span></button>`).join("")}</div>
  </div>`;
  if (typeof logScreen === "function") logScreen("drills");
}

// ── 📚 THE BOOK MAP ───────────────────────────
// The blueprint (tools/book/blueprint.json: headings and exercise counts,
// never the book's text): every chapter, its sections and exercises, with
// what each became.
let _cxBook = null;
function cxBookLoad() {
  if (_cxBook) return Promise.resolve(_cxBook);
  return fetch("../tools/book/blueprint.json", { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(b => (_cxBook = b));
}
const CX_COV_CHIP = { mirrored: "🪞 mirrored", generated: "⚙️ generated", skipped: "⤼ skipped", planned: "⏳ planned", none: "· not yet" };
function renderCourseBook() {
  showGameScreen();
  const host = document.getElementById("main-screen");
  host.innerHTML = `<div class="screen grammar course"><div class="screen-top"><div class="screen-label">📚 Book map</div><button class="back-btn" onclick="renderCourse()">← Course</button></div><div id="cx-book">Loading…</div></div>`;
  cxBookLoad().then(b => {
    const el = document.getElementById("cx-book");
    if (!el) return;
    const all = Object.values(b).flatMap(c => c.exercises);
    const tot = cxCovCounts(all);
    el.innerHTML = `<div class="gr-unote">The grammar book is the course's backbone — its headings and exercises, never its text. Every exercise ends up mirrored by a drill set of our own, generated by the engine, or skipped on purpose.</div>
      <div class="cx-covsum"><b>${tot.done} / ${tot.total}</b> exercises covered · ${tot.mirrored} mirrored · ${tot.generated} generated · ${tot.skipped} skipped · ${tot.planned} planned</div>
      <div class="gr-sheets">${Object.entries(b).map(([ch, c]) => { const n = cxCovCounts(c.exercises), secs = cxSectionsOfChapter(ch), lv = [...new Set(secs.map(s => s.level))].join("–");
        return `<button class="gr-sheet cx-ch" onclick="renderCourseChapter('${ch}')"><span class="gr-sn">${escapeHtml(ch.replace(/^c/, "").replace(/^app/, ""))}</span><span class="gr-stt">${escapeHtml(CX.chapters[ch] || ch)}<small>${c.exercises.length} exercises${lv ? " · " + lv : ""}</small><span class="cx-bar"><i style="width:${n.total ? Math.round(n.done / n.total * 100) : 0}%"></i><i class="pl" style="width:${n.total ? Math.round(n.planned / n.total * 100) : 0}%"></i></span></span><span class="gr-due">${n.done}/${n.total}</span><span class="set-chev">›</span></button>`; }).join("")}</div>`;
  }).catch(() => { const el = document.getElementById("cx-book"); if (el) el.innerHTML = `<div class="set-note">The book map needs a connection the first time — try again online.</div>`; });
}
function renderCourseChapter(ch) {
  showGameScreen();
  cxBookLoad().then(b => {
    const c = b[ch];
    if (!c) return renderCourseBook();
    const heads = ["", ...c.sections].filter((h, i, a) => a.indexOf(h) === i);
    const secs = cxSectionsOfChapter(ch);
    const rows = heads.map(h => {
      const exs = c.exercises.filter(e => e.section === h);
      if (!exs.length && !h) return "";
      const ours = secs.filter(s => s.book.some(([cc, hh]) => cc === ch && hh === h));
      return `<div class="cx-bsec"><div class="cx-bh">${escapeHtml(h || "Chapter opening")}${ours.length ? ` <span>→ ${ours.map(s => `<button class="tc-link" onclick="renderCourseSection('${s.id}')">${escapeHtml(s.title)} (${s.level})</button>`).join(" · ")}</span>` : ""}</div>
        ${exs.map(e => { const cv = cxCovOf(e.id), set = cv.set && cxSet(cv.set), to = cv.sec && cxSection(cv.sec);
          return `<div class="cx-ex ${cv.st}"><b>Übung ${escapeHtml(e.id)}</b><span>${escapeHtml(e.type)} · ${e.items} items</span><span class="cx-cov">${CX_COV_CHIP[cv.st] || cv.st}${set ? ` · <button class="tc-link" onclick="renderCourseDrill('${set.sec}','${set.id}')">${escapeHtml(set.title)}</button>` : ""}${to ? ` · ${escapeHtml(to.title)}` : ""}${cv.why ? ` · ${escapeHtml(cv.why)}` : ""}</span></div>`; }).join("") || `<div class="cx-ex none"><span>no exercises</span></div>`}</div>`;
    }).join("");
    document.getElementById("main-screen").innerHTML = `<div class="screen grammar course"><div class="screen-top"><div class="screen-label">📚 ${escapeHtml(ch.replace(/^c/, "Chapter ").replace(/^app/, "Appendix "))}</div><button class="back-btn" onclick="renderCourseBook()">← Book map</button></div>
      <div class="gr-uhead"><div><h2>${escapeHtml(CX.chapters[ch] || ch)}</h2><p>${c.exercises.length} exercises · ${c.sections.length} headings</p></div></div>${rows}</div>`;
    scrollPageTop();
  }).catch(() => renderCourseBook());
}

// ── SETTINGS: the grammar plan ────────────────
function cxSettingsHtml() {
  if (typeof cxOn !== "function" || !cxOn()) return "";
  migrateCourse();
  const P = cxPlanner(), dot = { green: "🟢", amber: "🟠", red: "🔴", none: "⚪" }[P.status], g = cxGap();
  const pace = P.status === "none" ? "a new sheet every day — set a finish date to spread them out"
    : `a new sheet ${g === 1 ? "every day" : `every ${g} days`} · ${dot} ${P.status === "green" ? "on track" : P.status === "amber" ? "tight" : "behind"} · all passed by ${fmtShortDate(P.target)}`;
  return setNavHtml("📖", "Grammar course", `Auto · ${pace} — set by your finish date`, "closeSettings();showScreen('course')");
}
