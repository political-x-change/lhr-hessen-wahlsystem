import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyVotingToken } from '@/lib/jwt';
import { isValidCandidateName, isValidDescription } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { token, candidateName, description } = await request.json();

    // Validate token
    if (!token) {
      return NextResponse.json(
        { error: 'Token fehlt' },
        { status: 400 }
      );
    }

    const payload = verifyVotingToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Token' },
        { status: 401 }
      );
    }

    // Check if user has already voted
    const user = await db.execute({
      sql: 'SELECT token_used FROM users WHERE id = ?',
      args: [payload.userId],
    });

    if (user.rows.length === 0) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    if (user.rows[0].token_used === 1) {
      return NextResponse.json(
        { error: 'Sie haben bereits abgestimmt' },
        { status: 400 }
      );
    }

    // Validate candidate name
    if (!candidateName || !isValidCandidateName(candidateName)) {
      return NextResponse.json(
        { error: 'Ungültiger Name. Format: "Vorname N." (z.B. "Leo G.")' },
        { status: 400 }
      );
    }

    // Validate description
    if (!description || !isValidDescription(description)) {
      return NextResponse.json(
        { error: 'Beschreibung muss zwischen 1 und 140 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // Insert anonymous vote
    await db.execute({
      sql: 'INSERT INTO votes (candidate_name, description) VALUES (?, ?)',
      args: [candidateName, description],
    });

    // Mark token as used (invalidate)
    await db.execute({
      sql: 'UPDATE users SET token_used = 1 WHERE id = ?',
      args: [payload.userId],
    });

    return NextResponse.json({
      message: 'Ihre Stimme wurde erfolgreich abgegeben',
    });
  } catch (error) {
    console.error('Voting error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    );
  }
}
