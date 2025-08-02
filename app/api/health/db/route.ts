import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection con SELECT 1
    const { data, error } = await supabase
      .rpc('version'); // Usa una funzione RPC semplice
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        responseTime,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    return NextResponse.json({
      ok: true,
      responseTime,
      timestamp: new Date().toISOString(),
      database: 'healthy'
    }, { status: 200 });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
} 