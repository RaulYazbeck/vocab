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
keep a monthly count in `work/usage.json` and **refuse to start** a run that
would take that month past 900,000 characters (checked before anything is sent;
safe even with two runs at once). That count only knows about this work folder,
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

### The routine (a few minutes)

```bash
node tools/audio/status.mjs --lang de     # how many texts have no recording yet? (no key needed)
python tools/audio/run_all.py full        # makes ONLY the new ones, repacks
git add audio && git commit -m "Update voice packs" && git push
```
`extract` also prints "+N new, −M no longer used" each time. Add `--strict` to
`status` to make it exit 1 when anything is missing (for a CI check).

### What people get
On launch the app compares versions. If the update is **small** (under 8 MB,
which is any ordinary round of deck edits) it downloads quietly and shows
"Voices updated". A bigger one waits at Settings → Sound & voice → **Update**.
Files the browser has dropped are restored the same way. Until a new text is
recorded it simply uses the phone's voice.

How the packs stay small to update: each deck's clips always live in the same
shard file (chosen from the deck's name, clips sorted by key), and encoding is
byte-for-byte reproducible, so editing a deck changes that deck's shard and
nothing else. Measured at full size: adding a word and changing a sentence in
one deck changed **2 of 33 shards (4.4 MB)**; rebuilding everything from scratch
changed **0**.

### Near-silent clips (handled automatically)
For some very short words ("oui", "et", "bist", "ja"…) Google sometimes returns
a quarter second of near-silence instead of speech. `synth.py` checks every clip's
level and re-makes a near-silent one as "word.", "Word.", "word!" or "Word!" until
one is audible (`work/<lang>/variants.json` lists which). `pack.mjs` also refuses
any clip quieter than −30 dB, so the worst case is the phone voice, never silence.
In the first real run this caught 45 of 18,477 clips, all fixed: some by a plain
retry, the rest by a full stop or exclamation mark. The listening page has a
section with the ones that needed a changed spelling, to check by ear.

### Fixing one clip or a pronunciation
- **A clip sounds wrong:** put its text (one per line) in a file, run
  `python tools/audio/synth.py --lang de --redo-file list.txt`, then
  `python tools/audio/run_all.py pack`.
- **Google keeps mispronouncing a word:** add it to `tools/audio/overrides/<lang>.json`,
  e.g. `{"Hallo": "Halo"}` (the deck text → how to say it). It's used for
  synthesis only; the app still finds the clip under the original text. Then
  `--redo-file` it.
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
