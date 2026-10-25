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
function cxClose() { cxDragOff(); _cx = null; }
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
  // (the part's name only on its result: during the questions the pill
  // and the instruction say enough)
  const head = `<div class="gs-head"><span class="gs-unit"><span class="gs-sign">📖</span>${escapeHtml(o.title || "Course")} · ${escapeHtml(CX_PART_LABEL[o.kind] || "")}</span>
    ${o.sub && r.done ? `<h2 class="gs-title">${escapeHtml(o.sub)}</h2>` : ""}</div>`;
  if (r.list[r.i] && !r.list[r.i].shownAt) r.list[r.i].shownAt = Date.now();
  if (r.done) { r.host.innerHTML = `<div class="gs-viewer cx-run" style="${o.sec ? cxSecStyle(o.sec) : cxStyle(0)}" id="cx-run">${head}${cxResultHtml()}</div>`; cxBindResult(); return; }
  const cur = r.list[r.i], set = cxSet(cur.set), item = cur.item, k = cxItemKind(set, item);
  // (the book's exercise number only outside Today — in a session it's noise)
  const src = o.mode !== "path" && set.ex ? "Übung " + set.ex : "";
  const pos = `<div class="gs-qpos">${cur.first ? `${r.i + 1 - r.list.slice(0, r.i).filter(e => !e.first).length} / ${r.n}` : "Once more"}${src ? ` · <span class="cx-src">${escapeHtml(src)}</span>` : ""}</div>`;
  const how = `<div class="cx-how">${gsMd(set.how || "")}</div>`;
  let body = "";
  const input = (ph = "type it…") => `<input type="text" class="german-input gs-input" id="cx-input" placeholder="${ph}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>${typeof accentBarHtml === "function" ? accentBarHtml("cx-input") : ""}`;
  if (k === "pick" || k === "respond") {
    const opts = item.o || set.o || [];
    if (!cur.order) cur.order = k === "pick" && !item.o ? opts.map((_, i) => i) : shuffle(opts.map((_, i) => i));
    body = `<div class="gs-qtext">${cxQHtml(item)}</div><div class="gs-opts">${cur.order.map((oi, j) => `<button class="g-opt gs-opt" data-o="${oi}"><span class="g-key">${j + 1}</span><span class="g-opt-text">${escapeHtml(opts[oi])}</span></button>`).join("")}</div>`;
  } else if (k === "write" || k === "open") {
    body = `<div class="gs-qtext">${gsMd(item.q)}</div><textarea class="german-input cx-text" id="cx-text" rows="3" placeholder="Schreib hier…" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" lang="de"></textarea>`;
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
  const actLabel = k === "write" || k === "open" ? "Save" : "Check";
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
  cxDragBind();
}
// ── DRAG & DROP ON THE TILES ──────────────────
// The games' engine (games-core.js gDrag, as in 🧱 Sentence Builder): drag
// a word from the bank to any place in your sentence — between words
// already there too — move one inside it, or drag it back to the bank.
// A tap still works as before. Its listeners are taken off at every redraw.
let _cxDragL = [];
function cxDragOff() { _cxDragL.forEach(([t, type, fn, o]) => t.removeEventListener(type, fn, o)); _cxDragL = []; }
function cxDragBind() {
  cxDragOff();
  const r = _cx, cur = r && r.list[r.i], root = document.getElementById("cx-run");
  const built = () => document.getElementById("cx-built"), bank = () => document.getElementById("cx-bank");
  if (!cur || !root || !built() || !bank() || typeof gDrag !== "function") return;
  const clear = () => {
    root.querySelectorAll(".g-caret").forEach(c => c.remove());
    bank().classList.remove("drop-hot");
  };
  gDrag(root, {
    listen: (t, type, fn, o) => { t.addEventListener(type, fn, o); _cxDragL.push([t, type, fn, o]); },
    items: "#cx-bank .gs-tok:not(:disabled), #cx-built .gs-tok",
    canDrag: () => _cx === r && !r.answered,
    resolve: (x, y, el) => {
      const L = built();
      if (pointIn(L, x, y, 14)) {
        const kids = [...L.querySelectorAll(".gs-tok")].filter(k => k !== el);
        // (a conversation's lines stand one under the other: above or below)
        const col = L.classList.contains("cx-lines"), below = kids.findIndex(k => { const b = k.getBoundingClientRect(); return y < b.top + b.height / 2; });
        return { zone: "line", index: col ? (below < 0 ? kids.length : below) : insertionIndex(kids, x, y), kids };
      }
      if (el.dataset.j !== undefined && pointIn(bank(), x, y, 24)) return { zone: "bank" };
      return null;
    },
    hover: t => {
      clear();
      if (!t) return;
      if (t.zone === "bank") { bank().classList.add("drop-hot"); return; }
      const L = built(), ph = L.querySelector(".gs-built-ph");
      if (ph) ph.remove();
      const caret = document.createElement("span");
      caret.className = "g-caret" + (L.classList.contains("cx-lines") ? " cx-caret-row" : "");
      L.insertBefore(caret, t.kids[t.index] || null);
    },
    drop: (el, t) => {
      clear();
      if (_cx !== r || r.answered) return false;
      if (t.zone === "bank") cur.picked.splice(+el.dataset.j, 1);
      else {
        // (the index counts the sentence without the dragged word)
        const bi = el.dataset.j !== undefined ? cur.picked.splice(+el.dataset.j, 1)[0] : +el.dataset.b;
        cur.picked.splice(Math.min(t.index, cur.picked.length), 0, bi);
      }
      cxRefreshTiles();
      return true;
    },
  });
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
  if (k === "write" || k === "open") return cxWriteSave();
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
  const fb = document.getElementById("cx-fb");
  if (typeof vxUmlautAsking === "function" && vxUmlautAsking(fb)) return;
  const res = cxCheck(item, val, sec);
  // Umlauts are never typed (agreed): a missing one is forgiven, and only
  // when the plain spelling is another real verb form (fahrt: fährt or
  // fahrt?) the small 1 / 2 choice asks which — as in the verb track.
  const uc = res.ok && cur.mode !== "tiles" && typeof vxUmlautAsk === "function" ? cxUmlautChoice(item, val) : null;
  if (uc) {
    const inp = document.getElementById("cx-input"), act = document.getElementById("cx-act");
    if (inp) inp.disabled = true;
    if (act) act.innerHTML = ""; // (pick 1 or 2 — Next comes after)
    vxUmlautAsk(fb, uc, (okPick, picked) => {
      if (_cx !== r || r.list[r.i] !== cur || r.answered) return;
      if (inp) inp.classList.add(okPick ? "correct" : "wrong");
      // the right one: right, the spelling shown · the other one: a miss
      const given = okPick ? val : val.replace(uc.word, picked);
      cxAnswered(okPick, given, okPick ? res : { ok: false, soft: [], right: res.right, rule: (item.r || [])[0] || null, umlaut: picked }, true);
    });
    return;
  }
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
// Your own sentences: saved as written for Claude to correct (✍️ Writing,
// the learning log) — never graded here, so they don't move a rule.
function cxWriteSave() {
  const r = _cx, cur = r.list[r.i], set = cxSet(cur.set), item = cur.item;
  const ta = document.getElementById("cx-text"), val = ta ? ta.value.trim() : "";
  if (cxWordCount(val) < 3) { if (ta) shakeEl(ta); return; }
  ta.disabled = true;
  if (cur.first) cxJournalSave("drill:" + set.id + "#" + cur.i, val, item.q);
  cxAnswered(true, val, { ok: true, soft: [], right: (item.model || [])[0] || "", rule: (item.r || [])[0] }, true, true);
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
  const rule = cxRuleView(res.rule || (item.r || [])[0]);
  const fb = document.getElementById("cx-fb");
  const self = k === "write" || k === "open";
  const also = (item.a || []).filter(a => a !== res.right);
  // A miss: your answer with the fix marked (it holds the right answer),
  // why in one line, and the rule's name — a tap opens its sheet.
  const why = rule ? `<div class="cx-why">${gsMd(res.msg || rule.text)}</div><button class="tc-link cx-see" onclick="gsPeek('${rule.sheet}')">📏 ${escapeHtml(rule.title)} ›</button>` : "";
  let html;
  if (self) html = `<div class="p-ok">✓ Saved for Claude to correct</div>${(item.model || []).length ? `<div class="cx-also">A model: <i>${escapeHtml(item.model[0])}</i></div>` : ""}`;
  else if (ok) html = `<div class="p-ok">✓ Right${res.soft && res.soft.length ? ` <span class="vx-uml">— ${res.soft.map(s => CX_SOFT[s]).join(", ")}: <b>${escapeHtml(res.right)}</b></span>` : ""}</div>${also.length ? `<div class="cx-also">Also right: ${also.map(a => `<i>${escapeHtml(a)}</i>`).join(" · ")}</div>` : ""}${cxMoveHtml(cur)}`;
  else html = (cur.given && k !== "pick" && k !== "respond" && k !== "order" && String(res.right || "").trim().split(/\s+/).length > 2
      ? `<div class="p-bad cx-bad">✗ <span class="p-diff">${diffHtml(cur.given, res.right || "")}</span></div>`
      : `<div class="p-bad">✗ Answer: <strong>${escapeHtml(res.right || (item.a || [])[0] || "")}</strong></div>`)
    + `${item.note ? `<div class="cx-note">${gsMd(item.note)}</div>` : ""}${why}`;
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
    title = res.passed ? `${escapeHtml([(cxStage(sec.stage) || {}).sign, (cxStage(sec.stage) || {}).name].filter(Boolean).join(" · ") || "Checkpoint")} — passed!` : on ? `${pct}% — moving on anyway` : `${pct}% — ${need}% moves on`;
    note = res.passed ? "On to the next part. Its rules keep coming back in your reviews."
      : on ? "Third try: the next part starts, so your finish date holds. The rules you missed come first in your reviews."
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
  const missed = r.missed.length ? `<div class="gs-missed"><b>To look at again</b>${r.missed.map(m => { const ru = cxRuleView((m.res && m.res.rule) || (m.item.r || [])[0]);
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
  if (sec) return { title: sec.title, sub: p.part === "testout" ? "Do you know it already?" : p.part === "checkpoint" ? "Everything of this part, mixed" : "Today's drill" };
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
  if (!cxPartLive(it)) { pathTopUp(it, 0); pathProgress(); pathNext(); return; }
  cxPartBegin(it);
  if (it.part === "sheet") {
    gsOpen(host, it.sheet, { mode: "path", onDone: res => { gsClose(); if (res && res.passed) cxPartDone(it); pathNext(); } });
    if (typeof logEvent === "function") logEvent("cx_open", { id: it.sheet, where: "path" });
    return;
  }
  if (it.part === "write") { cxJournalOpen(host, { mode: "path", partKey: "write:", onDone: () => { cxPartDone(it); pathNext(); } }); return; }
  const list = cxPartList(it).slice(0, it.qn || 99);
  if (!list.length) { cxPartDone(it); pathTopUp(it, 0); pathProgress(); pathNext(); return; }
  if (list.length < it.qn) { pathTopUp(it, list.length); pathProgress(); }
  const t = cxPartTitle(it);
  cxRun(host, list, { mode: "path", kind: it.part === "review" && it.contrast ? "contrast" : it.part, sec: it.sec, title: t.title, sub: t.sub, it,
    // (✅ Due today: its answers count like the words' reviews — not against
    // the share Today's own review card keeps for the plan)
    partKey: it.dues ? "" : it.part + ":" + (it.sec || ""), onDone: () => { cxPartDone(it); cxClose(); pathNext(); } });
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
// opts: { mode: "path" | "menu", onDone, prompt? (an id), pool? (the ids
// "another topic" goes through) }
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
      <div class="gs-qpos">${min}+ words · for Claude to correct</div>
      <div class="gs-qtext cx-en">${escapeHtml(p.t)}</div>
      ${(p.help || []).length ? `<div class="cx-cue cx-starters">${p.help.map((h, i) => `<button type="button" class="gs-chip" onpointerdown="event.preventDefault()" onmousedown="event.preventDefault()" onclick="cxJournalStarter(${i})" aria-label="Type: ${escapeHtml(h)}">${escapeHtml(h)}</button>`).join("")}</div>` : ""}
      <textarea class="german-input cx-text cx-jtext" id="cx-jtext" rows="6" placeholder="Schreib hier…" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" lang="de">${escapeHtml(draft)}</textarea>
      <div class="cx-wc" id="cx-wc" aria-live="polite"></div>
      <div class="gs-qact"><button class="g-big-btn" id="cx-jsave" onclick="cxJournalSubmit()">Save</button>${!j.opts.pool || j.opts.pool.length > 1 ? `<button class="tc-link cx-typeit" onclick="cxJournalOther()">↻ another topic</button>` : ""}</div>
    </div></div>`;
  const ta = document.getElementById("cx-jtext");
  ta.addEventListener("input", () => { cxJDraft(p.id, ta.value); cxJournalCount(); });
  // Where the cursor was when a starter is tapped (a tap can blur the text first).
  ta.addEventListener("blur", () => { j.sel = [ta.selectionStart, ta.selectionEnd]; });
  j.sel = null;
  cxJournalCount();
  if (j.opts.mode !== "path") setTimeout(() => { try { ta.focus({ preventScroll: true }); } catch (e) {} }, 60);
}
// A starter tapped: typed into the text where the cursor is (at the end
// when the text isn't focused). Its "…" are the gaps to fill: the cursor
// lands in the first one; a leading "…" means "go on with the sentence".
// "Ich mag … nicht." → "Ich mag | nicht." · "… sondern …" → "sondern |".
// A choice ("Es regnet / schneit …", "Liebe … / Lieber …") gives its first.
function cxStarterText(h) {
  const s = String(h || "").replace(/(\S+) \/ \S+/g, "$1").replace(/^\s*…\s*/, ""), i = s.indexOf("…");
  const clean = x => x.replace(/\s*…\s*/g, " ").replace(/\s+/g, " ");
  if (i < 0) return { text: s.trim() + " ", at: s.trim().length + 1 };
  const before = clean(s.slice(0, i)).replace(/\s+$/, ""), after = clean(s.slice(i + 1)).trim();
  const text = before + " " + (after ? (/^[?.!,;:]/.test(after) ? "" : " ") + after : "");
  return { text: /^\s/.test(text) ? text.trimStart() : text, at: before ? before.length + 1 : 0 };
}
function cxJournalStarter(i) {
  const j = _cj, ta = document.getElementById("cx-jtext");
  if (!j || j.saved || !ta || !j.p.help || j.p.help[i] === undefined) return;
  const st = cxStarterText(j.p.help[i]);
  const v = ta.value, focused = document.activeElement === ta;
  const sel = focused ? [ta.selectionStart, ta.selectionEnd] : j.sel && j.sel[1] <= v.length ? j.sel : [v.length, v.length];
  const a = sel[0], b = sel[1];
  // A space between it and what's before (none at the start of a line).
  const pre = a > 0 && !/\s$/.test(v.slice(0, a)) ? " " : "";
  ta.value = v.slice(0, a) + pre + st.text + v.slice(b);
  const at = a + pre.length + st.at;
  try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); }
  try { ta.setSelectionRange(at, at); } catch (e) {}
  j.sel = [at, at];
  cxJDraft(j.p.id, ta.value);
  cxJournalCount();
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
  const p = j.opts.pool ? cxJournalPrompt(j.opts.pool[j.skip % j.opts.pool.length]) : cxJournalPick(j.skip);
  if (p) { j.p = p; cxJournalRender(); }
}
function cxJournalSubmit() {
  const j = _cj, ta = document.getElementById("cx-jtext");
  if (!j || j.saved || !ta || cxWordCount(ta.value) < cxJournalMin(j.p)) return;
  const e = cxJournalSave(j.p.id, ta.value);
  if (!e) return;
  cxJDraft(j.p.id, "");
  j.saved = e;
  // A text written is one right answer of the day (its card counts 1 in
  // Today's plan) — never graded, always right.
  if (typeof questEvent === "function" && (!j.opts.partKey || cxPlanTake(j.opts.partKey, 1, true)))
    questEvent("answer", { mode: j.opts.mode === "path" ? "path" : "grammar", ok: true, typed: true });
  if (j.opts.mode === "path" && typeof pathSession !== "undefined" && pathSession) { pathSession.stats.answered++; pathSession.stats.correct++; }
  cxJournalRender();
}
function cxJournalCopy() {
  const text = cxJournalCopyText();
  copyTextToClipboard(text)
    .then(() => showCelebrateToast("✍️", "Your texts are copied", "Paste them into your German project in Claude"))
    .catch(() => { window.prompt("Copy your texts:", text); });
}
function cxJournalDone() { const j = _cj; _cj = null; if (j && j.opts.onDone) j.opts.onDone(); else if (j && j.opts.mode !== "path") renderJournal(); }

