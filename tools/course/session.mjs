// What a build session needs: the chapters to upload and the lessons it
// builds — worked out from the course map (js/course/plan.js: each
// lesson's `ses`, the book lines it teaches, the exercises planned for it).
//   node session.mjs 2          one session
//   node session.mjs            every session
import fs from "node:fs";
import path from "node:path";
import { loadCourse, ROOT } from "./load.mjs";

// The last build session finished (bump it at the end of each session):
// every lesson of a session up to here has all its book exercises covered.
export const DONE = 1;

export function sessionPlans(C = loadCourse()) {
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/book/blueprint.json"), "utf8"));
  const out = {};
  const plan = n => out[n] || (out[n] = { n, lessons: [], chapters: new Set() });
  C.CX.sections.forEach(s => {
    const p = plan(s.ses || 0);
    p.lessons.push(s);
    // a chapter is needed when the lesson draws on a heading of it that has
    // exercises to mirror (an appendix: its tables)
    (s.book || []).forEach(([ch, h]) => { if (ch.startsWith("app") || (B[ch] ? B[ch].exercises : []).some(e => e.section === h)) p.chapters.add(ch); });
  });
  // exercises planned for a lesson: their chapter too
  Object.entries(C.CX.cov).forEach(([ex, c]) => {
    if (c && c.st === "planned" && C.CX.byId[c.sec]) plan(C.CX.byId[c.sec].ses || 0).chapters.add("c" + ex.split(".")[0]);
  });
  const order = ch => ch.startsWith("app") ? 100 + ch.charCodeAt(3) : +ch.slice(1);
  Object.values(out).forEach(p => { p.chapters = [...p.chapters].sort((a, b) => order(a) - order(b)); });
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const C = loadCourse(), P = sessionPlans(C), want = process.argv[2] ? [+process.argv[2]] : Object.keys(P).map(Number).sort((a, b) => a - b);
  const name = ch => ch.replace(/^c/, "").replace(/^app/, "appendix ");
  want.forEach(n => {
    const p = P[n];
    if (!p) return console.log(`Session ${n}: nothing planned`);
    console.log(`\nSession ${n} — upload chapters: ${p.chapters.map(name).join(", ") || "none"}`);
    console.log(`  builds: ${p.lessons.map(s => s.title + (s.verb ? " (its drills — the verb sheets exist)" : s.built ? " (built)" : "")).join(" · ")}`);
  });
}
