import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/container';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const registerUserUseCase = container.getRegisterUserUseCase();
    const result = await registerUserUseCase.execute({ email });

    return NextResponse.json({
      message: result.message,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    
    // Determine status code based on error message
    const status = errorMessage.includes('Ungültige') || errorMessage.includes('bereits') ? 400 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
