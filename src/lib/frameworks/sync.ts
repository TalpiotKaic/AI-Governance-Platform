// Keeps an existing database's requirement ↔ control mappings (and control descriptions) in line with
// prisma/seed-data/frameworks.json, so mapping updates reach deployed instances without re-seeding.
// Runs once per server process; inserts missing links only (never deletes user data).
import { db } from "@/lib/db";
import frameworksJson from "../../../prisma/seed-data/frameworks.json";

type FwJson = { frameworks: { code: string; requirements: { ref: string }[] }[]; controls: { code: string; description: string; mappings: Record<string, string[]> }[] };
let done: Promise<void> | null = null;

export function ensureFrameworkMappings(): Promise<void> {
  if (!done) done = run().catch((e) => { done = null; console.warn("framework mapping sync failed", e); });
  return done;
}

async function run() {
  const fw = frameworksJson as unknown as FwJson;
  const [reqs, controls, links] = await Promise.all([
    db.requirement.findMany({ select: { id: true, ref: true, framework: { select: { code: true } } } }),
    db.control.findMany({ select: { id: true, code: true, description: true } }),
    db.requirementControl.findMany({ select: { requirementId: true, controlId: true } }),
  ]);
  if (!reqs.length || !controls.length) return; // not seeded yet
  const reqId = new Map(reqs.map((r) => [`${r.framework.code}|${r.ref}`, r.id]));
  const ctl = new Map(controls.map((c) => [c.code, c]));
  const have = new Set(links.map((l) => `${l.requirementId}|${l.controlId}`));
  const add: { requirementId: string; controlId: string }[] = [];
  for (const c of fw.controls) {
    const control = ctl.get(c.code);
    if (!control) continue;
    if (control.description !== c.description) await db.control.update({ where: { id: control.id }, data: { description: c.description } });
    for (const [code, refs] of Object.entries(c.mappings)) for (const ref of refs) {
      const r = reqId.get(`${code}|${ref}`);
      if (r && !have.has(`${r}|${control.id}`)) { add.push({ requirementId: r, controlId: control.id }); have.add(`${r}|${control.id}`); }
    }
  }
  if (add.length) await db.requirementControl.createMany({ data: add, skipDuplicates: true });
}
