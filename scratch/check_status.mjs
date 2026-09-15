import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_V9WkaUpbT7Gq@ep-icy-hat-adekz7qm.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });
pool.query("SELECT DISTINCT status FROM questions").then(r => {
  console.log(r.rows);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
