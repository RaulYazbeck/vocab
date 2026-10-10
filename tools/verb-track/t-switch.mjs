import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp();
const out = await page.evaluate(() => {
  const t0 = performance.now();
  const p = vxPreview();
  const t1 = performance.now();
  const before = JSON.stringify(S.words).length;
  const unchanged = !vxOn() && !Object.keys(S.words).some(k => k.startsWith("vx_"));
  vxSwitchOn();
  const t2 = performance.now();
  const scan = pathScan(true);
  const units = VX_UNITS.map(u => u.id + ":" + vxUnitState(u.id)).join(" ");
  const vxKeys = Object.keys(S.words).filter(k => k.startsWith("vx_"));
  const seeded = vxKeys.map(k => k + "=" + S.words[k].st);
  const shadows = Object.values(S.words).filter(w => w.rt).length;
  const q = vxQuotas(scan);
  const pend = vxPendingSheets();
  const sess = buildPathQueue("regular");
  const kinds = sess.items.map(x => x.t + (x.w && x.w.vx ? ":vx" + (x.w.vx.cell ? "cell" : "") : "") + (x.t === "sheet" ? ":" + x.sheet : ""));
  return { previewMs: Math.round(t1 - t0), switchMs: Math.round(t2 - t1), unchanged, p: { before: p.before, after: { pace: p.after.pace, unmet: p.after.unmet, items: p.after.items, cells: p.after.cells, q: p.after.q, status: p.after.status }, retired: p.retired, seeds: p.seeds, units: p.units.map(u => u.id + ":" + u.st).join(" ") },
    units, seeded, shadows, pace: pathPace(scan), unmet: pathUnmet(scan), frontier: pathFrontier(scan).id, q, pend, kinds, ledger: vxLedger().levels, games: vlLevelTenses(), conj: conjLevelTenses() };
});
console.log(JSON.stringify(out, null, 1));
console.log("errors:", errors);
await browser.close();
