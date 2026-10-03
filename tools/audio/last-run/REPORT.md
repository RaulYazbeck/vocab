# Voice pack report

Voice: Google Chirp 3 HD · Aoede. Generated in about 2 hours (Oct 3, 2026). Characters sent to Google this month: 405,585 (free tier: 1,000,000).

## de
- texts the app can say: **10785**
- recorded and in the pack: **10785**
- refused by Google (keep the phone voice): **0**
- pack size: words 13.9 MB (5781 clips), sentences 29.9 MB (5004 clips), 22 files

## fr
- texts the app can say: **7692**
- recorded and in the pack: **7692**
- refused by Google (keep the phone voice): **0**
- pack size: words 10.2 MB (4042 clips), sentences 19.3 MB (3650 clips), 15 files

Listening page: `tools/audio/last-run/samples.html` (download it and open it in a browser; it plays on phones too).

## After the run: near-silent short words
Google returned a near-silent quarter second for some very short words. They were found
(a level check on every clip, and a browser test that decodes every packed clip) and re-made:
- with a full stop / exclamation mark kept in `tools/audio/overrides/` (21): da, es, habt, hast, ist, ja, machen, voll, a, aies, bon, bu, cuit, dis, dû, fais, fait, merci, paie, pris, tu
- automatically by the new guard in synth.py: bist → bist., oui → oui., un → un., tout → tout., lui → lui., ou → ou., pas → Pas., es → Es., ai → Ai., tôt → tôt., et → Et!, pu → Pu., aie → Aie.
- by a plain retry: the rest of the 45
Result: 0 near-silent clips; 100% coverage (German 10,785/10,785, French 7,692/7,692);
every packed clip decodes in the app. Characters sent to Google this month: 405,585 (free tier 1,000,000).

## Second pass: pronunciation fixes
Reported by ear: French "as" sounded its s, "ai" its i, and "puissent" was clipped. Checked
with a phone recognizer (allosaurus) on every word clip, plus a hiss measure on clip endings:
- **French verb forms said with their pronoun** (337): "as" → "tu as", "ai" → "j'ai",
  "es" → "tu es", "est" → "il est", "puissent" → "qu'ils puissent"… (rule: SAY_WITH_PRONOUN in
  lib.mjs). The capitalised variants "Es.", "Ai.", "Aie." are gone with it.
- **"cuit"** is sent as "cuit," (with a full stop Google sounded the t); **"sera"** re-made
  (a stray hiss at the end).
- **German** dictionary shorthand read out in full ("jmd. etw. versprechen" → "jemandem etwas
  versprechen", "die Vokabeln always pl." → "die Vokabeln", "Ich heiße (name)." → "Ich heiße …",
  and the "die/das/den..." phrases); abbreviations (z.B., d.h., usw., bzw., ca.) were already
  read correctly.
- Still 100% coverage; every packed clip decodes in the app. Characters sent this month: 409,644.

Pages to check by ear: `check-fr.html` (the fixes, 136 clips) and `check-de.html` (German edge
cases, 163 clips).
