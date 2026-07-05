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
function toggleDeck(id)  { selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id); renderGroups(); renderStartBar(); }
function renderGroups() {
  document.getElementById("groups-container").innerHTML = ALL_GROUPS.map(group => {
    const isOpen       = openGroups.has(group.id);
    const totalWords   = group.decks.reduce((s,d) => s + d.words.length, 0);
    const totalMastered = group.decks.reduce((s,d) => s + deckProgress(d).mastered, 0);
    const decksHtml = group.decks.map(deck => {
      const { mastered, masteryPlus, total, all } = deckProgress(deck);
      const pct      = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const sel      = selectedIds.has(deck.id);
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
    return `<div class="group">
      <div class="group-header" onclick="toggleGroup('${group.id}')">
        <span class="group-icon">${group.icon}</span>
        <span class="group-name">${group.name}</span>
        <span class="group-meta">${group.decks.length} deck${group.decks.length!==1?"s":""} · ${totalWords} words · ${totalMastered} mastered</span>
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
  const modeLabels = { learn:"👁 Learn", drill:"📖 Drill", timer:"⏱ Timer", anki:"🃏 Anki" };
  const { due, newCount } = ankiDueCount();
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
  const names = [...selectedIds].map(id => getDeck(id)?.name).filter(Boolean).join(", ");
  const ankiSubtitle = activeMode === "anki"
    ? `<div style="font-size:11px;color:#7C5CBF;font-weight:500;margin-bottom:8px;">${due} due today · ${Math.min(newCount,20)} new available</div>`
    : "";
  island.innerHTML = `
    <div class="fi-summary">
      <span class="fi-count"><strong>${selectedIds.size}</strong> deck${selectedIds.size !== 1 ? "s" : ""} · <strong>${totalWords}</strong> words</span>
      <span class="fi-names">${names}</span>
    </div>
    <div class="fi-modes">
      ${["learn","drill","timer","anki"].map(m =>
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
    ${ankiSubtitle}
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
  ALL_GROUPS.forEach(g => g.decks.forEach(d => {
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
        <button class="stats-choice-btn" onclick="renderAnkiStatsScreen()">
          <div class="stats-choice-icon">🃏</div>
          <div class="stats-choice-label">Anki Stats</div>
          <div class="stats-choice-sub">Intervals · due dates · phases</div>
        </button>
      </div>
    </div>`;
}

// ── ANKI STATS SCREEN ─────────────────────────
function renderAnkiStatsScreen() {
  const today = todayISO();

  // Build upcoming due chart data (next 7 days)
  const dueBuckets = {};
  for (let i = 1; i <= 7; i++) {
    dueBuckets[addDays(today, i)] = 0;
  }
  let totalNew = 0, totalLearning = 0, totalReview = 0, totalOverdue = 0;

  ALL_GROUPS.forEach(g => g.decks.forEach(d => {
    unlockedWords(d).forEach((w, i) => {
      const ws = getWS(d.id, i);
      if (!ws.anki) return;
      const a = ws.anki;
      if (a.phase === "new" && !a.dueDate) { totalNew++; return; }
      if (a.phase === "learning") totalLearning++;
      else if (a.phase === "review") totalReview++;
      if (a.dueDate && a.dueDate <= today) { totalOverdue++; return; }
      if (a.dueDate && dueBuckets[a.dueDate] !== undefined) dueBuckets[a.dueDate]++;
    });
  }));

  const maxBucket = Math.max(...Object.values(dueBuckets), 1);
  const chartBars = Object.entries(dueBuckets).map(([date, count]) => {
    const pct = Math.round((count / maxBucket) * 100);
    const label = daysBetween(today, date) === 1 ? "tmr" : `+${daysBetween(today, date)}d`;
    return `<div class="anki-chart-col">
      <div class="anki-chart-bar-wrap">
        <div class="anki-chart-bar" style="height:${pct}%"></div>
      </div>
      <div class="anki-chart-count">${count}</div>
      <div class="anki-chart-label">${label}</div>
    </div>`;
  }).join("");

  // Per-deck table
  let deckRows = "";
  ALL_GROUPS.forEach(g => g.decks.forEach(d => {
    let dNew = 0, dLearning = 0, dReview = 0, dDue = 0;
    unlockedWords(d).forEach((w, i) => {
      const ws = getWS(d.id, i);
      if (!ws.anki) return;
      const a = ws.anki;
      if (a.phase === "new" && !a.dueDate) dNew++;
      else if (a.phase === "learning") dLearning++;
      else if (a.phase === "review") dReview++;
      if (a.dueDate && a.dueDate <= today) dDue++;
    });
    deckRows += `<tr>
      <td>${d.icon} ${d.name}</td>
      <td><span class="anki-badge new">${dNew}</span></td>
      <td><span class="anki-badge learning">${dLearning}</span></td>
      <td><span class="anki-badge review">${dReview}</span></td>
      <td style="font-weight:600;color:${dDue>0?"#c62828":"#888"}">${dDue}</td>
    </tr>`;
  }));

  // Per-word detail (all reviewed words only — skip pure new)
  let wordRows = "";
  ALL_GROUPS.forEach(g => g.decks.forEach(d => {
    unlockedWords(d).forEach((w, i) => {
      const ws = getWS(d.id, i);
      if (!ws.anki || ws.anki.phase === "new") return;
      const a = ws.anki;
      const phaseBadge = a.phase === "review"
        ? `<span class="anki-badge review">review</span>`
        : `<span class="anki-badge learning">learning</span>`;
      const dueLabel = !a.dueDate ? "—"
        : a.dueDate <= today ? `<span style="color:#c62828;font-weight:600;">overdue</span>`
        : daysBetween(today, a.dueDate) === 1 ? "tomorrow"
        : `in ${daysBetween(today, a.dueDate)}d`;
      wordRows += `<tr>
        <td>${w.en}</td>
        <td style="color:var(--text-2)">${w[WORD_KEY]}</td>
        <td>${phaseBadge}</td>
        <td>${a.interval}d</td>
        <td>${dueLabel}</td>
        <td>${a.lapses}</td>
      </tr>`;
    });
  }));

  document.getElementById("main-screen").innerHTML = `
    <div class="screen">
      <div class="screen-top">
        <div class="screen-label">🃏 Anki Stats</div>
        <button class="back-btn" onclick="renderStatsChoice()">← Back</button>
      </div>
      <div style="text-align:right;margin-bottom:1rem;">
        <button onclick="resetAnkiProgress()" style="font-size:12px;padding:5px 12px;border:1px solid #7C5CBF;border-radius:6px;background:transparent;color:#7C5CBF;cursor:pointer;">Reset Anki progress</button>
      </div>
      <div class="anki-stats-summary">
        <div class="anki-stats-pill new">📦 ${totalNew} new</div>
        <div class="anki-stats-pill learning">🔄 ${totalLearning} learning</div>
        <div class="anki-stats-pill review">✅ ${totalReview} review</div>
        <div class="anki-stats-pill overdue">🔴 ${totalOverdue} due</div>
      </div>
      <div class="anki-chart-title">Due in the next 7 days</div>
      <div class="anki-chart">${chartBars}</div>
      <div class="stats-section-title" style="margin-top:1.5rem;">By deck</div>
      <table>
        <thead><tr><th>Deck</th><th>New</th><th>Learning</th><th>Review</th><th>Due</th></tr></thead>
        <tbody>${deckRows}</tbody>
      </table>
      ${wordRows ? `
      <div class="stats-section-title" style="margin-top:1.5rem;">Word detail</div>
      <table>
        <thead><tr><th>English</th><th>Target</th><th>Phase</th><th>Interval</th><th>Due</th><th>Lapses</th></tr></thead>
        <tbody>${wordRows}</tbody>
      </table>` : `<div style="text-align:center;color:#aaa;margin-top:2rem;font-size:13px;">No Anki reviews yet — start a session first.</div>`}
    </div>`;
}
function resetAnkiProgress() {
  if (!confirm("Reset all Anki progress? SM-2 intervals and phases will be cleared. Classic progress is untouched.")) return;
  Object.keys(S.words).forEach(key => { S.words[key].anki = freshAnki(); });
  saveState();
  renderAnkiStatsScreen();
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
        ${[10,20,50,100].map(n => `<button class="goal-pick ${goal===n?"active":""}" onclick="setDailyGoal(${n})">${n}</button>`).join("")}
      </div>
      <div class="settings-sync-line">☁️ ${escapeHtml(account)} · last saved ${lastSaved}</div>
    </div>`;
}
function setDailyGoal(n) {
  S.dailyGoal = n;
  saveState();
  renderSettingsPanel();
  renderExpBar();
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
