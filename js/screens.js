// ── RENDER GROUPS ─────────────────────────────
// Cards only animate in when their dropdown is opened; re-renders
// caused by selecting decks must not replay the entrance animation.
let justOpenedGroupId = null;
function toggleGroup(id) {
  if (openGroups.has(id)) {
    openGroups.delete(id);
    deselectGroupDecks(id);
  } else {
    openGroups.add(id);
    justOpenedGroupId = id;
  }
  renderGroups();
  renderStartBar();
}

// Closing a folder withdraws its decks from the selection: the start
// bar only ever reflects decks the user can currently see, so a session
// can never silently include decks hidden inside a collapsed folder.
// Selections in other (still open) folders are untouched; when nothing
// remains selected, renderStartBar removes the island entirely.
function deselectGroupDecks(groupId) {
  const group = ALL_GROUPS.find(g => g.id === groupId);
  if (!group) return;
  let changed = false;
  group.decks.forEach(d => { if (selectedIds.delete(d.id)) changed = true; });
  if (!changed) return;
  // Keep the mode coherent with whatever selection survives.
  const type = selectionType();
  if (type === "anki") activeMode = "anki";
  else if (type === "vocab" && activeMode === "anki") activeMode = "drill";
}
// Anki and Vocab decks are separate systems: selecting one type clears
// any selection of the other, and the mode follows the deck type.
function toggleDeck(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    const t = deckType(id);
    if ([...selectedIds].some(x => deckType(x) !== t)) selectedIds.clear();
    selectedIds.add(id);
  }
  const type = selectionType();
  if (type === "anki") activeMode = "anki";
  else if (activeMode === "anki") activeMode = "drill";
  renderGroups(); renderStartBar();
}
function renderGroups() {
  document.getElementById("groups-container").innerHTML = ALL_GROUPS.map(group => {
    const isOpen       = openGroups.has(group.id);
    const totalWords   = group.decks.reduce((s,d) => s + d.words.length, 0);
    const anki         = isAnkiGroup(group);
    const decksHtml = group.decks.map(deck => {
      const sel = selectedIds.has(deck.id);
      if (anki) {
        // Anki deck card: the official new/learning/due triple + progress
        const c = ankiCounts([deck.id]);
        const introduced = deck.words.length - c.unseen;
        const pct = deck.words.length ? Math.round((introduced / deck.words.length) * 100) : 0;
        return `<div class="folder-card anki-deck ${sel?"selected":""}" onclick="toggleDeck('${deck.id}')">
          <div class="folder-check">✓</div>
          <div class="folder-icon">${deck.icon}</div>
          <div class="folder-name">${deck.name}</div>
          <div class="anki-counts small">
            <span class="anki-count new" title="new today">${c.newCount}</span>
            <span class="anki-count learning" title="learning">${c.learning}</span>
            <span class="anki-count review" title="reviews due">${c.review}</span>
          </div>
          <div class="folder-unlock">${introduced}/${deck.words.length} introduced</div>
          <div class="progress-bar"><div class="progress-fill" style="background:linear-gradient(90deg,#7C5CBF,#B39DDB);width:${pct}%"></div></div>
        </div>`;
      }
      const { mastered, masteryPlus, total, all } = deckProgress(deck);
      const pct      = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const unlocked = getUnlocked(deck.id);
      return `<div class="folder-card ${sel?"selected":""}" onclick="toggleDeck('${deck.id}')">
        <div class="folder-check">✓</div>
        <div class="folder-icon">${deck.icon}</div>
        <div class="folder-name">${deck.name}</div>
        <div class="folder-meta">${mastered}/${total} mastered</div>
        <div class="folder-unlock">${unlocked}/${all} unlocked</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-bar" style="margin-top:3px;"><div class="progress-fill" style="background:linear-gradient(90deg,#7C5CBF,#B39DDB);width:${Math.round((masteryPlus/total)*100)||0}%"></div></div>
        <div style="font-size:10px;color:#7C5CBF;margin-top:2px;">${masteryPlus} ⭐</div>
      </div>`;
    }).join("");
    const meta = anki
      ? (() => { const c = ankiCounts(group.decks.map(d => d.id));
          return `🃏 Anki · ${totalWords} words · owed today: ${c.newCount + c.learning + c.review}${S.ankiNewPaused ? " · ⏸ new paused" : ""}`; })()
      : `${group.decks.length} deck${group.decks.length!==1?"s":""} · ${totalWords} words · ${group.decks.reduce((s,d) => s + deckProgress(d).mastered, 0)} mastered`;
    return `<div class="group">
      <div class="group-header" onclick="toggleGroup('${group.id}')">
        <span class="group-icon">${group.icon}</span>
        <span class="group-name">${group.name}</span>
        <span class="group-meta">${meta}</span>
        <span class="group-chevron ${isOpen?"open":""}">▶</span>
      </div>
      <div class="group-decks ${isOpen?"":"collapsed"}${group.id === justOpenedGroupId ? " just-opened" : ""}">${decksHtml}</div>
    </div>`;
  }).join("");
  justOpenedGroupId = null;
}

