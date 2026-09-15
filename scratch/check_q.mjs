import pg from 'pg';
const { Pool } = pg;
const connectionString = 'postgresql://neondb_owner:npg_V9WkaUpbT7Gq@ep-icy-hat-adekz7qm.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString });

async function test() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT count(*) FROM questions');
    console.log('Total questions in DB:', res.rows[0].count);

    const statuses = await client.query('SELECT status, count(*) FROM questions GROUP BY status');
    console.log('Statuses:', statuses.rows);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
