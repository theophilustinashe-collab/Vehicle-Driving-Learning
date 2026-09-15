import pg from 'pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.log('DATABASE_URL not set'); process.exit(1); }
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
console.log(res.rows);
await pool.end();
