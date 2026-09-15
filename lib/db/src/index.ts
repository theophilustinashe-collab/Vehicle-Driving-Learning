import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

const { Pool } = pg;

// Connection string from environment variable (Neon PostgreSQL or local instance)
const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/mock_db";

const isNeon = connectionString.includes('neon.tech') || connectionString.includes('sslmode=require');
const isProd = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString,
  ssl: (isNeon || isProd) ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 20000, // 20 seconds connection timeout
  query_timeout: 45000, // 45 seconds query timeout
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const db = drizzle(pool, { schema });

export * from "./schema/index";