// ── START BAR ─────────────────────────────────
function renderStartBar() {
  let island = document.getElementById("floating-island");
  if (selectedIds.size === 0) {
    if (island) island.remove();
    const spacer = document.getElementById("island-spacer");
    if (spacer) spacer.remove();
    return;
  }
  if (!island) {
    island = document.createElement("div");
    island.id = "floating-island";
    document.body.appendChild(island);
    let spacer = document.getElementById("island-spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "island-spacer";
      document.querySelector(".app").appendChild(spacer);
    }
  }
  const modeLabels = { learn:"👁 Learn", drill:"📖 Drill", timer:"⏱ Timer", games:"🎮 Games" };
  const names = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(", ");

  // Anki selection: no modes to pick — you owe what you owe, then stop.
  if (selectionType() === "anki") {
    const ids = selectedAnkiDeckIds();
    const c = ankiCounts(ids);
    const owed = c.newCount + c.learning + c.review;
    const f = ankiForecastData(ids, 2)[1];
    island.innerHTML = `
      <div class="fi-summary">
        <span class="fi-count">🃏 <strong>Anki</strong> · ${selectedIds.size} deck${selectedIds.size !== 1 ? "s" : ""}</span>
        <span class="fi-names">${names}</span>
      </div>
      <div class="fi-owed">
        ${owed > 0 ? `
          <div class="fi-owed-title">You owe <strong>${owed}</strong> card${owed !== 1 ? "s" : ""} today</div>
          <div class="anki-counts">
            <span class="anki-count new">${c.newCount} new</span>
            <span class="anki-count learning">${c.learning} learning</span>
            <span class="anki-count review">${c.review} due</span>
          </div>`
        : `
          <div class="fi-owed-title done">✓ Done for today — nothing owed</div>
          <div class="fi-owed-sub">Tomorrow: ${f.total} cards (${f.reviews + f.projected} reviews + ${f.news} new)</div>`}
        ${S.ankiNewPaused ? `
          <div class="fi-paused">⏸ New words paused${S.ankiAutoPausedOn ? " automatically after 3 missed days" : ""} — reviews only</div>` : ""}
      </div>
      <div class="fi-modes" style="margin-top:6px;">
        <button class="fi-pill" onclick="showScreen('forecast')">📅 Forecast</button>
        <button class="fi-pill" onclick="openGamesHub(selectedAnkiDeckIds())">🎮 Games</button>
        <button class="fi-pill ${S.ankiNewPaused ? "active" : ""}" onclick="toggleAnkiPause()">${S.ankiNewPaused ? "▶ Resume new words" : "⏸ Pause new words"}</button>
      </div>
      ${owed > 0
        ? `<button class="fi-start" onclick="startSession()">Start ▶</button>`
        : `<button class="fi-start fi-start-done" onclick="startSession()">✓ Done for today</button>`}`;
    requestAnimationFrame(() => {
      const spacer = document.getElementById("island-spacer");
      if (spacer) spacer.style.height = (island.offsetHeight + 32) + "px";
    });
    return;
  }

  const isFocusMode = (activeMode === "drill" && drillSubMode === "focus") || (activeMode === "timer" && timerSubMode === "focus");
  const totalWords = [...selectedIds].reduce((s, id) => {
    const d = getDeck(id);
    if (!d) return s;
    if (isFocusMode) {
      const unmastered = unlockedWords(d).filter((w, i) => !isMastered(getWS(id, i))).length;
      return s + (unmastered > 0 ? unmastered : getUnlocked(id));
    }
    return s + getUnlocked(id);
  }, 0);
  island.innerHTML = `
    <div class="fi-summary">
      <span class="fi-count"><strong>${selectedIds.size}</strong> deck${selectedIds.size !== 1 ? "s" : ""} · <strong>${totalWords}</strong> words</span>
      <span class="fi-names">${names}</span>
    </div>
    <div class="fi-modes">
      ${["learn","drill","timer","games"].map(m =>
        `<button class="fi-pill ${activeMode === m ? "active" : ""}" onclick="setMode('${m}')">${modeLabels[m]}</button>`
      ).join("")}
    </div>
    ${activeMode === "drill" ? `
    <div class="fi-modes" style="margin-top:6px;">
      ${["classic","focus","refresh"].map(s =>
        `<button class="fi-pill ${drillSubMode === s ? "active" : ""}" onclick="setDrillSubMode('${s}')">${s[0].toUpperCase()+s.slice(1)}</button>`
      ).join("")}
      <button class="fi-pill ${voiceEnabled ? "active" : ""}" onclick="toggleVoice()">🎙️ Voice</button>
    </div>` : ""}
    ${activeMode === "timer" ? `
    <div class="fi-modes" style="margin-top:6px;">
      ${["classic","focus"].map(s =>
        `<button class="fi-pill ${timerSubMode === s ? "active" : ""}" onclick="setTimerSubMode('${s}')">${s[0].toUpperCase()+s.slice(1)}</button>`
      ).join("")}
      <button class="fi-pill ${voiceEnabled ? "active" : ""}" onclick="toggleVoice()">🎙️ Voice</button>
    </div>
    <div class="fi-modes" style="margin-top:6px;">
      <span style="font-size:11px;color:var(--text-3);align-self:center;">Words:</span>
      ${[10,25,50].map(n =>
        `<button class="fi-pill ${timerWordCount === n ? "active" : ""}" onclick="setTimerCount(${n})">${n}</button>`
      ).join("")}
    </div>` : ""}
    ${activeMode === "games" ? `
    <div class="fi-owed-sub" style="margin:-2px 0 10px;text-align:center;">Minigames with every unlocked word in these decks</div>` : ""}
    <button class="fi-start" onclick="startSession()">${activeMode === "games" ? "Open games ▶" : "Start ▶"}</button>`;
    requestAnimationFrame(() => {
    const spacer = document.getElementById("island-spacer");
    if (spacer) spacer.style.height = (island.offsetHeight + 32) + "px";
  });
}
function setMode(m)       { activeMode = m; renderStartBar(); }
function toggleVoice()    { voiceEnabled = !voiceEnabled; renderStartBar(); }
function setTimerCount(n) { timerWordCount = n; renderStartBar(); }
function setDrillSubMode(s) { drillSubMode = s; renderStartBar(); }
function setTimerSubMode(s) { timerSubMode = s; renderStartBar(); }


// ── STATS SCREEN ──────────────────────────────
function agoLabel(ts) {
  const days = daysBetween(new Date(ts).toLocaleDateString('en-CA'), todayISO());
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`;
}
function renderStatsScreen() {
  let html = `<div class="screen">
    <div class="screen-top"><div class="screen-label">Progress</div><button class="back-btn" onclick="renderStatsChoice()">← Back</button></div>
    <div style="text-align:right;margin-bottom:1rem;">
      <button class="danger-outline-btn" onclick="resetAll()">Reset all progress</button>
    </div>`;
  ALL_GROUPS.forEach(group => {
    if (isAnkiGroup(group)) return; // Anki decks live in the forecast screen
    html += `<div class="stats-section"><div class="stats-section-title">${group.icon} ${group.name}</div>`;
    group.decks.forEach(deck => {
      const { mastered, masteryPlus, total, all } = deckProgress(deck);
      const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const deckKey = `stats-deck-${deck.id}`;
      // Aggregate accuracy / recency / struggle count over unlocked words.
      // Read S.words directly — no getWS, so viewing stats creates nothing.
      let sumC = 0, sumW = 0, lastAt = 0, struggling = 0;
      unlockedWords(deck).forEach((w, i) => {
        const ws = S.words[deck.id + "_" + i];
        if (!ws) return;
        sumC += ws.correct || 0; sumW += ws.wrong || 0;
        if (ws.lastAnsweredAt && ws.lastAnsweredAt > lastAt) lastAt = ws.lastAnsweredAt;
        if (isStruggling(ws)) struggling++;
      });
      const acc = sumC + sumW > 0 ? Math.round(sumC / (sumC + sumW) * 100) + "%" : "—";
      const extra = ` · ${acc} acc · ${lastAt ? agoLabel(lastAt) : "never practiced"}${struggling ? ` · <span class="struggle-count">${struggling} struggling</span>` : ""}`;
      html += `
        <div class="stats-deck-card">
          <div class="stats-deck-head" onclick="toggleStatsDeck('${deck.id}')">
            <div class="stats-deck-title">
              <span style="font-size:14px;">${deck.icon}</span>
              <div>
                <div class="stats-deck-name">${deck.name}</div>
                <div class="stats-deck-meta">${mastered}/${total} mastered · ${masteryPlus} ⭐ · ${pct}% · ${all} total${extra}</div>
              </div>
            </div>
            <div class="stats-deck-actions">
              <button class="mini-btn" onclick="event.stopPropagation();resetDeck('${deck.id}')">Reset</button>
              <span id="chevron-${deck.id}" class="stats-chevron"${_openStatsDecks.has(deck.id) ? ` style="transform:rotate(90deg)"` : ""}>▶</span>
            </div>
          </div>
          <div id="${deckKey}" class="stats-deck-body${_openStatsDecks.has(deck.id) ? " open" : ""}">
            <div class="stats-table-wrap"><table style="margin:0;border-radius:0;">
              <thead><tr><th>English</th><th>Target</th><th>Plural</th><th>✓</th><th>✗</th><th>Stage</th><th></th></tr></thead>
              <tbody>`;
      unlockedWords(deck).forEach((w,i) => {
        const ws = getWS(deck.id, i);
        const st = stageOf(ws) ? `${tierBadgeHtml(ws)} ${pipsHtml(ws)}` : `<span style="color:#bbb">new</span>`;
        html += `<tr><td>${w.en}</td><td style="color:var(--text-2)">${w[WORD_KEY]}</td><td style="color:var(--text-3)">${w.pl||"—"}</td><td>${ws.correct}</td><td>${ws.wrong}</td><td>${st}</td><td><button class="edit-word-btn" onclick="openWordEditor('${deck.id}',${i},renderStatsScreen)" title="Edit word texts">✏️</button></td></tr>`;
      });
      html += `</tbody></table></div></div></div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;
  document.getElementById("main-screen").innerHTML = html;
}

// Open/closed deck state survives re-renders (e.g. after a word edit).
const _openStatsDecks = new Set();
function toggleStatsDeck(deckId) {
  const el = document.getElementById(`stats-deck-${deckId}`);
  const chevron = document.getElementById(`chevron-${deckId}`);
  if (!el) return;
  const isOpen = _openStatsDecks.has(deckId);
  if (isOpen) _openStatsDecks.delete(deckId); else _openStatsDecks.add(deckId);
  el.classList.toggle("open", !isOpen);
  if (chevron) chevron.style.transform = isOpen ? "" : "rotate(90deg)";
}
// ── STATS CHOICE ──────────────────────────────
// 12-week login-activity grid (columns = weeks, Monday-aligned).
function activityGridHtml() {
  const dates = new Set(S.loginDates);
  const todayStr = todayISO();
  const d = new Date(); d.setHours(12, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dow - 77); // back to the Monday 11 weeks ago
  let cols = "";
  for (let wk = 0; wk < 12; wk++) {
    let cells = "";
    for (let i = 0; i < 7; i++) {
      const iso = d.toLocaleDateString('en-CA');
      const cls = iso > todayStr ? "future" : dates.has(iso) ? "on" : "";
      cells += `<div class="cal-cell ${cls}" title="${iso}"></div>`;
      d.setDate(d.getDate() + 1);
    }
    cols += `<div class="cal-col">${cells}</div>`;
  }
  return `<div class="cal-wrap">
    <div class="cal-title">📅 Activity — last 12 weeks</div>
    <div class="cal-grid">${cols}</div>
  </div>`;
}