// 📖 Course › ✍️ Writing: a level, a theme, Write — then my texts.
const _cjPick = { lv: "", th: "" }; // "" = my level · any theme
try { const lv = localStorage.getItem("cx-jlevel"); if (["A1", "A2", "B1"].includes(lv)) _cjPick.lv = lv; } catch (e) {}
function cxJournalChoose(k, v) {
  _cjPick[k] = v;
  if (k === "lv") try { localStorage.setItem("cx-jlevel", v); } catch (e) {}
  renderJournal();
}
function cxJournalStart() {
  const lv = _cjPick.lv || cxLevel(), pool = cxJournalPool(_cjPick.th, lv);
  if (!pool.length) return;
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">✍️ Writing</div>${cxBackHtml("renderJournal()", "Writing")}</div>
    <div id="cx-jhost"></div></div>`;
  cxJournalOpen(document.getElementById("cx-jhost"), { mode: "menu", prompt: pool[0], pool });
  scrollPageTop();
}
function renderJournal() {
  if (typeof cxOn !== "function" || !cxOn()) return;
  showGameScreen();
  cxClose(); _cj = null;
  migrateCourse();
  const list = cxJournalList().slice().reverse(), open = list.filter(e => !e.c).length;
  const lv = _cjPick.lv || cxLevel(), th = _cjPick.th, pool = cxJournalPool(th, lv), p = pool.length && cxJournalPrompt(pool[0]);
  const theme = (t, ico, name) => `<button class="cx-theme ${th === t ? "on" : ""}" onclick="cxJournalChoose('th','${t}')"><span>${ico}</span>${escapeHtml(name)}</button>`;
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course cx-wscreen">
    <div class="screen-top"><div class="screen-label">✍️ Writing</div>${cxBackHtml()}</div>
    <div class="cx-seg">${["A1", "A2", "B1"].map(l => `<button class="${l === lv ? "on" : ""}" onclick="cxJournalChoose('lv','${l}')"><b>${l}</b><small>${CX_JOURNAL_MIN[l]}+ words</small></button>`).join("")}</div>
    <div class="cx-themes">${theme("", "🎲", "Surprise me")}${CX.themes.map(t => theme(t.id, t.ico, t.name)).join("")}</div>
    ${p ? `<div class="cx-jnext"><b>${escapeHtml(p.de)}</b>${escapeHtml(p.t)}</div>
    <button class="g-big-btn cx-jgo" onclick="cxJournalStart()">✍️ Write</button>` : ""}
    <div class="gr-h cx-jh"><span>My texts${open ? ` · ${open} to correct` : ""}</span>${list.length ? `<button class="tc-link" onclick="cxJournalCopy()">📋 Copy for Claude</button>` : ""}</div>
    ${list.length ? `<div class="cx-jlist">${list.map(e => `<details name="cxj" class="cx-jentry ${e.c ? "done" : ""}"><summary><span class="cx-jd">${escapeHtml(fmtShortDate(e.d))}</span><span class="cx-jt">${escapeHtml(cxJournalTitle(e))}<small>${e.w} words · ${e.c ? "corrected ✓" : "to correct"}</small></span></summary>
        <div class="cx-jbody">${escapeHtml(e.t)}</div>
        <button class="g-sec-btn" onclick="cxJournalMark('${e.id}', ${e.c ? "false" : "true"});renderJournal()">${e.c ? "↺ Not corrected yet" : "✓ Corrected with Claude"}</button></details>`).join("")}</div>`
      : `<div class="gr-unote">Nothing yet. Each text is kept with its date and goes into your learning log for Claude to correct.</div>`}
  </div>`;
  if (typeof logScreen === "function") logScreen("writing");
}

