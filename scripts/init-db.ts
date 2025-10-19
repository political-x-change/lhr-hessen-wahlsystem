#!/usr/bin/env tsx
/**
 * Database Initialization Script
 *
 * This script initializes the PostgreSQL database with the required schema.
 * Run with: npx tsx scripts/init-db.ts
 */

import { Client } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error("Error: DATABASE_URL must be set in .env.local");
	process.exit(1);
}

async function initDatabase() {
	console.log("Connecting to database...");

	if (!DATABASE_URL) {
		throw new Error("Database URL is not defined");
	}

	const db = new Client({
		connectionString: DATABASE_URL,
	});

	try {
		await db.connect();
		console.log("✓ Connected to database");

		console.log("Creating users table...");
		await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        token_used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
		console.log("✓ Users table created");

		console.log("Creating candidates table...");
		await db.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
		console.log("✓ Candidates table created");

		console.log("Creating votes table...");
		await db.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id)
      )
    `);
		console.log("✓ Votes table created");

		// Create indexes for better performance
		console.log("Creating indexes...");
		try {
			await db.query(
				"CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
			);
			await db.query(
				"CREATE INDEX IF NOT EXISTS idx_users_token_used ON users(token_used)",
			);
			await db.query(
				"CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id)",
			);
			console.log("✓ Indexes created");
		} catch {
			console.log("Note: Indexes may already exist");
		}

		// Insert sample candidates if the table is empty
		console.log("Checking for existing candidates...");
		const existingCandidates = await db.query(
			"SELECT COUNT(*) as count FROM candidates",
		);
		const count = Number(existingCandidates.rows[0].count);

		if (count === 0) {
			console.log("Adding sample candidates...");
			await db.query({
				text: "INSERT INTO candidates (name, description) VALUES ($1, $2)",
				values: [
					"Leo G.",
					"Erfahrener Politiker mit Fokus auf Bildung und Innovation",
				],
			});
			await db.query({
				text: "INSERT INTO candidates (name, description) VALUES ($1, $2)",
				values: [
					"Maria K.",
					"Engagierte Aktivistin für Umweltschutz und Nachhaltigkeit",
				],
			});
			await db.query({
				text: "INSERT INTO candidates (name, description) VALUES ($1, $2)",
				values: [
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
		await db.end();
	}
}

initDatabase();
