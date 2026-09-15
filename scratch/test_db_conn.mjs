import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Connecting to:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

try {
  const res = await pool.query('SELECT NOW()');
  console.log("Success! Server time:", res.rows[0]);
} catch (err) {
  console.error("Connection failed:", err.message);
} finally {
  await pool.end();
}