// Struggling = enough attempts, not mastered, and a Wilson confidence
// score clearly below the mastery bar (see isStruggling in srs.js).
let _showAllStruggling = false;
function toggleStruggling() { _showAllStruggling = !_showAllStruggling; renderStatsChoice(); }
function strugglingListHtml() {
  const items = [];
  ALL_GROUPS.filter(g => !isAnkiGroup(g)).forEach(g => g.decks.forEach(d => {
    unlockedWords(d).forEach((w, i) => {
      const ws = S.words[d.id + "_" + i];
      if (!ws || !isStruggling(ws)) return;
      items.push({ w, ws, score: wilsonLower(ws.correct || 0, (ws.correct || 0) + (ws.wrong || 0)) });
    });
  }));
  if (!items.length) return "";
  items.sort((a, b) => a.score - b.score);
  const shown = _showAllStruggling ? items : items.slice(0, 15);
  const rows = shown.map(it => `<div class="struggle-row">
      <div><span class="struggle-word">${it.w.en}</span> <span class="struggle-target">${it.w[WORD_KEY]}</span></div>
      <div class="struggle-score">✓${it.ws.correct} ✗${it.ws.wrong}</div>
    </div>`).join("");
  const moreBtn = items.length > 15
    ? `<button class="show-more-btn" onclick="toggleStruggling()">${_showAllStruggling ? "Show top 15 only" : `Show all ${items.length}`}</button>`
    : "";
  return `<div class="struggle-wrap">
    <div class="stats-section-title">🎯 Struggling words (${items.length})</div>
    <div class="struggle-list">${rows}</div>
    ${moreBtn}
  </div>`;
}

