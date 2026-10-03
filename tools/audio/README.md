# Natural voices — how the voice packs are made and kept up to date

The app reads words and example sentences aloud. Instead of the phone's robotic
text-to-speech, every word and sentence is spoken once by a natural **AI voice**,
**Google "Chirp 3 HD", voice "Aoede"** (the same voice for German and French),
packed into `audio/<lang>/`, and downloaded inside the app (first-launch offer,
or Settings → Sound & voice) so it plays offline. Anything without a recording
still uses the phone's voice.

```
decks ─extract─▶ texts.json ─synth (Google)─▶ wav/ ─pack─▶ audio/de/   (served by GitHub Pages)
                                                            manifest.json + shard files
```

No GPU and no model download: each text is one request to Google. The app side
(`js/audio.js`) needs nothing from you.

## 1. One-time setup (about 10 minutes)

1. [console.cloud.google.com](https://console.cloud.google.com): create a project
   (e.g. `vocab-voices`).
2. **Billing**: link a billing account (Google asks for a card even for the free
   tier), then **Billing → Budgets & alerts**: a budget of €1 with an email alert.
3. **APIs & Services → Library**: enable **Cloud Text-to-Speech API**.
4. **APIs & Services → Credentials → Create credentials → API key**. Edit it:
   **API restrictions → Restrict key → Cloud Text-to-Speech API**.
5. Give the key to Claude's environment as a **credential** (environment menu in
   the session title bar → Edit → API credentials → Add credential):
   - **Allowed websites:** `texttospeech.googleapis.com`, **Path prefix:** `/v1/`
   - **Custom header:** Name **`X-Goog-Api-Key`**, Prefix **empty**, Value: the key
   The environment then adds the key to requests for Google's voice service; the
   scripts and Claude never see it. (On your own computer instead:
   `export GOOGLE_TTS_API_KEY=…`.) Never commit the key or paste it anywhere.

   The first thing every run does is a free call (Google's voice list, no
   characters billed) that checks the key works and the voice exists.

**Cost.** Google's free tier for Chirp 3 HD is 1,000,000 characters a month.
Both decks together are about **405,000** (German 244k, French 161k), so a full
run is free, and later updates only send the new texts. As a guard, the scripts
keep a monthly count in `state/usage.json` and **refuse to start** a run that
would take that month past 900,000 characters (checked before anything is sent;
safe even with two runs at once). That count only knows about runs made from this repository,
so keep the budget alert too.

## 2. Make the packs

Needs node 18+, Python 3 and ffmpeg (with libopus).

```bash
python tools/audio/run_all.py smoke    # 3 clips per language: key OK, voice OK? (seconds)
python tools/audio/run_all.py full     # everything: about 1.5–2 hours
```

`full` extracts every text the app can say, checks the character budget, makes
every clip (resumable: stop and re-run any time; nothing is made or paid for
twice), retries anything Google refused, packs both languages, checks coverage,
and writes `work/REPORT.md` and a listening page **`work/samples.html`** (48 random
clips with their text). Listen to it, then commit the `audio/` folders. The app
offers the download on its next launch.

`run_all.py pilot` makes ~20 clips per language and the listening page, to judge
the voice before a full run.

## 3. Changing the decks later: add, edit, remove

The packs are built so that **only what changed** is made again, and only what
changed is downloaded again by people who already have the pack.

| You change the decks… | What happens |
|---|---|
| **Add** a word or sentence | It has no recording yet, so it uses the phone's voice (never silence). `status` lists it. The next run records only the new ones. |
| **Edit** a word or sentence | The old text is no longer used; the new text counts as new. The old recording is dropped from the pack, the new one made. |
| **Remove** one | Its recording is dropped from the pack, and people's phones delete it on their next update. |
| **Re-order** words or decks | Nothing changes. |
| **Add a deck / level** | Only the new clips are made; a few new shard files appear. |
| **Rename** a deck | That deck's clips move to another shard: a few shards change, nothing is re-recorded. |
| **Add a word that another deck already has** | Nothing is recorded or re-downloaded: the clip is shared and stays where it is. |

