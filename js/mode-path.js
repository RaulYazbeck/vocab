// ── TODAY SESSION (the Path runner) ───────────
// One button, no decisions: the queue comes from buildPathQueue()
// (path.js) and mixes 🩹 repairs, due reviews, new-word rituals, a 💎
// spot check and optional bonus rounds. Drill-first — most items are
// typed recall. Like Drill and Boss Battle it keeps ONE input element
// for the whole session, so the phone keyboard never closes between
// typed items.
//
// Every answer goes through applyCorrect / applyWrong (srs.js), so the
// stage rules live in one place. Voice is optional: a 🎙️ toggle, off by
// default, never offered while muted until tomorrow.

let pathSession = null;
let _pathKeyBound = false;

function startPathSession(lenKey, opts = {}) {
  if (typeof quitAllGames === "function") quitAllGames();
  lenKey = PATH.SESSION_LENGTHS[lenKey] ? lenKey : (S.path.sessionLen || "regular");
  S.path.sessionLen = lenKey;
  const q = buildPathQueue(lenKey, opts);
  const island = document.getElementById("floating-island");
  if (island) island.remove();
  activeMode = "path";
  sessionCorrect = 0; sessionConsecutive = 0;
  showGameScreen();
  if (!q.items.length) {
    // Nothing due and today's new words met: "practise anyway" gets a
    // refresh session on your least recently seen words (stages only
    // move for due words, so this is pure extra practice).
    if (opts.practice && !opts.focus) { startPathSession(lenKey, { focus: "stale", practice: true }); return; }
    renderPathCaughtUp(); return;
  }
  pathSession = {
    lenKey, items: q.items, i: -1, budget: q.budget, startedAt: Date.now(), startExp: S.exp,
    stats: { answered: 0, correct: 0, wrong: 0, near: 0 }, moves: new Map(), met: [], repaired: 0,
    locked: 0, flagged: 0, missed: [], reasks: {}, bonusShown: 0, lastBonus: "", answered: false,
    cur: null, shownAt: 0, pendingReverse: null, typedSeen: 0, quick: !!opts.quick,
    focus: q.focus ? q.focus : "", focusParam: opts.param || "", practice: !!opts.practice,
    ok5: 0, upCount: 0, wotdHit: false, golden: 0,
  };
  pathMarkActive();
  logEvent("session_start", { kind: opts.quick ? "quick5" : "path", len: lenKey, n: q.items.length, nw: q.newWords, focus: q.focus || "" });
  logScreen("path");
  renderPathShell();
  bindPathKeys();
  pathNext();
}

// ── SHELL ─────────────────────────────────────
function renderPathShell() {
  const el = document.getElementById("main-screen");
  el.style.paddingBottom = "";
  const voiceAvail = !quietActive() && typeof voiceEngineUsable === "function" && voiceEngineUsable();
  el.innerHTML = `
    <div class="screen path-screen" id="path-screen">
      <div class="p-top">
        <button class="g-hud-btn" onclick="pathQuit()" aria-label="Leave session">✕</button>
        <div class="p-progress" aria-hidden="true"><div class="p-progress-fill" id="p-prog"></div></div>
        <span class="p-count" id="p-count"></span>
        ${voiceAvail ? `<button class="g-hud-btn p-toggle ${S.path.voiceInput ? "on" : ""}" id="p-voice" onclick="pathToggleVoice()" aria-pressed="${!!S.path.voiceInput}" aria-label="Answer by voice (optional)">🎙️</button>` : ""}
      </div>
      ${pathFocusLabel() ? `<div class="p-focus">${pathFocusLabel()}</div>` : ""}
      <div id="p-nudge"></div>
      <div class="p-card" id="p-card"></div>
      <div class="p-typed" id="p-typed" style="display:none">
        <input type="text" class="german-input" id="p-input" placeholder="type the answer…"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"/>
        ${accentBarHtml("p-input")}
        <div class="p-mic" id="p-mic" style="display:none">
          <button class="mic-btn" id="voice-mic-btn" onclick="pathMicTap()">🎤</button>
          <div class="voice-status" id="voice-status"></div>
        </div>
      </div>
      <div class="p-fb" id="p-fb" aria-live="polite"></div>
      <div class="p-actions" id="p-actions"></div>
    </div>`;
  const input = document.getElementById("p-input");
  input.addEventListener("input", () => { if (voiceActive) { cancelListening(); updateMicBtn(); setVoiceStatus("Typing — tap 🎤 to speak instead"); } });
}
function pathFocusLabel() {
  const s = pathSession;
  if (!s) return "";
  if (s.quick) return "5️⃣ Quick Five";
  if (s.practice) return "🧺 Extra practice — nothing is due, so this is just for fun";
  if (!s.focus) return "";
  const p = s.focusParam;
  const extra = s.focus === "deck" || s.focus === "new" ? (getDeck(p) ? " · " + escapeHtml(getDeck(p).name) : "")
    : s.focus === "level" ? " · " + escapeHtml((ALL_GROUPS.find(g => g.id === p) || {}).name || "")
    : s.focus === "pos" ? " · " + ({ verb: "verbs", noun: "nouns", adj: "adjectives" }[p] || p) : "";
  return `🎯 ${FOCUS_LABELS[s.focus] || "Focus"}${extra}`;
}
function bindPathKeys() {
  if (_pathKeyBound) return;
  _pathKeyBound = true;
  document.addEventListener("keydown", e => {
    if (!pathSession || !document.getElementById("path-screen")) return;
    if (document.getElementById("g-overlay") && document.getElementById("game-screen")) return;
    const it = pathSession.cur;
    if (!it) return;
    // Any open sheet (word editor, confirm, chest…) owns the keyboard.
    if (document.querySelector(".modal-overlay") || document.getElementById("settings-panel").style.display === "block") return;
    if (e.key === "Escape") { e.preventDefault(); pathQuit(); return; }
    // A focused, live button handles its own Enter (no double advance);
    // a stale one (an answered option) falls through to Next.
    if (e.key === "Enter" && e.target && e.target.tagName === "BUTTON" && !e.target.disabled && !e.target.closest(".g-options")) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (it.t === "learn") pathNext();
      else if (it.t === "bonus") { if (it.minion) pathMinion(true); else pathBonus(true); }
      else if (pathSession.pendingReverse !== null) pathReverseResolve(false);
      else if (pathSession.answered) pathGo();
      else if (["typed", "spot", "cloze", "reverse"].includes(it.t)) pathCheckTyped();
      return;
    }
    if ((it.t === "choice" || it.t === "listen") && !pathSession.answered) {
      if (e.target && e.target.tagName === "INPUT") return;
      const d = parseInt(e.key, 10);
      if (d >= 1 && d <= (it.opts || []).length) { e.preventDefault(); pathAnswerChoice(d - 1); }
      if (e.key === " " && it.t === "listen") { e.preventDefault(); speak(gameForm(it.w)); }
    }
  });
}
function pathProgress() {
  const s = pathSession;
  // Learn cards and bonus offers aren't questions: a Regular session
  // reads x/30, like the length you picked.
  const q = x => x.t !== "bonus" && x.t !== "learn" && !x.warm;
  const total = s.items.filter(q).length;
  const done = s.items.slice(0, s.i).filter(q).length;
  const f = document.getElementById("p-prog");
  if (f) f.style.width = Math.round(done / Math.max(1, total) * 100) + "%";
  const c = document.getElementById("p-count");
  if (c) c.textContent = `${Math.min(done + 1, total)}/${total}`;
}
function pathSetActions(html) { const a = document.getElementById("p-actions"); if (a) a.innerHTML = html; }
function pathShowTyped(show, placeholder = "type the answer…", accents = true) {
  const t = document.getElementById("p-typed"), input = document.getElementById("p-input");
  if (!t || !input) return;
  t.style.display = show ? "" : "none";
  t.classList.toggle("no-accents", !accents);
  input.value = ""; input.className = "german-input"; input.disabled = false;
  input.placeholder = placeholder;
  if (show) {
    try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    if (IS_STANDALONE) requestAnimationFrame(() => { const c = document.getElementById("path-screen"); if (c) c.scrollIntoView({ block: "start", behavior: "instant" }); });
  }
}

