// ── USAGE LOG ─────────────────────────────────
// A private record of how the app is actually used, so the next round
// of changes can be based on real habits instead of guesses.
//
//   • Event log — the last USAGE_LOG_MAX raw events, in this device's
//     localStorage only (never synced).
//   • Daily aggregates — S.usage.days[date], a few hundred bytes a day
//     kept for USAGE_DAYS days in the synced meta doc, so every device
//     contributes to one picture.
//   • Settings → "Copy usage report" turns both into a readable summary
//     plus JSON, ready to paste into a conversation. Nothing is ever
//     sent anywhere else.

const USAGE_LOG_KEY = "gv_log_" + STORAGE_KEY;
const USAGE_LOG_MAX = 5000;
const USAGE_DAYS = 90;
let _usageBuf = null, _usageSaveT = null;

function migrateUsage() {
  if (!S.usage || typeof S.usage !== "object") S.usage = {};
  if (!S.usage.days || typeof S.usage.days !== "object") S.usage.days = {};
  const keys = Object.keys(S.usage.days).sort();
  if (keys.length > USAGE_DAYS) keys.slice(0, keys.length - USAGE_DAYS).forEach(k => delete S.usage.days[k]);
}
function _usageLog() {
  if (_usageBuf) return _usageBuf;
  try { _usageBuf = JSON.parse(localStorage.getItem(USAGE_LOG_KEY) || "[]"); } catch (e) { _usageBuf = []; }
  if (!Array.isArray(_usageBuf)) _usageBuf = [];
  return _usageBuf;
}
function _usagePersist() {
  clearTimeout(_usageSaveT);
  _usageSaveT = setTimeout(() => {
    try { localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(_usageLog())); } catch (e) {
      // Storage full: keep the newer half and try once more.
      _usageBuf = _usageLog().slice(-Math.floor(USAGE_LOG_MAX / 2));
      try { localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(_usageBuf)); } catch (e2) {}
    }
  }, 1500);
}
function usageDay(date = todayISO()) {
  if (!S.usage) migrateUsage();
  let d = S.usage.days[date];
  if (!d) {
    d = S.usage.days[date] = { min: 0, open: 0, ans: {}, lat: [0, 0], voice: 0, near: 0, hint: 0,
      gp: {}, q: [0, 0, 0, 0], ev: {}, hr: new Array(24).fill(0), ses: {}, drag: [0, 0], bonus: [0, 0], twist: [0, 0] };
    migrateUsage();
  }
  return d;
}
function _inc(obj, k, i, n = 1) {
  if (!obj[k]) obj[k] = [0, 0, 0];
  obj[k][i] = (obj[k][i] || 0) + n;
}

// type: short event name. data: small flat object.
function logEvent(type, data = {}) {
  try {
    const now = Date.now();
    const log = _usageLog();
    log.push({ t: now, e: type, ...data });
    if (log.length > USAGE_LOG_MAX) log.splice(0, log.length - USAGE_LOG_MAX);
    _usagePersist();
    _usageAggregate(type, data, now);
  } catch (e) { console.warn("usage log failed", e); }
}
function _usageAggregate(type, d, now) {
  const day = usageDay();
  switch (type) {
    case "app_open": day.open++; break;
    case "answer": {
      _inc(day.ans, d.m || "?", 0);
      if (d.ok === true) _inc(day.ans, d.m || "?", 1);
      if (d.ms > 0 && d.ms < 120000 && d.typed) { day.lat[0] += Math.round(d.ms); day.lat[1]++; }
      if (d.voice) day.voice++;
      if (d.near) day.near++;
      if (d.hint) day.hint++;
      day.hr[new Date(now).getHours()]++;
      break;
    }
    case "session_start": _inc(day.ses, d.kind || "?", 0); break;
    case "session_end": _inc(day.ses, d.kind || "?", d.abandoned ? 2 : 1); break;
    case "game_start": _inc(day.gp, d.id || "?", 0); break;
    case "game_end": _inc(day.gp, d.id || "?", d.quit ? 2 : 1); break;
    case "quest_done": day.q[0]++; break;
    case "quest_reroll": day.q[1]++; break;
    case "quest_swap": day.q[2]++; break;
    case "day_complete": day.q[3]++; break;
    case "event": day.ev[d.kind + (d.taken ? "+" : "")] = (day.ev[d.kind + (d.taken ? "+" : "")] || 0) + 1; break;
    case "drag": day.drag[d.how === "drag" ? 0 : 1] += d.n || 1; break;
    case "bonus": day.bonus[d.taken ? 1 : 0]++; break;
    case "twist": day.twist[d.taken ? 1 : 0]++; break;
  }
}

