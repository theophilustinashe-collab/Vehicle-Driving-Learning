import { db, roadSignsTable } from '../lib/db/src/index.ts';

async function check() {
  try {
    const signs = await db.select().from(roadSignsTable);
    console.log(`Total signs in database: ${signs.length}`);
    signs.forEach(s => console.log(`ID ${s.id}: ${s.name} (${s.category})`));
    process.exit(0);
  } catch (error) {
    console.error("Check failed:", error);
    process.exit(1);
  }
}

check();
