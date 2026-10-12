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
- pack size: words 10.3 MB (4042 clips), sentences 19.3 MB (3650 clips), 15 files

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

## Third pass: German "…" pairs and cut-off endings
Reported by ear: "je … desto" sounded French, "um … zu" had something at the end.
- The "…" made Google add a stray sound or clip the end; every "…" is now sent as "...".
  "je … desto" is sent as "je ..., desto ..." (German "je"); for it and "um / ohne … zu",
  "entweder … oder" the take with a clear pause and clean ending was picked from several.
- A wider check found clips whose last sound was cut off (still loud in the last 50 ms):
  **343 German and 105 French**, all re-made; 2 borderline ones remain. synth.py now checks
  this on every clip (and `--redo-cut` re-checks old ones).
- Still 100% coverage; every packed clip decodes in the app (browser test 12/12).
  Characters sent this month: 418,534 (free tier 1,000,000).

Page: `check-cutoff.html` (the "…" phrases and examples of re-made endings, 51 clips).

## Fourth pass: three German phrases
"je … desto" still sounded French, "um … zu" and "ohne … zu" odd. They now carry IPA sound
hints that Google follows (je = /je/, desto = /dɛsto/, um = /ʊm/, zu = /tsu/, ohne = /onə/):
checked by giving a French hint on purpose, which came back with a French "zh". Three takes
each; take A is installed. Only these 3 clips changed (2 shard files). `pick-pairs.html` has
the takes and the old versions side by side. Characters sent this month: 418,904.

## Fifth pass: card text and the last two endings
- The German JM deck cards with dictionary shorthand are written out ("jmd. (DAT) etw. (AKK)
  versprechen" → "jemandem etwas versprechen", case kept in the hint; also überzeugen,
  umbringen, vertrauen, zustimmen, verfügen, aus Versehen machen). "die Vokabeln [always pl.]"
  now uses round brackets like "die Leute (always pl.)", so the app says just "die Vokabeln".
  Progress is kept: the app saves it by the card's position, not its text. 8 new clips.
- "ärgerlich über" and "Ne parle pas en mangeant !" re-made (best of four takes): no clip in
  either language now ends abruptly.
- 100% coverage, browser test 12/12. Characters sent this month: 419,249.
  Page: `check-latest.html` (these 10 clips).

## Sixth pass (Oct 11): phrases the app makes while it runs
The voice log showed phrases with no recording: verb forms the games build ("ich würde
besuchen", "bedeuten Sie"), the verb cards' answers ("triffst dich"), grammar-sheet examples.
`runtime.mjs` now lists every such phrase from the app itself (state/<lang>/runtime.tsv):
- **German A1 + A2:** Conjugation Slots, Verb Thread (also its 🎧 forms), the verb cards,
  grammar sheets, idioms, Today's cloze answers: 22,112 clips. "circa" re-made as "zirka"
  (it sounded Spanish).
- **French A1** (with the new French verb track): 10,826 clips; Verb Thread's 🎧-only forms wait.
- Verb forms are said without the display gap ("ich melde mich an", not "… an"); each game
  speaks through one function (conjSayText, threadSayText, vxSayText, gsSayText) that the
  tools call too. Word clips re-split: 80 shards (de), 60 (fr).
- Coverage: German 32,061/32,061, French 18,518/18,518; every clip decodes (browser test);
  tests pack, games, flag, runtime, update all pass.
- Characters sent this month: 929,028 (limit set for October: 930,000; free tier 1,000,000).
- Still to record: German B1 (~397k), French A2 + B1 + 🎧 forms (~619k): November and December.


## Seventh pass (Oct 12): the first B1 verbs
The voice log's 40 phrases all had recordings already (the phone had an older pack, whose
update is too big to come quietly; the app now shows a banner with a Download button for that).
German A1 + A2 stay 100% covered. The month's leftover characters went to the first 17 B1 verbs
in deck order, in full (`runtime.mjs --verbs`): erziehen, begleiten, sich verabreden, siezen,
trennen, sich fürchten, aufregen, beruhigen, erschrecken, leiden, behandeln, operieren, pflegen,
atmen, bluten, schwitzen, spülen — 1,173 clips. Coverage 33,335/33,335; tests pack, runtime,
flag, update pass. Characters sent this month: 948,755 (limit set: 950,000).