// Visible minutes: a heartbeat while the page is visible.
let _usageBeat = null;
function startUsageClock() {
  clearInterval(_usageBeat);
  _usageBeat = setInterval(() => {
    if (document.visibilityState === "visible") usageDay().min = Math.round((usageDay().min + 0.5) * 10) / 10;
  }, 30000);
  document.addEventListener("visibilitychange", () => {
    logEvent(document.visibilityState === "visible" ? "app_show" : "app_hide", { scr: currentScreenName() });
  });
}
function currentScreenName() {
  const ms = document.getElementById("main-screen");
  if (!ms || ms.style.display === "none") return "home";
  const g = document.getElementById("game-screen");
  if (g) return "game:" + (g.dataset.game || "");
  return (typeof _lastScreen === "string" && _lastScreen) || "screen";
}
let _lastScreen = "home";
function logScreen(name) { _lastScreen = name; logEvent("screen", { s: name }); }

// ── REPORT ────────────────────────────────────
function buildUsageReport(nDays = 30) {
  migrateUsage();
  const today = todayISO();
  const dates = [];
  for (let i = nDays - 1; i >= 0; i--) dates.push(addDays(today, -i));
  const days = dates.map(d => [d, S.usage.days[d]]).filter(([, v]) => v);
  const sum = (f) => days.reduce((a, [, v]) => a + (f(v) || 0), 0);
  const active = days.filter(([, v]) => v.min > 0 || Object.keys(v.ans).length).length;
  const minutes = sum(v => v.min);
  const modes = {};
  days.forEach(([, v]) => Object.entries(v.ans).forEach(([m, a]) => {
    if (!modes[m]) modes[m] = [0, 0]; modes[m][0] += a[0] || 0; modes[m][1] += a[1] || 0;
  }));
  const games = {};
  days.forEach(([, v]) => Object.entries(v.gp).forEach(([g, a]) => {
    if (!games[g]) games[g] = [0, 0, 0]; a.forEach((x, i) => games[g][i] += x || 0);
  }));
  const sessions = {};
  days.forEach(([, v]) => Object.entries(v.ses || {}).forEach(([k, a]) => {
    if (!sessions[k]) sessions[k] = [0, 0, 0]; a.forEach((x, i) => sessions[k][i] += x || 0);
  }));
  const hours = new Array(24).fill(0);
  days.forEach(([, v]) => (v.hr || []).forEach((x, i) => hours[i] += x || 0));
  const latN = sum(v => v.lat[1]), latS = sum(v => v.lat[0]);
  const totalAns = Object.values(modes).reduce((a, m) => a + m[0], 0);
  const ev = {};
  days.forEach(([, v]) => Object.entries(v.ev || {}).forEach(([k, n]) => ev[k] = (ev[k] || 0) + n));

  // Quest templates: from the raw log (this device) — done vs swapped.
  const qStats = {};
  _usageLog().forEach(e => {
    if (!["quest_gen", "quest_done", "quest_reroll", "quest_swap"].includes(e.e)) return;
    if (e.e === "quest_gen") (e.ids || []).forEach(id => { (qStats[id] = qStats[id] || [0, 0, 0])[0]++; });
    else { const s = (qStats[e.tpl] = qStats[e.tpl] || [0, 0, 0]); s[e.e === "quest_done" ? 1 : 2]++; }
  });
  // Stage distribution now.
  const tiers = typeof pathScan === "function" ? { ...pathScan(true).tiers } : {};

  const pct = (a, b) => b ? Math.round(a / b * 100) + "%" : "—";
  const peak = hours.map((n, h) => [h, n]).sort((a, b) => b[1] - a[1]).slice(0, 3).filter(x => x[1]).map(x => x[0] + "h");
  const lines = [];
  lines.push(`VOCAB APP USAGE REPORT — ${APP_CONFIG.title} — ${today} (last ${nDays} days)`);
  lines.push(`Active days: ${active}/${nDays} · minutes: ${Math.round(minutes)} (avg ${active ? Math.round(minutes / active) : 0}/active day) · app opens: ${sum(v => v.open)}`);
  lines.push(`Answers: ${totalAns} · typing latency avg ${latN ? (latS / latN / 1000).toFixed(1) + "s" : "—"} · spoken: ${sum(v => v.voice)} · near-misses: ${sum(v => v.near)} · hints: ${sum(v => v.hint)}`);
  lines.push(`By mode: ` + Object.entries(modes).sort((a, b) => b[1][0] - a[1][0]).map(([m, a]) => `${m} ${a[0]} (${pct(a[1], a[0])} ok)`).join(" · "));
  lines.push(`Sessions (started/finished/abandoned): ` + Object.entries(sessions).map(([k, a]) => `${k} ${a[0]}/${a[1]}/${a[2]}`).join(" · "));
  lines.push(`Games (started/finished/quit): ` + (Object.entries(games).map(([g, a]) => `${g} ${a[0]}/${a[1]}/${a[2]}`).join(" · ") || "none"));
  lines.push(`Quests: done ${sum(v => v.q[0])} · rerolled ${sum(v => v.q[1])} · swapped 🔇 ${sum(v => v.q[2])} · full days ${sum(v => v.q[3])}`);
  const qs = Object.entries(qStats).sort((a, b) => b[1][0] - a[1][0]);
  if (qs.length) lines.push(`Quest templates (offered/done/rerolled+swapped): ` + qs.slice(0, 40).map(([k, a]) => `${k} ${a[0]}/${a[1]}/${a[2]}`).join(" · "));
  lines.push(`Random events: ` + (Object.entries(ev).map(([k, n]) => `${k} ${n}`).join(" · ") || "none"));
  lines.push(`Bonus rounds offered/taken: ${sum(v => v.bonus[0] + v.bonus[1])}/${sum(v => v.bonus[1])} · twists declined/taken: ${sum(v => v.twist[0])}/${sum(v => v.twist[1])} · drag vs tap: ${sum(v => v.drag[0])}/${sum(v => v.drag[1])}`);
  lines.push(`Busiest hours: ${peak.join(", ") || "—"}`);
  lines.push(`Words by tier now: ` + TIERS.map(t => `${t.icon}${t.name} ${tiers[t.id]}`).join(" · "));
  lines.push(`Daily goal ${getDailyGoal()} · new/day ${S.path.newPerDay} · level ${currentLevel()} · streak ${getDailyStreak()}d`);
  const json = JSON.stringify({ app: STORAGE_KEY, generated: new Date().toISOString(), days: Object.fromEntries(days), quests: qStats, tiers });
  return lines.join("\n") + "\n\n--- JSON ---\n" + json;
}
function copyUsageReport() {
  const text = buildUsageReport(30);
  copyTextToClipboard(text)
    .then(() => showCelebrateToast("📋", "Usage report copied", "Paste it into our next conversation"))
    .catch(() => { window.prompt("Copy the report:", text); });
}