function renderStatsChoice() {
  const todayWords = S.drillCorrectToday || 0;
  const streak     = getDailyStreak();
  const mastered   = countMastered();
  const level      = currentLevel();
  const daysActive = S.loginDates.length;
  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">Statistics</div>
        <button class="back-btn" onclick="backToMenu()">← Back</button>
      </div>
      <div class="gen-stats-grid">
        <div class="gen-stat-card accent">
          <div class="gen-stat-icon">📚</div>
          <div class="gen-stat-val">${todayWords}</div>
          <div class="gen-stat-label">correct today</div>
        </div>
        <div class="gen-stat-card teal">
          <div class="gen-stat-icon">🔥</div>
          <div class="gen-stat-val">${streak}</div>
          <div class="gen-stat-label">day streak</div>
        </div>
        <div class="gen-stat-card purple">
          <div class="gen-stat-icon">⭐</div>
          <div class="gen-stat-val">${mastered}</div>
          <div class="gen-stat-label">mastered</div>
        </div>
        <div class="gen-stat-card">
          <div class="gen-stat-icon">✓</div>
          <div class="gen-stat-val">${(S.totalCorrect||0).toLocaleString()}</div>
          <div class="gen-stat-label">all-time correct</div>
        </div>
        <div class="gen-stat-card">
          <div class="gen-stat-icon">📅</div>
          <div class="gen-stat-val">${daysActive}</div>
          <div class="gen-stat-label">days active</div>
        </div>
        <div class="gen-stat-card">
          <div class="gen-stat-icon">🎓</div>
          <div class="gen-stat-val">Lv ${level}</div>
          <div class="gen-stat-label">${(S.exp||0).toLocaleString()} XP</div>
        </div>
      </div>
      ${activityGridHtml()}
      ${strugglingListHtml()}
      <div class="stats-choice-row">
        <button class="stats-choice-btn" onclick="renderStatsScreen()">
          <div class="stats-choice-icon">📖</div>
          <div class="stats-choice-label">Classic Stats</div>
          <div class="stats-choice-sub">Mastery · streaks · correct/wrong</div>
        </button>
        ${allAnkiDeckIds().length ? `
        <button class="stats-choice-btn" onclick="renderAnkiForecast()">
          <div class="stats-choice-icon">📅</div>
          <div class="stats-choice-label">Anki Forecast</div>
          <div class="stats-choice-sub">Owed today · next days · intervals</div>
        </button>` : ""}
      </div>
    </div>`;
}

// ── ANKI FORECAST SCREEN ──────────────────────
// The INTP view: exactly what today and every coming day will cost.
// Solid green = reviews already on the calendar. Light purple = projected
// (assumes the debt is cleared daily and every card is rated Good).
// Blue = the daily quota of new words.
function renderAnkiForecast() {
  const today = ankiToday();
  const deckIds = allAnkiDeckIds();
  if (!deckIds.length) { renderStatsChoice(); return; }

  const HORIZON = 14;
  const days = ankiForecastData(deckIds, HORIZON);
  const c = ankiCounts(deckIds);
  const perDay = ankiNewPerDay();

  // Header pills: current state of the whole Anki collection
  let unseen = 0, inReview = 0, leeches = 0;
  ankiScopeWords(deckIds).forEach(w => {
    const ws = S.words[w.deckId + "_" + w.idx];
    const a = ws && ws.anki;
    if (!a || a.phase === "new") unseen++;
    else if (a.phase === "review") inReview++;
    if (a && a.leech) leeches++;
  });
  const effPerDay = ankiEffectiveNewPerDay();
  const daysToFinish = effPerDay > 0 ? Math.ceil(unseen / effPerDay) : 0;
  const finishLabel = unseen === 0
    ? "Every word has been introduced."
    : S.ankiNewPaused
      ? `⏸ New words are paused${S.ankiAutoPausedOn ? " (auto, after 3 missed days)" : ""} — ${unseen} words waiting. Resume to continue introducing.`
      : `At ${perDay} new/day, the last of ${unseen} remaining words is introduced on <strong>${addDays(today, daysToFinish)}</strong>.`;

  const maxTotal = Math.max(...days.map(d => d.total), 1);
  const chartBars = days.map((d, i) => {
    const h = v => Math.round((v / maxTotal) * 100);
    const label = i === 0 ? "today" : i === 1 ? "tmr" : `+${i}d`;
    return `<div class="anki-chart-col" title="${d.date}: ${d.reviews + d.projected} reviews · ${d.learning} learning · ${d.news} new">
      <div class="anki-chart-bar-wrap">
        <div class="anki-chart-bar seg-new" style="height:${h(d.news)}%"></div>
        <div class="anki-chart-bar seg-projected" style="height:${h(d.projected + d.learning)}%"></div>
        <div class="anki-chart-bar seg-review" style="height:${h(d.reviews)}%"></div>
      </div>
      <div class="anki-chart-count">${d.total}</div>
      <div class="anki-chart-label">${label}</div>
    </div>`;
  }).join("");

  const dayRows = days.map((d, i) => {
    const dayName = new Date(d.date + "T12:00").toLocaleDateString("en-US", { weekday: "short" });
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${dayName} ${d.date.slice(5)}`;
    return `<tr${i === 0 ? ' style="font-weight:600;"' : ""}>
      <td>${label}</td>
      <td style="color:var(--teal)">${d.reviews}</td>
      <td style="color:var(--purple)">${d.projected + d.learning}</td>
      <td style="color:#5B8DEF">${d.news}</td>
      <td style="font-weight:600;">${d.total}</td>
    </tr>`;
  }).join("");

  // Per-word detail (every card that has left the new pile)
  let wordRows = "";
  ALL_GROUPS.filter(isAnkiGroup).forEach(g => g.decks.forEach(d => {
    d.words.forEach((w, i) => {
      const ws = S.words[d.id + "_" + i];
      const a = ws && ws.anki;
      if (!a || a.phase === "new") return;
      const dueLabel = a.phase !== "review" ? `<span style="color:var(--accent);font-weight:600;">in session</span>`
        : a.due <= today ? `<span style="color:#c62828;font-weight:600;">due now</span>`
        : daysBetween(today, a.due) === 1 ? "tomorrow"
        : `in ${daysBetween(today, a.due)}d`;
      wordRows += `<tr>
        <td>${w.en}</td>
        <td style="color:var(--text-2)">${w[WORD_KEY]}</td>
        <td>${ankiPhaseBadge(a)}${a.leech ? " ⚠️" : ""}</td>
        <td>${a.phase === "review" ? fmtIvlDays(a.interval) : "—"}</td>
        <td>${dueLabel}</td>
        <td>${Math.round(a.ease * 100)}%</td>
        <td>${a.lapses}</td>
      </tr>`;
    });
  }));

  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">📅 Anki Forecast</div>
        <button class="back-btn" onclick="backToMenu()">← Back</button>
      </div>
      <div class="anki-stats-summary">
        <div class="anki-stats-pill overdue">Owed today: ${c.newCount + c.learning + c.review}</div>
        <div class="anki-stats-pill new">📦 ${unseen} unseen</div>
        <div class="anki-stats-pill review">✅ ${inReview} in review</div>
        ${leeches ? `<div class="anki-stats-pill overdue">⚠️ ${leeches} leech${leeches > 1 ? "es" : ""}</div>` : ""}
      </div>
      <div class="anki-chart-title">Your next ${HORIZON} days</div>
      <div class="anki-chart">${chartBars}</div>
      <div class="anki-chart-legend">
        <span><i class="leg seg-review"></i> scheduled reviews</span>
        <span><i class="leg seg-projected"></i> projected (all Good)</span>
        <span><i class="leg seg-new"></i> new (${S.ankiNewPaused ? "paused" : `${perDay}/day`})</span>
      </div>
      <div style="font-size:13px;color:var(--text-2);margin-top:1rem;text-align:center;">${finishLabel}</div>
      <div class="stats-section-title" style="margin-top:1.5rem;">Day by day</div>
      <div class="stats-table-wrap"><table>
        <thead><tr><th>Day</th><th>Reviews</th><th>Projected</th><th>New</th><th>Total owed</th></tr></thead>
        <tbody>${dayRows}</tbody>
      </table></div>
      ${wordRows ? `
      <div class="stats-section-title" style="margin-top:1.5rem;">Card detail</div>
      <div class="stats-table-wrap"><table>
        <thead><tr><th>English</th><th>Target</th><th>Phase</th><th>Interval</th><th>Due</th><th>Ease</th><th>Lapses</th></tr></thead>
        <tbody>${wordRows}</tbody>
      </table></div>` : `<div style="text-align:center;color:#aaa;margin-top:2rem;font-size:13px;">No cards studied yet — clear your first day to populate the forecast.</div>`}
      <div style="text-align:right;margin-top:1.5rem;">
        <button onclick="resetAnkiProgress()" style="font-size:12px;padding:5px 12px;border:1px solid #7C5CBF;border-radius:6px;background:transparent;color:#7C5CBF;cursor:pointer;">Reset Anki progress</button>
      </div>
    </div>`;
}
function resetAnkiProgress() {
  if (!confirm("Reset all Anki progress? Intervals, phases and the daily quota history will be cleared.")) return;
  Object.keys(S.words).forEach(key => { S.words[key].anki = freshAnki(); });
  saveState();
  renderAnkiForecast();
}

// ── SETTINGS PANEL ────────────────────────────
// Injected here so both language apps share one copy. The sheet is
// re-rendered on every open so dynamic bits (goal, sync, edits) stay
// fresh. A short main page leads to sub-pages; every row says in one
// plain line what it does.
let settingsPage = "main";
const SETTINGS_PAGES = {
  progress: "📈 Progress", plan: "🎯 Study plan", sound: "🔊 Sound & voice",
  games: "🎮 Games", anki: "🃏 Anki", cookie: "🍪 Cookie", account: "☁️ Account & data",
};
function initSettingsPanel() {
  const panel = document.createElement("div");
  panel.id = "settings-panel";
  panel.style.cssText = "display:none;position:fixed;inset:0;z-index:200;";
  document.body.appendChild(panel);
}
function openSettingsPage(p) {
  settingsPage = SETTINGS_PAGES[p] ? p : "main";
  renderSettingsPanel();
  const sheet = document.querySelector("#settings-panel .settings-sheet");
  if (sheet) sheet.scrollTop = 0;
}
// A row that opens a sub-page or a screen.
// No onclick: shown greyed out, for a row with nothing to do right now.
function setNavHtml(icon, label, sub, onclick) {
  return `<button class="settings-item set-nav" ${onclick ? `onclick="${onclick}"` : "disabled"}><span class="set-icon">${icon}</span><span class="set-label">${label}</span>${onclick ? `<span class="set-chev" aria-hidden="true">›</span>` : ""}${sub ? `<span class="settings-sub">${sub}</span>` : ""}</button>`;
}
// An on/off switch row.
function setSwitchHtml(icon, label, sub, on, onclick) {
  return `<button class="settings-item set-switch ${on ? "on" : ""}" role="switch" aria-checked="${!!on}" onclick="${onclick}"><span class="set-icon">${icon}</span><span class="set-label">${label}</span><span class="set-knob" aria-hidden="true"></span>${sub ? `<span class="settings-sub">${sub}</span>` : ""}</button>`;
}
// A setting with a few values: label on top, every value on one line
// below it (equal widths, never wrapping). `auto` replaces the choices
// with a note when something else decides (the finish date).
//   opts: [{ label, on, onclick }]
function setChoiceHtml(icon, label, sub, opts, auto = "") {
  return `<div class="set-choice">
    <div class="set-choice-head"><span class="set-icon">${icon}</span><span class="set-label">${label}</span></div>
    ${auto ? `<div class="set-auto">${auto}</div>` : `<div class="set-seg" role="radiogroup" aria-label="${escapeHtml(label)}">
      ${opts.map(o => `<button class="set-seg-btn ${o.on ? "on" : ""}" role="radio" aria-checked="${!!o.on}" onclick="${o.onclick}">${o.label}</button>`).join("")}
    </div>`}
    ${sub ? `<div class="set-choice-sub">${sub}</div>` : ""}
  </div>`;
}
function renderSettingsPanel() {
  const page = SETTINGS_PAGES[settingsPage] ? settingsPage : "main";
  const body = page === "progress" ? settingsProgressHtml()
    : page === "plan" ? settingsPlanHtml()
    : page === "sound" ? settingsSoundHtml()
    : page === "games" ? settingsGamesHtml()
    : page === "anki" ? settingsAnkiHtml()
    : page === "cookie" ? settingsCookieHtml()
    : page === "account" ? settingsAccountHtml()
    : settingsMainHtml();
  document.getElementById("settings-panel").innerHTML = `
    <div class="settings-overlay" onclick="closeSettings()"></div>
    <div class="settings-sheet" role="dialog" aria-label="Settings">
      <div class="settings-top">
        ${page === "main" ? "" : `<button class="set-back" onclick="openSettingsPage('main')" aria-label="Back to Settings">‹ Back</button>`}
        <div class="settings-title">${page === "main" ? "Settings" : SETTINGS_PAGES[page]}</div>
        <button class="set-close" onclick="closeSettings()" aria-label="Close settings">✕</button>
      </div>
      ${body}
    </div>`;
}
function settingsAccountName() {
  return (typeof currentUser !== "undefined" && currentUser)
    ? (currentUser.displayName || currentUser.email || "Signed in") : "";
}
function settingsMainHtml() {
  const plan = pathEnsurePlan();
  const editCount = Object.keys(S.wordEdits || {}).length;
  const chests = S.quests && S.quests.pending.length;
  const lens = PATH.SESSION_LENGTHS, len = S.path.sessionLen || "regular";
  const planSub = plan
    ? `Finish by ${fmtShortDate(S.path.deadline)} · ${plan.pace} new words today`
    : `${S.path.newPerDay ? S.path.newPerDay + " new words a day" : "New words paused"} · goal ${getDailyGoal()} · ${len[0].toUpperCase() + len.slice(1)} sessions (${lens[len]})`;
  const account = settingsAccountName();
  const cookie = [grandmaOn() && "👵 Grandma mode", speakOn() && "🗣️ Speak, don't spell"].filter(Boolean);
  return `
    ${setNavHtml("📈", "Progress", "Journey map, stats, collection, achievements" + (chests ? ` · <span class='accent'>${chests} chest${chests > 1 ? "s" : ""} to open</span>` : ""), "openSettingsPage('progress')")}
    ${setNavHtml("🎯", "Study plan", planSub, "openSettingsPage('plan')")}
    ${setNavHtml("🔊", "Sound & voice", soundSummary(), "openSettingsPage('sound')")}
    ${setNavHtml("🎮", "Games", "Surprise rounds and random twists", "openSettingsPage('games')")}
    ${allAnkiDeckIds().length ? setNavHtml("🃏", "Anki", `${ankiNewPerDay()} new cards a day${S.ankiNewPaused ? " · new cards paused" : ""}`, "openSettingsPage('anki')") : ""}
    ${setNavHtml("🍪", "Cookie", cookie.length ? `<span class='accent'>On: ${cookie.join(" · ")}</span>` : "Grandma mode, speak don't spell, skip a level", "openSettingsPage('cookie')")}
    ${setNavHtml("✏️", `My word edits${editCount ? ` (${editCount})` : ""}`, "Words whose text you corrected", "closeSettings();showScreen('edits')")}
    ${setNavHtml("☁️", "Account & data", account ? `Signed in as ${escapeHtml(account)}` : "Not signed in — progress is saved on this device only", "openSettingsPage('account')")}`;
}
// 🍪 The ways of using the app that change it the most.
function settingsCookieHtml() {
  const sk = skipLevelInfo();
  return `
    ${setSwitchHtml("👵", "Grandma mode", "Big buttons, no fuss: just Start, your quests and games. Your grandchildren will be proud.", grandmaOn(), "toggleGrandma()")}
    ${setSwitchHtml("🗣️", "Speak, don't spell", "For speaking, not writing: say each answer out loud, tap Show, hear it and grade yourself. Words still climb all the way to 💎. Spelling games and quests are left out.", speakOn(), "toggleSpeakMode()")}
    ${sk ? setNavHtml("⏭️", `Skip ${escapeHtml(sk.name)}`, `Already know ${escapeHtml(sk.name)}? Its ${sk.lift} word${sk.lift === 1 ? "" : "s"} below ⭐ Strong become Strong and you move straight on to ${escapeHtml(sk.next || "the next level")}.`, "confirmSkipLevel()")
      : setNavHtml("⏭️", "Skip a level", "Nothing left to skip — every level is ⭐ Strong or better.", "")}`;
}
function settingsProgressHtml() {
  const chests = S.quests && S.quests.pending.length;
  return `
    ${setNavHtml("🗺️", "Journey", "The completion map: every level and deck", "closeSettings();showScreen('journey')")}
    ${setNavHtml("📊", "Stats &amp; progress", "Activity, words you struggle with, per-deck detail", "closeSettings();showScreen('stats')")}
    ${setNavHtml("🎨", "Collection", chests ? `<span class='accent'>${chests} chest${chests > 1 ? "s" : ""} to open</span>` : "What your chests gave you", "closeSettings();showScreen('collection')")}
    ${setNavHtml("🏆", "Achievements", "Badges and their levels", "closeSettings();showScreen('badges')")}`;
}
function settingsPlanHtml() {
  const goal = getDailyGoal();
  const plan = pathEnsurePlan();
  const len = S.path.sessionLen || "regular";
  return `
    ${deadlineSettingsHtml()}
    ${setChoiceHtml("🌱", "New words a day", "How many new words Start brings in each day. Off = reviews only.",
      PATH.NEW_PER_DAY_OPTIONS.map(n => ({ label: n === 0 ? "Off" : n, on: S.path.newPerDay === n, onclick: `setPathNewPerDay(${n});renderSettingsPanel()` })),
      plan ? `Auto · ${plan.pace} today — set by your finish date` : "")}
    ${setChoiceHtml("🎯", "Daily goal", "Right answers a day — your 4 quests add up to it.",
      GOAL_OPTIONS.map(n => ({ label: n, on: goal === n, onclick: `setDailyGoal(${n})` })),
      plan ? `Auto · ${plan.goal} today — set by your finish date` : "")}
    ${setChoiceHtml("⏱️", "Session length", "Questions per Start. Also on the Today card.",
      Object.entries(PATH.SESSION_LENGTHS).map(([k, n]) => ({ label: `${k[0].toUpperCase() + k.slice(1)} <small>${n}</small>`, on: k === len, onclick: `setSessionLen('${k}');renderSettingsPanel()` })))}`;
}
// One short line for the main page: what is actually on right now.
function soundSummary() {
  if (quietActive()) return "🔇 Muted until tomorrow";
  const on = [SOUND.tts && "sound on", SOUND.vibe && hasVibration() && "vibration"].filter(Boolean);
  const mic = S.path.voiceInput ? " · mic on" : "";
  return (on.length ? on.join(", ")[0].toUpperCase() + on.join(", ").slice(1) : "All sound off") + mic;
}
function hasVibration() { return typeof navigator.vibrate === "function"; }
function settingsSoundHtml() {
  const quiet = quietActive();
  return `
    ${quiet ? `<div class="set-note">🔇 <strong>Muted until tomorrow.</strong> Everything below stays silent until the day rolls over (4 AM), whatever the switches say. <button class="goal-pick" onclick="toggleQuiet();renderSettingsPanel()">Unmute now</button></div>` : ""}
    <div class="set-group-title">Always on this device</div>
    ${setSwitchHtml("🔊", "Sound", "Words and example sentences read aloud, plus the chime for a right or wrong answer and the sounds in games. Off also hides listening exercises — there would be nothing to hear.", SOUND.tts, "toggleSoundPref('sound')")}
    ${hasVibration() ? setSwitchHtml("📳", "Vibration", "A short buzz on answers and in games.", SOUND.vibe, "toggleSoundPref('vibe')") : ""}
    <div class="set-group-title">Just for today</div>
    ${setSwitchHtml("🔇", "Mute until tomorrow", "Silences everything above — plus the mic and listening exercises — until tomorrow, then switches itself off. Your switches above are not changed. Same as the button on the Today card.", quiet, "toggleQuiet();renderSettingsPanel()")}
    <div class="set-group-title">Microphone (optional)</div>
    ${setSwitchHtml("🎙️", "Answer with the mic", "In Today sessions, say your answer instead of typing it. You can always type. Also the 🎙️ button during a session.", !!S.path.voiceInput, "pathToggleVoice();renderSettingsPanel()")}
    ${setChoiceHtml("🎧", "Speech recognition", "What listens to the mic. <strong>System</strong>: the browser's own — fast, needs internet. <strong>Whisper</strong>: more accurate, works offline, downloads 40 MB once.",
      [{ label: "System", on: voiceEngineChoice === "system", onclick: "setVoiceEngine('system');renderSettingsPanel()" },
       { label: "Whisper", on: voiceEngineChoice === "whisper", onclick: "setVoiceEngine('whisper');renderSettingsPanel()" }])}`;
}
function toggleSoundPref(k) { setSoundPref(k, !(k === "vibe" ? SOUND.vibe : SOUND.tts)); renderSettingsPanel(); }
function settingsGamesHtml() {
  return `
    ${setSwitchHtml("🎁", "Surprise rounds in Drill", `A bonus game every ${SURPRISE_EVERY} correct answers in Library Drill.`, !(S.games && S.games.surprise === false), "toggleSurpriseRounds()")}
    ${setSwitchHtml("🌀", "Random game twists", "Games sometimes start with a twist (golden words, sudden death…). You can always decline one.", !(S.games && S.games.twists === false), "toggleRandomTwists()")}`;
}
function settingsAnkiHtml() {
  return `
    ${setChoiceHtml("🃏", "New cards a day", "Across all your Anki decks.",
      ANKI.NEW_PER_DAY_OPTIONS.map(n => ({ label: n, on: ankiNewPerDay() === n, onclick: `setAnkiNewPerDay(${n})` })))}
    ${setSwitchHtml("⏸", "Pause new Anki cards", "Reviews stay owed; only new cards stop." + (S.ankiNewPaused && S.ankiAutoPausedOn ? " Paused automatically after 3 missed days." : ""), !!S.ankiNewPaused, "toggleAnkiPause()")}`;
}
function settingsAccountHtml() {
  const account = settingsAccountName();
  const lastSaved = S.savedAt ? new Date(S.savedAt).toLocaleString() : "never";
  return `
    ${setNavHtml("👤", account ? `Signed in as ${escapeHtml(account)}` : "Sign in with Google", account ? "Tap to sign out" : "Sync your progress across devices", "handleAuth()")}
    ${setNavHtml("📋", "Copy usage report", "Paste it to Claude for the next improvements", "copyUsageReport()")}
    <div class="settings-sync-line">☁️ Last saved ${lastSaved}</div>`;
}
// Optional finish date: off by default. When set, new words/day and
// the daily goal are worked out each morning and the Core quest becomes
// "Today's plan" — doing the 4 quests keeps you on time.
function deadlineSettingsHtml() {
  const on = pathDeadlineOn();
  const minDate = addDays(studyToday(), 30);
  if (!on) return setSwitchHtml("🗓️", "Finish date", "Optional. Set one and your quests are sized so you finish every word by then.", false, "setDeadlineFromSettings(addDays(studyToday(), 365))");
  const scan = pathScan();
  const st = pathDeadlineStatus(scan);
  const late = !st.ok
    ? `<span>⚠️ Out of reach: even at the maximum pace (${PLAN.MAX_PACE} new words a day) you'd finish around ${fmtShortDate(st.eta)}. Pick a later date to get an honest daily plan.</span>` : "";
  return `<div class="set-choice">
      <div class="set-choice-head"><span class="set-icon">🗓️</span><span class="set-label">Finish everything by</span></div>
      <div class="set-date-row">
        <input type="date" class="settings-date" value="${S.path.deadline}" min="${minDate}" onchange="setDeadlineFromSettings(this.value)" aria-label="Finish date">
        <button class="set-seg-btn" onclick="setDeadlineFromSettings('')">Turn off</button>
      </div>
      <div class="set-choice-sub">Your quests are sized to it — do your 4 quests and you're on time. Missed days are spread over the weeks after.</div>
      ${late ? `<div class="set-choice-sub">${late}</div>` : ""}
    </div>`;
}
function deadlineLineHtml(scan) {
  const d = fmtShortDate(S.path.deadline);
  if (!pathUnmet(scan)) return `🗓️ Every word is met — reviews only from here`;
  if (pathDaysLeft() < 0) return `🗓️ Your finish date (${d}) has passed — pick a new one in ⚙️ Settings whenever you like`;
  const st = pathDeadlineStatus(scan);
  if (!st.ok) return `⚠️ ${d} is out of reach — at the maximum pace (${PLAN.MAX_PACE} new a day) you'd finish around <b>${fmtShortDate(st.eta)}</b>. Pick a later date in ⚙️ Settings`;
  return `🗓️ Quests are sized to finish everything by <b>${d}</b> · ${pathEnsurePlan().pace} new today`;
}
function setDeadlineFromSettings(iso) {
  setPathDeadline(iso);
  if (typeof questPlanChanged === "function") questPlanChanged();
  renderSettingsPanel();
  renderExpBar();
  if (typeof renderHome === "function") renderHome();
}
function setDailyGoal(n) {
  S.dailyGoal = n;
  saveState();
  logEvent("setting", { k: "dailyGoal", v: n });
  renderSettingsPanel();
  renderExpBar();
}
function toggleRandomTwists() {
  S.games.twists = S.games.twists === false;
  saveState();
  logEvent("setting", { k: "twists", v: S.games.twists });
  renderSettingsPanel();
}
function setAnkiNewPerDay(n) {
  S.ankiNewPerDay = n;
  saveState();
  renderSettingsPanel();
  renderGroups();
  renderStartBar();
}
function openSettings(page = "main") {
  if (typeof pauseGame === "function") pauseGame("Paused while Settings were open.");
  settingsPage = SETTINGS_PAGES[page] ? page : "main";
  renderSettingsPanel();
  document.getElementById("settings-panel").style.display = "block";
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "none";
}
function closeSettings() {
  document.getElementById("settings-panel").style.display = "none";
  if (typeof renderHome === "function") renderHome();
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "";
}

