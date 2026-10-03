#!/usr/bin/env python3
"""Step 2 - make one WAV per text with Google's "Chirp 3: HD" AI voice.

    python tools/audio/synth.py --lang de        # key: see "The key" below

    python tools/audio/synth.py --lang fr

The key: either the environment adds it to requests for texttospeech.googleapis.com
(a Claude environment credential with the header X-Goog-Api-Key: the scripts
never see it), or set GOOGLE_TTS_API_KEY yourself (the script then sends that
header). Before making anything, a free call (the voice list) checks that the key
works and that the voice exists in that language.

Reads  work/<lang>/texts.json  (from extract.mjs)
Writes work/<lang>/wav/<key>.wav   one per text. Resumable: clips that exist are
                                   skipped, so stop and re-run any time.
       work/<lang>/failures.json  texts Google refused (they keep the phone voice)
       work/usage.json            characters sent per month (the free-tier guard)

The voice: Google Cloud Text-to-Speech, Chirp 3: HD, voice "Aoede", the same
voice for German (de-DE-Chirp3-HD-Aoede) and French (fr-FR-Chirp3-HD-Aoede).
No GPU, no model download: each text is one HTTPS request.

Cost guard: Google's free tier for Chirp 3: HD is 1,000,000 characters a month.
Both decks together are about 405,000. Before sending anything this script adds
up what it is about to send plus what this work folder already sent this month,
and refuses to start if that would pass --max-chars-month (default 900,000).
It also stays under Google's default limit of 200 requests a minute.

What is sent for each text: an override (below) if there is one, else the
text's "say" from extract.mjs (French conjugation forms go with their pronoun:
"as" → "tu as"), else the text itself. work/<lang>/spoken.json remembers what
each clip was made from; when that changes (new rule, override added or
removed) the clip is made again automatically.

Fixing individual clips
  overrides/<lang>.json  {"text as written in the deck": "how to say it"}: used for
                         synthesis only; the app still finds the clip under the
                         original text. Then --redo-file it.
  --redo-file list.txt   one deck text per line: delete those clips and make them again.

Near-silence guard: for some very short words Google returns a quarter second of
near-silence instead of speech. Every clip is checked (peak level); a near-silent
one is made again as "word.", "Word.", "word!", "Word!" until one is audible
(recorded in work/<lang>/variants.json). If none is, the text is listed as
refused and keeps the phone voice; it never ends up in the pack as silence.

Engines: "google" (the real one) and "tone" (a beep per text, for testing the
pipeline without a key).
"""
import argparse
import array
import base64
import fcntl
import io
import json
import math
import os
import struct
import sys
import threading
import time
import urllib.error
import urllib.request
import wave
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
# AUDIO_WORK: keep intermediate files somewhere else (optional).
WORK = os.environ.get("AUDIO_WORK") or os.path.join(HERE, "work")
LOCALES = {"de": "de-DE", "fr": "fr-FR"}
ENDPOINT = os.environ.get("GOOGLE_TTS_ENDPOINT", "https://texttospeech.googleapis.com/v1/text:synthesize")
VOICES_URL = ENDPOINT.rsplit("/", 1)[0] + "/voices"
SAMPLE_RATE = 24000


class Fatal(Exception):
    """Stop everything (bad key, API off, budget reached)."""


class Refused(Exception):
    """Google won't say this one text; record it and carry on."""


# ---------------------------------------------------------------- engines

def wav_bytes(pcm, sr):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm)
    return buf.getvalue()


class ToneEngine:
    """A beep whose length follows the text. Pipeline test only."""

    def __init__(self, args):
        pass

    def synth(self, text):
        secs = min(8.0, 0.35 + 0.055 * len(text))
        f = 300 + (sum(map(ord, text)) % 400)
        n = int(SAMPLE_RATE * secs)
        pcm = b"".join(struct.pack("<h", int(9000 * min(1.0, i / 800, (n - i) / 800) * math.sin(2 * math.pi * f * i / SAMPLE_RATE))) for i in range(n))
        return wav_bytes(pcm, SAMPLE_RATE)