// ── FLOW ──────────────────────────────────────
function pathNext() {
  const s = pathSession;
  if (!s) return;
  stopPathVoice();
  s.i++;
  s.answered = false; s.pendingReverse = null;
  const fb = document.getElementById("p-fb"); if (fb) fb.innerHTML = "";
  if (s.i >= s.items.length) { renderPathSummary(false); return; }
  const it = s.items[s.i];
  // A spot check / review whose word changed meanwhile (e.g. a re-ask
  // already fixed it) is still fine to show — every answer is valid.
  s.cur = it; s.shownAt = Date.now();
  if (it.golden === undefined) it.golden = !["learn", "bonus"].includes(it.t) && Math.random() < goldenChance();
  pathProgress();
  const card = document.getElementById("p-card");
  if (card) { card.classList.remove("p-swap"); void card.offsetWidth; card.classList.add("p-swap"); card.classList.toggle("golden", !!it.golden); }
  switch (it.t) {
    case "learn": return renderPathLearn(it);
    case "choice": case "listen": return renderPathChoice(it);
    case "bonus": return renderPathBonusOffer(it);
    default: return renderPathTyped(it);
  }
}
// Next after an answer — held for a moment after a mistake.
function pathGo() { if (!mistakeHeld("p-fb")) pathNext(); }
function pathWordHeader(w, ws, extra = "") {
  const badge = ws && stageOf(ws) ? `${tierBadgeHtml(ws)} ${pipsHtml(ws)}` : `<span class="tier-badge tier-learning">🌱 New</span>`;
  return `<div class="p-meta"><span class="p-deck">${escapeHtml(w.deckName)}</span>${badge}${extra}</div>`;
}

// Learn card: the word is met the moment it's shown.
function renderPathLearn(it) {
  const s = pathSession, w = it.w;
  if (pathMeetWord(w)) { s.met.push(w); addExp(2); }
  pathShowTyped(false);
  document.getElementById("p-card").innerHTML = `
    <div class="p-learn">
      <div class="p-kicker">🌱 New word</div>
      <div class="p-learn-target">${colorArticleHtml(w[WORD_KEY])}</div>
      <div class="p-learn-prompt">${escapeHtml(w.en)}</div>
      ${frGenderNoteHtml(w)}
      ${w.pl ? `<div class="p-learn-hint">plural: ${escapeHtml(w.pl)}</div>` : ""}
      ${w.hint ? `<div class="p-learn-hint">${escapeHtml(w.hint)}</div>` : ""}
      ${examplesHtml(w, "first")}
      ${audioOk() ? `<button class="audio-btn" ${speakBtnAttrs(w[WORD_KEY])}>🔊 Listen</button>` : ""}
    </div>`;
  pathSetActions(`<button class="g-big-btn p-main" id="p-go" onclick="pathNext()">Got it →</button>`);
  setTimeout(() => { if (pathSession && pathSession.cur === it) speak(w[WORD_KEY]); }, 250);
  saveState();
}

