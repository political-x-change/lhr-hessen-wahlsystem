import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      // Check if user has already voted
      if (user.token_used === 1) {
        return NextResponse.json(
          { error: 'Sie haben bereits abgestimmt' },
          { status: 400 }
        );
      }
      
      // User already registered but hasn't voted yet
      return NextResponse.json({
        message: 'Sie sind bereits registriert. Der Wahllink wird zu gegebener Zeit per E-Mail versendet.',
      });
    } else {
      // Insert new user
      await db.execute({
        sql: 'INSERT INTO users (email, token_used) VALUES (?, 0)',
        args: [email],
      });
    }

    return NextResponse.json({
      message: 'Registrierung erfolgreich. Der Wahllink wird zu gegebener Zeit per E-Mail versendet.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
}
