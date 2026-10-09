/**
 * One-off: give every open risk without a due date the default deadline for its score
 * (CRITICAL >=80: 30 days, HIGH >=60: 45 days, otherwise 90 days), counted from the risk's creation date.
 * The same backfill also runs automatically whenever the dashboard or the risk register is opened.
 * Run: pnpm tsx scripts/backfill-risk-due-dates.ts
 */
import { db } from "../src/lib/db";
import { backfillRiskDueDates } from "../src/lib/risks/due";

async function main() {
  const n = await backfillRiskDueDates();
  console.log(`risk due dates filled: ${n}`);
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
