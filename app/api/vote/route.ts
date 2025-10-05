import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/container';

export async function POST(request: NextRequest) {
  try {
    const { token, candidateId } = await request.json();

    const castVoteUseCase = container.getCastVoteUseCase();
    const result = await castVoteUseCase.execute({ token, candidateId });

    return NextResponse.json({
      message: result.message,
    });
  } catch (error) {
    console.error('Voting error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    
    // Determine status code based on error message
    let status = 500;
    if (errorMessage.includes('Token fehlt') || errorMessage.includes('wählen Sie')) {
      status = 400;
    } else if (errorMessage.includes('Ungültiger oder abgelaufener Token')) {
      status = 401;
    } else if (errorMessage.includes('nicht gefunden')) {
      status = 404;
    } else if (errorMessage.includes('bereits')) {
      status = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
