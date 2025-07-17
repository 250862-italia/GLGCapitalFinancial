import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    responseTime: 0,
    error: undefined as string | undefined,
    checks: {
      database: { status: 'unknown', responseTime: 0, error: undefined as string | undefined },
      supabase: { status: 'unknown', responseTime: 0, error: undefined as string | undefined },
      memory: { status: 'unknown', usage: 0 },
      disk: { status: 'unknown', usage: 0 },
      environment: { status: 'unknown', missing: [] as string[] }
    }
  };

  try {
    // Check 1: Database connection
    const dbStartTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('count')
        .limit(1);
      
      const dbResponseTime = Date.now() - dbStartTime;
      
      if (error) {
        health.checks.database = {
          status: 'unhealthy',
          responseTime: dbResponseTime,
          error: error.message
        };
      } else {
        health.checks.database = {
          status: 'healthy',
          responseTime: dbResponseTime,
          error: undefined
        };
      }
    } catch (error) {
      health.checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check 2: Supabase connection
    const supabaseStartTime = Date.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const supabaseResponseTime = Date.now() - supabaseStartTime;
      
      if (error) {
        health.checks.supabase = {
          status: 'unhealthy',
          responseTime: supabaseResponseTime,
          error: error.message
        };
      } else {
        health.checks.supabase = {
          status: 'healthy',
          responseTime: supabaseResponseTime,
          error: undefined
        };
      }
    } catch (error) {
      health.checks.supabase = {
        status: 'unhealthy',
        responseTime: Date.now() - supabaseStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check 3: Memory usage
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    health.checks.memory = {
      status: memUsagePercent < 80 ? 'healthy' : 'warning',
      usage: Math.round(memUsagePercent)
    };

    // Check 4: Environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      health.status = 'warning';
      health.checks.environment = {
        status: 'warning',
        missing: missingEnvVars
      };
    }

    // Determine overall status
    const allChecks = Object.values(health.checks);
    const unhealthyChecks = allChecks.filter(check => 
      check.status === 'unhealthy' || 
      (Array.isArray(check) && check.some(c => c.status === 'unhealthy'))
    );

    if (unhealthyChecks.length > 0) {
      health.status = 'unhealthy';
    }

    const totalResponseTime = Date.now() - startTime;
    health.responseTime = totalResponseTime;

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503;

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    health.status = 'unhealthy';
    health.error = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(health, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
} 