class GoogleEngine:
    """Google Cloud Text-to-Speech REST API, Chirp 3: HD voices."""

    RETRY = {408, 429, 500, 502, 503, 504}

    NO_KEY = ("No API key reached Google. Add the environment credential (header X-Goog-Api-Key for "
              "texttospeech.googleapis.com) or set GOOGLE_TTS_API_KEY. See tools/audio/README.md.")

    def __init__(self, args):
        self.key = os.environ.get("GOOGLE_TTS_API_KEY", "").strip()   # optional: else the environment adds it
        self.voice = {"languageCode": LOCALES[args.lang], "name": f"{LOCALES[args.lang]}-Chirp3-HD-{args.voice}"}
        self.rate = args.speaking_rate
        self.limiter = None          # set by main(): every attempt, retries included, waits its turn
        self.check_voice()
        print(f"Google voice: {self.voice['name']} (key {'from GOOGLE_TTS_API_KEY' if self.key else 'added by the environment'})")

    def headers(self):
        h = {"Content-Type": "application/json; charset=utf-8"}
        if self.key:
            h["X-Goog-Api-Key"] = self.key           # in a header: never in a URL or a log
        return h

    def check_voice(self):
        """Free (no characters billed): does the key work, and does the voice exist?"""
        url = VOICES_URL + "?languageCode=" + self.voice["languageCode"]
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=self.headers()), timeout=30) as res:
                names = [v.get("name", "") for v in json.load(res).get("voices", [])]
        except urllib.error.HTTPError as e:
            detail = _error_text(e)
            if e.code in (401, 403):
                raise Fatal(self.NO_KEY if "unregistered callers" in detail else
                            f"Google refused the key (HTTP {e.code}): {detail}\nCheck: the key is right, Cloud "
                            "Text-to-Speech API is enabled, billing is linked, and the key's API restriction allows Text-to-Speech.")
            raise Fatal(f"Couldn't list Google's voices (HTTP {e.code}): {detail}")
        except (urllib.error.URLError, OSError) as e:
            raise Fatal(f"Couldn't reach Google: {e}")
        if self.voice["name"] not in names:
            chirp = sorted(n for n in names if "Chirp3-HD" in n)
            raise Fatal(f"Voice {self.voice['name']} isn't offered. Chirp 3 HD voices for {self.voice['languageCode']}: "
                        + (", ".join(chirp[:30]) or "none"))

    def synth(self, text):
        body = json.dumps({
            "input": {"text": text},
            "voice": self.voice,
            "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": SAMPLE_RATE, "speakingRate": self.rate},
        }).encode()
        delay = 2.0
        detail = ""
        for attempt in range(8):
            if self.limiter:
                self.limiter.wait()
            req = urllib.request.Request(ENDPOINT, data=body, method="POST", headers=self.headers())
            try:
                with urllib.request.urlopen(req, timeout=60) as res:
                    audio = base64.b64decode(json.load(res)["audioContent"])
                # LINEAR16 comes back as a WAV file; wrap it if it is bare PCM.
                return audio if audio[:4] == b"RIFF" else wav_bytes(audio, SAMPLE_RATE)
            except urllib.error.HTTPError as e:
                detail = _error_text(e)
                if e.code in (401, 403) and "unregistered callers" in detail:
                    raise Fatal(self.NO_KEY)
                if e.code in (401, 403):
                    raise Fatal(f"Google refused the key (HTTP {e.code}): {detail}\n"
                                "Check: the key is right, Cloud Text-to-Speech API is enabled, billing is linked, "
                                "and the key's API restriction allows Text-to-Speech.")
                if e.code == 400:
                    raise Refused(f"HTTP 400: {detail}")
                if e.code not in self.RETRY:
                    raise Fatal(f"Unexpected HTTP {e.code}: {detail}")
                try:
                    wait = float(e.headers.get("Retry-After") or delay)
                except ValueError:
                    wait = delay
            except (urllib.error.URLError, TimeoutError, ConnectionError, OSError, ValueError, KeyError) as e:
                wait = delay
                detail = f"{type(e).__name__}: {e}"
            time.sleep(min(wait, 60))
            delay = min(delay * 2, 60)
        raise Refused(f"gave up after 8 tries: {detail}")


def _error_text(e):
    try:
        err = json.loads(e.read()).get("error", {})
        return f"{err.get('status', '')} {err.get('message', '')}".strip()[:300]
    except Exception:
        return str(getattr(e, "reason", ""))


ENGINES = {"google": GoogleEngine, "tone": ToneEngine}


# ----------------------------------------------------------------- helpers

SILENT_DB = -30.0      # real speech peaks around -10..0 dBFS; Google's glitch is about -35..-55


def peak_db(wav):
    """Peak level of a 16-bit mono WAV, in dBFS."""
    with wave.open(io.BytesIO(wav)) as w:
        a = array.array("h", w.readframes(w.getnframes()))
    if sys.byteorder == "big":
        a.byteswap()
    peak = max((abs(x) for x in a), default=0)
    return 20 * math.log10(peak / 32768) if peak else -120.0


def variants(text):
    """Other ways to send a text that comes back near-silent."""
    cap = text[:1].upper() + text[1:]
    out = []
    for v in (text + ".", cap + ".", text + "!", cap + "!"):
        if v != text and v not in out:
            out.append(v)
    return out