// ── THE TODAY CARD ────────────────────────────
function cxTodayHtml() {
  if (typeof cxOn !== "function" || !cxOn()) return "";
  const c = cxTodayCounts();
  if (!c.parts) return "";
  // (rules due get no line: they're in 📚 due and come in the session)
  const sec = c.lesson && cxSection(c.lesson.sec);
  // (its sheet passed — in Today or ☰ › Course — only the drill is left)
  const what = sec ? `📖 Grammar: <b>${escapeHtml(sec.title)}</b> — ${c.lesson.part === "drill" ? "its drill, " : ""}in your session`
    : c.write ? `✍️ Writing: <b>${escapeHtml((cxJournalPick(0) || { de: "a few lines" }).de)}</b> — for Claude to correct` : "";
  if (!what) return "";
  return `<button class="tc-vx lesson cx-today" style="${sec ? cxSecStyle(sec.id) : cxStyle(0)}" onclick="showScreen('course')">${what}</button>`;
}

// ── ☰ › 📖 COURSE ─────────────────────────────
// Built like the verb track's screens (📐 Grammar · Verbs): the parts as
// cards (level, status, a bar of their lessons), each part a page of
// numbered lessons, each lesson a page with its sheet, one Practise card
// and its rules "in your reviews". Words on screen: part · lesson · rule.

