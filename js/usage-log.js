// ── USAGE LOG ─────────────────────────────────
// A private record of how the app is actually used, so the next round
// of changes can be based on real habits instead of guesses.
//
//   • Event log — the last USAGE_LOG_MAX raw events, in this device's
//     localStorage only (never synced). A short-term buffer: localStorage
//     is shared with the progress itself, so letting it grow without end
//     could one day stop progress from saving. Everything worth keeping
//     is also counted in the daily aggregates below.
//   • Daily aggregates — one small record per day, kept forever and
//     synced, so every device contributes to one picture. The last
//     USAGE_DAYS days live in S.usage.days (the synced meta doc); older
//     days move to S.usageArchive[year][date], which sync.js stores as
//     one Firestore doc per year (a doc holds 1 MB, a year is ~0.5 MB).
//     Nothing is ever deleted.
//   • Settings → "Copy usage report" turns the whole history into a
//     readable summary plus JSON, ready to paste into a conversation.
//     Nothing is ever sent anywhere else.

const USAGE_LOG_KEY = "gv_log_" + STORAGE_KEY;
const USAGE_LOG_MAX = 5000;
const USAGE_DAYS = 90;
let _usageBuf = null, _usageSaveT = null;

function migrateUsage() {
  if (!S.usage || typeof S.usage !== "object") S.usage = {};
  if (!S.usage.days || typeof S.usage.days !== "object") S.usage.days = {};
  if (!S.usageArchive || typeof S.usageArchive !== "object") S.usageArchive = {};
  const keys = Object.keys(S.usage.days).sort();
  if (keys.length > USAGE_DAYS) keys.slice(0, keys.length - USAGE_DAYS).forEach(k => {
    const y = k.slice(0, 4);
    if (!S.usageArchive[y] || typeof S.usageArchive[y] !== "object") S.usageArchive[y] = {};
    S.usageArchive[y][k] = S.usage.days[k];
    delete S.usage.days[k];
  });
}
// Every recorded day, oldest first: archive + recent.
function usageAllDays() {
  migrateUsage();
  const all = {};
  Object.values(S.usageArchive).forEach(y => Object.assign(all, y || {}));
  Object.assign(all, S.usage.days);
  return Object.keys(all).sort().map(d => [d, all[d]]);
}
// The study day (same rollover as the rest of the app) a timestamp falls on.
function usageDateOf(t) {
  return new Date(t - ANKI.ROLLOVER_HOUR * 3600 * 1000).toLocaleDateString("en-CA");
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
  if (!d && S.usageArchive) { const y = S.usageArchive[date.slice(0, 4)]; if (y && y[date]) d = y[date]; }
  if (!d) {
    d = S.usage.days[date] = { min: 0, open: 0, ans: {}, lat: [0, 0], voice: 0, near: 0, hint: 0,
      gp: {}, q: [0, 0, 0, 0], ev: {}, hr: new Array(24).fill(0), ses: {}, drag: [0, 0], bonus: [0, 0], twist: [0, 0] };
    migrateUsage();
  }
  return d;
}
// Fields added later (2026-10): filled in on first use so older days
// simply lack them.
function _uf(day, k, make) { if (!day[k]) day[k] = make(); return day[k]; }
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
  // Sessions and games count on the day they STARTED, so one left open
  // overnight doesn't show as "finished, never started".
  const startDay = d.sd ? usageDay(d.sd) : day;
  switch (type) {
    case "app_open": day.open++; break;
    case "app_show": day.show = (day.show || 0) + 1; break;
    case "screen": { const s = _uf(day, "scr", () => ({})); s[d.s || "?"] = (s[d.s || "?"] || 0) + 1; break; }
    case "answer": {
      const m = d.m || "?";
      _inc(day.ans, m, 0);
      if (d.ok === true) _inc(day.ans, m, 1);
      if (d.ms > 0 && d.ms < 120000) {
        if (d.typed) { day.lat[0] += Math.round(d.ms); day.lat[1]++; }
        const lm = _uf(day, "latm", () => ({}));
        if (!lm[m]) lm[m] = [0, 0];
        lm[m][0] += Math.round(d.ms); lm[m][1]++;
      }
      if (d.voice) day.voice++;
      if (d.near) day.near++;
      if (d.hint) day.hint++;
      const h = new Date(now).getHours();
      day.hr[h]++;
      if (d.ok === true) _uf(day, "hrOk", () => new Array(24).fill(0))[h]++;
      break;
    }
    case "hint": day.hintTap = (day.hintTap || 0) + 1; break;
    case "session_start": _inc(day.ses, d.kind || "?", 0); break;
    case "session_end": {
      const k = d.kind || "?";
      _inc(startDay.ses, k, d.abandoned ? 2 : 1);
      // sx[kind] = [finished: count, ms, answers, abandoned: count, ms, answers]
      const sx = _uf(startDay, "sx", () => ({}));
      if (!sx[k]) sx[k] = [0, 0, 0, 0, 0, 0];
      const o = d.abandoned ? 3 : 0;
      sx[k][o]++; sx[k][o + 1] += Math.round(d.ms || 0); sx[k][o + 2] += d.n || 0;
      if (d.met) startDay.met = (startDay.met || 0) + d.met;
      if (d.up) startDay.up = (startDay.up || 0) + d.up;
      if (d.down) startDay.down = (startDay.down || 0) + d.down;
      if (k === "path" || k === "quick5") _usageTierSnapshot();
      break;
    }
    case "game_start": _inc(day.gp, d.id || "?", 0); break;
    case "game_end": {
      const id = d.id || "?";
      _inc(startDay.gp, id, d.quit ? 2 : 1);
      // gx[id] = [right, wrong, ms finished, ms quit, quit before playing]
      const gx = _uf(startDay, "gx", () => ({}));
      if (!gx[id]) gx[id] = [0, 0, 0, 0, 0];
      if (d.quit) { gx[id][3] += Math.round(d.ms || 0); if (d.pre) gx[id][4]++; }
      else { gx[id][0] += d.ok || 0; gx[id][1] += d.bad || 0; gx[id][2] += Math.round(d.ms || 0); }
      break;
    }
    case "quest_gen": {
      const qt = _uf(day, "qt", () => ({}));
      (d.ids || []).forEach(id => { if (!qt[id]) qt[id] = [0, 0, 0]; qt[id][0]++; });
      break;
    }
    case "quest_done": day.q[0]++; _usageQuest(day, d.tpl, 1); break;
    case "quest_reroll": day.q[1]++; _usageQuest(day, d.tpl, 2); break;
    case "quest_swap": day.q[2]++; _usageQuest(day, d.tpl, 2); break;
    case "day_complete": day.q[3]++; break;
    case "event": day.ev[d.kind + (d.taken ? "+" : "")] = (day.ev[d.kind + (d.taken ? "+" : "")] || 0) + 1; break;
    case "drag": day.drag[d.how === "drag" ? 0 : 1] += d.n || 1; break;
    case "bonus": day.bonus[d.taken ? 1 : 0]++; break;
    case "twist": day.twist[d.taken ? 1 : 0]++; break;
    case "setting": { const st = _uf(day, "set", () => ({})); st[d.k] = d.v; break; }
  }
}
function _usageQuest(day, tpl, i) {
  if (!tpl) return;
  const qt = _uf(day, "qt", () => ({}));
  if (!qt[tpl]) qt[tpl] = [0, 0, 0];
  qt[tpl][i]++;
}
// Words per tier at the end of each Today session: the day's last one
// is the day's closing picture, so growth can be followed day by day.
function _usageTierSnapshot() {
  setTimeout(() => {
    try { if (typeof pathScan === "function") usageDay().tiers = { ...pathScan(true).tiers }; } catch (e) {}
  }, 0);
}
// A phrase spoken with the phone's voice because the pack has no
// recording for it (see audio.js).
function usageNoteTts() { try { const d = usageDay(); d.tts = (d.tts || 0) + 1; } catch (e) {} }

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
// The whole history (nDays = 0) or the last nDays days.
function buildUsageReport(nDays = 0) {
  const today = todayISO();
  let days = usageAllDays();
  if (nDays > 0) { const from = addDays(today, -(nDays - 1)); days = days.filter(([d]) => d >= from); }
  const isActive = v => v.min > 0 || Object.keys(v.ans || {}).length;
  const activeDays = days.filter(([, v]) => isActive(v));
  const span = days.length ? Math.round((Date.parse(today) - Date.parse(days[0][0])) / 864e5) + 1 : 0;
  const sum = (f) => days.reduce((a, [, v]) => a + (f(v) || 0), 0);
  const active = activeDays.length;
  const minutes = sum(v => v.min);
  const addInto = (out, obj, n) => Object.entries(obj || {}).forEach(([k, a]) => {
    if (!out[k]) out[k] = new Array(n).fill(0); a.forEach((x, i) => { if (i < n) out[k][i] += x || 0; });
  });
  const modes = {}, games = {}, gx = {}, sessions = {}, sx = {}, latm = {}, scr = {}, ev = {};
  days.forEach(([, v]) => {
    addInto(modes, v.ans, 2); addInto(games, v.gp, 3); addInto(gx, v.gx, 5);
    addInto(sessions, v.ses, 3); addInto(sx, v.sx, 6); addInto(latm, v.latm, 2);
    Object.entries(v.scr || {}).forEach(([k, n]) => scr[k] = (scr[k] || 0) + n);
    Object.entries(v.ev || {}).forEach(([k, n]) => ev[k] = (ev[k] || 0) + n);
  });
  const hours = new Array(24).fill(0), hoursOk = new Array(24).fill(0);
  const hoursOkN = new Array(24).fill(0);
  days.forEach(([, v]) => {
    (v.hr || []).forEach((x, i) => hours[i] += x || 0);
    if (v.hrOk) v.hrOk.forEach((x, i) => { hoursOk[i] += x || 0; hoursOkN[i] += (v.hr || [])[i] || 0; });
  });
  const latN = sum(v => v.lat[1]), latS = sum(v => v.lat[0]);
  const totalAns = Object.values(modes).reduce((a, m) => a + m[0], 0);

  // Quest templates: daily counts where recorded; for days before those
  // existed, from this device's raw log.
  const qStats = {};
  const qDays = new Set();
  days.forEach(([d, v]) => { if (v.qt) { qDays.add(d); addInto(qStats, v.qt, 3); } });
  const from = days.length ? days[0][0] : today;
  _usageLog().forEach(e => {
    if (!["quest_gen", "quest_done", "quest_reroll", "quest_swap"].includes(e.e)) return;
    const d = usageDateOf(e.t);
    if (d < from || qDays.has(d)) return;
    if (e.e === "quest_gen") (e.ids || []).forEach(id => { (qStats[id] = qStats[id] || [0, 0, 0])[0]++; });
    else { const s = (qStats[e.tpl] = qStats[e.tpl] || [0, 0, 0]); s[e.e === "quest_done" ? 1 : 2]++; }
  });
  const tiers = typeof pathScan === "function" ? { ...pathScan(true).tiers } : {};

  const pct = (a, b) => b ? Math.round(a / b * 100) + "%" : "—";
  const secs = (ms, n) => n ? (ms / n / 1000).toFixed(1) + "s" : "—";
  const mins = (ms, n) => n ? (ms / n / 60000).toFixed(1) + "m" : "—";
  const peak = hours.map((n, h) => [h, n]).sort((a, b) => b[1] - a[1]).slice(0, 3).filter(x => x[1]).map(x => x[0] + "h");
  const lines = [];
  lines.push(`VOCAB APP USAGE REPORT — ${APP_CONFIG.title} — ${today} (${nDays > 0 ? `last ${nDays} days` : `all history since ${from}`})`);
  lines.push(`Active days: ${active}/${nDays > 0 ? nDays : span} · minutes: ${Math.round(minutes)} (avg ${active ? Math.round(minutes / active) : 0}/active day) · app opens: ${sum(v => v.open)} · returns to the app: ${sum(v => v.show)}`);
  lines.push(`Answers: ${totalAns} · typing latency avg ${latN ? (latS / latN / 1000).toFixed(1) + "s" : "—"} · spoken: ${sum(v => v.voice)} · near-misses: ${sum(v => v.near)} · hints: ${sum(v => v.hint)} · phone-voice fallbacks: ${sum(v => v.tts)}`);
  lines.push(`By mode (answers, ok, avg time): ` + Object.entries(modes).sort((a, b) => b[1][0] - a[1][0]).map(([m, a]) => `${m} ${a[0]} (${pct(a[1], a[0])} ok${latm[m] ? ", " + secs(latm[m][0], latm[m][1]) : ""})`).join(" · "));
  lines.push(`Sessions (started/finished/abandoned): ` + Object.entries(sessions).map(([k, a]) => `${k} ${a[0]}/${a[1]}/${a[2]}`).join(" · "));
  const sxl = Object.entries(sx).filter(([, a]) => a[0] || a[3]);
  if (sxl.length) lines.push(`Session detail (finished: avg length, answers · abandoned: avg length, answers before leaving): ` +
    sxl.map(([k, a]) => `${k} ${mins(a[1], a[0])}, ${a[0] ? Math.round(a[2] / a[0]) : "—"} · ${mins(a[4], a[3])}, ${a[3] ? Math.round(a[5] / a[3]) : "—"}`).join(" | "));
  lines.push(`Games (started/finished/quit): ` + (Object.entries(games).map(([g, a]) => `${g} ${a[0]}/${a[1]}/${a[2]}`).join(" · ") || "none"));
  const gxl = Object.entries(gx).filter(([, a]) => a.some(x => x));
  if (gxl.length) lines.push(`Game detail (ok% · avg finished · avg time before quitting · quit before playing): ` +
    gxl.map(([g, a]) => { const fin = (games[g] || [])[1] || 0, q = (games[g] || [])[2] || 0;
      return `${g} ${pct(a[0], a[0] + a[1])} · ${secs(a[2], fin)} · ${secs(a[3], q)} · ${a[4]}`; }).join(" | "));
  const mk = {}, sf = {};
  days.forEach(([, v]) => { Object.entries(v.mk || {}).forEach(([k, n]) => mk[k] = (mk[k] || 0) + n); Object.entries(v.sf || {}).forEach(([k, n]) => sf[k] = (sf[k] || 0) + n); });
  if (Object.keys(mk).length) lines.push(`Mistakes by type: ` + Object.entries(mk).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
  if (Object.keys(sf).length) lines.push(`Writing slips on accepted answers: ` + Object.entries(sf).map(([k, n]) => `${k} ${n}`).join(" · "));
  lines.push(`Quests: done ${sum(v => v.q[0])} · rerolled ${sum(v => v.q[1])} · swapped 🔇 ${sum(v => v.q[2])} · full days ${sum(v => v.q[3])}`);
  const qs = Object.entries(qStats).sort((a, b) => b[1][0] - a[1][0]);
  if (qs.length) lines.push(`Quest templates (offered/done/rerolled+swapped): ` + qs.map(([k, a]) => `${k} ${a[0]}/${a[1]}/${a[2]}`).join(" · "));
  lines.push(`Random events: ` + (Object.entries(ev).map(([k, n]) => `${k} ${n}`).join(" · ") || "none"));
  lines.push(`Bonus rounds offered/taken: ${sum(v => v.bonus[0] + v.bonus[1])}/${sum(v => v.bonus[1])} · twists declined/taken: ${sum(v => v.twist[0])}/${sum(v => v.twist[1])} · drag vs tap: ${sum(v => v.drag[0])}/${sum(v => v.drag[1])}`);
  lines.push(`Busiest hours: ${peak.join(", ") || "—"}`);
  const hAcc = hours.map((n, h) => [h, hoursOkN[h], hoursOk[h]]).filter(x => x[1] >= 20);
  if (hAcc.length) lines.push(`Accuracy by hour (≥20 answers): ` + hAcc.map(([h, n, ok]) => `${h}h ${pct(ok, n)}`).join(" · "));
  if (Object.keys(scr).length) lines.push(`Screens opened: ` + Object.entries(scr).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
  lines.push(`Words by tier now: ` + TIERS.map(t => `${t.icon}${t.name} ${tiers[t.id]}`).join(" · "));
  lines.push(`Daily goal ${getDailyGoal()} · new/day ${S.path.deadline ? `auto ${pathPace()} (finish by ${S.path.deadline})` : S.path.newPerDay} · level ${currentLevel()} · streak ${getDailyStreak()}d`);
  // One line per active day: the trend at a glance.
  lines.push(``, `Per day (date · min · answers · typed ok · typed latency · path sessions started/finished/abandoned · games started/quit · new words met · words up/down):`);
  activeDays.forEach(([d, v]) => {
    const t = (v.ans || {})["path:typed"] || [0, 0];
    const p = (v.ses || {}).path || [0, 0, 0];
    const g = Object.values(v.gp || {}).reduce((a, x) => [a[0] + (x[0] || 0), a[1] + (x[2] || 0)], [0, 0]);
    const n = Object.values(v.ans || {}).reduce((a, x) => a + (x[0] || 0), 0);
    lines.push(`${d} · ${Math.round(v.min)} · ${n} · ${pct(t[1], t[0])} · ${secs(v.lat[0], v.lat[1])} · ${p[0]}/${p[1]}/${p[2]} · ${g[0]}/${g[1]} · ${v.met ?? "—"} · ${v.up ?? "—"}/${v.down ?? "—"}`);
  });
  const json = JSON.stringify({ app: STORAGE_KEY, generated: new Date().toISOString(), days: Object.fromEntries(days), quests: qStats, tiers });
  return lines.join("\n") + "\n\n--- JSON ---\n" + json;
}
function copyUsageReport() {
  const text = buildUsageReport(0);
  copyTextToClipboard(text)
    .then(() => showCelebrateToast("📋", "Usage report copied", "Paste it into our next conversation"))
    .catch(() => { window.prompt("Copy the report:", text); });
}
