// ── LEARN MODE ────────────────────────────────
function startLearn() {
  learnQueue = [...activeWords].sort((a,b) => {
    const wa = getWS(a.deckId, a.idx), wb = getWS(b.deckId, b.idx);
    const newA = wa.correct===0 && wa.wrong===0;
    const newB = wb.correct===0 && wb.wrong===0;
    if (newA && !newB) return -1;
    if (!newA && newB) return 1;
    return (wb.wrong - wb.correct) - (wa.wrong - wa.correct);
  });
  learnIndex = 0;
  showGameScreen();
  renderLearnCard();
}
function renderLearnCard() {
  const el = document.getElementById("main-screen");
  if (learnIndex >= learnQueue.length) {
    el.innerHTML = `<div class="screen">
      <div class="screen-top"><div class="screen-label">Learning complete</div><button class="back-btn" onclick="backToMenu()">← Menu</button></div>
      <div class="result-screen">
        <div class="result-emoji">🎉</div>
        <div class="result-title">All cards seen!</div>
        <div class="result-sub">Now drill them to lock them in.</div>
        <button class="result-btn" onclick="finishLearnStartDrill()">Start drilling →</button>
      </div></div>`;
    confettiBurst(36);
    return;
  }
  const w     = learnQueue[learnIndex];
  const total = activeWords.length;
  const seen  = Math.min(learnIndex, total);
  el.innerHTML = `<div class="screen">
    <div class="screen-top">
      <div class="screen-label">Learn · ${seen+1}/${total}</div>
      <button class="back-btn" onclick="backToMenu()">← Menu</button>
    </div>
    <div class="learn-progress">${learnQueue.length - learnIndex} cards left in queue</div>
    <div id="unlock-row-learn"></div>
    <div class="learn-card">
      <div class="learn-en">${w.en}</div>
      <div class="learn-de">${w[WORD_KEY]}</div>
      ${w.pl ? `<div class="learn-hint">plural: ${w.pl}</div>` : ""}
      <div class="learn-hint">${w.hint}</div>
      ${w.examples && w.examples.length ? `<div class="examples-wrap" style="text-align:left;margin-top:12px">
        <div class="examples-title">Examples</div>
        ${w.examples.map(ex=>`<div class="example-row"><div class="example-de">${ex[WORD_KEY]}</div><div class="example-en">${ex.en}</div></div>`).join("")}
      </div>` : ""}
    </div>
    <button class="audio-btn" style="display:block;margin:0 auto 1rem;" onclick="speak('${w[WORD_KEY].replace(/'/g,"\\'")}')">🔊 Listen</button>
    <div class="learn-actions">
      <button class="learn-btn not-yet" onclick="learnNotYet()">Not yet</button>
      <button class="learn-btn got-it"  onclick="learnGotIt()">Got it ✓</button>
    </div>
  </div>`;
  renderUnlockRow("unlock-row-learn");
}
function learnGotIt()  { learnIndex++; addExp(5); saveState(); renderLearnCard(); }
function learnNotYet() {
  const w = learnQueue[learnIndex];
  learnQueue.splice(learnIndex, 1);
  learnQueue.push(w);
  const el = document.getElementById("main-screen");
  const notYetBtn = el.querySelector(".learn-btn.not-yet");
  const gotItBtn  = el.querySelector(".learn-btn.got-it");
  if (notYetBtn) notYetBtn.disabled = true;
  if (gotItBtn)  gotItBtn.disabled  = true;
  const deEl = el.querySelector(".learn-de");
  if (deEl) { deEl.style.color = "#993C1D"; deEl.style.fontSize = "2.2rem"; }
  let banner = document.getElementById("learn-wrong-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "learn-wrong-banner";
    banner.style.cssText = "background:#fff5f5;border:1px solid #E24B4A;border-radius:8px;padding:10px 14px;text-align:center;margin-bottom:1rem;font-size:20px;font-weight:700;color:#993C1D;";
    const actionsEl = el.querySelector(".learn-actions");
    if (actionsEl) actionsEl.parentNode.insertBefore(banner, actionsEl);
  }
  banner.textContent = `✗ ${w[WORD_KEY]}`;
  setTimeout(() => { renderLearnCard(); }, 0);
}
function finishLearnStartDrill() { activeMode = "drill"; startDrill(); }
