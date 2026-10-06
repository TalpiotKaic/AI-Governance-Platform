import "dotenv/config";
import { db } from "../src/lib/db";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: pnpm tsx scripts/delete-org.ts <orgSlug>");
    process.exit(1);
  }

  const slug = args[0];
  const org = await db.organization.findUnique({ where: { slug }, include: { _count: true } });

  if (!org) {
    console.error(`Organization with slug '${slug}' not found.`);
    process.exit(1);
  }

  console.log(`\n⚠️ WARNING: You are about to permanently delete the organization '${org.name}' (${org.slug}).`);
  console.log(`This will delete:`);
  console.log(` - ${org._count.users} Users`);
  console.log(` - ${org._count.systems} AI Systems`);
  console.log(` - ${org._count.runs} Evaluation Runs`);
  console.log(` - ${org._count.evidence} Evidence Records`);
  console.log(` - ${org._count.reports} Reports`);
  
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`\nAre you sure you want to proceed? Type the slug '${slug}' to confirm: `);
  rl.close();

  if (answer !== slug) {
    console.log("Deletion cancelled.");
    process.exit(0);
  }

  await db.organization.delete({ where: { id: org.id } });
  console.log(`✅ Organization '${slug}' and all associated data have been permanently deleted.`);
}

main().finally(() => db.$disconnect());
