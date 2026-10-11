// Every form the verb track can ask (each verb × kind × person): the answer
// is the whole verb (prefix, pronoun, Sie), it and every accepted spelling
// grade right, the finite verb alone does not, the answer shown matches,
// and the prompt gives none of it away.
import { openApp } from "./browser.mjs";
const { browser, page, errors } = await openApp();
const out = await page.evaluate(() => {
  vxSwitchOn();
  const strip = h => { const d = document.createElement("div"); d.innerHTML = h; return d.innerText.replace(/…/g, " ").replace(/!/g, " ").replace(/\s+/g, " ").trim(); };
  const issues = {}, add = (k, s) => { (issues[k] = issues[k] || []).push(s); };
  let n = 0;
  const kinds = new Set(VX_RULES.map(r => r.kind).concat(["pr", "pt", "pf", "pq", "fu", "im", "sc", "p2"]));
  for (const x of vxVerbs()) for (const kind of kinds) for (const p of ["ich", "du", "er", "wir", "ihr", "sie", "Sie"]) {
    if (kind === "p2" && p !== "er") continue; // the Partizip II card asks er only
    const form = vxForm(x, kind, p, { modal: "müssen" });
    if (!form) continue;
    n++;
    const tag = `${x.inf} ${kind} ${p}`, F = x.F, ans = form.ans;
    if (!ans || /undefined|null|NaN|\s\s|…/.test(ans) || /undefined/.test(form.acc.join("|"))) add("bad answer text", `${tag} → "${ans}"`);
    const ex = { kind, x, p, form, tense: VX_KIND_TENSE[kind] };
    // the answer and every accepted spelling grade as right
    if (vxGrade(ans, ex) !== true) add("own answer not accepted", `${tag} → ${ans}`);
    form.acc.forEach(a => { if (vxGrade(a, ex) !== true) add("accepted spelling rejected", `${tag} → ${a}`); });
    // the whole verb: prefix, pronoun, Sie
    const words = ans.split(" ");
    const needSep = F.sep && ["pr", "pt", "im", "sc", "prsep", "imsep", "imfull", "ptsep"].includes(kind);
    if (needSep && !words.includes(F.sep)) add("prefix missing from answer", `${tag} → ${ans}`);
    const refl = F.refl ? (REFL[p] || "sich") : "";
    if (refl && !["p2only", "pvpr", "pvpt", "pvmod"].includes(kind) && !words.includes(refl) && !(kind === "p2" && words.includes("sich"))) add("pronoun missing from answer", `${tag} → ${ans}`);
    if (/^im/.test(kind) && p === "Sie" && !words.includes("Sie")) add("Sie missing from command", `${tag} → ${ans}`);
    // the finite verb alone must not pass when the answer has more
    if (words.length > 1 && (needSep || refl || (/^im/.test(kind) && p === "Sie")) && vxGrade(words[0], ex) === true) add("finite verb alone accepted", `${tag} → "${words[0]}" for ${ans}`);
    // what's shown after checking = the answer
    const shown = strip(vxFormHtml(ex)).toLowerCase();
    const want = ans.toLowerCase().replace(/\s+/g, " ");
    if (!shown.replace(/\s/g, "").includes(want.replace(/\s/g, ""))) add("shown answer differs", `${tag}: shows "${shown}" for "${ans}"`);
    // the prompt gives nothing of the answer away (beyond the person / context)
    const prompt = strip(vxPromptHtml(ex)).split(x.inf)[0].replace(/^.*?(Präsens|Präteritum|Perfekt|Plusquamperfekt|Futur I|Imperativ|Konjunktiv II · past|Konjunktiv II|Passiv)\s*/, "");
    const pw = prompt.toLowerCase().split(/[\s()]+/).filter(Boolean);
    const leak = words.filter(w => w.length > 1 && pw.includes(w.toLowerCase()) && !(w === "Sie" && kind !== "pvpr") && !["mit", "anna"].includes(w.toLowerCase()) && w.toLowerCase() !== p.toLowerCase());
    if (leak.length && !(/^im/.test(kind) && leak.every(w => w === "Sie"))) add("prompt shows part of the answer", `${tag}: prompt "${prompt}" ← ${leak.join(",")}`);
    if (/^im/.test(kind) && p === "Sie" && /\bSie\b.*\bSie\b/.test(prompt)) add("prompt shows Sie", `${tag}: ${prompt}`);
  }
  return { n, issues: Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, { count: v.length, first: v.slice(0, 8) }])) };
});
console.log("forms checked:", out.n);
console.log(JSON.stringify(out.issues, null, 1));
console.log("page errors:", errors.length ? errors.slice(0, 5) : "none");
await browser.close();
process.exit(Object.keys(out.issues).length || errors.length ? 1 : 0);
