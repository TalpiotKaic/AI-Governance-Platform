import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { db } from "../src/lib/db";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: pnpm tsx scripts/export-org.ts <orgSlug>");
    process.exit(1);
  }

  const slug = args[0];
  const org = await db.organization.findUnique({
    where: { slug },
    include: {
      users: true,
      systems: true,
      risks: true,
      plans: true,
      runs: true,
      evidence: true,
      reports: true,
      incidents: true,
    }
  });

  if (!org) {
    console.error(`Organization with slug '${slug}' not found.`);
    process.exit(1);
  }

  const exportPath = path.join(process.cwd(), `export-${slug}-${new Date().toISOString().replace(/:/g, '-')}.json`);
  
  await fs.writeFile(exportPath, JSON.stringify(org, null, 2));
  console.log(`✅ Organization data backed up successfully to: ${exportPath}`);
}

main().finally(() => db.$disconnect());
