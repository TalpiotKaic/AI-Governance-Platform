#!/usr/bin/env python3
"""Validate prisma/seed-data/i18n/library.<lang>.json against library._source.json (same keys, no empty fields, codes kept)."""
import json, re, sys, pathlib
base = pathlib.Path(__file__).resolve().parents[1] / "prisma/seed-data/i18n"
src = json.load(open(base / "library._source.json"))
langs = sys.argv[1:] or sorted(p.stem.split(".")[1] for p in base.glob("library.*.json") if not p.stem.endswith("_source"))
CODE = re.compile(r"\b(EV-[A-Z]+|T-[A-Z]+|HC-\d\d|TM-\d\d|SC-[A-Z]+-\d{3}|Art\. ?\d+|NIST AI [\d-]+|ISO/IEC \d+|제\d+조|GOVERN|MAP|MEASURE|MANAGE)\b")
ok = True
for lang in langs:
    p = base / f"library.{lang}.json"
    if not p.exists(): print(f"[{lang}] missing file"); ok = False; continue
    t = json.load(open(p))
    for section in src:
        missing = [k for k in src[section] if k not in t.get(section, {})]
        extra = [k for k in t.get(section, {}) if k not in src[section]]
        if missing: print(f"[{lang}] {section}: {len(missing)} missing, e.g. {missing[:3]}"); ok = False
        if extra: print(f"[{lang}] {section}: {len(extra)} unknown, e.g. {extra[:3]}"); ok = False
        for k, sv in src[section].items():
            tv = t.get(section, {}).get(k)
            if not isinstance(tv, dict): continue
            for field, s in sv.items():
                v = tv.get(field)
                if s and not v: print(f"[{lang}] {section} {k}.{field}: empty"); ok = False
                if s and v and set(CODE.findall(s)) - set(CODE.findall(v)): print(f"[{lang}] {section} {k}.{field}: dropped codes {sorted(set(CODE.findall(s)) - set(CODE.findall(v)))}"); ok = False
    print(f"[{lang}] {'OK' if ok else 'issues found'} — {len(t.get('scenarios',{}))} scenarios, {len(t.get('methods',{}))} methods")
sys.exit(0 if ok else 1)
