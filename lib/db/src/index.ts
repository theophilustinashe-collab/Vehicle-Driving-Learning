import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

const { Pool } = pg;

// Mock DATABASE_URL if it's not provided to allow server to start for UI preview
const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/mock_db";

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 20000, // Increased to 20 seconds to connect
  query_timeout: 45000, // Increased to 45 seconds for query
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });

export * from "./schema/index";
