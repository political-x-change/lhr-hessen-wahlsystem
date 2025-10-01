#!/usr/bin/env tsx
/**
 * Database Initialization Script
 * 
 * This script initializes the Turso database with the required schema.
 * Run with: npx tsx scripts/init-db.ts
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL || !DATABASE_AUTH_TOKEN) {
  console.error('Error: DATABASE_URL and DATABASE_AUTH_TOKEN must be set in .env.local');
  process.exit(1);
}

async function initDatabase() {
  console.log('Connecting to database...');
  
  const db = createClient({
    url: DATABASE_URL!,
    authToken: DATABASE_AUTH_TOKEN!,
  });

  try {
    console.log('Creating users table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        token_used INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    console.log('Creating votes table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_name TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Votes table created');

    // Create indexes for better performance
    console.log('Creating indexes...');
    try {
      await db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await db.execute('CREATE INDEX IF NOT EXISTS idx_users_token_used ON users(token_used)');
      console.log('✓ Indexes created');
    } catch {
      console.log('Note: Indexes may already exist');
    }

    console.log('\n✅ Database initialized successfully!');
    console.log('\nYou can now start the application with: npm run dev');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

initDatabase();
