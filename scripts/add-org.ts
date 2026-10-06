import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.log("Usage: pnpm tsx scripts/add-org.ts <orgSlug> <orgName> <adminEmail> <adminPassword>");
    console.log("Example: pnpm tsx scripts/add-org.ts mycompany \"My Company Inc.\" admin@mycompany.com secret123");
    process.exit(1);
  }

  const [slug, name, email, password] = args;

  try {
    // 1. Check if org exists
    let org = await db.organization.findUnique({ where: { slug } });
    if (org) {
      console.log(`Organization '${slug}' already exists.`);
    } else {
      org = await db.organization.create({
        data: {
          slug,
          name,
          type: "ENTERPRISE",
          trustCenterEnabled: false,
        },
      });
      console.log(`✅ Created organization: ${org.name} (${org.slug})`);
    }

    // 2. Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error(`❌ User with email ${email} already exists!`);
      process.exit(1);
    }

    // 3. Create Admin user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        orgId: org.id,
        email,
        name: "Admin",
        role: "ADMIN",
        passwordHash,
      },
    });

    console.log(`✅ Created ADMIN user: ${user.email}`);
    console.log(`\nYou can now log in at /login with the above email and password.`);
  } catch (err) {
    console.error("Error creating org/user:", err);
  } finally {
    await db.$disconnect();
  }
}

main();
