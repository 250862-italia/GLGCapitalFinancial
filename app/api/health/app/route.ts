import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test base dell'applicazione senza database
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      ok: true,
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      uptime: process.uptime(),
      checks: {
        app: {
          status: 'healthy',
          responseTime
        },
        memory: {
          status: 'healthy',
          usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        }
      }
    }, { status: 200 });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      ok: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
} 