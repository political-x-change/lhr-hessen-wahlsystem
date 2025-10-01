import { NextResponse } from 'next/server';
import { container } from '@/lib/container';

export async function GET() {
  try {
    const getCandidatesUseCase = container.getGetCandidatesUseCase();
    const candidates = await getCandidatesUseCase.execute();
    
    return NextResponse.json({
      candidates,
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
