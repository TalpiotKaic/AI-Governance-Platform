import "dotenv/config";
import fs from "fs/promises";
import { db } from "../src/lib/db";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: pnpm tsx scripts/import-org.ts <path-to-json-file>");
    process.exit(1);
  }

  const filePath = args[0];
  console.log(`Reading backup file from ${filePath}...`);
  const fileContent = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  // Exclude nested arrays to insert the Organization first
  const { users, systems, risks, plans, runs, evidence, reports, incidents, ...orgData } = data;

  console.log(`Restoring Organization: ${orgData.name} (${orgData.slug})`);

  try {
    // 1. Organization
    await db.organization.create({ data: orgData });

    // 2. Users & Systems (Level 1)
    if (users?.length) {
      console.log(`Restoring ${users.length} Users...`);
      await db.user.createMany({ data: users });
    }
    if (systems?.length) {
      console.log(`Restoring ${systems.length} AI Systems...`);
      await db.aiSystem.createMany({ data: systems });
    }

    // 3. Risks & Plans (Level 2 - depends on systems & users)
    if (risks?.length) {
      console.log(`Restoring ${risks.length} Risks...`);
      await db.risk.createMany({ data: risks });
    }
    if (plans?.length) {
      console.log(`Restoring ${plans.length} Evaluation Plans...`);
      await db.evaluationPlan.createMany({ data: plans });
    }

    // 4. Runs, Evidence, Incidents (Level 3 - depends on plans, systems, users)
    if (runs?.length) {
      console.log(`Restoring ${runs.length} Evaluation Runs...`);
      await db.evaluationRun.createMany({ data: runs });
    }
    if (evidence?.length) {
      console.log(`Restoring ${evidence.length} Evidence Records...`);
      await db.evidence.createMany({ data: evidence });
    }
    if (incidents?.length) {
      console.log(`Restoring ${incidents.length} Incidents...`);
      await db.incident.createMany({ data: incidents });
    }

    // 5. Reports (Level 4 - depends on runs, etc)
    if (reports?.length) {
      console.log(`Restoring ${reports.length} Reports...`);
      await db.report.createMany({ data: reports });
    }

    console.log(`✅ Organization '${orgData.slug}' has been successfully restored!`);
  } catch (err) {
    console.error("❌ Error during restoration. Make sure the organization doesn't already exist and the JSON is valid.");
    console.error(err);
  } finally {
    await db.$disconnect();
  }
}

main();
