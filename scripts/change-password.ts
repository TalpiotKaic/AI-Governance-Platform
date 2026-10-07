import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: pnpm tsx scripts/change-password.ts <userEmail>");
    process.exit(1);
  }

  const email = args[0].toLowerCase().trim();
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User with email '${email}' not found.`);
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });
  const newPassword = await rl.question(`Enter new password for ${email}: `);
  rl.close();

  if (!newPassword || newPassword.length < 6) {
    console.error("Password must be at least 6 characters long.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  console.log(`✅ Password successfully updated for user: ${email}`);
}

main().finally(() => db.$disconnect());
