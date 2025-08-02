import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/database-config';

export async function GET() {
  try {
    const result = await getDatabaseStatus();
    
    if (result.ok) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 503 });
    }
    
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: 0,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
} 