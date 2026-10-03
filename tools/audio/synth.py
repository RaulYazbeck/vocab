#!/usr/bin/env python3
"""Step 2 - turn every text from extract.mjs into a WAV file.

    python tools/audio/synth.py --lang de --engine chatterbox --verify
    python tools/audio/synth.py --lang fr --engine chatterbox --verify

Reads  tools/audio/work/<lang>/texts.json
Writes tools/audio/work/<lang>/wav/<key>.wav   (one per text, resumable:
       files that already exist are skipped, so you can stop and restart)
       tools/audio/work/<lang>/failures.json   (clips that never passed --verify)

Engines
  chatterbox  Resemble AI's open multilingual model (MIT), using its own built-in voice. Needs a GPU.
              ASSUMES the Chatterbox Multilingual API as documented at
              github.com/resemble-ai/chatterbox -- UNTESTED here (no GPU,
              no Hugging Face access in the sandbox this was written in).
              If the API has moved, only ChatterboxEngine below changes.
  tone        Test engine: a short beep per text. Proves the rest of the
              pipeline (pack, app) without a model. Not for real use.
  <your own>  Skip this script: put <key>.wav files in work/<lang>/wav/
              from any other engine and go straight to pack.mjs.

Fixing individual clips
  overrides/<lang>.json   {"text as written in the deck": "how to say it"} —
                          used for synthesis only; the app still looks the clip up
                          under the original text. Use it for a word the model
                          mispronounces (respell it), then --redo-file it.
  --redo-file list.txt    one deck text per line: delete those clips and make
                          them again (new random seed each time).

--verify (recommended): transcribes each clip back with Whisper
(faster-whisper) and compares it with the text. A clip that doesn't
match (garbled word, extra babble, wrong language) is retried with a
new random seed, up to --retries times, then listed in failures.json
and left out of the pack, so those words keep the system voice instead
of teaching you a wrong pronunciation.
"""
import argparse
import difflib
import inspect
import json
import math
import os
import re
import struct
import sys
import time
import unicodedata
import wave
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
# AUDIO_WORK: keep intermediate files somewhere that survives (Drive on Colab).
WORK = os.environ.get("AUDIO_WORK") or os.path.join(HERE, "work")


# ---------------------------------------------------------------- engines

class ToneEngine:
    """A beep whose length follows the text. Pipeline test only."""
    sr = 24000

    def __init__(self, args):
        pass

    def synth(self, text, kind, seed):
        secs = min(8.0, 0.35 + 0.055 * len(text))
        f = 300 + (sum(map(ord, text)) % 400)
        n = int(self.sr * secs)
        frames = bytearray()
        for i in range(n):
            env = min(1.0, i / 800, (n - i) / 800)
            frames += struct.pack("<h", int(9000 * env * math.sin(2 * math.pi * f * i / self.sr)))
        return bytes(frames), self.sr


class ChatterboxEngine:
    """Chatterbox Multilingual (github.com/resemble-ai/chatterbox, MIT).

    API as in the project's example_tts.py:
        ChatterboxMultilingualTTS.from_pretrained(device=..., t3_model="v3")
        model.generate(text, language_id="fr", audio_prompt_path=...)  -> tensor
        model.sr
    """

    def __init__(self, args):
        import torch
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        self.torch = torch
        device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
        if device == "cpu":
            print("WARNING: no GPU found - this will be very slow.", file=sys.stderr)
        try:
            self.model = ChatterboxMultilingualTTS.from_pretrained(device=device, t3_model=args.t3_model)
            print(f"Loaded Chatterbox Multilingual ({args.t3_model}) on {device}")
        except TypeError:
            # an older package without the t3_model option
            self.model = ChatterboxMultilingualTTS.from_pretrained(device=device)
            print(f"Loaded Chatterbox Multilingual (package default; no t3_model option) on {device}")
        self.sr = self.model.sr
        self.lang = args.lang
        # Pass only the options this installed version understands.
        params = inspect.signature(self.model.generate).parameters
        takes_any = any(p.kind == inspect.Parameter.VAR_KEYWORD for p in params.values())
        wanted = {"language_id": self.lang, "exaggeration": args.exaggeration,
                  "cfg_weight": args.cfg_weight, "temperature": args.temperature}
        self.kwargs = {k: v for k, v in wanted.items() if takes_any or k in params}
        skipped = sorted(set(wanted) - set(self.kwargs))
        if skipped:
            print(f"NOTE: this Chatterbox version ignores: {', '.join(skipped)}", file=sys.stderr)
        print("Using the model's built-in voice.")

    def synth(self, text, kind, seed):
        torch = self.torch
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
        wav = self.model.generate(text, **self.kwargs)     # tensor, shape (1, n)
        samples = wav.squeeze().detach().cpu().clamp(-1, 1).numpy()
        pcm = (samples * 32767).astype("<i2").tobytes()
        return pcm, self.sr


ENGINES = {"tone": ToneEngine, "chatterbox": ChatterboxEngine}


# ----------------------------------------------------------------- helpers

def load_overrides(lang):
    path = os.path.join(HERE, "overrides", lang + ".json")
    if not os.path.exists(path):
        return {}
    data = json.load(open(path, encoding="utf8"))
    return {k: v for k, v in data.items() if isinstance(v, str) and not k.startswith("_")}


def tts_text(text, kind, args, overrides=None):
    text = (overrides or {}).get(text, text)
    t = text.replace("…", "...").replace("¨", "").replace("’", "'")
    t = re.sub(r"\s+", " ", t).strip()
    # Models read a bare single word better with a full stop after it.
    if kind == "w" and args.word_suffix and not re.search(r"[.!?]$", t):
        t += args.word_suffix
    return t


def write_wav(path, pcm, sr):
    tmp = path + ".part"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm)
    os.replace(tmp, path)


