#!/usr/bin/env python3
"""Validate prisma/seed-data/i18n/<lang>.json against _source.json: same keys, same fields, codes preserved."""
import json, re, sys, pathlib
base = pathlib.Path(__file__).resolve().parents[1] / "prisma/seed-data/i18n"
src = json.load(open(base / "_source.json"))
langs = sys.argv[1:] or [p.stem for p in base.glob("*.json") if not p.stem.startswith("_")]
CODE = re.compile(r"\b(EV-[A-Z]+|T-[A-Z]+|HC-\d\d|Art\. ?\d+[a-z]?|GOVERN|MAP|MEASURE|MANAGE|ISO/IEC \d+|NIST AI [\d-]+|제\d+조)\b")
ok = True
for lang in langs:
    p = base / f"{lang}.json"
    if not p.exists(): print(f"[{lang}] missing file"); ok = False; continue
    t = json.load(open(p))
    for section in ("frameworks", "requirements", "controls"):
        missing = [] if lang == "en" else [k for k in src[section] if k not in t.get(section, {})]  # en.json only covers Korean-source entries
        extra = [k for k in t.get(section, {}) if k not in src[section]]
        if missing: print(f"[{lang}] {section}: {len(missing)} missing keys, e.g. {missing[:3]}"); ok = False
        if extra: print(f"[{lang}] {section}: {len(extra)} unknown keys, e.g. {extra[:3]}"); ok = False
        for k, sv in src[section].items():
            tv = t.get(section, {}).get(k)
            if not isinstance(tv, dict): continue
            for field, s in sv.items():
                v = tv.get(field)
                if s and not v: print(f"[{lang}] {section} {k}.{field}: empty"); ok = False
                if s and v and set(CODE.findall(s)) - set(CODE.findall(v)): print(f"[{lang}] {section} {k}.{field}: dropped codes {sorted(set(CODE.findall(s)) - set(CODE.findall(v)))}"); ok = False
    print(f"[{lang}] {'OK' if ok else 'issues found'} — {len(t.get('requirements',{}))} requirements, {len(t.get('controls',{}))} controls")
sys.exit(0 if ok else 1)