### The routine (a few minutes)

```bash
node tools/audio/status.mjs --lang de     # how many texts have no recording yet? (no key needed)
python tools/audio/run_all.py full        # makes ONLY the new ones, repacks
git add audio tools/audio/state && git commit -m "Update voice packs" && git push
```
`extract` also prints what is new compared with the published pack, and warns
about cards the voice would read literally ("jmd. anrufen", "[always pl.]",
"der/die", "sth"): write those out on the card (or add an override) before
recording. The warning is repeated in `work/REPORT.md`. Add `--strict` to
`status` to make it exit 1 when anything is missing (for a CI check).

### What is kept, and what can be lost
`tools/audio/work/` (texts, the raw WAVs, about 1.5 GB) is **not** in git and
disappears with the machine or session that made it. That is fine:
- `synth.py` counts every clip already in the published pack as made, so a
  fresh machine only records texts that are new or whose wording changed;
- `pack.mjs` takes those clips byte for byte from the published pack, so the
  rebuilt pack is identical apart from what changed (tested: no WAVs at all
  plus one new sentence → one request to Google, 1 of 22 files changed).

What must not be lost is small and is in git, in `tools/audio/state/`:
`<lang>/spoken.json` (what each clip was made from, so a changed override is
noticed), `<lang>/variants.json` (which clips needed a full stop) and
`usage.json` (characters sent per month). Commit it together with `audio/`.

### What people get
On launch the app compares versions. If the update is **small** (under 8 MB,
which is any ordinary round of deck edits) it downloads quietly and shows
"Voices updated". A bigger one waits at Settings → Sound & voice → **Update**.
Files the browser has dropped are restored the same way. Until a new text is
recorded it simply uses the phone's voice.

