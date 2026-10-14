// ── THE TENSE DRILL · SCREENS ─────────────────
// 📐 Grammar › a tense › 🎯 Drill, under its mastery quiz once every
// sheet of the tense is passed (what an answer leaves behind is in
// verb-track.js: vxDrillAnswer). Pick 10, 30 or ∞: one form at a time,
// the verbs you've met taking turns, graded like Today (a pronoun in
// front is fine, the umlaut choice, another tense's form gets one more
// try). At the end of a round — or when you stop — your mistakes can be
// looked at again: graded, logged, nothing else.

let _vd = null;
// The card under the mastery quiz.
function gsDrillCardHtml(unit) {
  if (typeof vxDrillOpen !== "function" || !vxOn()) return "";
  const ids = vxSheetIds(unit), done = ids.filter(vxSheetPassed).length, open = vxDrillOpen(unit);
  const n = open ? vxDrillPool(unit).length : 0;
  const sub = !open ? vxT("Opens when all {0} sheets are passed ({1}/{0})", ids.length, done)
    : n ? (n === 1 ? vxT("1 of your verbs, every person") : vxT("{0} of your verbs, taking turns", n)) : vxT("None of your verbs fits this tense yet");
  const go = open && n;
  return `<button class="gr-mastery gr-drill ${go ? "" : "locked"}" ${go ? `onclick="renderDrillStart('${unit}')"` : "disabled"}>
    <span class="gr-m-ico">${go ? "🎯" : "🔒"}</span>
    <span class="gr-m-t"><b>${vxT("Drill")}</b><small>${sub}${vxT(" · optional, outside your daily plan")}</small></span>
    ${go ? `<span class="set-chev">›</span>` : ""}</button>`;
}
// 10 · 30 · ∞, and what it does.
function renderDrillStart(unit) {
  const u = VX_UNIT[unit];
  if (!u || !vxDrillOpen(unit)) return renderGrammarUnit(unit);
  showGameScreen();
  _vd = null;
  const sizes = VX_DRILL_ROUNDS.map(n => `<button class="g-opt vd-size" onclick="vdBegin('${unit}', ${n})"><span class="g-opt-text"><b>${n || "∞"}</b> ${n ? vxT("forms") : vxT("until you stop")}</span></button>`).join("");
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar" style="${vxUnitStyle(unit)}">
    <div class="screen-top"><div class="screen-label">${vxT("📐 Grammar · 🎯 Drill")}</div><button class="back-btn" onclick="renderGrammarUnit('${unit}')">← ${escapeHtml(u.name)}</button></div>
    <h2 class="vd-h">${u.sign} ${escapeHtml(u.name)}</h2>
    <div class="g-options vd-sizes">${sizes}</div>
    <ul class="vd-what">
      <li>${vxT("Only verbs you've met, taking turns — every form typed, as in Today.")}</li>
      <li>${vxT("Outside your daily plan: nothing here counts in Today's numbers or the quests.")}</li>
      <li>${vxT("A form right fills your verb ledger ahead of Today. A rule or verb item Today would check now can move up — never past 🌿 Familiar; the rest comes from Today.")}</li>
      <li>${vxT("A miss comes back at the end of tomorrow's Today, as a check.")}</li>
    </ul>
  </div>`;
  scrollPageTop();
  if (typeof logScreen === "function") logScreen("grammar:drill");
}
function vdBegin(unit, size) {
  const d = vxDrillStart(unit);
  if (!d.order.length) return renderGrammarUnit(unit);
  _vd = { unit, d, size, n: 0, right: 0, missed: [], ups: [], cells: 0, checks: new Set(), review: null, ex: null, answered: false };
  vdShell();
  if (typeof logEvent === "function") logEvent("vx_drill_start", { u: unit, n: size });
  vdNext();
}
function vdShell() {
  const unit = _vd.unit;
  showGameScreen();
  const el = document.getElementById("main-screen");
  el.style.paddingBottom = "";
  el.innerHTML = `<div class="screen path-screen vd-screen" id="vd-screen" style="${vxUnitStyle(unit)}">
      <div class="p-top">
        <button class="g-hud-btn" onclick="vdStop()" aria-label="${vxT("Stop")}">✕</button>
        <div class="p-progress" aria-hidden="true"><div class="p-progress-fill" id="vd-prog"></div></div>
        <span class="p-count" id="vd-count"></span>
      </div>
      <div class="p-focus" id="vd-label"></div>
      <div class="p-card" id="vd-card"></div>
      <div class="p-typed" id="vd-typed" style="display:none">
        <input type="text" class="german-input" id="vd-input" placeholder="type the answer…"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
        ${accentBarHtml("vd-input")}
      </div>
      <div class="p-fb" id="vd-fb" aria-live="polite"></div>
      <div class="p-actions" id="vd-actions"></div>
    </div>`;
  vdBindKeys();
}
// The exercise now: a new one, or the next mistake to look at again.
function vdNext() {
  const v = _vd;
  if (!v) return;
  v.answered = false; v.usedHint = false; v.tenseRetry = null; v.revealed = false;
  if (v.review) {
    if (v.review.i >= v.review.list.length) return vdSummary();
    v.ex = v.review.list[v.review.i];
  } else {
    if (v.size && v.n >= v.size) return vdSummary();
    v.ex = vxDrillNext(v.d);
    if (!v.ex) return vdSummary();
  }
  v.shownAt = Date.now();
  vdRender();
}
function vdRender() {
  const v = _vd, ex = v.ex;
  const R = v.review;
  const done = R ? R.i : v.n, of = R ? R.list.length : v.size;
  document.getElementById("vd-prog").style.width = of ? `${Math.round(done / of * 100)}%` : "0%";
  document.getElementById("vd-count").textContent = of ? `${done + 1}/${of}` : `${v.n + 1}`;
  document.getElementById("vd-label").textContent = R ? vxT("↻ Your mistakes, once more — nothing moves") : `🎯 ${VX_UNIT[v.unit].name} · ${v.right}/${v.n} ✓`;
  document.getElementById("vd-card").innerHTML = `<div class="p-meta"><span class="p-deck">${escapeHtml(vxItemLabel(ex))}</span></div>${vxPromptHtml(ex)}<div id="vd-hint"></div>`;
  document.getElementById("vd-fb").innerHTML = "";
  const t = document.getElementById("vd-typed"), input = document.getElementById("vd-input");
  input.value = ""; input.className = "german-input"; input.disabled = false;
  if (speakOn()) {
    t.style.display = "none";
    vdActions(`<button class="g-big-btn p-main" id="vd-show" onclick="vdReveal()">${vxT("Show ▶")}</button>`);
    return;
  }
  t.style.display = "";
  input.placeholder = vxT("{0} — the full form…", VX_TENSE_LABEL[ex.tense] || "");
  vdActions(`
    <button class="hint-btn" id="vd-hint-btn" onclick="vdHint()">${vxT("💡 Hint")}</button>
    <button class="dontknow-btn" onclick="vdGrade('', false)">${vxT("? Don't know")}</button>
    <button class="g-big-btn p-main" id="vd-check" onclick="vdCheck()">${vxT("Check")}</button>`);
  try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
}
function vdActions(html) { const a = document.getElementById("vd-actions"); if (a) a.innerHTML = html; }
function vdHint() {
  const v = _vd;
  if (!v || v.answered) return;
  v.usedHint = true;
  const first = v.ex.form.ans.split(" ").map(x => x.slice(0, 2) + "…").join(" ");
  document.getElementById("vd-hint").innerHTML = `<div class="hint-wrap"><div class="examples-title">${vxT("💡 It starts with")}</div><div class="hint-sentence">${escapeHtml(first)}</div></div>`;
  const b = document.getElementById("vd-hint-btn"); if (b) b.disabled = true;
  const input = document.getElementById("vd-input"); if (input) input.focus({ preventScroll: true });
}
function vdCheck() {
  const v = _vd;
  if (!v || v.answered) return;
  const input = document.getElementById("vd-input");
  const val = input ? input.value : "";
  if (!val.trim()) { shakeEl(input); if (input) input.focus({ preventScroll: true }); return; }
  const ex = v.ex;
  // Only an umlaut off, on a verb where it changes the form: 1 or 2.
  const ch = vxUmlautChoice(val, ex.form.acc, ex.x, vxIsCommand(ex));
  if (ch) {
    if (vxUmlautAsking(document.getElementById("vd-fb"))) return;
    input.disabled = true; vdActions("");
    vxUmlautAsk(document.getElementById("vd-fb"), ch, (ok, picked) => {
      if (_vd !== v || v.ex !== ex) return;
      input.disabled = false; input.value = picked;
      vdGrade(ok ? ch.right : picked, ok);
    });
    return;
  }
  const g = vxGrade(val, ex);
  // The right verb in another tense: pointed out, one more try (as in Today).
  const other = g !== true ? vxOtherTense(val, ex) : vxUmlautOnly(val, ex.form.acc, vxIsCommand(ex)) ? vxOtherTense(val, ex, true) : null;
  if (other) {
    const again = !!v.tenseRetry;
    v.tenseRetry = other;
    if (again) shakeEl(input);
    document.getElementById("vd-fb").innerHTML = other === "k2w"
      ? `<div class="vx-fb"><div class="vx-retry">↺ würde + infinitive is right too — this card asks for the verb's <b>own</b> ${vxTenseTitleHtml(ex.tense, "sm")}.</div><div class="vx-retry-sub">One word, like wäre or hätte: one more try.</div></div>`
      : `<div class="vx-fb"><div class="vx-retry">${vxT("↺ That's the {0} — this one asks for the {1}.", vxTenseTitleHtml(other, "sm"), vxTenseTitleHtml(ex.tense, "sm"))}</div><div class="vx-retry-sub">${vxT("Right verb, other tense: one more try.")}</div></div>`;
    input.classList.add("retry"); input.select(); input.focus({ preventScroll: true });
    input.addEventListener("input", () => input.classList.remove("retry"), { once: true });
    return;
  }
  vdGrade(val, g);
}
// Say-it mode: Show, hear it, ✗ / ✓.
function vdReveal() {
  const v = _vd;
  if (!v || v.answered) return;
  v.revealed = true;
  document.getElementById("vd-fb").innerHTML = `<div class="vx-fb"><div class="vx-answer">${vxFormHtml(v.ex)}</div></div>`;
  vdActions(`<button class="g-sec-btn" onclick="vdGrade('', false, true)">${vxT("✗ Not yet")}</button><button class="g-big-btn p-main" onclick="vdGrade('', true, true)">${vxT("✓ I said it")}</button>`);
  speak(vxSayText(v.ex));
}
// ok: true / "near" / false. said: graded by yourself (Say-it).
function vdGrade(val, ok, said = false) {
  const v = _vd;
  if (!v || v.answered) return;
  v.answered = true;
  const ex = v.ex, R = v.review, right = ok === true;
  const input = document.getElementById("vd-input");
  if (input) input.classList.remove("retry");
  const res = vxDrillAnswer(ex, ok, { given: val, hint: !!v.usedHint, said, ms: Date.now() - v.shownAt, review: !!R });
  if (R) { R.i++; if (right) R.right++; else R.still.push(ex); }
  else {
    v.n++;
    if (right) v.right++; else v.missed.push(ex);
    if (res.cell) v.cells++;
    if (res.up) v.ups.push({ ex, ...res.up });
    if (res.check) v.checks.add(res.check);
  }
  if (input) input.classList.add(right ? "correct" : ok === "near" ? "near" : "wrong");
  if (right) { playSuccess(); haptic("select"); } else { playFailure(); haptic("miss"); }
  saveState();
  const { why, row } = vxWhyRow(ex);
  const umlNote = right && val && vxUmlautOnly(val, ex.form.acc, vxIsCommand(ex));
  const head = right ? `<div class="vx-res ok">${vxT("✓ Correct!")}${umlNote ? ` <span class="vx-uml">${vxT("— spelt {0}", `<b>${escapeHtml(ex.form.ans)}</b>`)}</span>` : ""}</div>`
    : ok === "near" ? `<div class="vx-res near">≈ ${vxT("Almost")} — ${vxT("check the spelling")}</div>`
    : `<div class="vx-res bad">${val.trim() ? `✗ ${vxT("Answer:")}` : vxT("Answer:")}</div>`;
  const chips = [];
  if (!R) {
    if (res.up) chips.push(`<span class="p-chip ok">↑ ${tierOfStage(res.up.to).icon} ${tierOfStage(res.up.to).name}</span>`);
    if (res.cell) chips.push(`<span class="p-chip ok">📒 ${escapeHtml(ex.x.inf)} · ${escapeHtml(VX_TENSE_LABEL[ex.tense])} ✓</span>`);
    if (res.check) chips.push(`<span class="p-chip warn">${vxT("🗓️ Checked again at the end of tomorrow's Today")}</span>`);
    if (right && v.usedHint) chips.push(`<span class="p-chip">${vxT("💡 with hint — no step up")}</span>`);
  }
  document.getElementById("vd-fb").innerHTML = `<div class="vx-fb">
    ${head}<div class="vx-answer">${vxFormHtml(ex)}</div>
    ${!right && val.trim() ? `<div class="p-diff">${vxDiffHtml(val, ex.form.ans)}</div>` : ""}
    ${chips.length ? `<div class="vx-chip">${chips.join("")}</div>` : ""}
    ${why ? `<div class="vx-why">${why}</div>` : ""}${row}</div>`;
  vdActions(`
    ${ex.sheet ? `<button class="audio-btn" onclick="gsPeek('${ex.sheet}')" title="${vxT("Open the sheet")}">📖</button>` : ""}
    ${audioOk() ? `<button class="audio-btn" onclick="speak(vxSayText(_vd.ex))">🔊</button>` : ""}
    <button class="g-big-btn p-main" id="vd-go" onclick="vdGo()">${vxT("Next →")}</button>`);
  if (!right) holdAfterMistake("vd-go");
  if (!said) speak(vxSayText(ex));
  if (input) input.focus({ preventScroll: true });
}
function vdGo() {
  if (!_vd || !_vd.answered) return;
  if (mistakeHeld("vd-fb")) return;
  vdNext();
}
// ✕ / Escape: the round ends where it is (an ∞ round ends this way).
function vdStop() {
  const v = _vd;
  if (!v) return;
  if (v.review || v.n > 0) return vdSummary();
  const unit = v.unit; _vd = null; renderGrammarUnit(unit);
}
// The end of a round: what it did, and your mistakes to look at again.
function vdSummary() {
  const v = _vd;
  if (!v) return;
  const R = v.review;
  if (R) { v.lastReview = { n: R.i, right: R.right }; v.missed = R.still; v.review = null; }
  v.ex = null; v.answered = false;
  const u = VX_UNIT[v.unit];
  if (typeof logEvent === "function" && !v.ended) { v.ended = true; logEvent("vx_drill_end", { u: v.unit, n: v.n, ok: v.right, cells: v.cells, up: v.ups.length, chk: v.checks.size }); }
  const k = v.missed.length;
  const lines = [
    v.cells ? vxT("📒 {0} forms done in your ledger", v.cells) : "",
    v.ups.length ? vxT("↑ {0} moved up (🌿 Familiar at most)", v.ups.length) : "",
    v.checks.size ? vxT("🗓️ {0} to check at the end of tomorrow's Today", v.checks.size) : "",
    v.lastReview ? vxT("↻ Mistakes once more: {0}/{1} right", v.lastReview.right, v.lastReview.n) : "",
  ].filter(Boolean);
  document.getElementById("main-screen").innerHTML = `<div class="screen grammar vd-screen vd-sum" id="vd-screen" style="${vxUnitStyle(v.unit)}">
    <div class="screen-top"><div class="screen-label">${vxT("📐 Grammar · 🎯 Drill")}</div><button class="back-btn" onclick="vdLeave()">← ${escapeHtml(u.name)}</button></div>
    <div class="gs-result">
      <div class="gs-result-icon">🎯</div>
      <div class="gs-result-title">${vxT("{0}/{1} right", v.right, v.n)}</div>
      <div class="gs-result-sub">${escapeHtml(u.name)}${vxT(" · outside your daily plan")}</div>
      ${lines.length ? `<div class="vd-lines">${lines.map(l => `<div>${l}</div>`).join("")}</div>` : ""}
      ${k ? `<div class="gs-missed"><b>${vxT("Your mistakes")}</b>${v.missed.map(ex => `<div class="gs-miss vd-miss"><span class="vx-answer">${vxFormHtml(ex)}</span><small>${escapeHtml(ex.x.inf)} · ${escapeHtml(VX_TENSE_LABEL[ex.tense] || "")}</small></div>`).join("")}</div>` : ""}
    </div>
    <div class="vd-act">
      ${k ? `<button class="g-big-btn" id="vd-review" onclick="vdReview()">${vxT("↻ Review my mistakes ({0})", k)}</button>` : ""}
      <button class="${k ? "g-sec-btn" : "g-big-btn"}" onclick="renderDrillStart('${v.unit}')">${vxT("🎯 Another round")}</button>
      <button class="g-sec-btn" onclick="vdLeave()">← ${escapeHtml(u.name)}</button>
    </div>
  </div>`;
  scrollPageTop();
}
// Your mistakes once more, in the same order: graded, logged, nothing moves.
function vdReview() {
  const v = _vd;
  if (!v || !v.missed.length) return;
  v.review = { list: v.missed.slice(), i: 0, right: 0, still: [] };
  vdShell();
  vdNext();
}
function vdLeave() { const unit = _vd ? _vd.unit : null; _vd = null; if (unit) renderGrammarUnit(unit); else renderGrammar(); }
let _vdKeys = false;
function vdBindKeys() {
  if (_vdKeys) return;
  _vdKeys = true;
  document.addEventListener("keydown", e => {
    const v = _vd;
    if (!v || !document.getElementById("vd-screen") || document.getElementById("vd-screen").classList.contains("vd-sum")) return;
    if (document.querySelector(".modal-overlay") || document.getElementById("gs-peek")) return;
    if (e.key === "Escape") { e.preventDefault(); vdStop(); return; }
    if (e.key !== "Enter") return;
    if (v.answered) { e.preventDefault(); vdGo(); return; }
    if (speakOn()) { if (!v.revealed) { e.preventDefault(); vdReveal(); } return; }
    if (e.target && e.target.id === "vd-input") { e.preventDefault(); vdCheck(); }
  });
}