class RateLimiter:
    """At most `per_minute` request starts per minute, shared by all threads."""

    def __init__(self, per_minute):
        self.gap = 60.0 / per_minute
        self.next = time.monotonic()
        self.lock = threading.Lock()

    def wait(self):
        with self.lock:
            now = time.monotonic()
            t = max(now, self.next)
            self.next = t + self.gap
        if t > now:
            time.sleep(t - now)


class Ledger:
    """Characters sent this month from this work folder (the free-tier guard).

    Safe across processes: every update locks the file and re-reads it, so two
    runs at once (German and French in parallel, say) can't both slip under the
    cap and pass it together."""

    def __init__(self, cap):
        self.path = os.path.join(WORK, "usage.json")
        self.cap = cap
        self.month = datetime.now(timezone.utc).strftime("%Y-%m")
        self.lock = threading.Lock()
        os.makedirs(WORK, exist_ok=True)

    @property
    def used(self):
        return load_json(self.path, {}).get(self.month, 0)

    def take(self, n):
        with self.lock, open(self.path + ".lock", "w") as lf:
            fcntl.flock(lf, fcntl.LOCK_EX)
            data = load_json(self.path, {})
            used = data.get(self.month, 0)
            if used + n > self.cap:
                raise Fatal(f"Monthly character cap reached ({used:,} sent + {n} > {self.cap:,}). "
                            "Stopping so this stays inside Google's free tier. Next month, or raise --max-chars-month.")
            data[self.month] = used + n
            save_json(self.path, data)


def load_json(path, default):
    try:
        return json.load(open(path, encoding="utf8"))
    except Exception:
        return default


