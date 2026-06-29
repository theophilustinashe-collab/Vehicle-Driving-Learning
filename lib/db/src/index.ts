import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Mock DATABASE_URL if it's not provided to allow server to start for UI preview
const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/mock_db";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
