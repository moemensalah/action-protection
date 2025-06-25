import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3, // Reduced pool size
  idleTimeoutMillis: 10000, // Shorter idle timeout
  connectionTimeoutMillis: 10000, // Connection timeout
  statement_timeout: 30000, // Query timeout
});

export const db = drizzle(pool, { schema });