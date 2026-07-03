import { db, usersTable } from '../lib/db/src/index.ts';

async function promote() {
  const email = 'theophilustinashe@gmail.com';
  try {
    console.log(`Promoting ${email} to admin...`);
    // Using a raw query to avoid complex imports in a quick script
    await db.execute(
      `UPDATE "users" SET "role" = 'admin' WHERE "email" = '${email}'`
    );
    console.log("✅ Success! Please log out and log back in to see the changes.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to promote user:", error);
    process.exit(1);
  }
}

promote();