// A lesson's status, short.
function cxSecStatus(s) {
  if (s.verb && s.verb.length) {
    const n = s.verb.filter(id => vxSheetPassed(id)).length;
    if (n === s.verb.length) return { k: "done", txt: "Done · in your verb track" };
    // the lesson clock's verb lesson: when its sheets come
    const nx = typeof cxClockLesson === "function" ? cxClockLesson() : null, on = nx === s ? cxNextLessonDay() : "";
    return { k: "verb", n, txt: `In your verb track · ${n}/${s.verb.length} sheets${on ? on <= studyToday() ? " · comes in Today" : ` · in Today on ${fmtShortDate(on)}` : ""}` };
  }
  if (!cxLearnable(s)) return { k: "coming", txt: "Coming soon" };
  const st = cxSecState(s.id) || {};
  if (s.checkpoint) return st.st >= 3 ? { k: "done", txt: `Passed · ${st.cp}%` } : cxCheckpointReady(s) ? { k: "now", txt: `Ready · ${Math.round(s.checkpoint.pass * 100)}% moves you on${st.cp ? ` · best ${st.cp}%` : ""}` } : { k: "later", txt: "After this part's lessons" };
  if (st.st >= 3) return { k: "done", txt: st.to >= 0 && !(st.sh > 0) ? "Done · tested out 🎓" : "Done" };
  if (st.st === 2) return { k: "now", txt: "Sheet passed · its drill next" };
  if (cxNextSections(1)[0] !== s) return { k: "now", txt: cxLessonReady(s) ? "Ready" : "After the lessons it builds on" };
  const on = cxNextLessonDay();
  return { k: "now", txt: on <= studyToday() ? "Next · comes in Today" : `Next · in Today on ${fmtShortDate(on)}` };
}
const CX_SEC_SIGN = { done: "✓", verb: "📐" };
// Going back: to the Course, a part, a lesson.
function cxBackHtml(to = "renderCourse()", label = "Course") { return `<button class="back-btn" onclick="${to}">← ${escapeHtml(label)}</button>`; }
// One line: on track or not, and by when.
// The lesson clock in words: a lesson's sheets on days in a row, then
// about G days to practise it (PLAN.md §9).
function cxBreakWords(G) { const g = Math.round(G); return g <= 0 ? "no break" : `about ${g} day${g > 1 ? "s" : ""} to practise it`; }
function cxPlannerHtml() {
  const P = cxPlanner();
  const dot = { green: "🟢", amber: "🟠", red: "🔴", none: "⚪" }[P.status];
  const line = P.status === "none" ? "Set a finish date (⚙️ Study plan) and the course spreads its lessons to it"
    : P.status === "green" ? `On track · each lesson's sheets on days in a row, then ${cxBreakWords(P.G)} · all done by <b>${fmtShortDate(P.target)}</b>`
    : P.status === "amber" ? `Tight · lessons back to back to finish by <b>${fmtShortDate(P.target)}</b>`
    : `Behind · ${Math.max(0, P.days)} days to <b>${fmtShortDate(P.target)}</b> — a second sheet on some days${P.need > 1.5 ? ", and still short: a later finish date" : ""}`;
  const wait = P.waiting ? `<small>Everything built so far is done — the next lessons arrive with the next update (already counted in the plan).</small>` : "";
  return `<div class="cx-plan ${P.status}">${dot} ${line}${wait}</div>`;
}
// When a part starts, about: its first lesson after the ones before it.
// (the lesson clock run forward on the complete course — its estimates —
// coming every day: the first of the part's lessons to start)
function cxPartEta(stage) {
  const sim = cxClockSim();
  const ds = CX.sections.filter(s => s.stage === stage).map(s => sim.start[s.id]).filter(Boolean).sort();
  return ds[0] || addDays(studyToday(), 1);
}
// A part's lessons, numbered, in order.
function cxPartLessonsHtml(stage) {
  return CX.sections.filter(s => s.stage === stage).map((s, i) => { const ss = cxSecStatus(s), sign = (s.checkpoint || s.kind === "recap") && ss.k !== "done" ? "🏁" : CX_SEC_SIGN[ss.k] || i + 1;
    // not built yet: its title only, nothing to open
    if (ss.k === "coming") return `<div class="gr-sheet cx-sec coming"><span class="gr-sn">${sign}</span><span class="gr-stt">${escapeHtml(s.title)}<small>${escapeHtml(ss.txt)}</small></span></div>`;
    return `<button class="gr-sheet cx-sec ${ss.k}" onclick="renderCourseSection('${s.id}')"><span class="gr-sn">${sign}</span><span class="gr-stt">${escapeHtml(s.title)}<small>${escapeHtml(ss.txt)}</small></span>${ss.k === "now" && /Today/.test(ss.txt) ? `<span class="gr-due">in Today</span>` : `<span class="set-chev">›</span>`}</button>`; }).join("");
}
// A part: its card, and under it its lessons — opened in place, one part
// at a time (the open one is kept while I go into a lesson and back).
function cxPartRowHtml(st) {
  const secs = CX.sections.filter(s => s.stage === st.id), stat = secs.map(cxSecStatus);
  const done = stat.filter(x => x.k === "done").length, now = stat.some(x => x.k === "now" || x.k === "verb" && x.n > 0);
  const chip = done === secs.length ? `<span class="gr-st solid">✅ Done</span>`
    : now || done ? `<span class="gr-st lesson">📖 ${done}/${secs.length} done</span>`
    : st.id === 4 ? `<span class="gr-st lock">✦ if time allows</span>`
    : `<span class="gr-st lock">🔒 ≈ ${fmtShortDate(cxPartEta(st.id))}</span>`;
  const open = window._cxOpenPart === st.id;
  return `<div class="cx-part ${open ? "open" : ""}" id="cx-part-${st.id}" style="${cxStyle(st.id)}">
    <button class="gr-unit ${now || done ? "s1" : "s0"}" aria-expanded="${open}" onclick="cxPartToggle(${st.id})">
    <span class="gr-sign">${escapeHtml(st.sign)}</span>
    <span class="gr-name">${escapeHtml(st.name)}<small>${secs.length} lessons</small></span>
    ${chip}
    <span class="gr-dots">${stat.map(x => `<i class="${x.k === "done" ? "on" : ""}"></i>`).join("")}</span>
  </button>
    <div class="cx-pbody" ${open ? "" : "inert"}><div class="cx-pin"><div class="gr-sheets">${cxPartLessonsHtml(st.id)}</div></div></div>
  </div>`;
}
function cxPartToggle(id) {
  const was = window._cxOpenPart;
  window._cxOpenPart = was === id ? null : id;
  document.querySelectorAll(".cx-part").forEach(el => {
    const on = el.id === "cx-part-" + window._cxOpenPart;
    el.classList.toggle("open", on);
    const b = el.querySelector(".gr-unit"); if (b) b.setAttribute("aria-expanded", on);
    const body = el.querySelector(".cx-pbody"); if (body) body.inert = !on;
  });
  // the part I opened stays in view while the other one closes above it
  const el = window._cxOpenPart !== null && document.getElementById("cx-part-" + id);
  if (el) setTimeout(() => { try { el.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {} }, 300);
}
function renderCourse() {
  if (typeof cxOn !== "function" || !cxOn()) { if (typeof renderGrammar === "function") renderGrammar(); return; }
  showGameScreen();
  if (typeof gsClose === "function") gsClose();
  cxClose();
  migrateCourse();
  window._cxFrom = true; // the verb track opened from here comes back here
  window._cxChap = null; window._cxUnitFrom = null;
  const next = cxNextSections(1)[0], nextOn = cxNextLessonDay();
  const { fix, due } = cxDueRules();
  const inRev = Object.keys(CX.rules).filter(r => (cxRuleWS(r) || {}).st).length, learned = Object.keys(CX.rules).filter(cxRuleLearned).length;
  const doneN = CX.sections.filter(s => cxSecStatus(s).k === "done").length;
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">📖 Course</div>${backBtnHtml()}</div>
    ${next ? `<button class="gr-next" onclick="renderCourseSection('${next.id}')" style="${cxStyle(next.stage)}"><span class="gr-next-k">📖 Your next lesson — ${nextOn <= studyToday() ? "comes in Today" : `in Today on ${escapeHtml(fmtShortDate(nextOn))}, or open it now`}</span><span class="gr-next-t">${escapeHtml(cxStage(next.stage).sign)} · ${escapeHtml(next.title)}</span></button>` : ""}
    ${cxPlannerHtml()}
    <div class="gr-unote cx-stat">${doneN} of ${CX.sections.length} lessons done${inRev ? ` · ${inRev} rules in your reviews, ${learned} learned${fix.length + due.length ? `, ${fix.length + due.length} due` : ""}` : ""}</div>
    <div class="cx-links four">
      <button class="cx-chip" onclick="renderDrills()">🧩 Practise</button>
      <button class="cx-chip" onclick="renderJournal()">✍️ Writing</button>
      <button class="cx-chip" onclick="renderCourseBook()">📚 By chapter</button>
      <button class="cx-chip" onclick="renderGrammar()">📐 Verbs</button>
    </div>
    <div class="gr-h">The parts, in the order you learn them</div>
    <div class="gr-units">${CX.stages.map(cxPartRowHtml).join("")}</div>
    <details class="gr-how"><summary>ℹ️ How the course works</summary>
      <p><b>Lesson, practise, lesson, practise.</b> A lesson's sheets come in Today one a day, on days in a row (each with its drill); then a few days with no new sheet to practise it — the same break after every lesson, set by your finish date and recounted every day.</p>
      <p><b>Each rule</b> becomes a review card, like your words. A miss names the rule and sends it back.</p>
      <p><b>The verb lessons</b> are lessons like the others: their sheets live in your verb track (📐) and come into Today when the course reaches them.</p>
      <p><b>Lessons still to come</b> are counted with an estimate of their sheets, so the pace is the whole course's. Once everything built is done, the next built lesson comes — even from the next level.</p>
    </details>
  </div>`;
  // back from a lesson: to its part, open where I left it
  const back = window._cxScrollPart && document.getElementById("cx-part-" + window._cxOpenPart);
  window._cxScrollPart = false;
  if (back) back.scrollIntoView({ block: "start" }); else scrollPageTop();
  if (typeof logScreen === "function") logScreen("course");
}
// A rule: its title and where it stands.
function cxRuleRowHtml(r) {
  const rule = cxRule(r), ws = cxRuleWS(r);
  return `<div class="gr-rule"><b>${escapeHtml(rule.title)}</b>${cxRuleLearned(r) ? `<span class="cx-learned">✓ learned — right on two days</span>` : `<span></span>`}${typeof gsRuleStatusHtml === "function" ? gsRuleStatusHtml(ws, 0) : ""}</div>`;
}
// The chapters it draws on: "ch 5 · ch 28".
function cxBookLine(s) {
  const by = {};
  (s.book || []).forEach(([ch]) => { by[ch] = 1; });
  return Object.keys(by).map(ch => ch.replace(/^c/, "ch ").replace(/^app/, "appendix ")).join(" · ");
}
// A lesson: its sheet, Practise, its rules.
function renderCourseSection(id) {
  const s = cxSection(id);
  if (!s) return renderCourse();
  showGameScreen();
  cxClose();
  migrateCourse();
  window._cxSec = null; window._cxUnitFrom = null; // set again by what it opens
  if (!window._cxChap) { window._cxOpenPart = s.stage; window._cxScrollPart = true; }
  const ss = cxSecStatus(s), st = cxSecState(id) || {}, book = cxBookLine(s);
  let body = "";
  if (s.verb && s.verb.length) {
    window._cxFrom = true;
    const units = [...new Set(s.verb.map(v => (vxSheet(v) || {}).unit).filter(u => u && VX_UNIT[u]))];
    body = `<div class="gr-unote">Taught in your verb track — its sheets come into Today one a day when the course reaches this lesson.</div>
      <div class="gr-sheets">${s.verb.map((v, i) => { const sh = vxSheet(v), p = vxSheetPassed(v);
        return `<button class="gr-sheet ${p ? "done" : ""}" onclick="window._cxSec='${id}';renderGrammarSheet('${v}')"><span class="gr-sn">${p ? "✓" : i + 1}</span><span class="gr-stt">${escapeHtml(sh ? sh.title : v)}</span>${p ? `<span class="gr-sc">${S.verb.sh[v]}%</span>` : `<span class="set-chev">›</span>`}</button>`; }).join("")}</div>
      ${s.sets.some(sid => !cxSet(sid).gen) ? `<button class="gr-mastery" onclick="renderCourseDrill('${id}')"><span class="gr-m-ico">🧩</span><span class="gr-m-t"><b>Practise</b><small>The book's exercises for these sheets, 12 at a time · any time${cxSecDone(id) ? " · also in your mixed days" : ""}</small></span><span class="set-chev">›</span></button>` : ""}
      ${units.map(u => `<button class="gr-mastery" style="${vxUnitStyle(u)}" onclick="window._cxSec='${id}';renderGrammarUnit('${u}')"><span class="gr-m-ico">${escapeHtml(VX_UNIT[u].sign)}</span><span class="gr-m-t"><b>${escapeHtml(VX_UNIT[u].name)}</b><small>The whole tense in your verb track: its rules, mastery, verbs</small></span><span class="set-chev">›</span></button>`).join("")}`;
  } else if (s.checkpoint) {
    const ready = cxCheckpointReady(s);
    body = `<div class="gr-unote">🏁 ${s.checkpoint.n} mixed questions from this part. ${Math.round(s.checkpoint.pass * 100)}% moves you on; if not, it comes back the next day.</div>
      <button class="gr-mastery ${ready ? "" : "locked"}" ${ready ? `onclick="renderCourseDrill('${id}', null, 'checkpoint')"` : "disabled"}><span class="gr-m-ico">${ready ? "🏁" : "🔒"}</span><span class="gr-m-t"><b>Checkpoint</b><small>${ready ? `${s.checkpoint.n} questions — or it comes in Today` : "Opens once every other lesson of this part is done"}</small></span>${ready ? `<span class="set-chev">›</span>` : ""}</button>`;
  } else if (!cxLearnable(s)) {
    body = `<div class="set-note">⏳ Coming with a later update — already counted in your plan.</div>`;
  } else {
    const started = s.rules.some(r => (cxRuleWS(r) || {}).st), to = s.stage === 0 && s.testout !== false && st.to === undefined && !(st.st >= 2);
    const tn = (s.testout && s.testout.n) || CX_TESTOUT.n, tm = s.testout && s.testout.miss !== undefined ? s.testout.miss : CX_TESTOUT.miss;
    body = `${ss.k !== "done" ? `<div class="gr-unote">${to ? `A short test first: ${tn - tm} of ${tn} right and the lesson is done. Otherwise ${s.sheets.length > 1 ? `its ${s.sheets.length} sheets, one a day, each with its drill` : "the sheet, then its drill"}.` : cxDrillOwed(id) ? "Sheet passed — its drill is next: here, or in Today." : "The sheet, then its drill — they come in Today."}</div>` : ""}
      <div class="gr-sheets">${s.sheets.map((sid, i) => { const sh = cxSheet(sid), p = cxSheetPassed(sid);
        return `<button class="gr-sheet ${p ? "done" : ""}" onclick="renderCourseSheet('${sid}')"><span class="gr-sn">${p ? "✓" : i + 1}</span><span class="gr-stt">${escapeHtml(s.sheets.length > 1 ? sh.title : "The sheet")}<small>${p ? "passed" : "read it, then 3 questions"}</small></span>${p ? `<span class="gr-sc">${(st.ok && st.ok[sid]) || st.sh || 100}%</span>` : `<span class="set-chev">›</span>`}</button>`; }).join("")}</div>
      ${cxDrillOwed(id) ? `<button class="gr-mastery" onclick="renderLessonDrill('${id}')"><span class="gr-m-ico">✅</span><span class="gr-m-t"><b>Its drill</b><small>The one Today gives — done here, the lesson is done</small></span><span class="set-chev">›</span></button>` : ""}
      <button class="gr-mastery" onclick="renderCourseDrill('${id}')"><span class="gr-m-ico">🧩</span><span class="gr-m-t"><b>Practise</b><small>12 questions, from picking to writing · any time</small></span><span class="set-chev">›</span></button>
      <div class="gr-h">In your reviews</div>
      ${started ? `<div class="gr-rules">${s.rules.map(cxRuleRowHtml).join("")}</div>`
        : `<div class="gr-unote">Each rule becomes a review card after the lesson:</div><ul class="cx-rlist">${s.rules.map(r => `<li>${escapeHtml(cxRule(r).title)}</li>`).join("")}</ul>`}`;
  }
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course" style="${cxStyle(s.stage)}">
    <div class="screen-top"><div class="screen-label">📖 Course</div>${window._cxChap ? cxBackHtml(`renderCourseChapter('${window._cxChap}')`, window._cxChap.replace(/^c/, "Chapter ").replace(/^app/, "Appendix ")) : cxBackHtml()}</div>
    <div class="gr-uhead"><span class="gr-sign big">${escapeHtml(cxStage(s.stage).sign)}</span><div><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(ss.txt)}</p></div></div>
    ${body}
    ${book ? `<div class="gr-items">📚 In the book: ${escapeHtml(book)}</div>` : ""}
  </div>`;
  scrollPageTop();
}
function renderCourseSheet(id) {
  const sh = cxSheet(id);
  if (!sh) return renderCourse();
  showGameScreen();
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">📖 Course</div>${cxBackHtml(`renderCourseSection('${sh.sec}')`, cxSection(sh.sec).title)}</div>
    <div id="gs-host"></div></div>`;
  gsOpen(document.getElementById("gs-host"), id, { mode: "menu", onDone: () => renderCourseSection(sh.sec) });
  scrollPageTop();
  if (typeof logEvent === "function") logEvent("cx_open", { id, where: "menu" });
}
// A lesson's drill outside Today (every sheet passed, the drill not done
// yet — wherever the sheets were passed): the same drill Today gives,
// and it finishes the lesson as Today's does (its card there is then
// skipped). Several lessons in a day this way is fine.
function cxDrillOwed(id) {
  const s = cxSection(id), st = cxSecState(id) || {};
  return !!s && !s.checkpoint && !cxIsVerb(s) && st.st === 2 && !cxSecDone(id) && !S.course.dd["sec:" + id];
}
function renderLessonDrill(id) {
  if (!cxDrillOwed(id)) return renderCourseSection(id);
  showGameScreen();
  const p = { part: "drill", sec: id }, list = cxPartList(p);
  if (!list.length) { cxDrillDone(id, 0, 0); cxPartDone(p); return renderCourseSection(id); }
  cxPartBegin(p);
  const t = cxPartTitle(p);
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">📖 Course</div>${cxBackHtml(`renderCourseSection('${id}')`, cxSection(id).title)}</div>
    <div id="cx-host"></div></div>`;
  // (its answers count for today's plan as Today's drill would — one share)
  cxRun(document.getElementById("cx-host"), list, { mode: "menu", kind: "drill", sec: id, title: t.title, sub: t.sub, partKey: "drill:" + id,
    onDone: () => { cxPartDone(p); cxClose(); renderCourseSection(id); } });
  scrollPageTop();
  if (typeof logEvent === "function") logEvent("cx_open", { id, where: "menu-drill" });
}
// Practice outside Today: a lesson's mixed drill, one set, weak rules
// or everything done. Answers count like any other (rules due move).
function renderCourseDrill(secId, setId, kind = "practice") {
  showGameScreen();
  migrateCourse();
  const sec = secId && cxSection(secId), set = setId && cxSet(setId);
  let list = [], title = "Grammar", sub = "";
  if (kind === "checkpoint") {
    list = cxCheckpointPlan(secId);
    title = sec ? sec.title : "Grammar"; sub = "Everything of this part, mixed";
  } else if (kind === "weak") {
    const { fix, due } = cxDueRules();
    const weak = [...fix, ...due, ...Object.keys(CX.rules).filter(r => { const ws = cxRuleWS(r); return ws && ws.st && !cxRuleLearned(r); })];
    const avoid = new Set();
    list = [...new Set(weak)].slice(0, 12).map(r => { const e = cxReviewFor(r, avoid); if (e) avoid.add(e.set + "#" + e.i); return e; }).filter(Boolean);
    sub = "Your weak rules";
  } else if (kind === "chapter") {
    // 🔀 a chapter's Übungen mixed: a few from each, 12 in all
    const sets = cxChapterSets(window._cxChap).map(r => r.set);
    sets.forEach(st => list.push(...cxSetPick(st, Math.ceil(12 / Math.max(1, sets.length)) + 1)));
    list = shuffle(list).slice(0, 12);
    title = CX.chapters[window._cxChap] || "Grammar"; sub = "This chapter's Übungen, mixed";
  } else if (kind === "mixed") {
    const done = [...new Set([...CX.sections.filter(s => s.built && s.sheets.length && cxSheetPassed(s.sheets[0])), ...cxMixSections()])];
    done.forEach(s => list.push(...cxDrillPlan(s.id, 6).filter(e => !["write", "open"].includes(cxItemKind(cxSet(e.set), e.item)))));
    list = shuffle(list).slice(0, 12);
    sub = "Mixed practice";
  } else {
    list = cxPracticePlan(secId, setId, set && set.gen ? 10 : 12);
    title = sec ? sec.title : "Grammar"; sub = set ? set.title : "Practise";
  }
  // one exercise opened from its chapter goes back there
  const chap = (set || kind === "chapter") && window._cxChap;
  const back = chap ? cxBackHtml(`renderCourseChapter('${chap}')`, chap.replace(/^c/, "Chapter ").replace(/^app/, "Appendix "))
    : sec ? cxBackHtml(`renderCourseSection('${secId}')`, sec.title) : cxBackHtml("renderDrills()", "Practise");
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar gs-screen">
    <div class="screen-top"><div class="screen-label">🧩 Practise</div>${back}</div>
    <div id="cx-host"></div></div>`;
  const again = `() => renderCourseDrill(${secId ? `'${secId}'` : "null"}, ${setId ? `'${setId}'` : "null"}, '${kind}')`;
  cxRun(document.getElementById("cx-host"), list, { mode: "menu", kind: kind === "checkpoint" ? "checkpoint" : "practice", sec: secId || "", title, sub, again: kind === "checkpoint" ? "" : again, onDone: () => { cxClose(); if (chap) renderCourseChapter(chap); else if (sec) renderCourseSection(secId); else renderDrills(); } });
  scrollPageTop();
}
// 📖 Course › 🧩 Practise: three rows that never grow — ✅ today's dues
// (closed at 0), 📏 weak spots, 🔀 mixed. One lesson or one Übung: its
// chapter (📚 By chapter) or its lesson page.
function renderDrills() {
  if (typeof cxOn !== "function" || !cxOn()) return;
  showGameScreen();
  cxClose();
  migrateCourse();
  const weak = Object.keys(CX.rules).filter(r => { const ws = cxRuleWS(r); return ws && ws.st && !cxRuleLearned(r); });
  const { fix, due } = cxDueRules();
  const nWeak = new Set([...weak, ...fix, ...due]).size;
  const anyDone = CX.sections.some(s => s.built && s.sheets.length && (cxSecDone(s.id) || cxSheetPassed(s.sheets[0]))) || cxMixSections().length > 0;
  const D = pathDues(), dn = k => D[k].fix.length + D[k].due.length;
  const parts = [["🌱", dn("words")], ["📐", dn("verbs")], ["📏", dn("rules")]].filter(x => x[1]).map(x => `${x[0]} ${x[1]}`).join("  ");
  const row = (ico, title, sub, go, on) => `<button class="gr-sheet cx-prow ${on ? "" : "off"}" ${on ? `onclick="${go}"` : "disabled"}><span class="gr-sn">${ico}</span><span class="gr-stt">${title}<small>${sub}</small></span>${on ? `<span class="set-chev">›</span>` : ""}</button>`;
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">🧩 Practise</div>${cxBackHtml()}</div>
    <div class="gr-sheets">
      ${D.n ? `<button class="gr-mastery cx-dues-btn" style="${cxStyle(0)}" onclick="renderDues()"><span class="gr-m-ico">✅</span><span class="gr-m-t"><b>Due today · ${D.n}</b><small>${parts}</small></span><span class="set-chev">›</span></button>`
        : row("✅", "Due today", "✓ Done for today", "", false)}
      ${row("📏", "Weak spots", nWeak ? `${nWeak} rule${nWeak > 1 ? "s" : ""} you keep missing` : "none right now", "renderCourseDrill(null,null,'weak')", nWeak)}
      ${row("🔀", "Mixed", anyDone ? "all you've learned" : "after your first lesson", "renderCourseDrill(null,null,'mixed')", anyDone)}
    </div>
    <button class="tc-link cx-plink" onclick="renderCourseBook()">📚 One lesson or Übung → By chapter</button>
  </div>`;
  if (typeof logScreen === "function") logScreen("drills");
}

// ✅ Due today: today's share of what's due, listed, and one button that
// drills just those (the ones to fix first). Answers count like Today's.
function cxDueChips(list, max = 40) {
  const chips = list.slice(0, max).map(([txt, fix]) => `<span class="cx-due ${fix ? "fix" : ""}">${fix ? "🩹 " : ""}${escapeHtml(txt)}</span>`).join("");
  return chips + (list.length > max ? `<span class="cx-due more">+${list.length - max}</span>` : "");
}
function renderDues() {
  showGameScreen();
  cxClose();
  const D = pathDues(), cap = PATH.SESSION_LENGTHS.long;
  if (!D.n) return renderDrills();
  const words = [...D.words.fix.map(x => [x.d.words[x.i].de, 1]), ...D.words.due.map(x => [x.d.words[x.i].de, 0])];
  const vlabel = it => it.rule && typeof VX_RULE !== "undefined" && VX_RULE[it.rule] ? VX_RULE[it.rule].title
    : `${(it.x && it.x.inf) || ""} · ${(typeof VX_ITEM_KINDS !== "undefined" && VX_ITEM_KINDS[it.kind] && VX_ITEM_KINDS[it.kind].title) || it.kind}`;
  const verbs = [...D.verbs.fix.map(x => [vlabel(x.it), 1]), ...D.verbs.due.map(x => [vlabel(x.it), 0])];
  const rules = [...D.rules.fix.map(r => [cxRule(r).title, 1]), ...D.rules.due.map(r => [cxRule(r).title, 0])];
  const group = (ico, list) => list.length ? `<div class="gr-h">${ico} ${list.length}</div><div class="cx-dues">${cxDueChips(list)}</div>` : "";
  const n = Math.min(D.n, cap), len = n <= PATH.SESSION_LENGTHS.quick ? "quick" : n <= PATH.SESSION_LENGTHS.regular ? "regular" : "long";
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">✅ Due today</div>${cxBackHtml("renderDrills()", "Practise")}</div>
    <div class="cx-dnum">${D.n}</div>
    <button class="g-big-btn cx-jgo" onclick="startPathSession('${len}', { focus: 'dues' })">Drill ${D.n > cap ? cap : "them"} ▶</button>
    ${group("🌱", words)}${group("📐", verbs)}${group("📏", rules)}
  </div>`;
  scrollPageTop();
  if (typeof logScreen === "function") logScreen("dues");
}

// 🗺️ Journey: the course in a few words — lessons done, the pace, and
// the next 7 days with the lesson days lit (≈, coming every day).
function cxJourneyHtml() {
  if (typeof cxOn !== "function" || !cxOn()) return "";
  migrateCourse();
  const P = cxPlanner(), total = CX.sections.length, done = CX.sections.filter(s => cxSecStatus(s).k === "done").length;
  const dot = { green: "🟢 on track", amber: "🟠 tight", red: "🔴 behind", none: "" }[P.status];
  const days = cxForecastDays(7);
  const wd = d => new Date(d + "T12:00").toLocaleDateString("en-GB", { weekday: "short" });
  return `<div class="jl jl-cx" role="button" tabindex="0" onclick="showScreen('course')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showScreen('course')}">
    <div class="jl-head"><span class="jl-name">📖 Grammar</span><span class="jl-pct">${done}/${total}${dot ? ` · ${dot}` : ""}</span></div>
    <div class="cx-week">${days.map(x => `<span class="cx-wday ${x.lesson ? "on" : ""}" title="${x.lesson ? "a lesson" : ""}">${wd(x.d)}<b>${+x.d.slice(8)}</b><i>${x.lesson ? "📖" : ""}</i></span>`).join("")}</div>
  </div>`;
}


// ── 📚 BY CHAPTER ─────────────────────────────
// The book's chapters, each with the lessons that teach it and where you
// stand — to study along the book. (What each book exercise became is
// for building the course: tools/course, not on screen.)
function cxChapterKey(ch) { return ch.startsWith("app") ? 100 + ch.charCodeAt(3) : +ch.slice(1); }
function renderCourseBook() {
  showGameScreen();
  cxClose();
  const chs = Object.keys(CX.chapters).filter(ch => cxSectionsOfChapter(ch).length).sort((a, b) => cxChapterKey(a) - cxChapterKey(b));
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">📚 By chapter</div>${cxBackHtml()}</div>
    <div class="gr-unote">Study along your grammar book: each chapter and the lessons that teach it.</div>
    <div class="gr-sheets">${chs.map(ch => { const secs = cxSectionsOfChapter(ch), done = secs.filter(s => cxSecStatus(s).k === "done").length, lv = [...new Set(secs.map(s => cxStage(s.stage).sign))].join(" ");
      return `<button class="gr-sheet ${done === secs.length ? "done" : ""}" onclick="renderCourseChapter('${ch}')"><span class="gr-sn">${done === secs.length ? "✓" : escapeHtml(ch.replace(/^c/, "").replace(/^app/, ""))}</span><span class="gr-stt">${escapeHtml(CX.chapters[ch] || ch)}<small>${secs.length} lesson${secs.length > 1 ? "s" : ""} · ${escapeHtml(lv)}</small></span><span class="gr-sc">${done}/${secs.length}</span></button>`; }).join("")}</div>
  </div>`;
  if (typeof logScreen === "function") logScreen("book");
}
function renderCourseChapter(ch) {
  const secs = cxSectionsOfChapter(ch);
  if (!secs.length) return renderCourseBook();
  showGameScreen();
  window._cxChap = ch; // its lessons come back here
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar course">
    <div class="screen-top"><div class="screen-label">📚 ${escapeHtml(ch.replace(/^c/, "Chapter ").replace(/^app/, "Appendix "))}</div>${cxBackHtml("renderCourseBook()", "By chapter")}</div>
    <div class="gr-uhead"><div><h2>${escapeHtml(CX.chapters[ch] || ch)}</h2><p>${secs.length} lesson${secs.length > 1 ? "s" : ""} teach it</p></div></div>
    <div class="gr-sheets">${secs.map(s => { const ss = cxSecStatus(s), sign = ss.k === "done" ? "✓" : escapeHtml(cxStage(s.stage).sign), body = `<span class="gr-sn">${sign}</span><span class="gr-stt">${escapeHtml(s.title)}<small>${escapeHtml(ss.txt)}</small></span>`;
      return ss.k === "coming" ? `<div class="gr-sheet cx-sec coming" style="${cxStyle(s.stage)}">${body}</div>`
        : `<button class="gr-sheet cx-sec ${ss.k}" style="${cxStyle(s.stage)}" onclick="renderCourseSection('${s.id}')">${body}<span class="set-chev">›</span></button>`; }).join("")}</div>
    ${cxChapterExercisesHtml(ch)}
  </div>`;
  scrollPageTop();
}
// The book's exercises of a chapter that have their drill, in the book's
// order: one runs on its own (to work along the book). A drill standing for
// two exercises shows both numbers; one not built yet isn't listed.
function cxChapterSets(ch) {
  const n = String(ch || "").replace(/^c/, ""), key = ex => ex.split(".").map(Number);
  return Object.values(CX.sets).map(set => {
    const sec = cxSection(set.sec), nums = [set.ex, ...(set.also || [])].filter(ex => ex && ex.split(".")[0] === n);
    return sec && nums.length && (sec.built || cxLearnable(sec)) ? { set, nums } : null;
  }).filter(Boolean).sort((a, b) => { const x = key(a.nums[0]), y = key(b.nums[0]); return x[0] - y[0] || x[1] - y[1]; });
}
function cxChapterExercisesHtml(ch) {
  const rows = cxChapterSets(ch);
  if (!rows.length) return "";
  return `<div class="gr-h">Übungen</div>
    ${rows.length > 1 ? `<button class="gr-mastery cx-chmix" style="${cxStyle(0)}" onclick="renderCourseDrill(null, null, 'chapter')"><span class="gr-m-ico">🔀</span><span class="gr-m-t"><b>Mix them</b><small>12 questions from all ${rows.length}</small></span><span class="set-chev">›</span></button>` : ""}
    <div class="gr-sheets">${rows.map(({ set, nums }) => { const d = (S.course.ds || {})[set.id] || [], pct = d[1] ? Math.round(d[0] / d[1] * 100) : null;
      return `<button class="gr-sheet cx-ex" style="${cxSecStyle(set.sec)}" onclick="renderCourseDrill('${set.sec}', '${set.id}')"><span class="gr-sn">🧩</span><span class="gr-stt">${escapeHtml(nums.join(" · "))} · ${escapeHtml(set.title)}<small>${gsMd(set.how || "")}</small></span>${pct !== null ? `<span class="gr-sc">${pct}%</span>` : `<span class="set-chev">›</span>`}</button>`; }).join("")}</div>`;
}

// ── SETTINGS: the grammar plan ────────────────
function cxSettingsHtml() {
  if (typeof cxOn !== "function" || !cxOn()) return "";
  migrateCourse();
  const P = cxPlanner(), dot = { green: "🟢", amber: "🟠", red: "🔴", none: "⚪" }[P.status];
  const pace = P.status === "none" ? "lesson after lesson — set a finish date to spread them out"
    : `each lesson, then ${cxBreakWords(P.G)} · ${dot} ${P.status === "green" ? "on track" : P.status === "amber" ? "tight" : "behind"} · all done by ${fmtShortDate(P.target)}`;
  return setNavHtml("📖", "Grammar course", `Auto · ${pace} — set by your finish date`, "closeSettings();showScreen('course')");
}
