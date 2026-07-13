// ── RENDER GROUPS ─────────────────────────────
// Cards only animate in when their dropdown is opened; re-renders
// caused by selecting decks must not replay the entrance animation.
let justOpenedGroupId = null;
function toggleGroup(id) {
  if (openGroups.has(id)) {
    openGroups.delete(id);
  } else {
    openGroups.add(id);
    justOpenedGroupId = id;
  }
  renderGroups();
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
  const modeLabels = { learn:"👁 Learn", drill:"📖 Drill", timer:"⏱ Timer" };
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
      ${["learn","drill","timer"].map(m =>
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
    <button class="fi-start" onclick="startSession()">Start ▶</button>`;
    requestAnimationFrame(() => {
    const spacer = document.getElementById("island-spacer");
    if (spacer) spacer.style.height = (island.offsetHeight + 32) + "px";
  });
}
function setMode(m)       { activeMode = m; renderStartBar(); }
function toggleVoice()    { voiceEnabled = !voiceEnabled; renderStartBar(); }
function setTimerCount(n) { timerWordCount = n; renderStartBar(); }
function toggleMute() {
  muteEnabled = !muteEnabled;
  localStorage.setItem('gv_mute', muteEnabled);
  const sbtn = document.getElementById('settings-mute-btn');
  if (sbtn) sbtn.textContent = muteEnabled ? '🔇  Sound off' : '🔊  Sound on';
}
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
              <thead><tr><th>English</th><th>Target</th><th>Plural</th><th>✓</th><th>✗</th><th>Streak</th><th></th></tr></thead>
              <tbody>`;
      unlockedWords(deck).forEach((w,i) => {
        const ws = getWS(deck.id, i);
        const st = isMasteryPlus(ws)
          ? `<span class="masteryplus-badge">⭐ ${21 - daysBetween(ws.masteryPlusDate, todayISO())}d</span>`
          : isMastered(ws)
            ? `<span class="mastered-badge">✓</span>`
            : ws.displayStreak > 0
              ? `<span class="streak-badge">${ws.displayStreak}</span>`
              : `<span style="color:#bbb">new</span>`;
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
// re-rendered on every open so dynamic bits (goal, sync, edits) stay fresh.
function initSettingsPanel() {
  const panel = document.createElement("div");
  panel.id = "settings-panel";
  panel.style.cssText = "display:none;position:fixed;inset:0;z-index:200;";
  document.body.appendChild(panel);
}
function renderSettingsPanel() {
  const goal = getDailyGoal();
  const account = (typeof currentUser !== "undefined" && currentUser)
    ? (currentUser.displayName || currentUser.email || "Signed in")
    : "Not signed in";
  const lastSaved = S.savedAt ? new Date(S.savedAt).toLocaleString() : "never";
  const editCount = Object.keys(S.wordEdits || {}).length;
  document.getElementById("settings-panel").innerHTML = `
    <div class="settings-overlay" onclick="closeSettings()"></div>
    <div class="settings-sheet">
      <div class="settings-title">Settings</div>
      <button class="settings-item" onclick="closeSettings();showScreen('stats')">📊&nbsp; Stats &amp; Progress</button>
      <button class="settings-item" onclick="closeSettings();showScreen('badges')">🏆&nbsp; Achievements</button>
      <button class="settings-item" onclick="closeSettings();showScreen('edits')">✏️&nbsp; My word edits${editCount ? ` (${editCount})` : ""}</button>
      <button class="settings-item" id="settings-mute-btn" onclick="toggleMute()">${muteEnabled ? "🔇&nbsp; Sound off" : "🔊&nbsp; Sound on"}</button>
      <button class="settings-item" id="settings-voice-btn" onclick="cycleVoiceEngine()">${voiceEngineSettingLabel()}</button>
      <div class="settings-goal">
        <span class="settings-goal-label">🎯&nbsp; Daily goal</span>
        ${GOAL_OPTIONS.map(n => `<button class="goal-pick ${goal===n?"active":""}" onclick="setDailyGoal(${n})">${n}</button>`).join("")}
      </div>
      ${allAnkiDeckIds().length ? `
      <div class="settings-goal">
        <span class="settings-goal-label">🃏&nbsp; New words/day</span>
        ${ANKI.NEW_PER_DAY_OPTIONS.map(n => `<button class="goal-pick ${ankiNewPerDay()===n?"active":""}" onclick="setAnkiNewPerDay(${n})">${n}</button>`).join("")}
      </div>
      <button class="settings-item" onclick="toggleAnkiPause()">${S.ankiNewPaused
        ? "▶&nbsp; Resume new words" + (S.ankiAutoPausedOn ? " <span style='font-size:11px;color:var(--text-3);'>(auto-paused)</span>" : "")
        : "⏸&nbsp; Pause new words <span style='font-size:11px;color:var(--text-3);'>(reviews stay owed)</span>"}</button>` : ""}
      <div class="settings-sync-line">☁️ ${escapeHtml(account)} · last saved ${lastSaved}</div>
    </div>`;
}
function setDailyGoal(n) {
  S.dailyGoal = n;
  saveState();
  renderSettingsPanel();
  renderExpBar();
}
function setAnkiNewPerDay(n) {
  S.ankiNewPerDay = n;
  saveState();
  renderSettingsPanel();
  renderGroups();
  renderStartBar();
}
function openSettings() {
  renderSettingsPanel();
  document.getElementById("settings-panel").style.display = "block";
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "none";
}
function closeSettings() {
  document.getElementById("settings-panel").style.display = "none";
  const island = document.getElementById("floating-island");
  if (island) island.style.display = "";
}
