// ── ANKI SYSTEM ───────────────────────────────
// Faithful replica of the official Anki app's daily flow:
//   owed today = every review due + every learning card + X new words.
// X (new/day) is configurable in Settings. When the debt is cleared the
// day is DONE — no extra studying, come back after the 4 AM rollover.
// Intervals carry no fuzz, so the forecast is exact.

// ── SCOPE HELPERS ─────────────────────────────
// Anki decks ignore the vocab unlock system: every word in the deck is
// schedulable; the daily new-card quota is the only gate.
function ankiScopeWords(deckIds) {
  const out = [];
  deckIds.forEach(id => {
    const deck = getDeck(id);
    if (!deck) return;
    deck.words.forEach((w, i) => out.push({ ...w, deckId: id, deckName: deck.name, idx: i }));
  });
  return out;
}
function allAnkiDeckIds() {
  const ids = [];
  ALL_GROUPS.forEach(g => { if (isAnkiGroup(g)) g.decks.forEach(d => ids.push(d.id)); });
  return ids;
}

// The new-card quota is global across all Anki decks (you owe X words a
// day as a person, not per deck), and is derived from card state so it
// can never drift out of sync across devices.
function ankiIntroducedToday() {
  const today = ankiToday();
  let n = 0;
  allAnkiDeckIds().forEach(id => {
    const deck = getDeck(id);
    deck.words.forEach((w, i) => {
      const ws = S.words[id + "_" + i];
      if (ws && ws.anki && ws.anki.introducedOn === today) n++;
    });
  });
  return n;
}

// Anki-style triple count for a set of decks:
//   newCount (blue) · learning (orange) · review due (green)
function ankiCounts(deckIds) {
  const today = ankiToday();
  const quota = Math.max(0, ankiEffectiveNewPerDay() - ankiIntroducedToday());
  let unseen = 0, learning = 0, review = 0;
  ankiScopeWords(deckIds).forEach(w => {
    const ws = S.words[w.deckId + "_" + w.idx];
    const a = ws && ws.anki;
    if (!a || a.phase === "new") { unseen++; return; }
    if (a.phase === "learning" || a.phase === "relearning") learning++;
    else if (a.phase === "review" && a.due <= today) review++;
  });
  return { newCount: Math.min(unseen, quota), learning, review, unseen, quota };
}

function ankiOwedToday(deckIds) {
  const c = ankiCounts(deckIds);
  return c.newCount + c.learning + c.review;
}

// ── PAUSE (new words) ─────────────────────────
// Pausing stops new-card intake; reviews stay owed in full. Manual via
// the ⏸ button, or automatic after a long absence: two missed days are
// tolerated, but once the 3rd consecutive day also passes with debt
// untouched, the pause switches on — so a comeback from vacation costs
// only the review backlog, not backlog + new words.
function toggleAnkiPause() {
  S.ankiNewPaused = !S.ankiNewPaused;
  if (!S.ankiNewPaused) delete S.ankiAutoPausedOn;
  saveState();
  renderGroups();
  renderStartBar();
  const panel = document.getElementById("settings-panel");
  if (panel && panel.style.display !== "none") renderSettingsPanel();
}

// Runs from migrate() — i.e. at every app open and after every cloud
// load. Uses saveLocalOnly: stamping savedAt at init time would make
// this device look newer than the cloud and block the load (see
// recordLogin in progression.js).
function checkAnkiAutoPause() {
  if (typeof ALL_GROUPS === "undefined" || !allAnkiDeckIds().length) return;
  const today = ankiToday();
  // A day with nothing owed is not neglect — count it as active.
  if (ankiOwedToday(allAnkiDeckIds()) === 0) {
    if (S.ankiLastActiveDay !== today) { S.ankiLastActiveDay = today; saveLocalOnly(); }
    return;
  }
  if (S.ankiNewPaused || !S.ankiLastActiveDay) return;
  const missedDays = daysBetween(S.ankiLastActiveDay, today) - 1;
  if (missedDays >= 3) {
    S.ankiNewPaused = true;
    S.ankiAutoPausedOn = today;
    saveLocalOnly();
  }
}