// Choice / listen: recognition. 3 options for fresh / 🌱 words.
function renderPathChoice(it) {
  const w = it.w, ws = getWS(w.deckId, w.idx);
  pathShowTyped(false);
  const fresh = it.fresh || stageOf(ws) <= 1;
  const n = fresh ? 3 : 4;
  const listen = it.t === "listen" && audioOk();
  const rev = !listen && it.rev;
  const text = x => (listen || rev) ? gamePrompt(x) : gameForm(x);
  const pool = pathSession.items.map(x => x.w).filter(Boolean);
  const opts = shuffle([{ text: text(w), correct: true },
    ...pickDistractors(w, pool, n - 1).map(x => ({ text: text(x), correct: false }))]);
  it.opts = opts;
  document.getElementById("p-card").innerHTML = `
    ${pathWordHeader(w, it.fresh ? null : ws)}
    <div class="g-question">
      <div class="g-q-label">${listen ? "What did you hear?" : rev ? "What does it mean?" : "Pick the translation"}</div>
      ${listen ? `<button class="l-play" id="p-listen" aria-label="Play again">🔊</button><div class="l-reveal" id="p-reveal"></div>`
        : `<div class="g-q-word ${rev ? "target" : ""}">${rev ? colorArticleHtml(gameForm(w)) : escapeHtml(gamePrompt(w))}</div>`}
    </div>
    ${mcOptionsHtml(opts)}`;
  document.querySelectorAll("#p-card .g-opt").forEach(b => b.onclick = () => pathAnswerChoice(+b.dataset.i));
  if (listen) {
    document.getElementById("p-listen").onclick = () => { speak(gameForm(w)); popEl(document.getElementById("p-listen")); };
    setTimeout(() => { if (pathSession && pathSession.cur === it) speak(gameForm(w)); }, 200);
  }
  pathSetActions(`<button class="dontknow-btn p-wide" onclick="pathAnswerChoice(-1)">? Don't know</button>`);
}
function pathAnswerChoice(i) {
  const s = pathSession;
  if (!s || s.answered) return;
  const it = s.cur, w = it.w;
  s.answered = true;
  const ok = i >= 0 && it.opts[i] && it.opts[i].correct;
  if (i >= 0) mcReveal(document.getElementById("p-card"), it.opts, i);
  else mcReveal(document.getElementById("p-card"), it.opts, -1);
  const rev = document.getElementById("p-reveal");
  if (rev) rev.textContent = gameForm(w);
  const ws = getWS(w.deckId, w.idx);
  const from = stageOf(ws);
  pathLogAnswer(it, ok, { typed: false });
  if (ok) {
    ws.lastAnsweredAt = Date.now(); ws.correct++; S.totalCorrect++;
    const res = it.fresh || it.warm ? null : srsReview(ws, true, "recognition");
    if (res) { res._w = w; questEvent("srs", res); }
    pathRecordMove(w, from, res);
    s.stats.correct++; sessionCorrect++; sessionConsecutive++;
    if (Date.now() - s.startedAt < 300000) s.ok5++;
    addExp(2); checkDrillMilestone();
    pathGolden(it);
    questEvent("answer", { mode: "path", ok: true, typed: false, st: from, w, ear: it.t === "listen" });
    playSuccess(); haptic("select");
    speak(gameForm(w));
  } else {
    ws.lastAnsweredAt = Date.now(); ws.wrong++;
    const res = it.fresh || it.warm ? null : srsReview(ws, false, "recognition");
    if (res) { res._w = w; questEvent("srs", res); }
    pathRecordMove(w, from, res);
    s.stats.wrong++; sessionConsecutive = 0;
    pathMissed(w);
    // A missed first choice comes back as a choice — typing comes after.
    if (it.fresh || it.warm) pathReask(w, 2, "choice");
    questEvent("answer", { mode: "path", ok: false, typed: false, st: from, w });
    playFailure(); haptic("miss");
    speak(gameForm(w));
  }
  s.stats.answered++;
  saveState();
  const fb = document.getElementById("p-fb");
  if (fb) fb.innerHTML = ok ? `<div class="p-ok">✓ ${colorArticleHtml(gameForm(w))} — ${escapeHtml(gamePrompt(w))}</div>`
    : `<div class="p-bad">✗ ${colorArticleHtml(gameForm(w))} — ${escapeHtml(gamePrompt(w))}</div>`;
  pathSetActions(`<button class="g-big-btn p-main" id="p-go" onclick="pathGo()">Next →</button>`);
  if (!ok) holdAfterMistake("p-go");
  // Never auto-skip: you always move on yourself (Enter or Next).
  const go = document.getElementById("p-go"); if (go) try { go.focus({ preventScroll: true }); } catch (e) {}
}

