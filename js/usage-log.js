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
// Active time: the app can sit open on screen while you are elsewhere, so
// besides the minutes it is visible we count the ones with a touch, key
// or answer in the previous USAGE_IDLE_MS. _usageActMs is the running
// total; a session or game remembers it at its start and logs the
// difference at its end (act), so a session started and left for later
// shows its real length.
const USAGE_IDLE_MS = 90000;
let _usageLastInput = 0, _usageActMs = 0;
const _usageActAt = {};
function _usageNoteInput() { _usageLastInput = Date.now(); }

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
    if (type === "answer") _usageLastInput = now;
    const actKey = type === "session_start" || type === "session_end" ? "s:" + (data.kind || "?")
      : type === "game_start" || type === "game_end" ? "g:" + (data.id || "?") : "";
    if (actKey) {
      if (type.endsWith("_start")) _usageActAt[actKey] = _usageActMs;
      else { if (data.act == null && _usageActAt[actKey] != null) data.act = _usageActMs - _usageActAt[actKey]; delete _usageActAt[actKey]; }
    }
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
      // src[where it came from] = [answers, right] (Today: path.js pathAnswerSrc)
      if (d.src) { const sr = _uf(day, "src", () => ({})); if (!sr[d.src]) sr[d.src] = [0, 0]; sr[d.src][0]++; if (d.ok === true) sr[d.src][1]++; }
      if (d.voice) day.voice++;
      if (d.near) day.near++;
      if (d.hint) day.hint++;
      const h = new Date(now).getHours();
      day.hr[h]++;
      if (d.ok === true) _uf(day, "hrOk", () => new Array(24).fill(0))[h]++;
      // bt[tier before the answer][exercise] = [answers, right] (path exercises)
      if (d.st != null && m.startsWith("path:") && typeof tierOfStage === "function") {
        const bt = _uf(day, "bt", () => ({})), tk = tierOfStage(d.st).id, ex = m.slice(5);
        const o = bt[tk] || (bt[tk] = {});
        if (!o[ex]) o[ex] = [0, 0];
        o[ex][0]++; if (d.ok === true) o[ex][1]++;
      }
      break;
    }
    case "hint": day.hintTap = (day.hintTap || 0) + 1; break;
    case "session_start":
      _inc(day.ses, d.kind || "?", 0);
      // pm: what the Path queues held — items by exercise, Known+ items, and how many of those had a sentence for a cloze
      if (d.mix) {
        const pm = _uf(day, "pm", () => ({ t: {}, k: 0, kz: 0 }));
        Object.entries(d.mix.t || {}).forEach(([k, n]) => pm.t[k] = (pm.t[k] || 0) + n);
        pm.k += d.mix.k || 0; pm.kz += d.mix.kz || 0;
      }
      break;
    // The verb track (verb-track.js): vx = { sh: sheets passed, sf: quizzes
    // not passed, in: verb items started, cell: ledger forms done, u: tenses
    // opened, on: switched on/off, ma / mp: mastery quizzes taken / passed,
    // rv: times a quiz miss was looked up in its sheet, dr: tense drill
    // [answers, right], drv: its mistakes looked at again }.
    case "vx_sheet": { const v = _uf(day, "vx", () => ({})); if (d.ok) v.sh = (v.sh || 0) + 1; else v.sf = (v.sf || 0) + 1; break; }
    case "vx_mastery": { const v = _uf(day, "vx", () => ({})); v.ma = (v.ma || 0) + 1; if (d.ok) v.mp = (v.mp || 0) + 1; break; }
    case "vx_cell": { const v = _uf(day, "vx", () => ({})); v.cell = (v.cell || 0) + 1; break; }
    case "vx_review": { const v = _uf(day, "vx", () => ({})); v.rv = (v.rv || 0) + 1; break; }
    case "vx_intro": { const v = _uf(day, "vx", () => ({})); v.in = (v.in || 0) + 1; break; }
    case "vx_unit": { const v = _uf(day, "vx", () => ({})); (v.u = v.u || []).push(d.u + ":" + d.st); break; }
    case "vx_drill": { const v = _uf(day, "vx", () => ({})); if (d.rev) v.drv = (v.drv || 0) + 1; else { const a = v.dr || (v.dr = [0, 0]); a[0]++; if (d.ok) a[1]++; } break; }
    case "vx_switch": { const v = _uf(day, "vx", () => ({})); v.on = d.on ? 1 : 0; break; }
    // The course (course-de.js): cx = { sh / sf: sheets passed / not,
    // to: test-outs [taken, passed], dr: drills finished, cp: checkpoints
    // [taken, passed], wr: texts written, ww: their words }.
    case "cx_sheet": { const v = _uf(day, "cx", () => ({})); if (d.ok) v.sh = (v.sh || 0) + 1; else v.sf = (v.sf || 0) + 1; break; }
    case "cx_testout": { const v = _uf(day, "cx", () => ({})), a = v.to || (v.to = [0, 0]); a[0]++; if (d.ok) a[1]++; break; }
    case "cx_drill": { const v = _uf(day, "cx", () => ({})); v.dr = (v.dr || 0) + 1; break; }
    case "cx_checkpoint": { const v = _uf(day, "cx", () => ({})), a = v.cp || (v.cp = [0, 0]); a[0]++; if (d.ok) a[1]++; break; }
    case "cx_write": { const v = _uf(day, "cx", () => ({})); v.wr = (v.wr || 0) + 1; v.ww = (v.ww || 0) + (d.w || 0); break; }
    case "session_end": {
      const k = d.kind || "?";
      _inc(startDay.ses, k, d.abandoned ? 2 : 1);
      if (d.vxCells) { const v = _uf(startDay, "vx", () => ({})); v.cell = (v.cell || 0) + d.vxCells; }
      // sx[kind] = [finished: count, ms, answers, abandoned: count, ms, answers]
      const sx = _uf(startDay, "sx", () => ({}));
      if (!sx[k]) sx[k] = [0, 0, 0, 0, 0, 0];
      const o = d.abandoned ? 3 : 0;
      sx[k][o]++; sx[k][o + 1] += Math.round(d.ms || 0); sx[k][o + 2] += d.n || 0;
      // [6] / [7]: active ms and count of finished sessions that logged it
      if (!d.abandoned && d.act != null) { sx[k][6] = (sx[k][6] || 0) + Math.round(d.act); sx[k][7] = (sx[k][7] || 0) + 1; }
      if (d.met) startDay.met = (startDay.met || 0) + d.met;
      if (d.up) startDay.up = (startDay.up || 0) + d.up;
      if (d.down) startDay.down = (startDay.down || 0) + d.down;
      if (k === "path") _usageTierSnapshot();
      break;
    }
    case "game_start": _inc(day.gp, d.id || "?", 0); break;
    case "game_end": {
      const id = d.id || "?";
      _inc(startDay.gp, id, d.quit ? 2 : 1);
      // gx[id] = [right, wrong, ms finished, ms quit, quit before playing]
      const gx = _uf(startDay, "gx", () => ({}));
      if (!gx[id]) gx[id] = [0, 0, 0, 0, 0];
      const gms = Math.min(Math.round(d.ms || 0), 600000); // a game left open counts 10 min at most
      if (d.quit) { gx[id][3] += gms; if (d.pre) gx[id][4]++; }
      else {
        gx[id][0] += d.ok || 0; gx[id][1] += d.bad || 0; gx[id][2] += gms;
        // [5] / [6]: active ms and count of finished games that logged it
        if (d.act != null) { gx[id][5] = (gx[id][5] || 0) + Math.min(Math.round(d.act), gms); gx[id][6] = (gx[id][6] || 0) + 1; }
      }
      break;
    }
    case "quest_gen": {
      const qt = _uf(day, "qt", () => ({}));
      (d.ids || []).forEach(id => { if (!qt[id]) qt[id] = [0, 0, 0]; qt[id][0]++; });
      break;
    }
    case "quest_done":
      day.q[0]++; _usageQuest(day, d.tpl, 1);
      if (d.tpl === "a_plan") day.planAt = new Date(now).getHours();
      break;
    case "quest_reroll": day.q[1]++; _usageQuest(day, d.tpl, 2); break;
    case "quest_swap": day.q[2]++; _usageQuest(day, d.tpl, 2); break;
    case "day_complete": day.q[3]++; break;
    case "event": day.ev[d.kind + (d.taken ? "+" : "")] = (day.ev[d.kind + (d.taken ? "+" : "")] || 0) + 1; break;
    case "drag": day.drag[d.how === "drag" ? 0 : 1] += d.n || 1; break;
    case "bonus": day.bonus[d.taken ? 1 : 0]++; break;
    case "twist": day.twist[d.taken ? 1 : 0]++; break;
    case "setting": { const st = _uf(day, "set", () => ({})); st[d.k] = d.v; break; }
    // Today's plan (finish date): the morning's numbers. A finish-date
    // change mid-day updates pace/target but keeps the morning pile.
    case "plan": {
      const p = day.plan || (day.plan = { due: d.due, od: d.od });
      Object.assign(p, { pace: d.pace, rev: d.reviews, tgt: d.target, leave: d.leave, ...(d.kw ? { kw: d.kw } : {}), ...(d.kv ? { kv: d.kv } : {}) });
      if (d.vx) p.vx = d.vx;
      if (d.snap && !p.snap) p.snap = d.snap; // (the morning's: pathPaceCheck)
      break;
    }
    // Chests: earned by source; opened by source × rarity, what decided
    // the rarity (roll / pity timer / source minimum), the item inside.
    case "chest_earned": { const e = _uf(day, "chE", () => ({})); e[d.src || "?"] = (e[d.src || "?"] || 0) + 1; break; }
    case "chest_lost": day.chLost = (day.chLost || 0) + 1; break;
    case "chest": {
      if (!day.ch) day.chSince = now; // older chests of this day: from the raw log
      const ch = _uf(day, "ch", () => ({}));
      const k = d.src || "?", r = ["common", "rare", "epic", "legendary"].indexOf(d.rar);
      if (!ch[k]) ch[k] = [0, 0, 0, 0, 0];
      ch[k][0]++; if (r >= 0) ch[k][r + 1]++;
      if (d.why) { const w = _uf(day, "chW", () => ({})); w[d.why] = (w[d.why] || 0) + 1; }
      if (d.item) { const it = _uf(day, "chI", () => ({})); it[d.item] = (it[d.item] || 0) + 1; }
      if (d.xp) day.chX = (day.chX || 0) + d.xp;
      if (d.from) { const f = _uf(day, "chF", () => ({})); f[d.from] = (f[d.from] || 0) + 1; }
      if (d.waited >= 0) { const w = _uf(day, "chWait", () => [0, 0]); w[0] += d.waited; w[1]++; }
      break;
    }
  }
}
// The new-word brake as the day saw it (finish date only): its state
// at the first check, its latest state, and the hour it lifted.
function usageNoteBrake(reason, overdue) {
  try {
    const d = usageDay(), r = reason || "none";
    if (!d.brk) { d.brk = { am: r, now: r, od: overdue }; return; }
    if (d.brk.now !== r) { d.brk.now = r; if (r === "none") d.brk.off = new Date().getHours(); }
  } catch (e) {}
}
function _usageQuest(day, tpl, i) {
  if (!tpl) return;
  const qt = _uf(day, "qt", () => ({}));
  if (!qt[tpl]) qt[tpl] = [0, 0, 0];
  qt[tpl][i]++;
}
// Words per tier at the end of each Today session: the day's last one
// is the day's closing picture, so growth can be followed day by day.
// Also the day's plan picture so far: right answers toward the plan,
// due words actually reviewed, what's still due/overdue, chests waiting.
function _usageTierSnapshot() {
  setTimeout(() => {
    try {
      if (typeof pathScan !== "function") return;
      const scan = pathScan(true), day = usageDay();
      day.tiers = { ...scan.tiers };
      day.end = { ok: (S.quests && S.quests.m && S.quests.m.ok) || 0, rev: typeof pathReviewedToday === "function" ? pathReviewedToday() : 0,
        due: scan.due, od: scan.overdue, pend: (S.quests && S.quests.pending || []).length };
      // owed0: the day finished everything it owed (path.js pathOwed) — the
      // days planRate learns from
      if (typeof pathOwedAny === "function" && !pathOwedAny()) day.owed0 = 1;
    } catch (e) {}
  }, 0);
}
// A phrase spoken with the phone's voice because the pack has no
// recording for it (see audio.js).
function usageNoteTts() { try { const d = usageDay(); d.tts = (d.tts || 0) + 1; } catch (e) {} }