// ── SESSION STATE ─────────────────────────────
let ankiSession = null; // { deckIds, reviewQueue, newQueue, stats }
let ankiCurrent = null;
let ankiShowingAnswer = false;
let _ankiWaitTimer = null;

function selectedAnkiDeckIds() {
  return [...selectedIds].filter(id => isAnkiDeck(id));
}

function startAnki() {
  clearTimeout(_ankiWaitTimer);
  const deckIds = selectedAnkiDeckIds();
  if (!deckIds.length) { backToMenu(); return; }
  const today = ankiToday();

  const reviewQueue = [], newQueue = [];
  ankiScopeWords(deckIds).forEach(w => {
    const ws = S.words[w.deckId + "_" + w.idx];
    const a = ws && ws.anki;
    if (!a || a.phase === "new") newQueue.push(w); // deck order — fixed path
    else if (a.phase === "review" && a.due <= today) reviewQueue.push(w);
  });
  shuffle(reviewQueue);

  ankiSession = {
    deckIds,
    reviewQueue,
    newQueue,
    stats: { again: 0, hard: 0, good: 0, easy: 0 },
  };
  ankiShowingAnswer = false;
  showGameScreen();
  ankiNextCard();
}

// Pick the next card exactly like Anki: due learning cards first, then
// due reviews, then new cards (while quota lasts), then learning cards
// up to the learn-ahead window. Nothing left → the day is done.
function ankiPickNext() {
  const now = Date.now();
  const s = ankiSession;

  // Learning/relearning cards, earliest due first
  const learning = [];
  ankiScopeWords(s.deckIds).forEach(w => {
    const ws = S.words[w.deckId + "_" + w.idx];
    const a = ws && ws.anki;
    if (a && (a.phase === "learning" || a.phase === "relearning")) learning.push({ w, due: a.due });
  });
  learning.sort((x, y) => x.due - y.due);

  const dueNow = learning.find(l => l.due <= now);
  if (dueNow) return dueNow.w;

  if (s.reviewQueue.length) return s.reviewQueue.shift();

  if (ankiIntroducedToday() < ankiEffectiveNewPerDay() && s.newQueue.length) return s.newQueue.shift();

  // Learn-ahead: show a not-quite-due learning card rather than idle
  const ahead = learning.find(l => l.due <= now + ANKI.LEARN_AHEAD_MIN * 60000);
  if (ahead) return ahead.w;

  if (learning.length) return { _waitUntil: learning[0].due }; // shouldn't happen with ≤10m steps
  return null;
}

function ankiNextCard() {
  const next = ankiPickNext();
  if (next === null) { renderAnkiDone(); return; }
  if (next._waitUntil) { renderAnkiWaiting(next._waitUntil); return; }
  ankiCurrent = next;
  ankiShowingAnswer = false;
  renderAnkiQuestion();
}

function ankiReveal() {
  ankiShowingAnswer = true;
  const word = ankiCurrent;
  const toSpeak = word.examples && word.examples.length ? word.examples[0][WORD_KEY] : word[WORD_KEY];
  speak(toSpeak);
  renderAnkiAnswer();
}

function ankiRate(rating) {
  const word = ankiCurrent;
  const ws = getWS(word.deckId, word.idx);
  ws.anki = ankiAnswer(ws.anki, rating);
  S.ankiLastActiveDay = ankiToday(); // inactivity tracking for auto-pause

  const labels = ["again", "hard", "good", "easy"];
  ankiSession.stats[labels[rating]]++;

  const xpMap = [0, 2, 4, 8];
  if (xpMap[rating] > 0) addExp(xpMap[rating]);

  saveState();
  ankiNextCard();
}

