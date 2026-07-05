import { db } from '../lib/db/src/index.ts';

async function run() {
  console.log("🛠 Adding last_daily_challenge_at column...");
  try {
    await db.execute(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "last_daily_challenge_at" timestamp;
    `);
    console.log("✅ Column added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to add column:", error);
    process.exit(1);
  }
}

run();
