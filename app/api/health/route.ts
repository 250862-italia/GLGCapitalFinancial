import { NextResponse } from 'next/server';
import { getSupabaseHealth } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Get system info
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const memoryPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    // Check Supabase health with checkpoints
    const supabaseHealth = await getSupabaseHealth();
    
    // Determine overall status
    const isHealthy = supabaseHealth.status === 'healthy';
    const overallStatus = isHealthy ? 'healthy' : 'unhealthy';
    
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      responseTime: Date.now() - startTime,
      checks: {
        database: {
          status: supabaseHealth.status,
          responseTime: supabaseHealth.responseTime || 0,
          error: supabaseHealth.error || null,
          checkpoint: supabaseHealth.checkpoint ? {
            name: supabaseHealth.checkpoint.name,
            region: supabaseHealth.checkpoint.region,
            status: supabaseHealth.checkpoint.status
          } : null,
          allCheckpoints: supabaseHealth.checkpoints.map(cp => ({
            name: cp.name,
            region: cp.region,
            status: cp.status,
            responseTime: cp.responseTime,
            lastCheck: cp.lastCheck
          }))
        },
        supabase: {
          status: supabaseHealth.status,
          responseTime: supabaseHealth.responseTime || 0,
          checkpoint: supabaseHealth.checkpoint?.name || 'none'
        },
        memory: {
          status: memoryPercent > 90 ? 'critical' : memoryPercent > 80 ? 'warning' : 'healthy',
          usage: memoryPercent,
          details: {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
          }
        },
        disk: {
          status: 'unknown',
          usage: 0
        },
        environment: {
          status: 'unknown',
          missing: []
        }
      }
    };
    
    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: {
          status: 'unhealthy',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        supabase: {
          status: 'unhealthy',
          responseTime: 0
        },
        memory: {
          status: 'unknown',
          usage: 0
        },
        disk: {
          status: 'unknown',
          usage: 0
        },
        environment: {
          status: 'unknown',
          missing: []
        }
      }
    }, {
      status: 503
    });
  }
} 