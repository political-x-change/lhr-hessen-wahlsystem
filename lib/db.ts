import "server-only";
import { createClient, Client } from "@libsql/client";

let dbInstance: Client | null = null;

// Lazy initialization of database connection
export function getDb(): Client {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL;
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    
    if (!url) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    dbInstance = createClient({
      url,
      authToken,
    });
  }
  
  return dbInstance;
}

// For backward compatibility
export const db = new Proxy({} as Client, {
  get(_target, prop) {
    const dbInstance = getDb();
    return dbInstance[prop as keyof Client];
  },
});

// Initialize database schema
export async function initializeDatabase() {
  const db = getDb();
  
  try {
    // Users table - stores email and token status
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        token_used INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Candidates table - stores candidate information
    await db.execute(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Votes table - anonymized, no link to users
    await db.execute(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id)
      )
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}
