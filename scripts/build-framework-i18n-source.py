#!/usr/bin/env python3
"""Regenerate prisma/seed-data/i18n/_source.json (translation skeleton) from frameworks.json.

Run after `python3 prisma/seed-data/build-frameworks.py`, then add any new keys to every
prisma/seed-data/i18n/<lang>.json and validate with scripts/check-framework-i18n.py.
"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parents[1] / "prisma/seed-data"
data = json.load(open(root / "frameworks.json", encoding="utf-8"))
out = {"frameworks": {}, "requirements": {}, "controls": {}}
for f in data["frameworks"]:
    out["frameworks"][f["code"]] = {"name": f["name"], "description": f.get("description")}
    for r in f["requirements"]:
        out["requirements"][f"{f['code']}|{r['ref']}"] = {"title": r["title"], "description": r.get("description"), "category": r.get("category"), "evidenceHint": r.get("evidenceHint")}
for c in data["controls"]:
    out["controls"][c["code"]] = {"name": c["name"], "category": c.get("category")}
path = root / "i18n/_source.json"
json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{path}: {len(out['frameworks'])} frameworks, {len(out['requirements'])} requirements, {len(out['controls'])} controls")