How the packs stay small to update: each deck's clips always live in the same
shard file (chosen from the deck's name, clips sorted by key), and encoding is
byte-for-byte reproducible, so editing a deck changes that deck's shard and
nothing else (a text used by several decks stays in the shard it is already
in). Tested on a fresh machine with no work folder: a new German deck, an
edited sentence and a removed card, plus a new French conjugation card →
9 + 3 clips recorded, 3 of 22 and 2 of 15 shards changed; a phone that had the
old pack updated by itself, fetched only those files, and every card,
including the new ones, played its recording, also offline. Measured at full size: adding a word and changing a sentence in
one deck changed **2 of 33 shards (4.4 MB)**; rebuilding everything from scratch
changed **0**.

### Near-silent clips (handled automatically)
For some very short words ("oui", "et", "bist", "ja"…) Google sometimes returns
a quarter second of near-silence instead of speech. `synth.py` checks every clip's
level and re-makes a near-silent one as "word.", "Word.", "word!" or "Word!" until
one is audible (`state/<lang>/variants.json` lists which). `pack.mjs` also refuses
any clip quieter than −30 dB, so the worst case is the phone voice, never silence.
In the first real run this caught 45 of 18,477 clips, all fixed: some by a plain
retry, the rest by a full stop or exclamation mark. The listening page has a
section with the ones that needed a changed spelling, to check by ear.

### Cut-off endings (handled automatically)
Google sometimes stops a clip in the middle of its last sound (the end of
"puissent", "die Standpunkte", "um … zu"). `synth.py` checks how loud the last
50 ms of every clip is: if it is within 25 dB of the clip's peak, the text is
asked for again, then sent as "text." and "text,", and the cleanest ending is
kept. `python tools/audio/synth.py --lang de --redo-cut` re-checks every clip
already made (this re-made 343 German and 105 French clips in the first pass).
Google's takes also vary from one request to the next, so asking again often
gives a better clip.

### "…" in a text
The typographic "…" made Google add a stray sound or clip the end, so it is
always sent as three plain dots "...", which give a clean pause. "je … desto"
alone was read with a French "je", "um … zu" with an English "um" and "ohne
… zu" with "su": those three carry sound hints (below), and for them and
"entweder … oder" the take with a clear pause was picked by measuring several
takes.

### French verb forms are said with their pronoun
A conjugation card's bare form, said alone, is often read as a different word:
"as" came out as "ass" (like the playing card, *un as*), "ai" as "aï", "es" as "ess", "est"
as "east", and "puissent" was clipped. So for French, `extract` gives every
bare verb form that belongs to one pronoun its pronoun ("as" → "tu as", "ai" →
"j'ai", "puissent" → "qu'ils puissent"), and a form shared by several
pronouns too when it is short (≤ 3 letters) or ends in a silent "-ent"
(337 forms). A form that is also an ordinary vocabulary word ("fait", "dit",
"écrit") stays bare. German forms are fine alone, so German is unchanged
(`SAY_WITH_PRONOUN` in `lib.mjs`).

### Fixing one clip or a pronunciation
- **Flagging in the app:** after a recording plays, a small ⚑ shows at the
  right edge for a few seconds. Tap it, add a note if you like ("French
  accent", "cut off"). Settings → Sound & voice → "Copy N flagged recordings"
  copies the list (kept on the phone until you clear it). Paste it to Claude,
  or save it as `flagged.txt` and use it with `--redo-file` as it is. The notes
  say what to fix (an override, a sound hint, or just a new take).
- **A clip sounds wrong:** put its text (one per line) in a file, run
  `python tools/audio/synth.py --lang de --redo-file list.txt`, then
  `python tools/audio/run_all.py pack`.
- **Google keeps mispronouncing a word:** add it to `tools/audio/overrides/<lang>.json`,
  e.g. `{"Hallo": "Halo"}` (the deck text → how to say it). It's used for
  synthesis only; the app still finds the clip under the original text. The
  next `synth.py` / `run_all.py full` re-makes it by itself: `state/<lang>/spoken.json`
  remembers what each clip was made from, and a clip whose wording changed is
  made again. The German overrides also spell out placeholders ("Ich heiße
  (name)." → "Ich heiße …"). Better still, fix the card itself: Google reads
  dictionary shorthand literally, so cards say "jemandem etwas versprechen",
  not "jmd. (DAT) etw. (AKK) versprechen" (the case goes in the card's hint), and
  notes go in round brackets, which the app leaves out when it speaks:
  "die Vokabeln (always pl.)".
- **Google uses the wrong sounds for a word** (a French "je" in "je … desto", an
  English "um", "zu" as "su"): give the override a sound hint in IPA,
  `{"je … desto": {"say": "je ..., desto ...", "sounds": {"je": "je", "desto": "dɛsto"}}}`.
  Google follows it (Chirp 3 HD "custom pronunciations"). It checks the IPA and
  refuses symbols it doesn't take, e.g. the length mark "ː": write "je", not "jeː".
  Changing a hint re-makes the clip like any other override change.
- **To hear chosen clips:** list them in a JSON file
  (`{"de": {"Abbreviations": ["z.B.", "d.h."]}}`) and run
  `node tools/audio/samples.mjs --check list.json --out check.html`.
- **Phrases the app had to speak with the phone voice** (a verb form a game
  made up, say): Settings → Sound & voice → "Copy N phrases…", save as
  `missing.txt`, then `node tools/audio/extract.mjs --lang de --extra missing.txt`
  and run as above.

## 4. The individual steps

```bash
node tools/audio/extract.mjs --lang de     # every text the app can say → work/de/texts.json (+ what changed)
node tools/audio/status.mjs  --lang de     # coverage of the published pack
python tools/audio/synth.py  --lang de     # make the clips with Google (resumable; --engine tone = test beeps)
node tools/audio/pack.mjs    --lang de     # → audio/de/  (and what changed for existing users)
node tools/audio/samples.mjs               # → work/samples.html, a listening page
```
German is about 10.8k clips, French about 7.7k (words and short phrases 5.8k /
4.0k, sentences 5.0k / 3.7k).

## 5. Size and format

`pack.mjs` trims silence, evens out loudness, and encodes mono Opus at 24 kbps
(`--bitrate`). The full pipeline at full size with test tones of speech-like length
gave **German 65.6 MB** (words 20, sentences 46; 33 shard files) and **French
43.7 MB** (13 + 31; 22 files). Real speech at the same bitrate should come out
similar or smaller; `pack` prints the real figure. People can download words
only or everything.

Opus-in-Ogg plays in current Chrome, Firefox and Edge, and in Safari/iOS from
18.4. If older iPhones matter, build with `--format aac --bitrate 40` (about
1.7× larger). The format is written into `manifest.json`; the app needs no
change, and a browser that can't play it simply keeps the phone voice.

## iPhone / iPad (Safari and the home-screen app)

- **iOS 18.4 or later is needed for the default Opus pack.** Before 18.4
  Safari can't play Opus in an Ogg file (it only did in Apple's CAF format,
  which no other browser reads). On such a phone the app simply hides the
  feature and keeps the system voice; nothing breaks. For older iPhones build
  with `--format aac --bitrate 40` (about 1.7× larger, plays everywhere).
  The AAC pack builds and is correctly hidden by browsers that can't decode it,
  but I could not run AAC playback anywhere (the test browser has no AAC
  decoder), so check it on a real phone before relying on it.
- **Silent switch and music.** The recordings play through an HTML `<audio>`
  element, which iOS treats as media playback: they play even when the ringer
  switch is on silent (the old system voice did not), and they can pause music
  or a podcast that is playing. Once a pack is installed the app's own chimes
  follow the same rule. There is deliberately no setting for this and no
  "natural voice" switch: the Sound switch (Settings → Sound & voice) is the one
  way to silence the app, and the system voice is only the fallback. For someone
  who hasn't downloaded the pack the app never touches audio.
- **Storage.** The home-screen app is exempt from Safari's rule that deletes a
  website's stored data after 7 days without a visit; a plain Safari tab is not.
  The app notices missing files and offers "Repair". The home-screen app also
  has its own storage, separate from Safari: a pack downloaded in a tab must
  be downloaded again inside the installed app.
- **Download while locked/backgrounded.** iOS suspends a backgrounded page, so
  the download pauses. The app keeps the screen awake while it downloads, shows
  "Keep the app open", and resumes from where it stopped.

### Checking a real iPhone (5 minutes)
1. Open the app (ideally the home-screen version), accept the download offer on
   Wi-Fi. Watch the progress pill; lock/unlock the phone once midway, then
   tap Download again if it stopped.
2. Settings → Sound & voice → **▶ Hear a sample**. It reports plainly if the
   phone won't play it.
3. Play a Today session: words and sentences should sound natural; tap 🐢
   Slower. With the ringer switch on silent you should still hear them.
   Turn the **Sound** switch off: everything should go quiet.
4. Turn on airplane mode, force-quit the app, reopen: words should still play.
5. With music playing in the background, note whether it pauses.

## What was and wasn't tested
Tested here:
- The Google generator against a fake Google server that misbehaves on purpose:
  rate-limit and server errors (retried), a refused text (recorded, the rest
  carries on), audio without a WAV header (wrapped), a wrong or missing key (stops
  at once with what to check), the budget cap (refuses before sending anything;
  holds with six processes at once, no lost counts), the request rate (retries
  included), resume without re-sending, and the key never appearing in output,
  files or URLs.
- The whole pipeline at full size for both languages with test tones (18,477
  clips), including killing it midway and restarting; a real deck edit through
  the maintenance routine; byte-identical rebuilds; stable shards.
- The whole app side in Chromium: first-launch offer, download with progress,
  stop and resume, damaged-file rejection, storage full, a dropped connection,
  offline playback, quiet auto-update (and not for big updates, offline, or with
  no pack), repair, words-only, fallback to the phone voice, old and new service
  workers, every game in both languages with no errors, every clip decoding, and
  100% of deck texts finding their recording.

**Not tested:** a call to the real Google service (that needs your key: the
`smoke` step does it in seconds), anything on a real iPhone (use the checklist),
AAC playback, and how the voice sounds (listen to `samples.html`).
