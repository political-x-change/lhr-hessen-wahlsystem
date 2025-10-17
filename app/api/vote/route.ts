import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/container';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const { token, candidateId } = await request.json();

    const castVoteUseCase = container.getCastVoteUseCase();
    const result = await castVoteUseCase.execute({ token, candidateId });

    return NextResponse.json({
      message: result.message,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