// Typed recall: plain, spot check, sentence (cloze) or reversed.
function renderPathTyped(it) {
  const s = pathSession, w = it.w, ws = getWS(w.deckId, w.idx);
  s.typedSeen++;
  let body = "", placeholder = "type the answer…";
  const kicker = it.t === "spot" ? (it.maint ? `<div class="p-kicker spot">💎 Check-in — a locked-in word, ${(ws.mt || 0) ? "a year" : "4 months"} later</div>` : `<div class="p-kicker spot">🔍 Spot check — a 💎 word</div>`)
    : ws.rp ? `<div class="p-kicker repair">🩹 Repair — get it right to keep its badge</div>`
    : it.second ? `<div class="p-kicker">🌱 Once more, from memory</div>`
    : it.reask ? `<div class="p-kicker">↻ Once more</div>`
    : ws.fl ? `<div class="p-kicker flag">⚠️ Quick check</div>`
    : it.practice ? `<div class="p-kicker">🧺 Extra practice</div>` : "";
  if (it.t === "cloze") {
    const info = clozeTarget(w);
    if (!info) { it.t = "typed"; return renderPathTyped(it); }
    it.cloze = info;
    body = `<div class="g-q-label">Type the missing word</div>
      <div class="cz-sentence p-cloze">${info.html}</div>
      <div class="cz-trans">${escapeHtml(info.example.en || "")}</div>
      <div class="p-cloze-meaning">(${escapeHtml(gamePrompt(w))})</div>`;
    placeholder = "the word as it appears in the sentence…";
  } else if (it.t === "reverse") {
    body = `<div class="g-q-label">What does it mean?</div>
      <div class="english-word p-target">${colorArticleHtml(gameForm(w))}</div>`;
    placeholder = WORD_KEY === "fr" ? "type the meaning…" : "type the meaning in English…";
  } else {
    body = `<div class="english-word">${escapeHtml(w.en)}</div>
      <div class="word-hint">${escapeHtml(w.hint || "")}</div>`;
  }
  document.getElementById("p-card").innerHTML = `${pathWordHeader(w, it.fresh ? null : ws)}${kicker}<div class="word-display p-word">${body}</div><div id="p-hint"></div>`;
  pathShowTyped(true, placeholder, it.t !== "reverse");
  // 💡 is always there for a plain prompt. Using it is fine — the answer
  // then counts as recognition: right, but no step up (repairs and new
  // words simply come back for an unaided try).
  const hint = it.t === "typed" || it.t === "spot" ? buildHint(w) : null;
  it.hintHtml = hint;
  pathSetActions(`
    ${hint ? `<button class="hint-btn" id="p-hint-btn" onclick="pathShowHint()">💡 Hint</button>` : ""}
    <button class="dontknow-btn" onclick="pathDontKnow()">? Don't know</button>
    <button class="g-big-btn p-main" id="p-check" onclick="pathCheckTyped()">Check</button>`);
  pathPreventBlur();
  pathMaybeVoice(it);
  pathMaybeNudge();
}
// Buttons must not steal focus from the input (keyboard would close).
function pathPreventBlur() {
  document.querySelectorAll("#p-actions button, #p-fb button").forEach(b => b.addEventListener("pointerdown", e => {
    if (document.getElementById("p-typed").style.display !== "none") e.preventDefault();
  }));
}
function pathShowHint() {
  const s = pathSession;
  if (!s || s.answered || !s.cur.hintHtml) return;
  s.cur.usedHint = true;
  document.getElementById("p-hint").innerHTML = `<div class="hint-wrap"><div class="examples-title">💡 In context — word hidden</div><div class="hint-sentence">${s.cur.hintHtml}</div></div>`;
  const b = document.getElementById("p-hint-btn"); if (b) b.disabled = true;
  logEvent("hint", {});
}
function pathDontKnow() {
  const s = pathSession;
  if (!s || s.answered) return;
  pathGradeTyped("", false);
}
// Accepts the stored answer or its display form ("die Katze" for
// "die Katze, -n").
function pathTypedOk(val, w) { return isCorrect(val, w[WORD_KEY]) || isCorrect(val, gameForm(w)); }
function reverseAlternatives(w) {
  return String(w.en || "").split(/\s+\/\s+|\//).map(a => normalize(a.replace(/\(.*?\)/g, " ").replace(/\b(to|the|a|an)\s+/gi, " ")).trim()).filter(Boolean);
}
function reverseOk(val, w) {
  const v = normalize(String(val).replace(/\(.*?\)/g, " ").replace(/\b(to|the|a|an)\s+/gi, " ")).trim();
  if (!v) return false;
  return reverseAlternatives(w).some(a => a === v || (a.length >= 5 && levenshtein(a, v) <= 1) || (v.length >= 4 && a.split(/[,;]\s*/).includes(v)));
}
function pathCheckTyped() {
  const s = pathSession;
  if (!s || s.answered) return;
  const input = document.getElementById("p-input");
  const val = input ? input.value : "";
  if (!val.trim()) { shakeEl(input); if (input) input.focus({ preventScroll: true }); return; }
  const it = s.cur, w = it.w;
  if (it.t === "cloze") {
    const ans = it.cloze.answer;
    if (normalize(val) === normalize(ans) || isCorrect(val, ans)) return pathGradeTyped(val, true);
    if (isNearMiss(val, [ans])) return pathGradeTyped(val, "near");
    // The base form where the sentence needs another article form (den/dem…)
    // is a grammar slip, not a typo: it counts as wrong, with a pointer.
    if (pathTypedOk(val, w)) return pathGradeTyped(val, false, `Right word — but in this sentence it's <strong>${escapeHtml(ans)}</strong>.`);
    return pathGradeTyped(val, false);
  }
  if (it.t === "reverse") {
    if (reverseOk(val, w)) return pathGradeTyped(val, true);
    return pathReverseMismatch(val);
  }
  if (pathTypedOk(val, w)) return pathGradeTyped(val, true);
  if (isNearMiss(val, [w[WORD_KEY], gameForm(w)])) return pathGradeTyped(val, "near");
  return pathGradeTyped(val, false);
}
// Reversed items: English phrasing varies, so a mismatch asks first.
function pathReverseMismatch(val) {
  const s = pathSession, w = s.cur.w;
  s.answered = true; s.pendingReverse = val;
  const input = document.getElementById("p-input");
  if (input) input.classList.add("wrong");
  document.getElementById("p-fb").innerHTML = `
    <div class="p-bad">Expected: <strong>${escapeHtml(gamePrompt(w))}</strong></div>
    <div class="p-sub">You wrote “${escapeHtml(val.trim())}”. Same meaning?</div>`;
  pathSetActions(`
    <button class="g-sec-btn" onclick="pathReverseResolve(true)">✓ I was right</button>
    <button class="g-big-btn p-main" id="p-go" onclick="pathReverseResolve(false)">✗ I was wrong</button>`);
  pathPreventBlur();
  holdAfterMistake("p-go");
}
function pathReverseResolve(right) {
  const s = pathSession;
  if (!s || s.pendingReverse === null) return;
  if (mistakeHeld("p-fb")) return;
  const val = s.pendingReverse;
  s.pendingReverse = null; s.answered = false;
  pathGradeTyped(val, right, "", true);
  if (!right) pathNext();
}
// ok: true / false / "near". Applies bookkeeping and shows feedback.
function pathGradeTyped(val, ok, note = "", fromReverse = false) {
  const s = pathSession, it = s.cur, w = it.w;
  if (s.answered && !fromReverse) return;
  s.answered = true;
  stopPathVoice();
  const ws = getWS(w.deckId, w.idx);
  const from = stageOf(ws);
  const prevAt = ws.lastAnsweredAt;
  const input = document.getElementById("p-input");
  let res = null;
  const spoken = !!it.spoken;
  pathLogAnswer(it, ok === true, { typed: true, near: ok === "near", hint: !!it.usedHint, voice: spoken });
  if (ok === true) {
    const kind = it.usedHint ? "recognition" : "recall";
    sessionConsecutive++;
    res = applyCorrect(ws, { quiet: true, kind, w, ms: Date.now() - s.shownAt });
    addExp(5);
    checkDrillMilestone(); sessionCorrect++;
    s.stats.correct++;
    if (Date.now() - s.startedAt < 300000) s.ok5++;
    if (it.t === "spot") S.path.spotToday = (S.path.spotToday || 0) + 1;
    const exact = !/[äöüßéèêàâçôîûùëïœ]/i.test(w[WORD_KEY] || "") || /[äöüßéèêàâçôîûùëïœ]/i.test(val);
    questEvent("answer", { mode: "path", ok: true, typed: true, st: from, w, it: it.t, hint: !!it.usedHint, voice: spoken,
      ms: Date.now() - s.shownAt, prevAt, raw: exact });
    pathGolden(it);
    playSuccess(); haptic("select");
    if (input) input.classList.add("correct");
  } else if (ok === "near") {
    s.stats.near++;
    ws.lastAnsweredAt = Date.now(); ws.near = (ws.near || 0) + 1;
    questEvent("answer", { mode: "path", ok: "near", typed: true, st: from, w });
    if (input) input.classList.add("near");
    haptic("select");
  } else {
    sessionConsecutive = 0;
    res = applyWrong(ws, { w });
    s.stats.wrong++;
    if (it.t === "spot") S.path.spotToday = (S.path.spotToday || 0) + 1;
    pathMissed(w);
    pathReask(w, 3 + Math.floor(Math.random() * 3));
    questEvent("answer", { mode: "path", ok: false, typed: true, st: from, w, it: it.t });
    playFailure(); haptic("miss");
    if (input) input.classList.add("wrong");
  }
  s.stats.answered++;
  pathRecordMove(w, from, res);
  saveState();
  // Feedback
  const answerText = it.t === "cloze" ? it.cloze.answer : it.t === "reverse" ? gamePrompt(w) : w[WORD_KEY];
  const evs = res ? res.events : [];
  const chip = evs.includes("locked") ? `<span class="p-chip gold">💎 Locked in!</span>`
    : evs.includes("strong") ? `<span class="p-chip gold">⭐ Strong!</span>`
    : evs.includes("known") ? `<span class="p-chip ok">🌳 Known!</span>`
    : evs.includes("repaired") ? `<span class="p-chip ok">🩹 Repaired</span>`
    : evs.includes("repair") ? `<span class="p-chip warn">🩹 Badge kept — repair it next time</span>`
    : evs.includes("dropped") ? `<span class="p-chip warn">↓ ${tierOfStage(res.to).icon} back to ${tierOfStage(res.to).name}</span>`
    : res && res.promoted ? `<span class="p-chip ok">↑ ${tierOfStage(res.to).icon} ${tierOfStage(res.to).name}</span>`
    : evs.includes("confirm") ? `<span class="p-chip">✓ Good — one more check before it moves up</span>`
    : evs.includes("maintained") ? `<span class="p-chip gold">💎 Check-in passed</span>`
    : evs.includes("spotcheck") ? `<span class="p-chip gold">💎 Still solid</span>`
    : evs.includes("confirmed") ? `<span class="p-chip ok">✓ Scheduled — see you ${stageIntervalDays(ws, stageOf(ws)) === 1 ? "tomorrow" : "in " + stageIntervalDays(ws, stageOf(ws)) + " days"}</span>`
    : it.usedHint && ok === true ? `<span class="p-chip">💡 with hint — no step up</span>` : "";
  const head = ok === true ? `<div class="p-ok">✓ Correct! <strong>${colorArticleHtml(answerText)}</strong></div>`
    : ok === "near" ? `<div class="p-near">≈ Almost — check the spelling</div><div class="p-diff">${diffHtml(val, answerText)}</div>${note ? `<div class="p-sub">${note}</div>` : ""}<div class="p-sub">No step up, no step down — it comes back next session.</div>`
    : `<div class="p-bad">${val.trim() ? "✗ Answer:" : "Answer:"} <strong>${colorArticleHtml(answerText)}</strong></div>${val.trim() ? `<div class="p-diff">${diffHtml(val, answerText)}</div>` : ""}${note ? `<div class="p-sub">${note}</div>` : ""}`;
  const fb = document.getElementById("p-fb");
  if (fb) fb.innerHTML = `
    <div class="p-fb-main">${head}${chip}${w.pl && it.t !== "cloze" && it.t !== "reverse" ? `<div class="p-sub">plural: ${escapeHtml(w.pl)}</div>` : ""}</div>
    ${it.t === "reverse" ? `<div class="p-sub">${colorArticleHtml(gameForm(w))} = ${escapeHtml(gamePrompt(w))}</div>` : ""}
    ${pathCaseNote(it)}
    ${examplesHtml(w, "first")}`;
  pathSetActions(`
    <button class="audio-btn" onclick="pathEditWord()" title="Edit this word">✏️</button>
    ${audioOk() ? `<button class="audio-btn" ${speakBtnAttrs(w[WORD_KEY])}>🔊</button>` : ""}
    <button class="g-big-btn p-main" id="p-go" onclick="pathGo()">Next →</button>`);
  pathPreventBlur();
  // The reversed item's mismatch screen already held; "I was wrong" moves on.
  if (ok !== true && !fromReverse) holdAfterMistake("p-go");
  speak(w[WORD_KEY]);
  if (input) input.focus({ preventScroll: true });
}
// Sentence items: why the article in front of the noun has its form
// (display only — grading is unchanged).
function pathCaseNote(it) {
  if (it.t !== "cloze" || typeof caseItem !== "function" || !it.cloze) return "";
  const ci = caseItem(it.w);
  return ci && ci.ex === it.cloze.example ? `<div class="p-sub">🧭 ${ci.reason.html}</div>` : "";
}
function pathEditWord() {
  const s = pathSession; if (!s || !s.cur) return;
  const w = s.cur.w;
  openWordEditor(w.deckId, w.idx, () => {
    const src = getDeck(w.deckId).words[w.idx];
    WORD_EDIT_FIELDS.forEach(f => { if (src[f] === undefined) delete w[f]; else w[f] = src[f]; });
  });
}
// 🌟 Golden words: triple XP and a quest counter.
function pathGolden(it) {
  if (!it.golden || it.goldPaid) return;
  it.goldPaid = true;
  pathSession.golden++;
  addExp(10);
  questEvent("golden", {});
  floatScore(document.getElementById("p-card"), "🌟 +10", "gold");
}
function pathMissed(w) {
  const s = pathSession;
  if (!s.missed.some(x => sameWord(x, w))) s.missed.push(w);
}
// Bring a missed word back a few items later (at most twice).
function pathReask(w, gap, type = "typed") {
  const s = pathSession, k = wordKey(w);
  s.reasks[k] = (s.reasks[k] || 0) + 1;
  if (s.reasks[k] > 2) return;
  let pos = s.i + 1, n = 0;
  while (pos < s.items.length && n < gap) { if (s.items[pos].t !== "bonus" && s.items[pos].t !== "learn") n++; pos++; }
  s.items.splice(pos, 0, type === "choice" ? { t: "choice", w, reask: true, warm: true, rev: Math.random() < 0.5 } : { t: "typed", w, reask: true, fix: true });
}
function pathRecordMove(w, from, res) {
  const s = pathSession;
  const k = wordKey(w);
  const prev = s.moves.get(k);
  const to = res ? res.to : from;
  const events = (prev ? prev.events : []).concat(res ? res.events : []);
  s.moves.set(k, { w, from: prev ? prev.from : from, to, events });
}
function pathLogAnswer(it, ok, extra) {
  logEvent("answer", { m: "path:" + it.t, ok, ms: Date.now() - (pathSession ? pathSession.shownAt : Date.now()), ...extra });
}

// ── VOICE (optional) ──────────────────────────
function pathToggleVoice() {
  S.path.voiceInput = !S.path.voiceInput;
  saveState();
  logEvent("setting", { k: "voiceInput", v: S.path.voiceInput });
  const b = document.getElementById("p-voice");
  if (b) { b.classList.toggle("on", S.path.voiceInput); b.setAttribute("aria-pressed", S.path.voiceInput); }
  if (pathSession && pathSession.cur && !pathSession.answered) {
    if (S.path.voiceInput) pathMaybeVoice(pathSession.cur); else stopPathVoice();
  }
}
function pathVoiceFits(it) {
  return S.path.voiceInput && !quietActive() && ["typed", "spot"].includes(it.t) &&
    typeof voiceEngineUsable === "function" && voiceEngineUsable();
}
function pathMaybeVoice(it) {
  const mic = document.getElementById("p-mic");
  if (!pathVoiceFits(it)) { if (mic) mic.style.display = "none"; return; }
  if (mic) mic.style.display = "";
  currentWord = it.w;
  voiceSessionRunning = true;
  voiceCapture = (correct, heard, isSkip) => {
    if (!pathSession || pathSession.cur !== it || pathSession.answered) return;
    cancelListening(); updateMicBtn();
    if (isSkip && !heard) { setVoiceStatus("Didn't hear anything — tap 🎤 or just type"); return; }
    if (isSkip) { pathGradeTyped("", false); return; }
    it.spoken = true;
    const input = document.getElementById("p-input");
    if (input) input.value = heard;
    if (correct) pathGradeTyped(heard, true);
    else pathGradeTyped(heard, false);
  };
  setVoiceStatus("Listening… say it, or type");
  setTimeout(() => { if (pathSession && pathSession.cur === it && !pathSession.answered) startListening(); }, 350);
}
function pathMicTap() { if (voiceActive) stopListening(); else if (pathSession && pathSession.cur) { voiceSessionRunning = true; startListening(); } }
function stopPathVoice() {
  if (voiceCapture) { voiceCapture = null; }
  if (voiceActive) cancelListening();
  voiceSessionRunning = false;
  const mic = document.getElementById("p-mic"); if (mic) mic.style.display = "none";
}
// A gentle, once-a-day suggestion — never while muted, never forced.
function pathMaybeNudge() {
  const s = pathSession, el = document.getElementById("p-nudge");
  if (!el) return;
  el.innerHTML = "";
  if (s.typedSeen !== 4 || S.path.voiceInput || quietActive() || S.path.voiceNudgeDay === todayISO()) return;
  if (typeof voiceEngineUsable !== "function" || !voiceEngineUsable()) return;
  el.innerHTML = `<div class="g-notice soft p-nudge">🎙️ Can you speak right now? Saying answers aloud counts the same — totally optional.
    <button class="g-notice-btn" onclick="pathNudge(true)">Try it</button><button class="g-sec-btn p-nudge-no" onclick="pathNudge(false)">Not now</button></div>`;
}
function pathNudge(yes) {
  S.path.voiceNudgeDay = todayISO();
  saveState();
  logEvent("voice_nudge", { yes });
  const el = document.getElementById("p-nudge"); if (el) el.innerHTML = "";
  if (yes && !S.path.voiceInput) pathToggleVoice();
}

// ── BONUS ROUND (optional) ────────────────────
function pathBonusGame() {
  const s = pathSession;
  const pool = uniqWords(s.items.map(x => x.w).filter(Boolean)).filter(w => isMet(w.deckId, w.idx)).map(w => ({ ...w, anki: false }));
  const ids = PATH_BONUS_IDS;
  const ok = ids.filter(id => {
    const g = getGame(id);
    if (!g || id === s.lastBonus) return false;
    if (g.audio && !audioOk()) return false;
    return gameRequirement(g, pool, "bonus").ok;
  });
  if (!ok.length) return null;
  // A game an open quest asks for comes first.
  const wanted = questNudges().games.filter(id => ok.includes(id));
  if (wanted.length) return { id: wanted[0], pool };
  // Prefer games that fit the words: nouns → gender, verb forms → conj.
  const weights = ok.map(id => ({ id, w: id === "gender" || id === "conj" ? 2 : 1 }));
  return { id: weightedPick(weights).id, pool };
}
function renderPathMinionOffer(it) {
  const s = pathSession, b = deckBoss(it.minion), d = getDeck(it.minion);
  S.games.minionDay = todayISO(); saveState();
  pathShowTyped(false);
  document.getElementById("p-card").innerHTML = `
    <div class="p-bonus p-minion">
      <div class="p-bonus-icon">${b.icon}</div>
      <div class="p-bonus-title">A ${escapeHtml(b.name)} minion appears!</div>
      <div class="p-bonus-sub">⚔️ ${MINION_WORDS} words from ${d.icon} ${escapeHtml(d.name)} · 3 lives</div>
      <div class="p-sub">A small trophy — the 👑 boss itself waits until the whole deck is met.</div>
    </div>`;
  pathSetActions(`
    <button class="g-sec-btn" onclick="pathMinion(false)">Skip</button>
    <button class="g-big-btn p-main" onclick="pathMinion(true)">Fight ⚔️</button>`);
}
function pathMinion(take) {
  const s = pathSession;
  if (!s || !s.cur || !s.cur.minion) return;
  logEvent("minion", { taken: take, deck: s.cur.minion });
  if (!take) { pathNext(); return; }
  startMinion(s.cur.minion, resumePathAfterBonus);
}
function renderPathBonusOffer(it) {
  const s = pathSession;
  if (it.minion) return renderPathMinionOffer(it);
  const pick = pathBonusGame();
  if (!pick) { pathNext(); return; }
  it.pick = pick;
  s.bonusShown++;
  pathShowTyped(false);
  const g = getGame(pick.id);
  document.getElementById("p-card").innerHTML = `
    <div class="p-bonus">
      <div class="p-bonus-icon">🎁</div>
      <div class="p-bonus-title">Bonus round?</div>
      <div class="p-bonus-sub">${g.icon} ${escapeHtml(gameName(g))} — <strong>${bonusGoalText(pick.id)}</strong> to clear it</div>
      <div class="p-sub">With this session's words · optional</div>
    </div>`;
  pathSetActions(`
    <button class="g-sec-btn" onclick="pathBonus(false)">Skip</button>
    <button class="g-big-btn p-main" onclick="pathBonus(true)">Play ▶</button>`);
}
function pathBonus(take) {
  const s = pathSession;
  if (!s || !s.cur || s.cur.t !== "bonus") return;
  if (s.cur.minion) return pathMinion(take);
  logEvent("bonus", { taken: take, id: s.cur.pick && s.cur.pick.id });
  if (!take) { pathNext(); return; }
  const { id, pool } = s.cur.pick;
  s.lastBonus = id;
  gameRun = { kind: "surprise", ids: [id], i: 0, summaries: [], pool, size: "bonus", title: "🎁 Bonus", onDone: resumePathAfterBonus };
  launchGame(id, { pool, size: "bonus" });
}
function resumePathAfterBonus() {
  gameRun = null;
  if (!pathSession) { backToMenu(); return; }
  renderPathShell();
  pathNext();
}

// ── LEAVING / SUMMARY ─────────────────────────
function pathQuit() {
  const s = pathSession;
  if (!s) { backToMenu(); return; }
  if (s.stats.answered === 0 && !s.met.length) { endPathSession(true); backToMenu(); return; }
  appConfirm({ title: "Leave the session?", body: "Everything you've answered so far is saved.", ok: "Leave", cancel: "Keep going" })
    .then(yes => {
      if (yes && pathSession === s) renderPathSummary(true);
      else if (!yes) { const i = document.getElementById("p-input"); if (i && document.getElementById("p-typed").style.display !== "none") i.focus({ preventScroll: true }); }
    });
}
function endPathSession(abandoned) {
  const s = pathSession;
  if (!s) return;
  stopPathVoice();
  logEvent("session_end", { kind: s.quick ? "quick5" : "path", abandoned, n: s.stats.answered, ok: s.stats.correct, ms: Date.now() - s.startedAt, at: s.i });
  questEvent("session_end", { kind: "path", len: s.lenKey, abandoned, stats: s.stats, ms: Date.now() - s.startedAt, quick: s.quick,
    ok5: s.ok5, up: s.upCount || 0, wotdHit: !!s.wotdHit });
  // ⚡ XP boost from a chest: doubles this session's XP.
  if (!abandoned && S.quests && S.quests.boosts > 0 && s.stats.answered >= 5) {
    S.quests.boosts--;
    const gained = Math.max(0, S.exp - s.startExp);
    if (gained) { addExp(gained); s.boosted = gained; }
  }
  pathSession = null;
  invalidatePathScan();
  if (typeof flushDeferredCelebrations === "function") flushDeferredCelebrations();
}
function renderPathSummary(abandoned) {
  const s = pathSession;
  if (!s) return;
  const moves = [...s.moves.values()];
  const up = moves.filter(m => m.to > m.from);
  const repaired = moves.filter(m => m.events.includes("repaired")).length;
  const locked = moves.filter(m => m.events.includes("locked")).length;
  const known = moves.filter(m => m.events.includes("known")).length;
  const flagged = moves.filter(m => m.events.includes("repair") || m.events.includes("dropped")).length;
  const acc = s.stats.answered ? Math.round(s.stats.correct / s.stats.answered * 100) : 0;
  const stats = { ...s.stats };
  const missed = s.missed.slice();
  const met = s.met.slice();
  const lenKey = s.lenKey;
  endPathSession(abandoned);
  const xp = Math.max(0, S.exp - s.startExp - (s.badgeXp || 0));
  if (!abandoned && s.stats.answered >= 5) { if (acc >= 90) confettiBurst(40); playAchievement(); }
  const upRow = m => `<div class="p-move">
      <span class="p-move-w">${colorArticleHtml(gameForm(m.w))}<small>${escapeHtml(gamePrompt(m.w))}</small></span>
      <span class="p-move-t">${pipsMoveHtml(m.from, m.to)}${tierOfStage(m.from).id !== tierOfStage(m.to).id ? ` <b>${tierOfStage(m.to).icon}</b>` : ""}</span>
    </div>`;
  // Tier changes first; a long list folds after 8.
  up.sort((a, b) => (tierOfStage(b.to).id !== tierOfStage(b.from).id) - (tierOfStage(a.to).id !== tierOfStage(a.from).id) || b.to - a.to);
  const upRows = up.slice(0, 8).map(upRow).join("") + (up.length > 8
    ? `<details class="p-more"><summary>Show ${up.length - 8} more</summary>${up.slice(8, 60).map(upRow).join("")}</details>` : "");
  const el = document.getElementById("main-screen");
  el.innerHTML = `
    <div class="screen game-screen">
      <div class="result-screen g-results">
        <div class="result-emoji">${abandoned ? "👋" : acc >= 90 ? "🏆" : acc >= 70 ? "🎉" : "💪"}</div>
        <div class="result-title">${abandoned ? "Saved — see you soon" : "Session complete!"}</div>
        <div class="result-sub">${stats.answered} answers · ${acc}% right${stats.near ? ` · ${stats.near} almost` : ""}</div>
        <div class="p-chips">
          ${up.length ? `<span class="p-chip ok">📈 ${up.length} moved up</span>` : ""}
          ${met.length ? `<span class="p-chip">🌱 ${met.length} new word${met.length > 1 ? "s" : ""}</span>` : ""}
          ${known ? `<span class="p-chip ok">🌳 ${known} Known</span>` : ""}
          ${repaired ? `<span class="p-chip ok">🩹 ${repaired} repaired</span>` : ""}
          ${locked ? `<span class="p-chip gold">💎 ${locked} locked in</span>` : ""}
          ${flagged ? `<span class="p-chip warn">🩹 ${flagged} need another look</span>` : ""}
          <span class="p-chip gold">+${xp} XP${s.boosted ? " (⚡×2)" : ""}</span>
          ${s.badges ? `<button class="p-chip gold" onclick="showScreen('badges')">🏅 ${s.badges} achievement${s.badges > 1 ? "s" : ""} · +${s.badgeXp} XP</button>` : ""}
          ${s.golden ? `<span class="p-chip gold">🌟 ${s.golden} golden</span>` : ""}
        </div>
        ${typeof questMiniHtml === "function" ? questMiniHtml() : ""}
        ${upRows ? `<div class="g-missed p-moves"><div class="examples-title">Moved forward</div>${upRows}</div>` : ""}
        ${missedListHtml(missed)}
        <div class="g-result-actions">
          ${dayCompleteCtaHtml()}
          <button class="${dayCompletePending() ? "g-sec-btn" : "g-big-btn"}" id="p-again">Another round ▶</button>
          <button class="g-sec-btn" onclick="backToMenu()">Done ✓</button>
        </div>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: "instant" });
  armOverlayButton(document.getElementById("p-again"), () => startPathSession(lenKey));
}
function renderPathCaughtUp() {
  const t = pathTodaySummary();
  const el = document.getElementById("main-screen");
  const done = !t.frontier;
  el.innerHTML = `
    <div class="screen">
      <div class="result-screen">
        <div class="result-emoji">${done ? "🏔️" : "✅"}</div>
        <div class="result-title">${done ? "Every word met!" : "All caught up"}</div>
        <div class="result-sub">${done ? "Keep reviewing to lock everything in." :
          t.reason === "autopaused" ? "New words are paused after a few days away — reviews first, then they resume by themselves." :
          t.reason === "paused" ? "New words are paused (Settings → New words/day)." :
          "Nothing is due and today's new words are met."}</div>
        <div class="g-result-actions">
          ${!done ? `<button class="g-big-btn" onclick="pathLearnExtra();startPathSession('quick')">🌱 Learn ${PATH.EXTRA_NEW} extra</button>` : ""}
          <button class="g-sec-btn" onclick="openGamesHub(null)">🎮 Play a game</button>
          <button class="g-link-btn" onclick="backToMenu()">← Home</button>
        </div>
      </div>
    </div>`;
}

// Quick Five: five due reviews — keeps the streak on a bad day.
function startQuickFive() {
  const { fix, due } = pathReviewCandidates();
  if (!fix.length && !due.length) { showCelebrateToast("✅", "Nothing due", "You're all caught up"); return; }
  S.path.quickFiveDay = todayISO();
  startPathSession("quick", { reviewOnly: true, noBonus: true, quick: true, limit: 5 });
}
