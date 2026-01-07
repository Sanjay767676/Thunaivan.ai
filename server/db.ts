import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Initialize database connection if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    console.log("Database connection initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
} else {
  console.warn("DATABASE_URL not set. Database operations will be limited.");
}

// Export db with type assertion - will be null if DATABASE_URL not set
export { db };
export { pool };
