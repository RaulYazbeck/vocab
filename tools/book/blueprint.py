#!/usr/bin/env python3
"""Book blueprint: the skeleton of the grammar book, without its text.

For every chapter and appendix PDF it records the section headings and,
for every exercise (ÜBUNG 28•6 …), its number, the section it sits in,
its type and how many items it has. No explanations and no exercise
sentences are kept, so the output can live in the repo; PLAN.md says how
the course uses it.

    python3 -I tools/book/blueprint.py <dir-with-chapter-pdfs> tools/book/blueprint.json

PDF names only need to contain "chap<N>" or "appendix<X>" (any case, any
prefix), e.g. "08e56334-Chap1.pdf" or "AppendixC.pdf". Needs pdftotext.
"""
import json, os, re, subprocess, sys

# Exercise type from its instruction: first match wins.
TYPES = [
    ("translate", r"\btranslat"),
    ("write-own", r"original|write (a|an) |your own|of your choosing|any appropriate"),
    ("compose", r"compose|using the (string of )?words|words in each list|make sentences"),
    ("combine", r"combine|join"),
    ("order", r"correct order|put each group"),
    ("answer", r"\banswer\b|respond|response|supply a (phrase|sentence)"),
    ("question", r"as (a |general )?questions?|form questions|interrogative"),
    ("negate", r"negat"),
    ("fill", r"fill in|blank|supply|insert|provide|complete|circle|underline|conjugat|write the"),
    ("transform", r"rewrite|change|replace|restate|reword|form the"),
    ("read", r"read|aloud|pronounc"),
]

def classify(text):
    for label, rx in TYPES:
        if re.search(rx, text, re.I):
            return label
    return "other"

def key_of(name):
    m = re.search(r"chap(?:ter)?\s*(\d+)", name, re.I)
    if m:
        return "c" + m.group(1)
    m = re.search(r"appendix\s*([a-z])", name, re.I)
    return "app" + m.group(1).upper() if m else None

def is_heading(lines, i):
    s = lines[i]
    t = s.strip()
    if not t or s.startswith(" ") or len(t) > 60 or len(t.split()) > 9:
        return False
    if re.search(r"[.:;,?!)]$|_{3,}|EXAMPLE|ÜBUNG| / ", t):
        return False
    if not re.match(r"^[A-Za-zÄÖÜ]", t) or re.match(r"^(ich|du|er|wir|ihr|Sie|sie|man|wer|es)\b\s", t):
        return False
    return i == 0 or not lines[i - 1].strip()

def chapter(text):
    lines = text.split("\n")
    heads, exercises, cur = [], [], None
    i = 0
    while i < len(lines):
        s = lines[i]
        m = re.search(r"ÜBUNG\s+(\d+•\d+)", s)
        if m:
            j, instr = i + 1, []
            while j < len(lines) and len(instr) < 6 and not re.search(r"EXAMPLE", lines[j], re.I) \
                    and not re.match(r"^\s*1\.", lines[j]):
                if lines[j].strip():
                    instr.append(lines[j].strip())
                j += 1
            cur = {"id": m.group(1).replace("•", "."), "section": heads[-1] if heads else "",
                   "type": classify(" ".join(instr)), "items": 0}
            exercises.append(cur)
            i = j
            continue
        if cur and re.match(r"^\s*\d+\.\s", s):
            cur["items"] += 1
        elif is_heading(lines, i) and s.strip() not in heads:
            heads.append(s.strip())
        i += 1
    return {"sections": heads, "exercises": exercises}

def main(src, out):
    book = {}
    for name in os.listdir(src):
        key = key_of(name)
        if not key or not name.lower().endswith(".pdf"):
            continue
        text = subprocess.run(["pdftotext", "-layout", os.path.join(src, name), "-"],
                              capture_output=True, text=True, check=True).stdout
        book[key] = chapter(text)
    order = sorted(book, key=lambda k: (k.startswith("app"), int(k[1:]) if k[1:].isdigit() else 0, k))
    result = {k: book[k] for k in order}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    n = sum(len(v["exercises"]) for v in result.values())
    items = sum(e["items"] for v in result.values() for e in v["exercises"])
    print(f"{len(result)} files, {n} exercises, {items} items -> {out}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