// ── HOME: TODAY CARD ──────────────────────────
// The one-tap start: today's quests, what's due, what's new, and a big
// Start button. The deck groups below it are the Library (manual use).
function renderHome() {
  const home = document.getElementById("home");
  if (!home) return;
  if (document.getElementById("main-screen").style.display === "block") return;
  questEnsureToday();
  if (grandmaOn()) { renderGrandmaHome(home); return; }
  const t = pathTodaySummary();
  const Q = S.quests;
  const len = S.path.sessionLen || "regular";
  const streak = questStreak();
  const quiet = quietActive();
  const ankiIds = allAnkiDeckIds();
  const ankiOwed = ankiIds.length && ankiInUse() ? ankiOwedToday(ankiIds) : 0;
  const sg = sagaProgress();
  const banner = t.reason === "autopaused"
    ? `<div class="tc-banner">⏸ New words paused after a few days away — clear some reviews and they resume by themselves. <button class="tc-link" onclick="pathResume();renderHome()">Resume now</button></div>`
    : t.reason === "catchup" ? `<div class="tc-banner">🧹 Catching up first — ${t.overdue} overdue reviews. New words return when the pile is smaller.</div>`
    : t.reason === "slowed" ? `<div class="tc-banner soft">🐢 Fewer new words today while you catch up on ${t.overdue} reviews.</div>` : "";
  const stats = [];
  if (t.fix) stats.push(`<span class="tc-stat warn">🩹 ${t.fix} to fix</span>`);
  stats.push(`<span class="tc-stat">📚 ${t.due} due</span>`);
  stats.push(t.frontier ? `<span class="tc-stat">🌱 ${t.newLeft} new</span>` : `<span class="tc-stat">🏔️ all met</span>`);
  const nothing = !t.due && !t.newLeft;
  home.innerHTML = `
    <div class="today-card" id="today-card">
      <div class="tc-head">
        <div class="tc-title">Today</div>
        ${streak || Q.freezes ? `<div class="tc-streak" title="Days in a row with all quests done">${streak ? `🔥 ${streak}` : ""}${Q.freezes ? ` <span class="tc-freeze" title="Streak freezes">🧊${Q.freezes}</span>` : ""}</div>` : ""}
        <button class="tc-quiet ${quiet ? "on" : ""}" onclick="toggleQuiet()" aria-pressed="${quiet}" title="Silence everything until tomorrow — your sound settings stay as they are">${quiet ? "🔇 Muted until tomorrow" : "🔈 Mute until tomorrow"}</button>
      </div>
      ${banner}
      <div class="tc-stats">${stats.join("")}</div>
      <div class="tc-len" role="radiogroup" aria-label="Session length">
        ${Object.entries(PATH.SESSION_LENGTHS).map(([k, n]) => `<button class="tc-len-btn ${k === len ? "on" : ""}" role="radio" aria-checked="${k === len}" onclick="setSessionLen('${k}')">${k[0].toUpperCase() + k.slice(1)} <small>${n}</small></button>`).join("")}
      </div>
      <button class="tc-start ${nothing ? "calm" : ""}" onclick="startPathSession('${len}'${nothing ? ", { practice: true }" : ""})">${nothing ? "✓ All caught up · extra practice ▶" : "Start ▶"}</button>
      ${(() => { const m = nothing ? [] : questNudges().quests; return m.length ? `<div class="tc-moves">Start moves ${m.length === 1 ? "a quest" : `${m.length} of your quests`} <span>${m.slice(0, 5).map(q => questIcon(q)).join(" ")}</span></div>` : ""; })()}
      <div class="tc-links">
        ${t.due >= 1 ? `<button class="tc-link" onclick="startQuickFive()">5️⃣ Quick Five</button>` : ""}
        ${t.frontier && !t.newLeft && t.reason !== "autopaused" ? `<button class="tc-link" onclick="pathLearnExtra();startPathSession('quick')">🌱 Learn ${PATH.EXTRA_NEW} extra</button>` : ""}
        <button class="tc-link" onclick="openGamesHub(null)">🎮 Games</button>
      </div>
      ${ankiOwed ? `<div class="tc-anki">🃏 Anki: <strong>${ankiOwed}</strong> owed today <button class="tc-link" onclick="runQuestAction('anki')">Start ▶</button></div>` : ""}
      ${questCardsHtml()}
      ${sg && !sg.done ? `<div class="tc-saga">📜 Weekly saga ${sg.idx + 1}/3 · ${escapeHtml(sg.title)} <span>${sg.prog}/${sg.target}</span></div>` : sg && sg.done ? `<div class="tc-saga done">📜 Weekly saga complete ✓</div>` : ""}
    </div>
    ${journeyStripHtml(t.scan)}
    <div class="library-head"><span class="lh-title">📚 Library</span><small>Pick decks yourself — Learn · Drill · Timer · Games</small></div>`;
}
// 👵 Grandma mode: one progress line, Start (with its length), the
// quests, the weekly saga and Games. Everything else waits in ⚙️.
function renderGrandmaHome(home) {
  const t = pathTodaySummary();
  const Q = S.quests;
  const len = S.path.sessionLen || "regular";
  const streak = questStreak();
  const sg = sagaProgress();
  const scan = t.scan;
  const pct = scan.total ? Math.round(scan.known / scan.total * 100) : 0;
  const nothing = !t.due && !t.newLeft;
  const banner = t.reason === "autopaused"
    ? `<div class="tc-banner">⏸ New words paused after a few days away — they come back by themselves. <button class="tc-link" onclick="pathResume();renderHome()">Resume now</button></div>` : "";
  home.innerHTML = `
    <div class="today-card gm-card" id="today-card">
      <div class="gm-progress" role="img" aria-label="${scan.known} of ${scan.total} words known">
        <div class="gm-line"><span>🌳 <b>${scan.known.toLocaleString()}</b> of ${scan.total.toLocaleString()} words known</span>${streak ? `<span class="gm-streak">🔥 ${streak}</span>` : ""}</div>
        <div class="gm-bar"><i style="width:${Math.max(pct, scan.known ? 1 : 0)}%"></i></div>
      </div>
      ${banner}
      <div class="tc-len" role="radiogroup" aria-label="Session length">
        ${Object.entries(PATH.SESSION_LENGTHS).map(([k, n]) => `<button class="tc-len-btn ${k === len ? "on" : ""}" role="radio" aria-checked="${k === len}" onclick="setSessionLen('${k}')">${k[0].toUpperCase() + k.slice(1)} <small>${n}</small></button>`).join("")}
      </div>
      <button class="tc-start gm-start ${nothing ? "calm" : ""}" onclick="startPathSession('${len}'${nothing ? ", { practice: true }" : ""})">${nothing ? "✓ All done · practise more ▶" : "Start ▶"}</button>
      <button class="gm-games" onclick="openGamesHub(null)">🎮 Games</button>
      ${questCardsHtml({ simple: true })}
      ${sg && !sg.done ? `<div class="tc-saga">📜 Weekly saga ${sg.idx + 1}/3 · ${escapeHtml(sg.title)} <span>${sg.prog}/${sg.target}</span></div>` : sg && sg.done ? `<div class="tc-saga done">📜 Weekly saga complete ✓</div>` : ""}
    </div>`;
}
function toggleGrandma() {
  S.prefs.grandma = !S.prefs.grandma;
  saveState();
  logEvent("setting", { k: "grandma", v: S.prefs.grandma });
  applyPrefClasses();
  if (S.prefs.grandma) { selectedIds.clear(); renderStartBar(); }
  renderSettingsPanel();
  renderGroups();
  renderExpBar();
  renderHome();
}
async function confirmSkipLevel() {
  const sk = skipLevelInfo();
  if (!sk) return;
  const ok = await appConfirm({
    title: `Skip ${sk.name}?`,
    body: `All ${sk.lift} ${sk.name} word${sk.lift === 1 ? "" : "s"} below ⭐ Strong become Strong (between 🌳 Known and 💎 Locked in) — including any you learnt today. `
      + `They won't come up in your sessions any more, and Start moves on to new ${sk.next || "words"} right away. `
      + `Games still use them, and you can practise them on purpose in the Library. Today's quests, goal, streak and achievements don't change. This can't be undone.`,
    ok: `Skip ${sk.name}`, cancel: "Cancel", danger: true,
  });
  if (!ok) return;
  const n = skipLevel(sk.id);
  showCelebrateToast("⏭️", `${sk.name} skipped`, `${n} word${n === 1 ? " is" : "s are"} now ⭐ Strong`);
  renderSettingsPanel();
  renderHome();
}
function toggleSpeakMode() {
  S.prefs.speak = !S.prefs.speak;
  saveState();
  logEvent("setting", { k: "speak", v: S.prefs.speak });
  applyPrefClasses();
  if (typeof questSwapForSpeak === "function") questSwapForSpeak();
  renderSettingsPanel();
  renderHome();
}
function setSessionLen(k) { if (!PATH.SESSION_LENGTHS[k]) return; S.path.sessionLen = k; saveState(); renderHome(); }
function onQuietChanged() { renderHome(); }
function journeyStripHtml(scan) {
  const lv = scan.groups.map(g => `<span class="js-lv"><b>${escapeHtml(g.name)}</b> ${g.total ? Math.floor(g.known / g.total * 100) : 0}%</span>`).join("");
  return `<button class="journey-strip" onclick="showScreen('journey')">
      <span class="js-title">🗺️ Journey</span>${lv}
      ${scan.repair ? `<span class="js-lv warn">🩹 ${scan.repair}</span>` : ""}
      <span class="js-go">›</span>
    </button>`;
}


