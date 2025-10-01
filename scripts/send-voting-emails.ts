#!/usr/bin/env tsx
/**
 * Send Voting Emails Script
 * 
 * This script sends voting links to all registered users who haven't voted yet.
 * Run with: npx tsx scripts/send-voting-emails.ts
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { generateVotingToken } from '../lib/jwt';
import { sendVotingEmail } from '../lib/email';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_URL || !DATABASE_AUTH_TOKEN) {
  console.error('Error: DATABASE_URL and DATABASE_AUTH_TOKEN must be set in .env.local');
  process.exit(1);
}

async function sendVotingEmails() {
  console.log('Connecting to database...');
  
  const db = createClient({
    url: DATABASE_URL!,
    authToken: DATABASE_AUTH_TOKEN!,
  });

  try {
    console.log('Fetching registered users who haven\'t voted yet...');
    
    const result = await db.execute(
      'SELECT id, email FROM users WHERE token_used = 0'
    );

    if (result.rows.length === 0) {
      console.log('No users found who need voting links.');
      return;
    }

    console.log(`Found ${result.rows.length} users to send emails to.`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const row of result.rows) {
      const userId = row.id as number;
      const email = row.email as string;

      try {
        // Generate one-time voting token
        const token = generateVotingToken({ email, userId });

        // Send voting email
        await sendVotingEmail(email, token);

        console.log(`✓ Sent email to: ${email}`);
        successCount++;

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`✗ Failed to send email to ${email}:`, error);
        errorCount++;
      }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`Summary:`);
    console.log(`  Total users: ${result.rows.length}`);
    console.log(`  Successfully sent: ${successCount}`);
    console.log(`  Failed: ${errorCount}`);
    console.log('='.repeat(50));

    if (successCount > 0) {
      console.log('');
      console.log('✅ Voting emails have been sent successfully!');
    }

    if (errorCount > 0) {
      console.log('');
      console.log('⚠️  Some emails failed to send. Please check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error sending voting emails:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run the script
console.log('='.repeat(50));
console.log('Send Voting Emails Script');
console.log('='.repeat(50));
console.log('');

sendVotingEmails();
