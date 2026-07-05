import { db } from '../lib/db/src/index.ts';

async function fix() {
  console.log("🛠 Checking database tables...");

  try {
    // Create question_progress table if missing
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "question_progress" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "question_id" integer NOT NULL,
        "correct_streak" integer DEFAULT 0 NOT NULL,
        "total_correct" integer DEFAULT 0 NOT NULL,
        "total_incorrect" integer DEFAULT 0 NOT NULL,
        "is_mastered" boolean DEFAULT false NOT NULL,
        "last_attempted_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create index if missing
    try {
      await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "user_q_prog_idx" ON "question_progress" ("user_id", "question_id");`);
    } catch (e) {
      console.log("Note: Index might already exist");
    }

    console.log("✅ Database fixed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to fix database:", error);
    process.exit(1);
  }
}

fix();