function showGameScreen() {
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("groups-container").style.display = "none";
  document.getElementById("start-bar").style.display = "none";
  document.getElementById("exp-bar").style.display = "none";
}

// ── RENDER ────────────────────────────────────
function ankiPhaseBadge(a) {
  if (a.phase === "review")     return `<span class="anki-badge review">review</span>`;
  if (a.phase === "relearning") return `<span class="anki-badge learning">relearning</span>`;
  if (a.phase === "learning")   return `<span class="anki-badge learning">learning</span>`;
  return `<span class="anki-badge new">new</span>`;
}

// Anki's signature count bar: blue new · orange learning · green due.
// Derived from card state, so the unrated current card is still counted
// in its own column — exactly like the real app.
function ankiCountBar() {
  const c = ankiCounts(ankiSession.deckIds);
  return `<div class="anki-counts">
    <span class="anki-count new">${c.newCount}</span>
    <span class="anki-count learning">${c.learning}</span>
    <span class="anki-count review">${c.review}</span>
  </div>`;
}

function ankiHeaderHtml() {
  return `
    <div class="screen-top">
      <div class="screen-label">🃏 Anki</div>
      <button class="back-btn" onclick="backToMenu()">← Menu</button>
    </div>
    ${ankiCountBar()}`;
}

function renderAnkiQuestion() {
  const el = document.getElementById("main-screen");
  const word = ankiCurrent;
  const ws = getWS(word.deckId, word.idx);
  const hasExample = word.examples && word.examples.length;
  const exSentence = hasExample ? word.examples[0][WORD_KEY] : null;

  el.innerHTML = `
    <div class="screen">
      ${ankiHeaderHtml()}
      <div class="anki-phase-row">${ankiPhaseBadge(ws.anki)}${ws.anki.leech ? ` <span class="anki-badge leech">⚠️ leech</span>` : ""}</div>
      <div class="anki-word-header">
        <div class="anki-word-main">${word[WORD_KEY]}</div>
        ${word.hint ? `<div class="anki-word-hint">${word.hint}</div>` : ""}
      </div>
      ${hasExample
        ? `<div class="anki-example-q">
            <div class="anki-example-sentence">${exSentence}</div>
            <button class="anki-example-play" onclick="speak('${exSentence.replace(/'/g,"\\'")}')">🔊</button>
           </div>`
        : `<div style="text-align:center;padding:1.5rem 0;color:var(--text-2);font-size:16px;">${word.en}</div>`}
      <button class="anki-reveal-btn" onclick="ankiReveal()">Show Answer</button>
      <div class="anki-session-bar">
        <span class="anki-stat again">✗ ${ankiSession.stats.again}</span>
        <span class="anki-stat hard">~ ${ankiSession.stats.hard}</span>
        <span class="anki-stat good">✓ ${ankiSession.stats.good}</span>
        <span class="anki-stat easy">⚡ ${ankiSession.stats.easy}</span>
      </div>
    </div>`;

  setTimeout(() => speak(hasExample ? exSentence : word[WORD_KEY]), 350);
}