// Visible minutes: a heartbeat while the page is visible.
let _usageBeat = null;
function startUsageClock() {
  clearInterval(_usageBeat);
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach(ev =>
    document.addEventListener(ev, _usageNoteInput, { passive: true, capture: true })); // same function: added once
  _usageBeat = setInterval(() => {
    if (document.visibilityState !== "visible") return;
    const d = usageDay();
    d.min = Math.round((d.min + 0.5) * 10) / 10;
    if (Date.now() - _usageLastInput <= USAGE_IDLE_MS) { d.act = Math.round(((d.act || 0) + 0.5) * 10) / 10; _usageActMs += 30000; }
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
    addInto(modes, v.ans, 2); addInto(games, v.gp, 3); addInto(gx, v.gx, 7);
    addInto(sessions, v.ses, 3); addInto(sx, v.sx, 8); addInto(latm, v.latm, 2);
    Object.entries(v.scr || {}).forEach(([k, n]) => scr[k] = (scr[k] || 0) + n);
    Object.entries(v.ev || {}).forEach(([k, n]) => ev[k] = (ev[k] || 0) + n);
  });
  const hours = new Array(24).fill(0), hoursOk = new Array(24).fill(0);
  const hoursOkN = new Array(24).fill(0);
  // hrOk was added mid-day: the first day that has it is partial (hours
  // before the update count answers but no right ones), so it is left out
  // of the by-hour accuracy — unless it is also the first day logged.
  const hrOkFirst = days.findIndex(([, v]) => v.hrOk);
  days.forEach(([, v], di) => {
    (v.hr || []).forEach((x, i) => hours[i] += x || 0);
    if (v.hrOk && !(di === hrOkFirst && hrOkFirst > 0)) v.hrOk.forEach((x, i) => { hoursOk[i] += x || 0; hoursOkN[i] += (v.hr || [])[i] || 0; });
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
  const actDays = activeDays.filter(([, v]) => v.act != null);
  const actMin = actDays.reduce((a, [, v]) => a + v.act, 0), actScreen = actDays.reduce((a, [, v]) => a + v.min, 0);
  lines.push(`Active days: ${active}/${nDays > 0 ? nDays : span} · minutes on screen: ${Math.round(minutes)} (avg ${active ? Math.round(minutes / active) : 0}/active day)` +
    (actDays.length ? ` · of those, minutes with a touch/key/answer in the last ${USAGE_IDLE_MS / 1000}s: ${Math.round(actMin)} of ${Math.round(actScreen)} on the ${actDays.length} day${actDays.length > 1 ? "s" : ""} measured = ${pct(actMin, actScreen)} (the rest: app left open)` : "") + ` · app opens: ${sum(v => v.open)} · returns to the app: ${sum(v => v.show)}`);
  lines.push(`Answers: ${totalAns} · typing latency avg ${latN ? (latS / latN / 1000).toFixed(1) + "s" : "—"} · spoken: ${sum(v => v.voice)} · near-misses: ${sum(v => v.near)} · hints: ${sum(v => v.hint)} · phone-voice fallbacks: ${sum(v => v.tts)}`);
  lines.push(`By mode (answers, ok, avg time): ` + Object.entries(modes).sort((a, b) => b[1][0] - a[1][0]).map(([m, a]) => `${m} ${a[0]} (${pct(a[1], a[0])} ok${latm[m] ? ", " + secs(latm[m][0], latm[m][1]) : ""})`).join(" · "));
  lines.push(`Sessions (started/finished/abandoned): ` + Object.entries(sessions).map(([k, a]) => `${k} ${a[0]}/${a[1]}/${a[2]}`).join(" · "));
  const sxl = Object.entries(sx).filter(([, a]) => a[0] || a[3]);
  if (sxl.length) lines.push(`Session detail (finished: avg length from start to end${sxl.some(([, a]) => a[7]) ? " (avg active time, from the sessions that logged it)" : ""}, answers · abandoned: avg length, answers before leaving): ` +
    sxl.map(([k, a]) => `${k} ${mins(a[1], a[0])}${a[7] ? ` (active ${mins(a[6], a[7])})` : ""}, ${a[0] ? Math.round(a[2] / a[0]) : "—"} · ${mins(a[4], a[3])}, ${a[3] ? Math.round(a[5] / a[3]) : "—"}`).join(" | "));
  lines.push(`Games (started/finished/quit): ` + (Object.entries(games).map(([g, a]) => `${g} ${a[0]}/${a[1]}/${a[2]}`).join(" · ") || "none"));
  const gxl = Object.entries(gx).filter(([, a]) => a.some(x => x));
  if (gxl.length) lines.push(`Game detail (ok% · avg finished${gxl.some(([, a]) => a[6]) ? " (avg active, from the games that logged it)" : ""} · avg time before quitting · quit before playing; a game left open counts 10 min at most): ` +
    gxl.map(([g, a]) => { const fin = (games[g] || [])[1] || 0, q = (games[g] || [])[2] || 0;
      return `${g} ${pct(a[0], a[0] + a[1])} · ${secs(a[2], fin)}${a[6] ? ` (active ${secs(a[5], a[6])})` : ""} · ${secs(a[3], q)} · ${a[4]}`; }).join(" | "));
  const mk = {}, sf = {};
  days.forEach(([, v]) => { Object.entries(v.mk || {}).forEach(([k, n]) => mk[k] = (mk[k] || 0) + n); Object.entries(v.sf || {}).forEach(([k, n]) => sf[k] = (sf[k] || 0) + n); });
  if (Object.keys(mk).length) lines.push(`Mistakes by type: ` + Object.entries(mk).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
  if (Object.keys(sf).length) lines.push(`Writing slips on accepted answers: ` + Object.entries(sf).map(([k, n]) => `${k} ${n}`).join(" · "));
  // Path answers by the word's tier BEFORE the answer × exercise, so each
  // tier's real accuracy (and which exercises feed it) can be checked.
  const bt = {};
  days.forEach(([, v]) => Object.entries(v.bt || {}).forEach(([tk, o]) => addInto(bt[tk] || (bt[tk] = {}), o, 2)));
  const btl = TIERS.filter(t => bt[t.id]).map(t => {
    const ex = Object.entries(bt[t.id]).sort((a, b) => b[1][0] - a[1][0]);
    const n = ex.reduce((a, [, x]) => a + x[0], 0), ok = ex.reduce((a, [, x]) => a + x[1], 0);
    return `${t.icon}${t.name} ${n} (${pct(ok, n)}): ` + ex.map(([k, x]) => `${k} ${x[0]}/${pct(x[1], x[0])}`).join(", ");
  });
  if (btl.length) lines.push(`Path answers by the word's tier before the answer (answers, ok%: exercise answers/ok%; recorded since ${days.find(([, v]) => v.bt)[0]}): ` + btl.join(" | "));
  lines.push(...usageRebuiltLines(days));
  // Last 7 active days against the 7 before them.
  const doneDays = activeDays.filter(([d]) => d !== today); // today is still partial
  if (doneDays.length >= 14) {
    const stat = rows => {
      const f = (fn) => rows.reduce((a, [, v]) => a + (fn(v) || 0), 0);
      const n = f(v => Object.values(v.ans || {}).reduce((a, x) => a + (x[0] || 0), 0)), ok = f(v => Object.values(v.ans || {}).reduce((a, x) => a + (x[1] || 0), 0));
      const am = rows.filter(([, v]) => v.act != null);
      return { n: Math.round(n / rows.length), ok: pct(ok, n), lat: secs(f(v => v.lat[0]), f(v => v.lat[1])), min: Math.round(f(v => v.min) / rows.length),
        act: am.length ? Math.round(am.reduce((a, [, v]) => a + v.act, 0) / am.length) : null };
    };
    const a = stat(doneDays.slice(-7)), b = stat(doneDays.slice(-14, -7));
    lines.push(`Trend, last 7 finished active days vs the 7 before (today left out): answers/day ${a.n} vs ${b.n} · answers right ${a.ok} vs ${b.ok} · typing latency ${a.lat} vs ${b.lat} · minutes on screen/day ${a.min} vs ${b.min}` + (a.act != null && b.act != null ? ` (active ${a.act} vs ${b.act})` : ""));
  }
  lines.push(`Quests: done ${sum(v => v.q[0])} · rerolled ${sum(v => v.q[1])} · swapped 🔇 ${sum(v => v.q[2])} · full days ${sum(v => v.q[3])}`);
  const qs = Object.entries(qStats).sort((a, b) => b[1][0] - a[1][0]);
  if (qs.length) lines.push(`Quest templates (offered/done/rerolled+swapped): ` + qs.map(([k, a]) => `${k} ${a[0]}/${a[1]}/${a[2]}`).join(" · "));
  lines.push(`Random events: ` + (Object.entries(ev).map(([k, n]) => `${k} ${n}`).join(" · ") || "none"));
  lines.push(...usageChestLines(days, activeDays.length));
  lines.push(`Bonus rounds offered/taken: ${sum(v => v.bonus[0] + v.bonus[1])}/${sum(v => v.bonus[1])} · twists declined/taken: ${sum(v => v.twist[0])}/${sum(v => v.twist[1])} · drag vs tap: ${sum(v => v.drag[0])}/${sum(v => v.drag[1])}`);
  lines.push(`Busiest hours: ${peak.join(", ") || "—"}`);
  const hAcc = hours.map((n, h) => [h, hoursOkN[h], hoursOk[h]]).filter(x => x[1] >= 20);
  if (hAcc.length) lines.push(`Accuracy by hour (≥20 answers): ` + hAcc.map(([h, n, ok]) => `${h}h ${pct(ok, n)}`).join(" · "));
  if (Object.keys(scr).length) lines.push(`Screens opened: ` + Object.entries(scr).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
  lines.push(`Words by tier now: ` + TIERS.map(t => `${t.icon}${t.name} ${tiers[t.id]}`).join(" · "));
  lines.push(`Daily goal ${getDailyGoal()} · new/day ${S.path.deadline ? `auto ${pathPace()} (finish by ${S.path.deadline})` : S.path.newPerDay} · level ${currentLevel()} · streak ${getDailyStreak()}d`);
  if (typeof vxReportLines === "function") lines.push(...vxReportLines());
  if (typeof cxReportLines === "function") lines.push(...cxReportLines());
  // One line per active day: the trend at a glance.
  const cxOnNow = typeof cxOn === "function" && cxOn();
  lines.push(``, `Per day (date · minutes on screen/active · answers · typed ok · typed latency · path sessions started/finished/abandoned · games started/quit · new words met · words up/down${typeof vxOn === "function" && vxOn() ? " · verbs: 📖 sheets passed/failed, ↩ misses looked up in the sheet, 🏆 mastery passed/taken, 🎯 drill right/answers, 🧩 items started, 📒 ledger forms" : ""}${cxOnNow ? " · grammar course: answers right/all, 📖 sheets passed/failed, 🎓 test-outs passed/taken, 🎯 drills, 🏁 checkpoints passed/taken, ✍️ texts (words)" : ""}):`);
  activeDays.forEach(([d, v]) => {
    const t = (v.ans || {})["path:typed"] || [0, 0];
    const p = (v.ses || {}).path || [0, 0, 0];
    const g = Object.values(v.gp || {}).reduce((a, x) => [a[0] + (x[0] || 0), a[1] + (x[2] || 0)], [0, 0]);
    const n = Object.values(v.ans || {}).reduce((a, x) => a + (x[0] || 0), 0);
    const vx = v.vx ? ` · 📖${v.vx.sh || 0}/${v.vx.sf || 0}${v.vx.rv ? ` ↩${v.vx.rv}` : ""}${v.vx.ma ? ` 🏆${v.vx.mp || 0}/${v.vx.ma}` : ""}${v.vx.dr ? ` 🎯${v.vx.dr[1]}/${v.vx.dr[0]}${v.vx.drv ? `+${v.vx.drv}` : ""}` : ""} 🧩${v.vx.in || 0} 📒${v.vx.cell || 0}${v.vx.u ? " [" + v.vx.u.join(", ") + "]" : ""}${v.vx.on !== undefined ? (v.vx.on ? " [switched on]" : " [switched off]") : ""}` : "";
    const ca = Object.entries(v.ans || {}).filter(([k]) => k.startsWith("course:")).reduce((a, [, x]) => [a[0] + (x[0] || 0), a[1] + (x[1] || 0)], [0, 0]), c = v.cx;
    const cx = ca[0] || c ? ` · ✎${ca[1]}/${ca[0]}${c && (c.sh || c.sf) ? ` 📖${c.sh || 0}/${c.sf || 0}` : ""}${c && c.to ? ` 🎓${c.to[1]}/${c.to[0]}` : ""}${c && c.dr ? ` 🎯${c.dr}` : ""}${c && c.cp ? ` 🏁${c.cp[1]}/${c.cp[0]}` : ""}${c && c.wr ? ` ✍️${c.wr} (${c.ww || 0}w)` : ""}` : "";
    lines.push(`${d} · ${Math.round(v.min)}${v.act != null ? "/" + Math.round(v.act) : ""} · ${n} · ${pct(t[1], t[0])} · ${secs(v.lat[0], v.lat[1])} · ${p[0]}/${p[1]}/${p[2]} · ${g[0]}/${g[1]} · ${v.met ?? "—"} · ${v.up ?? "—"}/${v.down ?? "—"}${vx}${cx}`);
  });
  lines.push(...usagePlanLines(activeDays));
  const json = JSON.stringify({ app: STORAGE_KEY, generated: new Date().toISOString(), days: Object.fromEntries(days), quests: qStats, tiers });
  return lines.join("\n") + "\n\n--- JSON ---\n" + json;
}
// Pieces that can be rebuilt from the progress itself, so they cover
// days the daily counts didn't: the Path queues as planned (from when
// they were recorded), the cloze supply right now, misses per day from
// the per-word histories, lifetime accuracy by tier.
function usageRebuiltLines(days) {
  const out = [], pct = (a, b) => b ? Math.round(a / b * 100) + "%" : "—";
  try {
    const pm = { t: {}, k: 0, kz: 0 }; let since = "";
    days.forEach(([d, v]) => {
      if (!v.pm) return;
      since = since || d;
      Object.entries(v.pm.t || {}).forEach(([k, n]) => pm.t[k] = (pm.t[k] || 0) + n);
      pm.k += v.pm.k || 0; pm.kz += v.pm.kz || 0;
    });
    if (since) out.push(`Path queues as planned (items by exercise, since ${since}): ` + Object.entries(pm.t).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · ") +
      ` · of ${pm.k} Known+ items, ${pm.kz} had a sentence a cloze could use (${pct(pm.kz, pm.k)})`);
  } catch (e) {}
  try {
    if (typeof vocabGroups === "function" && typeof clozeTarget === "function" && typeof pathWord === "function") {
      let k = 0, kz = 0, r = 0, rz = 0;
      vocabGroups().forEach(g => g.decks.forEach(d => d.words.forEach((_, i) => {
        const ws = S.words[d.id + "_" + i];
        if (!ws) return;
        const was = ws.rt ? (ws.rtWas || {}).st || 0 : ws.st || 0;
        if (was < STAGE_KNOWN) return;
        const cz = !!clozeTarget(pathWord(d.id, i));
        if (ws.rt) { r++; if (cz) rz++; } else { k++; if (cz) kz++; }
      })));
      out.push(`Cloze supply now: ${k} Known+ words in the word reviews, ${kz} with a sentence a cloze could use (${pct(kz, k)}); ` +
        `${r} cards that were Known+ when the verb track took them over (${rz} had such a sentence — they no longer feed cloze)`);
    }
  } catch (e) {}
  try {
    // Misses per day: every word keeps its last LEARN_HIST misses, so recent days are
    // complete and older ones only hold what each word still remembers.
    const per = {}, add = (date, type) => { const o = per[date] || (per[date] = {}); o[type] = (o[type] || 0) + 1; };
    Object.values(S.words || {}).forEach(ws => (ws && ws.mh || []).forEach(h => h && h[0] && add(String(h[0]), h[2] || "?")));
    Object.values((S.learn && S.learn.verbs) || {}).forEach(v => (v.mh || []).forEach(h => h && h[0] && add(String(h[0]), h[5] || "?")));
    const ds = Object.keys(per).sort().slice(-21);
    if (ds.length) out.push(`Misses per day, rebuilt from the per-word histories (the learning log began ${(S.learn && S.learn.since) || "?"}; each word keeps its last ${LEARN_HIST}, so busy words can fall short; types ranked, gender always shown): ` +
      ds.map(d => {
        const o = per[d], n = Object.values(o).reduce((a, x) => a + x, 0);
        const top = Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, x]) => `${k} ${x}`);
        if (o.gender && !top.some(x => x.startsWith("gender "))) top.push(`gender ${o.gender}`);
        return `${d.slice(5)} ${n} (${top.join(", ")})`;
      }).join(" | "));
  } catch (e) {}
  try {
    const t = {};
    Object.values(S.words || {}).forEach(ws => {
      if (!ws || ws.rt) return;
      const n = (ws.correct || 0) + (ws.wrong || 0);
      if (!n || typeof tierOfStage !== "function") return;
      const id = tierOfStage(ws.st || 0).id, o = t[id] || (t[id] = [0, 0]);
      o[0] += ws.correct || 0; o[1] += n;
    });
    const parts = TIERS.filter(x => t[x.id]).map(x => `${x.icon}${x.name} ${pct(t[x.id][0], t[x.id][1])} of ${t[x.id][1]}`);
    if (parts.length) out.push(`Lifetime right answers by the word's tier now (words reach higher tiers by answering right, so this flatters them): ` + parts.join(" · "));
  } catch (e) {}
  return out;
}
// Chests: earned and opened by source, rarity mix against the base
// odds, what decided the rarity, items, where they were opened. Opened
// chests of days before the daily counts existed come from this
// device's raw log.
function usageChestLines(days, nActive) {
  const RAR = ["common", "rare", "epic", "legendary"];
  const earned = {}, opened = {}, why = {}, items = {}, from = {};
  let xp = 0, lost = 0, waitS = 0, waitN = 0;
  const chSince = {};
  const add = (o, k, n = 1) => o[k] = (o[k] || 0) + n;
  days.forEach(([d, v]) => {
    Object.entries(v.chE || {}).forEach(([k, n]) => add(earned, k, n));
    if (v.ch) {
      chSince[d] = v.chSince || 0;
      Object.entries(v.ch).forEach(([k, a]) => { if (!opened[k]) opened[k] = [0, 0, 0, 0, 0]; a.forEach((x, i) => opened[k][i] += x || 0); });
    }
    Object.entries(v.chW || {}).forEach(([k, n]) => add(why, k, n));
    Object.entries(v.chI || {}).forEach(([k, n]) => add(items, k, n));
    Object.entries(v.chF || {}).forEach(([k, n]) => add(from, k, n));
    xp += v.chX || 0; lost += v.chLost || 0;
    if (v.chWait) { waitS += v.chWait[0]; waitN += v.chWait[1]; }
  });
  const first = days.length ? days[0][0] : todayISO();
  _usageLog().forEach(e => {
    if (e.e !== "chest") return;
    const d = usageDateOf(e.t);
    if (d < first || (d in chSince && e.t >= chSince[d])) return;
    const k = e.src || "?", r = RAR.indexOf(e.rar);
    if (!opened[k]) opened[k] = [0, 0, 0, 0, 0];
    opened[k][0]++; if (r >= 0) opened[k][r + 1]++;
  });
  const tot = [0, 0, 0, 0, 0];
  Object.values(opened).forEach(a => a.forEach((x, i) => tot[i] += x));
  const pend = S.quests && S.quests.pending ? S.quests.pending.length : 0;
  const pct = (a, b) => b ? Math.round(a / b * 100) + "%" : "—";
  const out = [];
  out.push(`Chests: opened ${tot[0]} (${nActive ? (tot[0] / nActive).toFixed(1) : "—"}/active day) · waiting now ${pend}` +
    (Object.keys(earned).length ? ` · earned ${Object.values(earned).reduce((a, n) => a + n, 0)} (counted only since tracking began; opened also covers the days before)` : "") + (lost ? ` · lost to the 20 cap ${lost}` : "") +
    (waitN ? ` · avg wait before opening ${Math.round(waitS / waitN)} min` : "") + (xp ? ` · chest XP ${xp}` : ""));
  if (tot[0]) out.push(`Chest rarity (common/rare/epic/legendary): ${tot.slice(1).join("/")} = ${tot.slice(1).map(n => pct(n, tot[0])).join("/")} · per-roll odds before pity and minimum rarities 62.5/28/8/1.5%` +
    (Object.keys(why).length ? ` · decided by ` + Object.entries(why).map(([k, n]) => `${k} ${n}`).join(" · ") : ""));
  if (Object.keys(opened).length) out.push(`Chests by source (opened: c/r/e/l${Object.keys(earned).length ? " · earned" : ""}): ` +
    Object.entries(opened).sort((a, b) => b[1][0] - a[1][0]).map(([k, a]) => `${k} ${a[0]}: ${a.slice(1).join("/")}${earned[k] != null ? ` · ${earned[k]}` : ""}`).join(" | ") +
    Object.keys(earned).filter(k => !opened[k]).map(k => ` | ${k} 0 · ${earned[k]}`).join(""));
  if (Object.keys(items).length) out.push(`Chest items: ` + Object.entries(items).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
  if (Object.keys(from).length) out.push(`Chests opened from: ` + Object.entries(from).map(([k, n]) => `${k} ${n}`).join(" · "));
  return out;
}
// Finish-date plan, day by day: was it kept, did the brake fire, did
// the backlog shrink? (Days before this was recorded show —.)
function usagePlanLines(activeDays) {
  const rows = activeDays.filter(([, v]) => v.plan || v.brk || v.end);
  if (!rows.length) return [];
  const done = v => v.planAt != null || !!(v.qt && v.qt.a_plan && v.qt.a_plan[1]);
  const kept = rows.filter(([, v]) => done(v)).length;
  const out = [``, `Plan per day (date · morning due/overdue · plan reviews+new → target, left for later · right answers · due words reviewed · new met · brake morning→end (lifted at h) · plan done at h · at last session due/overdue · chests waiting · answers a word review / a verb item due took (kw/kv) · everything owed done · right/answers by source — rv reviews, rf fixes, rr repair round, w warm-ups, new new words, vxd/vxn/cell/vxr verbs, q spot check / word of the day, xq for another quest, x extra practice): plan finished ${kept}/${rows.length} days`];
  rows.forEach(([d, v]) => {
    const p = v.plan || {}, b = v.brk, e = v.end || {};
    const f = x => x == null ? "—" : x;
    out.push(`${d} · ${f(p.due)}/${f(p.od)} · ${p.rev != null ? `${p.rev}+${p.pace}${p.vx ? ` (verbs: ${p.vx.due} due, ${p.vx.items} new, ${p.vx.cells} drills, ${p.vx.sheets} sheets)` : ""} → ${p.tgt}, leave ${p.leave}` : "—"} · ${f(e.ok)} · ${f(e.rev)} · ${f(v.met)} · ${b ? `${b.am}→${b.now}${b.off != null ? ` (${b.off}h)` : ""}` : "—"} · ${v.planAt != null ? v.planAt + "h" : done(v) ? "done" : "not done"} · ${f(e.due)}/${f(e.od)} · ${f(e.pend)} · ${f(p.kw)}/${f(p.kv)} · ${v.owed0 ? "owed done" : "—"} · ${v.src ? Object.entries(v.src).map(([k, x]) => `${k} ${x[1]}/${x[0]}`).join(" ") : "—"}`);
  });
  return out;
}
function copyUsageReport() {
  const text = buildUsageReport(0);
  copyTextToClipboard(text)
    .then(() => showCelebrateToast("📋", "Usage report copied", "Paste it into our next conversation"))
    .catch(() => { window.prompt("Copy the report:", text); });
}
