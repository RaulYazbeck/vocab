#!/usr/bin/env python3
"""The whole voice-pack job in one command, built to run unattended overnight.

    python tools/audio/run_all.py pilot            # a small sample to listen to first
    python tools/audio/run_all.py full             # everything (hours; safe to stop and re-run)
    python tools/audio/run_all.py pack             # re-pack only (after fixing clips)

The AI model speaks with its own built-in voice: nothing to record or upload.

pilot  A small sample (25 words + 25 sentences per language), plus a listening
       page, so you can judge the voice BEFORE the long run. Prints a time
       estimate for the full run.
full   Everything, exhaustively:
         1. extract every text the app can say
         2. make every clip, checking each one by transcribing it back with
            Whisper and retrying bad ones (new random seed, up to 3 times)
         3. a second, more careful pass over any clips that still failed
            (more retries, lower randomness)
         4. pack into audio/<lang>/  (stable shards: see pack.mjs)
         5. status check, and a REPORT.md
pack   Steps 4-5 only.

It is resumable: stop it any time (or let Colab disconnect) and run the same
command again; finished clips are never redone. Set AUDIO_WORK to a folder that
survives (Google Drive on Colab) so progress isn't lost.

Nothing is committed or published: you listen first, then commit audio/.
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


def run(cmd, **kw):
    print("\n$ " + " ".join(cmd), flush=True)
    r = subprocess.run(cmd, **kw)
    if r.returncode != 0:
        sys.exit(f"\nStopped: command failed (exit {r.returncode}). Fix the problem and run the same command again; finished work is kept.")


def node(script, *a):
    run(["node", os.path.join(HERE, script), *a])


def synth(lang, args, *extra):
    cmd = [sys.executable, os.path.join(HERE, "synth.py"), "--lang", lang, "--engine", args.engine]
    if args.device:
        cmd += ["--device", args.device]
    if args.verify:
        cmd += ["--verify", "--whisper-model", args.whisper_model]
    run(cmd + list(extra))


def read_json(path, default=None):
    try:
        return json.load(open(path, encoding="utf8"))
    except Exception:
        return default


def lang_dir(lang):
    return os.path.join(WORK, lang)


def count_wavs(lang):
    d = os.path.join(lang_dir(lang), "wav")
    return len([f for f in os.listdir(d) if f.endswith(".wav")]) if os.path.isdir(d) else 0


def eta_line(lang, remaining):
    sp = read_json(os.path.join(lang_dir(lang), "speed.json"))
    if not sp or not sp.get("per_second"):
        return ""
    secs = remaining / sp["per_second"]
    return f"{lang}: {sp['per_second']:.2f} clips/s  →  about {secs / 3600:.1f} h for the {remaining} clips still to make"


def stage_pilot(args):
    print("PILOT: a small sample to judge the voice before the long run.")
    for lang in args.langs:
        node("extract.mjs", "--lang", lang)
        synth(lang, args, "--kind", "w", "--limit", str(args.pilot))
        synth(lang, args, "--kind", "s", "--limit", str(args.pilot))
        node("review.mjs", "--lang", lang, "--n", str(args.pilot))
    print("\n" + "=" * 70)
    for lang in args.langs:
        texts = read_json(os.path.join(lang_dir(lang), "texts.json"), [])
        remaining = len(texts) - count_wavs(lang)
        print(eta_line(lang, remaining) or f"{lang}: (no speed measured)")
        print(f"   listen: {os.path.join(lang_dir(lang), 'review.html')}")
    print("Happy with how it sounds? Run the same command with 'full'.")


def stage_full(args):
    t0 = time.time()
    for lang in args.langs:
        node("extract.mjs", "--lang", lang)
        texts = read_json(os.path.join(lang_dir(lang), "texts.json"), [])
        print(f"\n{lang}: {len(texts)} clips to make ({count_wavs(lang)} already done)")
        synth(lang, args)                                           # pass 1
        failures = read_json(os.path.join(lang_dir(lang), "failures.json"), [])
        if failures and args.verify:
            print(f"\n{lang}: {len(failures)} clips failed the check — second, more careful pass")
            synth(lang, args, "--retry-failures", "--retries", "6", "--temperature", "0.6", "--cfg-weight", "0.7")
    stage_pack(args, t0)


def stage_pack(args, t0=None):
    t0 = t0 or time.time()
    for lang in args.langs:
        cmd = ["--lang", lang, "--out", os.path.join(args.out_root, lang), "--bitrate", str(args.bitrate), "--format", args.format]
        if args.voice:
            cmd += ["--voice", args.voice]
        node("pack.mjs", *cmd)
        node("status.mjs", "--lang", lang, "--manifest", os.path.join(args.out_root, lang, "manifest.json"))
    write_report(args, time.time() - t0)


def write_report(args, seconds):
    lines = ["# Voice pack report", "", f"Run time this session: {seconds / 3600:.1f} h  (engine: {args.engine})", ""]
    for lang in args.langs:
        texts = read_json(os.path.join(lang_dir(lang), "texts.json"), [])
        fails = read_json(os.path.join(lang_dir(lang), "failures.json"), [])
        man = read_json(os.path.join(args.out_root, lang, "manifest.json"), {})
        tot = man.get("tot", {})
        have = len(man.get("idx", {}))
        mb = lambda b: f"{b / 1048576:.1f} MB"
        lines += [
            f"## {lang}",
            f"- texts the app can say: **{len(texts)}**",
            f"- recorded and in the pack: **{have}**",
            f"- failed the check (use the phone voice): **{len(fails)}**",
            f"- pack size: words {mb(tot.get('w', {}).get('b', 0))} ({tot.get('w', {}).get('n', 0)} clips), "
            f"sentences {mb(tot.get('s', {}).get('b', 0))} ({tot.get('s', {}).get('n', 0)} clips)",
            f"- shards: {len(man.get('shards', []))}, version `{man.get('v', '?')}`",
            f"- listen: `{os.path.join(lang_dir(lang), 'review.html')}` (make a fresh one: `node tools/audio/review.mjs --lang {lang}`)",
            "",
        ]
        if fails:
            lines += ["Clips that never passed (first 40) — fix with an override or `--redo-file`, see the README:", ""]
            for f in fails[:40]:
                lines.append(f"- `{f['text']}` — heard: “{f.get('heard', '')}” (similarity {f.get('score')})")
            lines.append("")
    lines += ["## Next", "1. Listen to a sample (review pages above) — especially accent, liaison, ü/ö/ch.",
              "2. If happy: commit the `audio/` folders and push. The app offers the download on its next launch.",
              "3. Anything wrong: fix it, then `run_all.py pack` again (only changed shards re-download for people)."]
    path = os.path.join(WORK, "REPORT.md")
    os.makedirs(WORK, exist_ok=True)
    open(path, "w", encoding="utf8").write("\n".join(lines) + "\n")
    print("\n" + "\n".join(lines))
    print(f"(saved to {path})")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stage", choices=["pilot", "full", "pack"])
    ap.add_argument("--langs", default="de,fr")
    ap.add_argument("--engine", default="chatterbox", choices=["chatterbox", "tone"])
    ap.add_argument("--device")
    ap.add_argument("--no-verify", dest="verify", action="store_false", help="skip the Whisper check (not recommended)")
    ap.add_argument("--whisper-model", default="large-v3", help="the checker (large-v3 is the most accurate; medium is faster)")
    ap.add_argument("--pilot", type=int, default=25, help="clips per kind in the pilot")
    ap.add_argument("--out-root", default=os.path.join(ROOT, "audio"), help="where the packs go (default: <repo>/audio)")
    ap.add_argument("--bitrate", type=int, default=24)
    ap.add_argument("--format", default="opus", choices=["opus", "aac", "mp3"])
    ap.add_argument("--voice", default="", help="short name of the voice, recorded in the manifest")
    args = ap.parse_args()
    args.langs = [l.strip() for l in args.langs.split(",") if l.strip()]
    if shutil.which("node") is None or shutil.which("ffmpeg") is None:
        sys.exit("node and ffmpeg are needed (see tools/audio/README.md).")
    if args.verify and args.engine == "chatterbox":
        try:
            import faster_whisper  # noqa: F401
        except ImportError:
            print("NOTE: faster-whisper isn't installed, so clips won't be checked (pip install faster-whisper).", file=sys.stderr)
            args.verify = False
    elif args.engine == "tone":
        args.verify = False
    os.makedirs(WORK, exist_ok=True)
    print(f"work folder: {WORK}\npacks go to: {args.out_root}")
    {"pilot": stage_pilot, "full": stage_full, "pack": stage_pack}[args.stage](args)


if __name__ == "__main__":
    main()