def norm_for_compare(s):
    s = unicodedata.normalize("NFC", s).lower().replace("’", "'")
    s = re.sub(r"[^\w\s']", " ", s)
    return re.sub(r"\s+", " ", s).strip()


class Verifier:
    """Whisper round-trip: does the clip say what it should?"""

    def __init__(self, lang, device, size):
        from faster_whisper import WhisperModel
        dev = device
        if not dev:
            try:
                import torch
                dev = "cuda" if torch.cuda.is_available() else "cpu"
            except ImportError:
                dev = "cpu"
        # float16 on a GPU; int8 keeps a CPU run feasible
        self.model = WhisperModel(size, device=dev, compute_type="float16" if dev == "cuda" else "int8")
        self.lang = lang

    def heard(self, wav_path):
        segs, _ = self.model.transcribe(wav_path, language=self.lang, beam_size=5,
                                        vad_filter=False, condition_on_previous_text=False)
        return " ".join(s.text for s in segs).strip()

    def score(self, text, wav_path):
        want = norm_for_compare(text)
        got = norm_for_compare(self.heard(wav_path))
        return difflib.SequenceMatcher(None, want, got).ratio(), got


# -------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", required=True, choices=["de", "fr"])
    ap.add_argument("--engine", default="chatterbox", choices=sorted(ENGINES))
    ap.add_argument("--device", help="cuda / cpu / mps (default: auto)")
    ap.add_argument("--limit", type=int, help="only the first N texts (try this first!)")
    ap.add_argument("--kind", choices=["w", "s"], help="only words or only sentences")
    ap.add_argument("--part", help="i/n: do the i-th of n slices, to split work across machines (e.g. 1/2)")
    ap.add_argument("--retry-failures", action="store_true", help="forget failures.json and try those clips again")
    ap.add_argument("--verify", action="store_true", help="check each clip with Whisper and retry bad ones")
    ap.add_argument("--whisper-model", default="large-v3")
    ap.add_argument("--min-score", type=float, default=0.88, help="similarity (0-1) a clip needs to pass --verify")
    ap.add_argument("--retries", type=int, default=3)
    ap.add_argument("--word-suffix", default=".", help='appended to bare single words before synthesis ("" to disable)')
    ap.add_argument("--t3-model", default="v3", help='Chatterbox multilingual checkpoint ("v3" = newest; falls back to the package default)')
    ap.add_argument("--redo-file", help="text file, one deck text per line: make those clips again")
    ap.add_argument("--exaggeration", type=float, default=0.5)
    ap.add_argument("--cfg-weight", type=float, default=0.5)
    ap.add_argument("--temperature", type=float, default=0.8)
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
    failures = {}
    if os.path.exists(fail_path) and not args.retry_failures:
        failures = {f["key"]: f for f in json.load(open(fail_path, encoding="utf8"))}

    if args.redo_file:
        want = {line.strip() for line in open(args.redo_file, encoding="utf8") if line.strip()}
        redo = [t for t in texts if t["text"] in want]
        for t in redo:
            for pth in (os.path.join(wav_dir, t["key"] + ".wav"),):
                if os.path.exists(pth):
                    os.remove(pth)
            failures.pop(t["key"], None)
        print(f"--redo-file: {len(redo)} of {len(want)} listed texts found in texts.json, will be made again")

    overrides = load_overrides(args.lang)
    todo = [t for t in texts if not os.path.exists(os.path.join(wav_dir, t["key"] + ".wav")) and t["key"] not in failures]
    print(f"{len(texts)} texts, {len(texts) - len(todo)} already done, {len(todo)} to go")
    if not todo:
        return

    engine = ENGINES[args.engine](args)
    verifier = Verifier(args.lang, args.device, args.whisper_model) if args.verify else None

    started = time.time()
    ok = bad = 0
    try:
        for n, t in enumerate(todo, 1):
            key, text, kind = t["key"], t["text"], t["kind"]
            path = os.path.join(wav_dir, key + ".wav")
            # Attempts are written to a scratch file and only moved into place
            # once they pass, so a stop in the middle never leaves an
            # unverified clip that a later run would take for finished.
            attempt_path = os.path.join(work, "attempt.wav")
            last = None
            for attempt in range(args.retries + 1 if verifier else 1):
                pcm, sr = engine.synth(tts_text(text, kind, args, overrides), kind, seed=1000 * attempt + (zlib.crc32(key.encode()) & 0xFFFF))
                write_wav(attempt_path, pcm, sr)
                if not verifier:
                    break
                score, heard = verifier.score(text, attempt_path)
                last = {"key": key, "text": text, "heard": heard, "score": round(score, 3)}
                if score >= args.min_score:
                    last = None
                    break
            if last:                                   # never passed
                failures[key] = last
                bad += 1
            else:
                os.replace(attempt_path, path)
                ok += 1
            if n % 25 == 0 or n == len(todo):
                rate = n / max(1e-6, time.time() - started)
                print(f"  {n}/{len(todo)}  ok {ok}  failed {bad}  ({rate:.1f}/s, ~{(len(todo) - n) / max(rate, 1e-6) / 60:.0f} min left)", flush=True)
                json.dump(list(failures.values()), open(fail_path, "w", encoding="utf8"), ensure_ascii=False, indent=1)
                json.dump({"per_second": round(rate, 3), "done": n, "of": len(todo), "ok": ok, "failed": bad}, open(os.path.join(work, "speed.json"), "w"))
    except KeyboardInterrupt:
        print("\nstopped - run the same command again to continue")
    json.dump(list(failures.values()), open(fail_path, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    if failures:
        print(f"{len(failures)} clips failed verification (see {fail_path}); they will use the system voice.")


if __name__ == "__main__":
    main()
