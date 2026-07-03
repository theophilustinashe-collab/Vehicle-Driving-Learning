import { db, usersTable } from '../lib/db/src/index.ts';

async function listUsers() {
  try {
    const users = await db.select().from(usersTable);
    console.log(JSON.stringify(users, (key, value) => key === 'password' ? '***' : value, 2));
    process.exit(0);
  } catch (error) {
    console.error("Failed to list users:", error);
    process.exit(1);
  }
}

listUsers();