def save_json(path, data):
    tmp = path + ".part"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(data, open(tmp, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def load_overrides(lang):
    data = load_json(os.path.join(HERE, "overrides", lang + ".json"), {})
    return {k: v for k, v in data.items() if isinstance(v, str) and not k.startswith("_")}


# -------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", required=True, choices=sorted(LOCALES))
    ap.add_argument("--engine", default="google", choices=sorted(ENGINES))
    ap.add_argument("--voice", default="Aoede", help="Chirp 3: HD voice name (the same for every language)")
    ap.add_argument("--speaking-rate", type=float, default=1.0)
    ap.add_argument("--limit", type=int, help="only the first N texts")
    ap.add_argument("--kind", choices=["w", "s"], help="only words or only sentences")
    ap.add_argument("--part", help="i/n: do the i-th of n slices")
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--per-minute", type=int, default=180, help="request rate (Google's default limit is 200/min)")
    ap.add_argument("--max-chars-month", type=int, default=900_000, help="stop before sending more than this per month")
    ap.add_argument("--retry-failures", action="store_true", help="forget failures.json and try those texts again")
    ap.add_argument("--redo-file", help="text file, one deck text per line: make those clips again")
    args = ap.parse_args()

    work = os.path.join(WORK, args.lang)
    texts_path = os.path.join(work, "texts.json")
    if not os.path.exists(texts_path):
        sys.exit(f"{texts_path} not found - run:  node tools/audio/extract.mjs --lang {args.lang}")
    texts = json.load(open(texts_path, encoding="utf8"))
    if args.kind:
        texts = [t for t in texts if t["kind"] == args.kind]
    if args.part:
        i, n = (int(x) for x in args.part.split("/"))
        texts = [t for k, t in enumerate(texts) if k % n == i - 1]
    if args.limit:
        texts = texts[: args.limit]

    wav_dir = os.path.join(work, "wav")
    os.makedirs(wav_dir, exist_ok=True)
    fail_path = os.path.join(work, "failures.json")
    failures = {} if args.retry_failures else {f["key"]: f for f in load_json(fail_path, [])}

    if args.redo_file:
        want = {line.strip() for line in open(args.redo_file, encoding="utf8") if line.strip()}
        redo = [t for t in texts if t["text"] in want]
        for t in redo:
            p = os.path.join(wav_dir, t["key"] + ".wav")
            if os.path.exists(p):
                os.remove(p)
            failures.pop(t["key"], None)
        print(f"--redo-file: {len(redo)} of {len(want)} listed texts found, will be made again")

    overrides = load_overrides(args.lang)
    say = lambda t: overrides.get(t["text"]) or t.get("say") or t["text"]
    # What each existing clip was made from. Clips from before this record
    # existed count as made from the override or the plain text.
    spoken_path = os.path.join(work, "spoken.json")
    spoken = load_json(spoken_path, {})
    made_from = lambda t: spoken.get(t["key"], overrides.get(t["text"]) or t["text"])
    stale = [t for t in texts if os.path.exists(os.path.join(wav_dir, t["key"] + ".wav")) and made_from(t) != say(t)]
    if stale:
        print(f"{len(stale)} clips will be made again because what they should say changed "
              f"(e.g. {', '.join(repr(t['text']) + ' → ' + repr(say(t)) for t in stale[:4])})")
        for t in stale:
            failures.pop(t["key"], None)
    stale_keys = {t["key"] for t in stale}
    todo = [t for t in texts if (t["key"] in stale_keys or not os.path.exists(os.path.join(wav_dir, t["key"] + ".wav"))) and t["key"] not in failures]
    chars = sum(len(say(t)) for t in todo)
    refused = sum(1 for t in texts if t["key"] in failures)
    for t in texts:                              # record clips that are fine as they are
        if t["key"] not in stale_keys and os.path.exists(os.path.join(wav_dir, t["key"] + ".wav")):
            spoken.setdefault(t["key"], made_from(t))
    save_json(spoken_path, spoken)
    print(f"{len(texts)} texts: {len(texts) - len(todo) - refused} already done, "
          + (f"{refused} refused earlier (see failures.json), " if refused else "")
          + f"{len(todo)} to go ({chars:,} characters)")
    if not todo:
        return

    try:
        engine = ENGINES[args.engine](args)
    except Fatal as e:
        sys.exit(f"\nSTOPPED: {e}")
    ledger = Ledger(args.max_chars_month) if args.engine == "google" else None
    if ledger and ledger.used + chars > ledger.cap:
        sys.exit(f"\nSTOPPED before sending anything: this would send {chars:,} characters and {ledger.used:,} were "
                 f"already sent this month (cap {ledger.cap:,}). The free tier is 1,000,000 a month.")
    if ledger:
        print(f"characters sent this month so far: {ledger.used:,} (cap {ledger.cap:,})")

    engine.limiter = RateLimiter(args.per_minute) if args.engine == "google" else None
    stop = threading.Event()
    fatal = []
    lock = threading.Lock()
    state = {"n": 0, "ok": 0, "bad": 0, "t0": time.time()}
    var_path = os.path.join(work, "variants.json")
    used_variants = load_json(var_path, {})

    def one(t):
        if stop.is_set():
            return
        text = say(t)
        try:
            if ledger:
                ledger.take(len(text))
            if stop.is_set():
                return
            audio, used = engine.synth(text), None
            if args.engine == "google" and peak_db(audio) < SILENT_DB:
                for v in variants(text):
                    if ledger:
                        ledger.take(len(v))
                    audio = engine.synth(v)
                    if peak_db(audio) >= SILENT_DB:
                        used = v
                        break
                else:
                    raise Refused("Google returned near-silence for every way of sending it")
            path = os.path.join(wav_dir, t["key"] + ".wav")
            with open(path + ".part", "wb") as f:
                f.write(audio)
            os.replace(path + ".part", path)
            with lock:
                spoken[t["key"]] = text
                if used:
                    used_variants[t["text"]] = used
                else:
                    used_variants.pop(t["text"], None)   # a re-made clip no longer needs its old variant
            ok = True
        except Refused as e:
            ok = False
            with lock:
                failures[t["key"]] = {"key": t["key"], "text": t["text"], "error": str(e)}
        except Fatal as e:
            fatal.append(str(e))
            stop.set()
            return
        with lock:
            state["n"] += 1
            state["ok" if ok else "bad"] += 1
            n = state["n"]
            if n % 50 == 0 or n == len(todo):
                rate = n / max(1e-6, time.time() - state["t0"])
                print(f"  {n}/{len(todo)}  ok {state['ok']}  failed {state['bad']}  ({rate:.1f}/s, ~{(len(todo) - n) / max(rate, 1e-6) / 60:.0f} min left)", flush=True)
                save_json(fail_path, list(failures.values()))
                save_json(spoken_path, spoken)
                save_json(os.path.join(work, "speed.json"), {"per_second": round(rate, 3), "done": n, "of": len(todo), "ok": state["ok"], "failed": state["bad"]})

    try:
        with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
            list(pool.map(one, todo))
    except KeyboardInterrupt:
        stop.set()
        print("\nstopped - run the same command again to continue")
    save_json(fail_path, list(failures.values()))
    save_json(var_path, used_variants)
    save_json(spoken_path, spoken)
    if fatal:
        sys.exit(f"\nSTOPPED: {fatal[0]}\n(finished clips are kept; fix the problem and run the same command again)")
    if failures:
        print(f"{len(failures)} texts were refused (see {fail_path}); they keep the phone's voice.")


if __name__ == "__main__":
    main()
