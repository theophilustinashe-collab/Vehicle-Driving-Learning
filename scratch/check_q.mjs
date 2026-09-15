import pg from 'pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.log('DATABASE_URL not set'); process.exit(1); }
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const res = await pool.query("SELECT id, text FROM questions LIMIT 5");
console.log(res.rows);
await pool.end();