function renderAnkiAnswer() {
  const el = document.getElementById("main-screen");
  const word = ankiCurrent;
  const ws = getWS(word.deckId, word.idx);
  const previews = [0, 1, 2, 3].map(r => ankiPreviewLabel(ws.anki, r));
  const hasExample = word.examples && word.examples.length;
  const exSentence = hasExample ? word.examples[0][WORD_KEY] : null;
  const exEn = hasExample ? word.examples[0].en : null;

  el.innerHTML = `
    <div class="screen">
      ${ankiHeaderHtml()}
      <div class="anki-phase-row">${ankiPhaseBadge(ws.anki)}${ws.anki.leech ? ` <span class="anki-badge leech">⚠️ leech</span>` : ""}</div>
      <div class="anki-word-header">
        <div class="anki-word-main">${word[WORD_KEY]}</div>
        ${word.hint ? `<div class="anki-word-hint">${word.hint}</div>` : ""}
      </div>
      ${hasExample
        ? `<div class="anki-example-q">
            <div class="anki-example-sentence">${exSentence}</div>
            <button class="anki-example-play" onclick="speak('${exSentence.replace(/'/g,"\\'")}')">🔊</button>
           </div>
           <div class="anki-answer-en">
             <div class="anki-answer-en-sentence">${exEn}</div>
             <div class="anki-answer-en-word">— ${word.en}</div>
           </div>`
        : `<div class="anki-answer-reveal">
            <div class="anki-answer-word">${word[WORD_KEY]}
              <button class="audio-btn" style="font-size:14px;padding:4px 8px;margin-left:8px;" onclick="speak('${word[WORD_KEY].replace(/'/g,"\\'")}')">🔊</button>
            </div>
            ${word.pl ? `<div style="font-size:13px;color:var(--text-3);margin-top:4px;">plural: ${word.pl}</div>` : ""}
           </div>`}
      <div class="anki-rating-row">
        <button class="anki-rate-btn again" onclick="ankiRate(0)">
          <span class="anki-rate-label">Again</span>
          <span class="anki-rate-interval">${previews[0]}</span>
        </button>
        <button class="anki-rate-btn hard" onclick="ankiRate(1)">
          <span class="anki-rate-label">Hard</span>
          <span class="anki-rate-interval">${previews[1]}</span>
        </button>
        <button class="anki-rate-btn good" onclick="ankiRate(2)">
          <span class="anki-rate-label">Good</span>
          <span class="anki-rate-interval">${previews[2]}</span>
        </button>
        <button class="anki-rate-btn easy" onclick="ankiRate(3)">
          <span class="anki-rate-label">Easy</span>
          <span class="anki-rate-interval">${previews[3]}</span>
        </button>
      </div>
      <div class="anki-session-bar">
        <span class="anki-stat again">✗ ${ankiSession.stats.again}</span>
        <span class="anki-stat hard">~ ${ankiSession.stats.hard}</span>
        <span class="anki-stat good">✓ ${ankiSession.stats.good}</span>
        <span class="anki-stat easy">⚡ ${ankiSession.stats.easy}</span>
      </div>
    </div>`;
}

