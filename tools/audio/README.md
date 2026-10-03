# Natural voices — how the voice packs are made

The app reads words and example sentences aloud. By default that is the
phone's own text-to-speech, which is often robotic. This folder makes
**recorded** audio instead: every word and example sentence is generated
once with a natural AI voice, packed into `audio/<lang>/`, and the app
downloads it (first-launch offer, or Settings → Sound & voice) so it plays
offline. Anything without a recording still uses the phone's voice.

```
decks  ──extract──▶  texts.json  ──synth (GPU)──▶  wav/  ──pack──▶  audio/de/  (served by GitHub Pages)
                                                                  manifest.json + ~2 MB shards
```

You run this on a computer with a GPU (a free Colab T4, or a rented one).
The app side (`js/audio.js`) needs nothing from you.

## Setup (once)

```bash
git clone https://github.com/RaulYazbeck/vocab && cd vocab
# node 18+ and ffmpeg (with libopus) are needed for extract/pack
pip install chatterbox-tts faster-whisper     # synthesis + the optional quality check
```

## A reference voice (strongly recommended)

Chatterbox copies the voice of a short reference recording, which is what
keeps the accent consistent across ~10,000 clips. For each language give it
**10–20 seconds of one clean native speaker** (no music, no echo), e.g.
`voices/de.wav`, `voices/fr.wav`. Check the licence of wherever it comes
from (Mozilla Common Voice is CC0, for instance), and don't clone a real
person's voice without their permission. Without `--ref` the model's default
voice is used, which may not be a native-sounding one.

## Run it

```bash
node tools/audio/extract.mjs --lang de            # lists everything the app can say → work/de/texts.json

# Try a small batch FIRST and listen:
python tools/audio/synth.py --lang de --ref voices/de.wav --verify --limit 60
node tools/audio/review.mjs --lang de             # → open tools/audio/work/de/review.html

# Happy? The full run (resumable: stop and re-run any time):
python tools/audio/synth.py --lang de --ref voices/de.wav --verify

node tools/audio/pack.mjs --lang de --voice "short name of the voice"
git add audio/de && git commit && git push        # the app picks it up on next launch
```

Same for `--lang fr`. German is about 10.8k clips, French about 7.7k (words
and short phrases 5.8k / 4.0k, sentences 5.0k / 3.7k). The synth script prints
its speed, so the `--limit 60` run tells you how long the full one takes.

### Listen for what a learner would copy
French liaison and nasal vowels; German *ch*, *ü*, *ö*, word stress; clips
that sound like another language or stumble. `--verify` catches garbled and
wrong clips automatically (it transcribes each one with Whisper and compares
it with the text, retrying with a new seed); clips that never pass go to
`work/<lang>/failures.json` and are left out of the pack, so those words keep
the phone voice rather than teaching a wrong pronunciation. It cannot judge
*accent*, only your ears can. To redo a clip: delete `work/<lang>/wav/<key>.wav`
and re-run synth. To retry the clips listed in `failures.json` (with a different
`--min-score`, say), add `--retry-failures`.

## Size and format

`pack.mjs` trims silence, evens out loudness, and encodes mono Opus at
24 kbps (`--bitrate`). I ran the whole pipeline at full size with test
tones of speech-like length (not real speech): **German 66 MB** (words
20 MB, sentences 46 MB) and **French 44 MB** (13 + 31 MB), 33 and 23 shard
files, manifest 326 KB and 231 KB. Real speech at the same bitrate should come
out similar or somewhat smaller, and the script prints the real figure. The
app lets people download words only or everything.

Opus-in-Ogg plays in current Chrome, Firefox and Edge, and in Safari/iOS from
18.4 (WebKit's release notes; see the iPhone section below). If older
iPhones matter, build with `--format aac --bitrate 40` (about 1.7× larger,
plays everywhere). The format is written into `manifest.json`; the app needs
no change, and a browser that can't play it simply keeps the phone voice.

## Adding phrases later
The app remembers anything it was asked to say that has no recording (a verb
form a game made up, say) and Settings → Sound & voice → "Copy N phrases…"
copies the list. Save it as `missing.txt`, then:

```bash
node tools/audio/extract.mjs --lang de --extra missing.txt
python tools/audio/synth.py --lang de --ref voices/de.wav --verify   # only the new ones
node tools/audio/pack.mjs --lang de
```

Shard files are named by content hash and unchanged clips keep their shard,
so people downloading the update only fetch what changed. Each full rebuild
of changed shards adds to the git history, so batch your changes.

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
Tested: extraction against the real decks, packing, and the whole app side
in Chromium (first-launch offer, download with progress/cancel/resume,
corrupt-file rejection, offline playback, updates, repair after eviction,
words-only, fallback to the system voice).
**Not tested:** the Chatterbox adapter in `synth.py` (no GPU or Hugging Face
access where this was written; it follows the project's documented API and
may need small changes), anything on a real iPhone (everything above was
simulated in Chromium; use the checklist), and AAC playback.
