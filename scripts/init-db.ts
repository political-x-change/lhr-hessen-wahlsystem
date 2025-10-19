#!/usr/bin/env tsx
/**
 * Database Initialization Script
 *
 * This script initializes the Turso database with the required schema.
 * Run with: npx tsx scripts/init-db.ts
 */

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL || !DATABASE_AUTH_TOKEN) {
	console.error(
		"Error: DATABASE_URL and DATABASE_AUTH_TOKEN must be set in .env.local",
	);
	process.exit(1);
}

async function initDatabase() {
	console.log("Connecting to database...");

	if (!DATABASE_URL || !DATABASE_AUTH_TOKEN) {
		throw new Error("Database URL or Auth Token is not defined");
	}

	const db = createClient({
		url: DATABASE_URL,
		authToken: DATABASE_AUTH_TOKEN,
	});

	try {
		console.log("Creating users table...");
		await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        token_used INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
		console.log("✓ Users table created");

		console.log("Creating candidates table...");
		await db.execute(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
		console.log("✓ Candidates table created");

		console.log("Creating votes table...");
		await db.execute(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id)
      )
    `);
		console.log("✓ Votes table created");

		// Create indexes for better performance
		console.log("Creating indexes...");
		try {
			await db.execute(
				"CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
			);
			await db.execute(
				"CREATE INDEX IF NOT EXISTS idx_users_token_used ON users(token_used)",
			);
			await db.execute(
				"CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id)",
			);
			console.log("✓ Indexes created");
		} catch {
			console.log("Note: Indexes may already exist");
		}

		// Insert sample candidates if the table is empty
		console.log("Checking for existing candidates...");
		const existingCandidates = await db.execute(
			"SELECT COUNT(*) as count FROM candidates",
		);
		const count = existingCandidates.rows[0].count as number;

		if (count === 0) {
			console.log("Adding sample candidates...");
			await db.execute({
				sql: "INSERT INTO candidates (name, description) VALUES (?, ?)",
				args: [
					"Leo G.",
					"Erfahrener Politiker mit Fokus auf Bildung und Innovation",
				],
			});
			await db.execute({
				sql: "INSERT INTO candidates (name, description) VALUES (?, ?)",
				args: [
					"Maria K.",
					"Engagierte Aktivistin für Umweltschutz und Nachhaltigkeit",
				],
			});
			await db.execute({
				sql: "INSERT INTO candidates (name, description) VALUES (?, ?)",
				args: [
					"Anna S.",
					"Expertin für Soziales und Familienpolitik mit langjähriger Erfahrung",
				],
			});
			console.log("✓ Sample candidates added");
		} else {
			console.log(`✓ Found ${count} existing candidates`);
		}

		console.log("\n✅ Database initialized successfully!");
		console.log("\nYou can now start the application with: npm run dev");
	} catch (error) {
		console.error("❌ Error initializing database:", error);
		process.exit(1);
	} finally {
		db.close();
	}
}

initDatabase();
