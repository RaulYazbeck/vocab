#!/usr/bin/env python3
"""The whole voice-pack job in one command. No GPU: Google makes the audio.

    (the Google key: an environment credential, or GOOGLE_TTS_API_KEY; see the README)
    python tools/audio/run_all.py smoke  # 3 clips per language: is the key/voice OK?
    python tools/audio/run_all.py pilot  # ~20 clips per language + a listening page
    python tools/audio/run_all.py full   # everything (about 1.5-2 hours)
    python tools/audio/run_all.py pack   # re-pack only (after fixing clips)

full:
  1. extract every text the app can say (both languages)
  2. check the total characters against the monthly cap BEFORE sending anything
  3. make every clip with Google's Chirp 3 HD voice "Aoede" (resumable)
  4. one more pass over any texts Google refused
  5. pack into audio/<lang>/  (stable shards: see pack.mjs)
  6. status check, REPORT.md, and a listening page (samples.html)

Resumable: stop it any time and run the same command again; finished clips are
never redone (and never paid for twice). Nothing is committed or published.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
WORK = os.environ.get("AUDIO_WORK") or os.path.join(HERE, "work")
STATE = WORK if os.environ.get("AUDIO_WORK") else os.path.join(HERE, "state")   # see synth.py
VOICE_LABEL = "Google Chirp 3 HD · Aoede"


def run(cmd):
    print("\n$ " + " ".join(cmd), flush=True)
    r = subprocess.run(cmd)
    if r.returncode != 0:
        sys.exit(f"\nStopped: command failed (exit {r.returncode}). Fix the problem and run the same command again; finished work is kept.")


def node(script, *a):
    run(["node", os.path.join(HERE, script), *a])


def synth(lang, args, *extra):
    run([sys.executable, os.path.join(HERE, "synth.py"), "--lang", lang, "--engine", args.engine,
         "--max-chars-month", str(args.max_chars_month), *extra])


def read_json(path, default=None):
    try:
        return json.load(open(path, encoding="utf8"))
    except Exception:
        return default


def lang_dir(lang):
    return os.path.join(WORK, lang)


def to_go(lang):
    """(clips, characters) not made yet for this language (a clip in the published pack counts as made)."""
    texts = read_json(os.path.join(lang_dir(lang), "texts.json"), [])
    published = set(read_json(os.path.join(ROOT, "audio", lang, "manifest.json"), {}).get("idx", {}))
    fails = {f["key"] for f in read_json(os.path.join(lang_dir(lang), "failures.json"), [])}
    wav = os.path.join(lang_dir(lang), "wav")
    left = [t for t in texts if t["key"] not in fails and t["key"] not in published
            and not os.path.exists(os.path.join(wav, t["key"] + ".wav"))]
    return len(left), sum(len(t["text"]) for t in left)


def preflight(args):
    """The key is checked by synth.py's first (free) call to Google's voice list."""
    return


def budget_check(args):
    """All languages together must fit under the monthly cap before we start."""
    used = read_json(os.path.join(STATE, "usage.json"), {}).get(time.strftime("%Y-%m", time.gmtime()), 0)
    need = sum(to_go(l)[1] for l in args.langs)
    print(f"\ncharacters to send: {need:,}   already sent this month: {used:,}   cap: {args.max_chars_month:,}")
    if args.engine == "google" and used + need > args.max_chars_month:
        sys.exit("STOPPED before sending anything: that would pass the monthly cap (Google's free tier is 1,000,000).")


def stage_smoke(args):
    preflight(args)
    for lang in args.langs:
        node("extract.mjs", "--lang", lang)
        synth(lang, args, "--limit", "3")
        wav = os.path.join(lang_dir(lang), "wav")
        files = sorted(os.listdir(wav))[:3] if os.path.isdir(wav) else []
        print(f"{lang}: {len(files)} clip(s): " + ", ".join(f"{os.path.getsize(os.path.join(wav, f)) // 1024} KB" for f in files))


def stage_pilot(args):
    preflight(args)
    for lang in args.langs:
        node("extract.mjs", "--lang", lang)
        synth(lang, args, "--kind", "w", "--limit", str(args.pilot))
        synth(lang, args, "--kind", "s", "--limit", str(args.pilot))
    node("samples.mjs", "--langs", ",".join(args.langs), "--n", str(args.pilot * 2))


def stage_full(args):
    preflight(args)
    t0 = time.time()
    for lang in args.langs:
        node("extract.mjs", "--lang", lang)
    budget_check(args)
    for lang in args.langs:
        n, c = to_go(lang)
        print(f"\n{lang}: {n} clips to make ({c:,} characters)")
        synth(lang, args)
        if read_json(os.path.join(lang_dir(lang), "failures.json"), []):
            print(f"\n{lang}: some texts were refused; one more try")
            synth(lang, args, "--retry-failures")
    stage_pack(args, t0)


def stage_pack(args, t0=None):
    t0 = t0 or time.time()
    for lang in args.langs:
        node("pack.mjs", "--lang", lang, "--out", os.path.join(args.out_root, lang), "--voice", VOICE_LABEL)
        node("status.mjs", "--lang", lang, "--manifest", os.path.join(args.out_root, lang, "manifest.json"))
    node("samples.mjs", "--langs", ",".join(args.langs), "--n", "24")
    write_report(args, time.time() - t0)


def write_report(args, seconds):
    used = read_json(os.path.join(STATE, "usage.json"), {}).get(time.strftime("%Y-%m", time.gmtime()), 0)
    lines = ["# Voice pack report", "",
             f"Voice: {VOICE_LABEL}. Run time this session: {seconds / 60:.0f} min. "
             f"Characters sent to Google this month: {used:,} (free tier: 1,000,000).", ""]
    mb = lambda b: f"{b / 1048576:.1f} MB"
    for lang in args.langs:
        texts = read_json(os.path.join(lang_dir(lang), "texts.json"), [])
        fails = read_json(os.path.join(lang_dir(lang), "failures.json"), [])
        man = read_json(os.path.join(args.out_root, lang, "manifest.json"), {})
        tot = man.get("tot", {})
        lines += [
            f"## {lang}",
            f"- texts the app can say: **{len(texts)}**",
            f"- recorded and in the pack: **{len(man.get('idx', {}))}**",
            f"- refused by Google (keep the phone voice): **{len(fails)}**",
            f"- pack size: words {mb(tot.get('w', {}).get('b', 0))} ({tot.get('w', {}).get('n', 0)} clips), "
            f"sentences {mb(tot.get('s', {}).get('b', 0))} ({tot.get('s', {}).get('n', 0)} clips), "
            f"{len(man.get('shards', []))} files",
            "",
        ]
        odd = read_json(os.path.join(lang_dir(lang), "warnings.json"), [])
        if odd:
            lines.append(f"- **read literally** (shorthand, brackets, an English note, a slash): write these out on the card or add an override, then run again:")
            lines += [f"  - `{o['text']}` (deck {o['deck']})" for o in odd[:30]]
        for f in fails[:30]:
            lines.append(f"  - `{f['text']}`: {f.get('error', '')}")
        if fails:
            lines.append("")
    lines += [f"Listening page: `{os.path.join(WORK, 'samples.html')}`"]
    path = os.path.join(WORK, "REPORT.md")
    os.makedirs(WORK, exist_ok=True)
    open(path, "w", encoding="utf8").write("\n".join(lines) + "\n")
    print("\n" + "\n".join(lines) + f"\n(saved to {path})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stage", choices=["smoke", "pilot", "full", "pack"])
    ap.add_argument("--langs", default="de,fr")
    ap.add_argument("--engine", default="google", choices=["google", "tone"])
    ap.add_argument("--pilot", type=int, default=10, help="clips per kind in the pilot")
    ap.add_argument("--max-chars-month", type=int, default=900_000)
    ap.add_argument("--out-root", default=os.path.join(ROOT, "audio"), help="where the packs go (default: <repo>/audio)")
    args = ap.parse_args()
    args.langs = [l.strip() for l in args.langs.split(",") if l.strip()]
    if shutil.which("node") is None or shutil.which("ffmpeg") is None:
        sys.exit("node and ffmpeg are needed (see tools/audio/README.md).")
    os.makedirs(WORK, exist_ok=True)
    print(f"work folder: {WORK}\npacks go to: {args.out_root}")
    {"smoke": stage_smoke, "pilot": stage_pilot, "full": stage_full, "pack": stage_pack}[args.stage](args)


if __name__ == "__main__":
    main()
