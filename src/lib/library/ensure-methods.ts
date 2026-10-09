import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { METHODS } from "../../../prisma/seed-data/library";

/** Make sure a seeded test method (e.g. TM-15 added after the database was first seeded) exists; returns its id. */
export async function ensureTestMethod(code: string): Promise<string> {
  const existing = await db.testMethod.findUnique({ where: { code }, select: { id: true } });
  if (existing) return existing.id;
  const m = METHODS.find((x) => x.code === code);
  if (!m) throw new Error(`Unknown test method ${code}`);
  const method = await db.testMethod.create({ data: { code: m.code, name: m.name, category: m.category, testingType: m.testingType, description: m.description, standardRef: m.standardRef, metrics: m.metrics as unknown as Prisma.InputJsonValue, applicableTo: m.applicableTo, judgeRubric: m.judgeRubric, sortOrder: Number(m.code.split("-")[1]) } });
  const controls = await db.control.findMany({ where: { code: { in: m.controls } }, select: { id: true } });
  for (const c of controls) await db.controlTestMethod.upsert({ where: { controlId_testMethodId: { controlId: c.id, testMethodId: method.id } }, update: {}, create: { controlId: c.id, testMethodId: method.id } });
  return method.id;
}