// Rare fallback: a learning card is due beyond the learn-ahead window.
function renderAnkiWaiting(dueAt) {
  const mins = Math.max(1, Math.ceil((dueAt - Date.now()) / 60000));
  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      ${ankiHeaderHtml()}
      <div class="result-screen">
        <div class="result-emoji">⏳</div>
        <div class="result-title">Next card in ${mins} min</div>
        <div style="font-size:13px;color:var(--text-3);margin-top:8px;">A learning card is still cooling down.</div>
        <button class="result-btn" onclick="backToMenu()">← Back to menu</button>
      </div>
    </div>`;
  clearTimeout(_ankiWaitTimer);
  _ankiWaitTimer = setTimeout(() => {
    if (document.getElementById("main-screen").style.display !== "none") ankiNextCard();
  }, Math.min(dueAt - Date.now() + 500, 60000));
}

// ── DONE-FOR-TODAY SCREEN ─────────────────────
// The hard stop. Shows what was cleared and exactly what tomorrow costs.
function renderAnkiDone() {
  const stats = ankiSession ? ankiSession.stats : { again: 0, hard: 0, good: 0, easy: 0 };
  const total = stats.again + stats.hard + stats.good + stats.easy;
  const deckIds = ankiSession ? ankiSession.deckIds : selectedAnkiDeckIds();

  if (total > 0) {
    S.ankiSessions = (S.ankiSessions || 0) + 1;
    addExp(25);
    confettiBurst(36);
    checkAchievements({ type: "anki_complete" });
    saveState();
  }

  const f = ankiForecastData(deckIds, 2)[1]; // tomorrow
  const tomorrowLabel = f
    ? `Tomorrow you'll owe <strong>${f.total}</strong> cards: ${f.reviews + f.projected} review${f.reviews + f.projected !== 1 ? "s" : ""} + ${f.news} new`
    : "";

  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="result-screen">
        <div class="result-emoji">✅</div>
        <div class="result-title">${total > 0 ? "Debt cleared — done for today!" : "Nothing owed today"}</div>
        ${total > 0 ? `
        <div class="anki-summary-stats">
          <span class="anki-stat again">✗ Again: ${stats.again}</span>
          <span class="anki-stat hard">~ Hard: ${stats.hard}</span>
          <span class="anki-stat good">✓ Good: ${stats.good}</span>
          <span class="anki-stat easy">⚡ Easy: ${stats.easy}</span>
        </div>
        <div style="font-size:13px;color:#1D9E75;font-weight:600;margin-top:8px;">+25 XP session bonus</div>` : ""}
        <div style="font-size:13px;color:var(--text-2);margin-top:1rem;">${tomorrowLabel}</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:6px;">New day starts at ${ANKI.ROLLOVER_HOUR}:00 AM.</div>
        <button class="result-btn" onclick="renderAnkiForecast()">📅 See my next days</button>
        <button class="result-btn" style="margin-top:8px;" onclick="backToMenu()">← Back to menu</button>
      </div>
    </div>`;
  ankiSession = null;
}

// ── FORECAST ──────────────────────────────────
// Deterministic day-by-day simulation of the debt: no fuzz means the
// already-scheduled reviews are exact; everything further out assumes
// you clear your debt daily and rate Good — the stable path.
// Each day: { date, reviews (scheduled now), projected (from future
// graduations/reviews), learning (today only), news, total }.
function ankiForecastData(deckIds, horizon) {
  const today = ankiToday();
  const perDay = ankiEffectiveNewPerDay(); // 0 while paused — forecast assumes the pause holds
  const introducedToday = ankiIntroducedToday();

  const sim = []; // { due: dayOffset, interval, ease, scheduled }
  let unseen = 0, learningNow = 0;
  ankiScopeWords(deckIds).forEach(w => {
    const ws = S.words[w.deckId + "_" + w.idx];
    const a = ws && ws.anki;
    if (!a || a.phase === "new") { unseen++; return; }
    if (a.phase === "learning" || a.phase === "relearning") {
      learningNow++; // owed today; graduates to a 1-day interval
      sim.push({ due: 1, interval: 1, ease: a.ease, scheduled: false });
    } else {
      sim.push({
        due: a.due <= today ? 0 : daysBetween(today, a.due),
        interval: a.interval, ease: a.ease, scheduled: true,
      });
    }
  });

  let unseenLeft = unseen;
  const days = [];
  for (let d = 0; d < horizon; d++) {
    const quota = d === 0 ? Math.max(0, perDay - introducedToday) : perDay;
    const news = Math.min(unseenLeft, quota);
    unseenLeft -= news;

    let reviews = 0, projected = 0;
    sim.forEach(c => {
      if (c.due !== d) return;
      if (c.scheduled) reviews++; else projected++;
      // advance the card assuming a Good rating
      const next = Math.min(ANKI.MAX_IVL, Math.max(c.interval + 1, Math.round(c.interval * c.ease)));
      c.interval = next;
      c.due = d + next;
      c.scheduled = false;
    });

    // today's new cards graduate onto tomorrow with a 1-day interval
    for (let i = 0; i < news; i++) {
      sim.push({ due: d + 1, interval: 1, ease: ANKI.STARTING_EASE, scheduled: false });
    }

    const learning = d === 0 ? learningNow : 0;
    days.push({
      date: addDays(today, d),
      reviews, projected, learning, news,
      total: reviews + projected + learning + news,
    });
  }
  return days;
}
