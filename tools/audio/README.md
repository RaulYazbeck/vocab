# Natural voices — how the voice packs are made and kept up to date

The app reads words and example sentences aloud. By default that is the
phone's own text-to-speech, which is often robotic. This folder makes
**recorded** audio instead: every word and example sentence is generated
once with a natural AI voice, packed into `audio/<lang>/`, and the app
downloads it (first-launch offer, or Settings → Sound & voice) so it plays
offline. Anything without a recording still uses the phone's voice.

```
decks ─extract─▶ texts.json ─synth (GPU)─▶ wav/ ─pack─▶ audio/de/   (served by GitHub Pages)
                                                         manifest.json + shard files
```

The app side (`js/audio.js`) needs nothing from you. Generating the audio needs
a GPU: a Google Colab T4 (free tier) or a rented one.

## 1. The overnight run (recommended): the Colab notebook

Open **`tools/audio/overnight.ipynb`** in [Google Colab](https://colab.research.google.com)
(File → Open notebook → GitHub tab → `RaulYazbeck/vocab`), set *Runtime → Change
runtime type → T4 GPU*, and go down the cells:

1. **Setup**: installs everything, mounts your Google Drive. Everything that
   must survive lives in `MyDrive/vocab-voices`, so a disconnect loses nothing.
2. **Voice**: nothing to do. The AI model speaks both languages with its own built-in voice. (An optional switch lets you use a different voice if you ever want one.)
3. **Pilot**: ~50 clips per language you can *listen to inside the notebook*, and
   a time estimate for the full run. **Listen before continuing.**
4. **Full run**: leave it overnight. For every one of the ~10.8k German and
   ~7.7k French clips it: generates → transcribes it back with Whisper and
   compares → retries bad ones with a new seed (up to 3×) → a second, more
   careful pass over any that still fail → packs → writes `REPORT.md`.
   Stop or reconnect at any time and run the cell again: finished clips are
   never redone.
5. **Results**: the report, 10 more random clips to hear, and a zip to download.
6. *(optional)* push the packs to a new GitHub branch from the notebook.

Then commit the `audio/` folders (or merge that branch). The app offers the
download on its next launch.

**About the voice.** You don't record or upload anything. Chatterbox is a free (MIT licence) AI text-to-speech model that speaks German and French with a built-in voice. The one thing I can't know from here is how *native* that built-in voice sounds in each language, which is exactly what the pilot step is for: ~50 clips per language you listen to in a few minutes, before committing to the long run. If it sounds foreign or robotic, don't run the full job; the pipeline can use a different AI voice or model (that is a small change, and costs only the pilot). Optionally you can make the model copy a specific voice from a short recording (`--ref`), but that is only for people who want that.

The free Colab tier can cut long sessions. If that keeps happening, Colab Pro or
a rented GPU (RunPod, Vast.ai; roughly a few dollars) avoids it. The notebook
cannot keep a sleeping computer connected: keep the tab open.

### Or run it yourself
```bash
git clone https://github.com/RaulYazbeck/vocab && cd vocab
pip install chatterbox-tts faster-whisper            # node 18+ and ffmpeg (with libopus) too
export AUDIO_WORK=/some/folder/that/survives         # optional: where progress is kept

python tools/audio/run_all.py pilot        # listen, check the estimate
python tools/audio/run_all.py full         # the long one
# (optional: --ref de=voices/de.wav --ref fr=voices/fr.wav to copy a specific voice instead)
```
`run_all.py` calls the individual steps below; you can also run those by hand.

## 2. Changing the decks later: add, edit, remove

This is covered: the packs are built so that **only what changed** is made again,
and only what changed is downloaded again by people who already have the pack.

| You change the decks… | What happens |
|---|---|
| **Add** a word or sentence | It has no recording yet, so it uses the phone's voice (never silence). `status` lists it. The next run records only the new ones. |
| **Edit** a word or sentence | The old text is no longer used; the new text counts as new. The old recording is dropped from the pack, the new one made. |
| **Remove** one | Its recording is dropped from the pack, and people's phones delete it on their next update. |
| **Re-order** words or decks | Nothing changes. |
| **Add a deck / level** | Only the new clips are made; a few new shard files appear. |
| **Rename** a deck | That deck's clips move to another shard: a few shards change, nothing is re-recorded. |

### The routine (about 10 minutes, plus GPU time for the new clips)

```bash
node tools/audio/status.mjs --lang de        # no GPU needed: how many texts have no recording yet?
python tools/audio/run_all.py full         # makes ONLY the new ones, repacks
git add audio && git commit -m "Update voice packs" && git push
```
Run `status` after editing a deck (add `--strict` to make it exit 1 when anything
is missing, if you want a CI check). `extract` also prints "+N new, −M no longer
used" each time. Keep the same voice settings (and the same model version) between runs, or
new clips can sound different from old ones.

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
one deck changed **2 of 33 shards (4.4 MB)**, the deck's words shard and its
sentences shard; rebuilding everything from scratch changed **0**. (Before this
was fixed, adding one word near the start changed 22 of 38 shards.)

### Fixing one clip, a pronunciation, or the voice
- **A clip sounds wrong:** put its text (one per line) in a file and run
  `python tools/audio/synth.py --lang de --verify --redo-file list.txt` then repack. It
  gets a new random seed.
- **The model keeps mispronouncing a word:** add it to `tools/audio/overrides/<lang>.json`,
  e.g. `{"Hallo": "Halo"}` (the deck text → how to say it). It's used for
  synthesis only; the app still finds the clip under the original text. Then
  `--redo-file` it.
- **Phrases the app had to speak with the phone voice** (a verb form a game
  made up, say): Settings → Sound & voice → "Copy N phrases…", save as
  `missing.txt`, then `node tools/audio/extract.mjs --lang de --extra missing.txt`
  and run as above.
- **Changing the voice itself** (a different voice or model) means redoing
  every clip, and everyone re-downloads everything. Do that rarely.

## 3. The individual steps

```bash
node tools/audio/extract.mjs --lang de        # every text the app can say → work/de/texts.json (+ what changed)
node tools/audio/status.mjs  --lang de        # coverage of the published pack (no GPU)
python tools/audio/synth.py  --lang de --verify     # make the clips (resumable; add --ref file.wav only to copy a voice)
node tools/audio/review.mjs  --lang de        # a page of random clips to listen to
node tools/audio/pack.mjs    --lang de        # → audio/de/  (and a report of what changed for existing users)
```
German is about 10.8k clips, French about 7.7k (words and short phrases 5.8k /
4.0k, sentences 5.0k / 3.7k).

`--verify` transcribes each clip back with Whisper and compares it with the text
(garbled words, extra babble, wrong language), retrying with a new seed. Clips
that never pass go to `work/<lang>/failures.json` and are left out of the pack,
so those words keep the phone voice rather than teaching a wrong pronunciation.
It cannot judge *accent*; only your ears can. What to listen for: French liaison
and nasal vowels; German *ch*, *ü*, *ö*, word stress; clips that stumble or sound
like another language. `--retry-failures` tries the failed ones again.

## 4. Size and format

`pack.mjs` trims silence, evens out loudness, and encodes mono Opus at 24 kbps
(`--bitrate`). I ran the whole pipeline at full size with test tones of speech-like length (not
real speech): **German 65.6 MB** (words 20 MB, sentences 46 MB, 33 shard files,
manifest 326 KB) and **French 43.7 MB** (13 + 31 MB, 22 shard files, manifest
231 KB). Real speech at the same bitrate should come out similar or somewhat
smaller, and the script prints the real figure. The app lets people download words
only or everything.

Opus-in-Ogg plays in current Chrome, Firefox and Edge, and in Safari/iOS from
18.4 (WebKit's release notes; see the iPhone section below). If older iPhones
matter, build with `--format aac --bitrate 40` (about 1.7× larger, plays
everywhere). The format is written into `manifest.json`; the app needs no
change, and a browser that can't play it simply keeps the phone voice.

## Any other voice engine
`synth.py` is only one way to fill `work/<lang>/wav/<key>.wav`. Any engine
(Piper, Qwen3-TTS, a cloud API …) works: write a 16-bit mono WAV per entry of
`texts.json` named `<key>.wav`, then run `pack.mjs`. To add an engine to
`synth.py`, add a class with `synth(text, kind, seed) → (pcm16 bytes, sample_rate)`.

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
Tested (with test tones standing in for the voice, since there is no GPU where
this was written):
- The whole overnight flow at full size for both languages (18,477 clips),
  including **killing it midway and restarting** (it resumed: "4496 already
  done"), the pilot with its time estimate, packing, status and the report.
- A real deck edit through the maintenance routine (see above).
- Byte-identical re-encoding; stable shards; the Chatterbox adapter against fake
  modules imitating three API variants (new, old without `t3_model`, `**kwargs`).
- Pronunciation overrides, `--redo-file`, resume after a stop.
- The whole app side in Chromium: first-launch offer, download with progress,
  stop and resume, damaged-file rejection, storage full, a dropped connection,
  offline playback, quiet auto-update (and not for big updates, offline, or with
  no pack), repair after the browser drops files, words-only, fallback to the
  phone voice, old and new service workers, every game in both languages with no
  errors, every one of the 18,477 clips decoding, and 100% of deck texts finding
  their recording.

**Not tested:**
- **Chatterbox itself** (needs a GPU and Hugging Face): the adapter follows the
  project's own example and is checked against fakes, but it has never loaded the
  real model. The notebook's pilot step is where that shows up first; if it fails
  there, it fails in minutes, not overnight.
- **The Colab notebook** was validated (every cell parses) but never run on Colab.
  Its commands are the ones tested above.
- **Anything on a real iPhone** (everything iPhone-related was simulated in
  Chromium; use the checklist), and AAC playback.
- **How the voices sound.** Whisper can catch wrong words, not a wrong accent.