// ── JOURNEY (completion map) ──────────────────
function tierBarHtml(tiers, total, cls = "") {
  if (!total) return `<div class="tier-bar ${cls}"></div>`;
  return `<div class="tier-bar ${cls}" role="img" aria-label="${TIERS.map(t => `${t.name} ${tiers[t.id] || 0}`).join(", ")}">${TIERS.map(t =>
    (tiers[t.id] || 0) ? `<i class="tb-${t.id}" style="width:${(tiers[t.id] / total * 100).toFixed(2)}%"></i>` : "").join("")}</div>`;
}
function renderJourney() {
  showGameScreen();
  const scan = pathScan(true);
  const pct = (a, b) => b ? Math.floor(a / b * 100) : 0;
  const levels = scan.groups.map(g => {
    const eta = pathEta(g);
    const left = [];
    if (g.tiers.new) left.push(`${g.tiers.new} not met`);
    if (g.tiers.learning) left.push(`${g.tiers.learning} learning`);
    if (g.tiers.familiar) left.push(`${g.tiers.familiar} familiar`);
    if (g.repair) left.push(`🩹 ${g.repair} in repair`);
    const crown = g.locked === g.total ? "💎" : g.known === g.total ? "🏆" : "";
    const decks = g.decks.map(d => {
      const dc = d.locked === d.total ? "💎" : d.known === d.total ? "👑" : "";
      const boss = typeof deckBossBadge === "function" ? deckBossBadge(d.id) : "";
      return `<button class="jd-tile ${d.met ? "" : "unmet"}" onclick="renderDeckWords('${d.id}')">
        <span class="jd-icon">${d.icon}</span><span class="jd-name">${escapeHtml(d.name)}</span>
        <span class="jd-crown">${dc}${boss}</span>
        ${tierBarHtml(d.tiers, d.total, "slim")}
        <span class="jd-meta">${d.known}/${d.total} known${d.repair ? ` · 🩹${d.repair}` : ""}</span>
      </button>`;
    }).join("");
    return `<div class="jl">
      <div class="jl-head"><span class="jl-name">${g.icon} ${escapeHtml(g.name)} ${crown}</span>
        <span class="jl-pct">${pct(g.known, g.total)}% known · ${pct(g.locked, g.total)}% 💎</span></div>
      ${tierBarHtml(g.tiers, g.total)}
      <div class="jl-left">${left.length ? "What's left: " + left.join(" · ") : "Every word is at least Known ✓"}</div>
      <div class="jl-eta">${eta.met ? `All met ≈ <b>${fmtShortDate(eta.met)}</b> · ` : ""}${eta.known ? `all Known ≈ <b>${fmtShortDate(eta.known)}</b>` : "all Known ✓"}${eta.locked ? ` · all 💎 ≈ <b>${fmtShortDate(eta.locked)}</b>` : " · all 💎 ✓"}</div>
      <details class="jl-decks" ${g.met > 0 && g.met < g.total ? "open" : ""}><summary>${g.decks.length} decks</summary><div class="jd-grid">${decks}</div></details>
    </div>`;
  }).join("");
  const maxDue = Math.max(1, ...scan.dueByDay);
  const fc = scan.dueByDay.map((n, i) => `<div class="jf-col"><div class="jf-bar" style="height:${Math.round(n / maxDue * 100)}%"></div><div class="jf-n">${n}</div><div class="jf-l">${i === 0 ? "today" : i === 1 ? "tmr" : "+" + i}</div></div>`).join("");
  const coll = typeof collectionsSummaryHtml === "function" ? collectionsSummaryHtml() : "";
  document.getElementById("main-screen").innerHTML = `<div class="screen journey">
    <div class="screen-top"><div class="screen-label">🗺️ Journey</div><button class="back-btn" onclick="backToMenu()">← Back</button></div>
    <div class="jh">
      <div class="jh-big"><b>${scan.known.toLocaleString()}</b> / ${scan.total.toLocaleString()} words Known ✓ <span>${pct(scan.known, scan.total)}%</span></div>
      ${pathDeadlineOn() ? `<div class="jh-plan">${deadlineLineHtml(scan)}</div>` : ""}
      <div class="jh-sub">💎 ${scan.locked.toLocaleString()} locked in · 🌱 ${scan.met.toLocaleString()} met${scan.repair ? ` · 🩹 ${scan.repair} in repair` : ""}${scan.flagged ? ` · ⚠️ ${scan.flagged} flagged` : ""}</div>
      ${tierBarHtml(scan.tiers, scan.total, "big")}
      <div class="tier-legend">${TIERS.map(t => `<span><i class="tb-${t.id}"></i>${t.icon} ${t.name} ${scan.tiers[t.id] || 0}</span>`).join("")}</div>
    </div>
    ${stageGuideHtml()}
    <div class="stats-section-title" style="margin-top:1rem">Reviews coming up</div>
    <div class="jf">${fc}</div>
    ${levels}
    ${coll}
    <div class="journey-links">
      <button class="g-sec-btn" onclick="renderCollection()">🎨 Collection</button>
      <button class="g-sec-btn" onclick="showScreen('badges')">🏆 Achievements</button>
    </div>
  </div>`;
}
// "How does a word move?" — the schedule, in plain words.
function stageGuideHtml() {
  const rows = [
    ["Day 0", "🌱 Meet it", `card · pick it · ${sayOr("type", "say")} it twice, spaced out in the session`],
    ["Day 1 · 3 · 7", "🌱→🌿", `${sayOr("typed", "spoken")} recall each time, just before you'd forget`],
    ["≈ Day 14", "🌳 Known", "the main finish line"],
    ["≈ Day 28", "⭐ Strong", sayOr("sometimes typed into a sentence, or reversed", "sometimes said into a sentence, or heard and explained")],
    ["≈ Day 58", "💎 Locked in", "badge earned"],
    ["+4 mo · +1 yr", "💎 Check-ins", "two quiet checks, then it's done for good"],
  ];
  return `<details class="stage-guide"><summary>ℹ️ How a word moves</summary>
    <div class="sg-rows">${rows.map(r => `<div class="sg-row"><b>${r[0]}</b><span>${r[1]}</span><small>${r[2]}</small></div>`).join("")}</div>
    <div class="p-sub">Every step is a real recall — ≈ 12 in all, more if a word is hard. Gaps adapt per word: ones you answer fast stretch a little; a slip brings the word back tomorrow, shrinks its gaps and, if it keeps slipping, asks for two correct reviews per step. A slip on a 🌳/⭐/💎 word keeps its badge (🩹 repair).</div>
  </details>`;
}
function renderDeckWords(deckId) {
  const d = getDeck(deckId);
  if (!d) return;
  const now = Date.now(), dayStart = studyDayStart(0, now);
  const rows = d.words.map((w, i) => {
    const ws = S.words[d.id + "_" + i];
    const st = ws ? ws.st || 0 : 0;
    const due = !st ? "" : ws.rp ? "🩹 repair" : ws.fl ? "⚠️ check" : ws.lrn ? "now" : st >= STAGE_LOCKED ? "💎" :
      ws.dueAt <= now ? "due" : (() => { const n = Math.round((ws.dueAt - dayStart) / 864e5); return n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${n}d`; })();
    return `<div class="dw-row ${st ? "" : "unmet"}"><div class="dw-en">${escapeHtml(w.en)}</div><div class="dw-de">${st ? colorArticleHtml(w[WORD_KEY]) : `<span class="dw-hidden">not met yet</span>`}</div>
      <div class="dw-pips">${st ? pipsHtml(ws) : ""}</div><div class="dw-due ${due === "due" || due === "now" ? "now" : ""}">${due}</div></div>`;
  }).join("");
  const ds = pathScan().decks[deckId];
  document.getElementById("main-screen").innerHTML = `<div class="screen">
    <div class="screen-top"><div class="screen-label">${d.icon} ${escapeHtml(d.name)}</div><button class="back-btn" onclick="renderJourney()">← Journey</button></div>
    ${ds ? tierBarHtml(ds.tiers, ds.total, "big") : ""}
    <div class="jh-sub" style="margin:8px 0 12px">${ds ? `${ds.known}/${ds.total} known · ${ds.locked} 💎 · ${ds.total - ds.met} not met` : ""}</div>
    ${typeof deckBossRowHtml === "function" ? deckBossRowHtml(deckId) : ""}
    <div class="g-result-actions" style="margin:0 0 12px"><button class="g-sec-btn" onclick="startPathSession(S.path.sessionLen, { focus: 'deck', param: '${deckId}' })">📖 Practise this deck</button></div>
    <div class="dw-list">${rows}</div>
  </div>`;
}

// Collections block on the Journey map.
let _nounTotals = null;
function collectionsSummaryHtml() {
  if (!_nounTotals) {
    let g = 0, p = 0;
    vocabGroups().forEach(gr => gr.decks.forEach(d => d.words.forEach((w, i) => {
      const x = { ...w, deckId: d.id, deckName: d.name, idx: i };
      if (nounParts(x)) g++;
      if (!IS_FRENCH_APP && typeof pluralItem === "function" && pluralItem(x)) p++;
    })));
    _nounTotals = { g, p };
  }
  const C = S.games.collect || {};
  const beaten = Object.values(S.games.bestiary || {}).filter(r => r && r.wins).length;
  const decks = vocabGroups().reduce((s, g) => s + g.decks.length, 0);
  const owned = S.quests ? S.quests.cos.owned.length : 0;
  const totalCos = typeof COSMETICS !== "undefined" ? COSMETICS.filter(c => !c.free).length : 0;
  return `<div class="stats-section-title" style="margin-top:1.4rem">Collections</div>
    <div class="coll-summary">
      <div class="coll-card"><b>${C.g || 0}</b><span>🎨 genders of ${_nounTotals.g} nouns</span></div>
      ${!IS_FRENCH_APP ? `<div class="coll-card"><b>${C.p || 0}</b><span>🔢 plurals of ${_nounTotals.p}</span></div>` : ""}
      <button class="coll-card" onclick="renderBestiary()" style="text-align:left;cursor:pointer;font-family:inherit;color:inherit"><b>${beaten}/${decks}</b><span>📖 deck bosses beaten</span></button>
      <button class="coll-card" onclick="renderCollection()" style="text-align:left;cursor:pointer;font-family:inherit;color:inherit"><b>${owned}/${totalCos}</b><span>🎨 cosmetics</span></button>
    </div>`;
}
