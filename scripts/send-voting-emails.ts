#!/usr/bin/env tsx
/**
 * Send Voting Emails Script
 *
 * Sends voting links to registered users who haven't voted.
 * Run: npx tsx scripts/send-voting-emails.ts
 */

import { Client } from "pg";
import * as dotenv from "dotenv";
import { Resend } from "resend";
import { generateVotingToken } from "../lib/jwt";

dotenv.config({ path: `${process.cwd()}/.env.local` });

const { DATABASE_URL, RESEND_API_KEY, NEXT_PUBLIC_APP_URL } = process.env;
const APP_URL = NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = "LHR Hessen Wahlsystem <poxc@lgll.dev>";

if (!DATABASE_URL || !RESEND_API_KEY) {
	console.error(
		"Error: DATABASE_URL and RESEND_API_KEY must be set in .env.local",
	);
	process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

const VOTING_EMAIL_HTML = (votingLink: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #333;">Landesheimratwahlen ${new Date().getFullYear()}</h1>
    <p>Die Wahlen zum Landesheimrat Hessen sind eröffnet!</p>
    <p>Bitte klicke auf den folgenden Link, um deine Stimme abzugeben:</p>
    <a href="${votingLink}" style="display: inline-block; background-color: #0e4f5d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Zur Abstimmung
    </a>
    <p style="color: #666; font-size: 14px;">
      Dieser Link ist einmalig gültig und kann nur für eine Abstimmung verwendet werden. Falls du diese E-Mail nicht angefordert hast, ignoriere sie bitte.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px;">
      Diese E-Mail wurde im Rahmen des von Political X Change entwickelten Wahlsystems versendet. 
    </p>
  </div>
`;

async function sendVotingEmails() {
	console.log("=".repeat(50));
	console.log("Send Voting Emails Script");
	console.log("=".repeat(50));
	console.log("");

	if (!DATABASE_URL) {
		throw new Error("Database URL is not defined");
	}

	const db = new Client({
		connectionString: DATABASE_URL,
	});

	try {
		await db.connect();
		console.log("Fetching registered users who haven't voted yet...");

		const result = await db.query(
			"SELECT id, email FROM users WHERE token_used = 0",
		);

		if (result.rows.length === 0) {
			console.log("No users found who need voting links.");
			return;
		}

		console.log(`Found ${result.rows.length} users to send emails to.`);
		console.log("");

		let successCount = 0;
		let errorCount = 0;

		for (const row of result.rows) {
			const { id: userId, email } = row;

			try {
				const token = generateVotingToken({
					email: email as string,
					userId: userId as number,
				});
				const votingLink = `${APP_URL}/vote?token=${token}`;

				const { error } = await resend.emails.send({
					from: FROM_EMAIL,
					to: [email as string],
					subject: "Ihr persönlicher Wahllink",
					html: VOTING_EMAIL_HTML(votingLink),
				});

				if (error) {
					console.error(`✗ Failed to send email to ${email}:`, error);
					errorCount++;
				} else {
					console.log(`✓ Sent email to: ${email}`);
					successCount++;
				}

				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				console.error(`✗ Error processing email for ${email}:`, error);
				errorCount++;
			}
		}

		console.log("");
		console.log("=".repeat(50));
		console.log(`Summary:`);
		console.log(`  Total users: ${result.rows.length}`);
		console.log(`  Successfully sent: ${successCount}`);
		console.log(`  Failed: ${errorCount}`);
		console.log("=".repeat(50));

		if (successCount > 0) {
			console.log("");
			console.log("✅ Voting emails have been sent successfully!");
		}

		if (errorCount > 0) {
			console.log("");
			console.log(
				"⚠️  Some emails failed to send. Please check the errors above.",
			);
			process.exit(1);
		}
	} catch (error) {
		console.error("❌ Error sending voting emails:", error);
		process.exit(1);
	} finally {
		await db.end();
	}
}

sendVotingEmails();
