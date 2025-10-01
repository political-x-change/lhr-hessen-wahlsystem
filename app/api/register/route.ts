import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVotingToken } from '@/lib/jwt';
import { sendVotingEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id, token_used FROM users WHERE email = ?',
      args: [email],
    });

    let userId: number;

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      userId = user.id as number;

      // Check if user has already voted
      if (user.token_used === 1) {
        return NextResponse.json(
          { error: 'Sie haben bereits abgestimmt' },
          { status: 400 }
        );
      }
    } else {
      // Insert new user
      const result = await db.execute({
        sql: 'INSERT INTO users (email, token_used) VALUES (?, 0)',
        args: [email],
      });
      userId = Number(result.lastInsertRowid);
    }

    // Generate one-time voting token
    const token = generateVotingToken({ email, userId });

    // Send voting email
    await sendVotingEmail(email, token);

    return NextResponse.json({
      message: 'Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
}
