import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllCheckpoints, 
  getCurrentCheckpoint, 
  refreshCheckpoints
} from '@/lib/supabase';
import { 
  addCheckpoint, 
  removeCheckpoint 
} from '@/lib/supabase-checkpoints';

export async function GET() {
  try {
    const checkpoints = getAllCheckpoints();
    const current = getCurrentCheckpoint();
    
    return NextResponse.json({
      current: current ? {
        name: current.name,
        region: current.region,
        status: current.status,
        responseTime: current.responseTime,
        lastCheck: current.lastCheck
      } : null,
      all: checkpoints.map(cp => ({
        name: cp.name,
        region: cp.region,
        priority: cp.priority,
        status: cp.status,
        responseTime: cp.responseTime,
        lastCheck: cp.lastCheck
      })),
      summary: {
        total: checkpoints.length,
        healthy: checkpoints.filter(cp => cp.status === 'healthy').length,
        unhealthy: checkpoints.filter(cp => cp.status === 'unhealthy').length,
        unknown: checkpoints.filter(cp => cp.status === 'unknown').length
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      case 'refresh':
        const newCheckpoint = await refreshCheckpoints();
        return NextResponse.json({
          success: true,
          message: 'Checkpoints refreshed',
          current: newCheckpoint ? {
            name: newCheckpoint.name,
            region: newCheckpoint.region,
            status: newCheckpoint.status
          } : null
        });
        
      case 'add':
        if (!data.name || !data.url || !data.anonKey || !data.region) {
          return NextResponse.json({
            error: 'Missing required fields: name, url, anonKey, region'
          }, { status: 400 });
        }
        
        addCheckpoint({
          name: data.name,
          url: data.url,
          anonKey: data.anonKey,
          region: data.region,
          priority: data.priority || 999
        });
        
        return NextResponse.json({
          success: true,
          message: `Checkpoint ${data.name} added`
        });
        
      case 'remove':
        if (!data.name) {
          return NextResponse.json({
            error: 'Missing required field: name'
          }, { status: 400 });
        }
        
        removeCheckpoint(data.name);
        
        return NextResponse.json({
          success: true,
          message: `Checkpoint ${data.name} removed`
        });
        
      default:
        return NextResponse.json({
          error: 'Invalid action. Use: refresh, add, or remove'
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 