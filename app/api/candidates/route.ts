import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Mock candidates for development/demo
const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'Leo G.',
    description: 'Erfahrener Politiker mit Fokus auf Bildung und Innovation. Setzt sich ein für moderne Lehrpläne und digitale Transformation in Schulen.',
    image_url: null,
  },
  {
    id: 2,
    name: 'Maria K.',
    description: 'Engagierte Aktivistin für Umweltschutz und Nachhaltigkeit. Kämpft für erneuerbare Energien und den Schutz natürlicher Ressourcen.',
    image_url: null,
  },
  {
    id: 3,
    name: 'Anna S.',
    description: 'Expertin für Soziales und Familienpolitik mit langjähriger Erfahrung. Fördert Programme für Kinderbetreuung und soziale Gerechtigkeit.',
    image_url: null,
  },
];

export async function GET() {
  try {
    const result = await db.execute('SELECT id, name, description, image_url FROM candidates ORDER BY name');
    
    // If no candidates in database, return mock data
    if (result.rows.length === 0) {
      return NextResponse.json({
        candidates: MOCK_CANDIDATES,
      });
    }
    
    return NextResponse.json({
      candidates: result.rows,
    });
  } catch (error) {
    console.error('Error fetching candidates, returning mock data:', error);
    // Return mock data if database fails
    return NextResponse.json({
      candidates: MOCK_CANDIDATES,
    });
  }
}
