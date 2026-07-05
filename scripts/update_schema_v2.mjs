import { db } from '../lib/db/src/index.ts';

async function run() {
  console.log("🛠 Updating schema to V2...");
  try {
    await db.execute(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "coins" integer DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS "unlocked_items" text DEFAULT '[]';
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "leaderboard_archives" (
        "id" serial PRIMARY KEY NOT NULL,
        "week_number" integer NOT NULL,
        "year" integer NOT NULL,
        "user_id" integer NOT NULL,
        "name" text NOT NULL,
        "rank" integer NOT NULL,
        "xp" integer NOT NULL,
        "avatar_url" text,
        "archived_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    console.log("✅ V2 Schema updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to update schema:", error);
    process.exit(1);
  }
}

run();
