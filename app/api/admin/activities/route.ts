import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Activity, ActivityFilters } from '@/types/activity';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin token required' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 });
    }
    
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const user_id = searchParams.get('user_id');
    const admin_id = searchParams.get('admin_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) query = query.eq('type', type);
    if (user_id) query = query.eq('user_id', user_id);
    if (admin_id) query = query.eq('admin_id', admin_id);
    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: activities || [],
      count: activities?.length || 0
    });

  } catch (error) {
    console.error('Activities API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({ error: 'Admin token required' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not available' }, { status: 500 });
    }
    const body = await request.json();
    
    const { user_id, admin_id, action, type, details, ip_address, user_agent } = body;

    // Validate required fields
    if (!action || !type) {
      return NextResponse.json({ error: 'Action and type are required' }, { status: 400 });
    }

    // Create activity record
    const { data: activity, error } = await supabaseAdmin
      .from('activities')
      .insert({
        user_id,
        admin_id,
        action,
        type,
        details,
        ip_address: ip_address || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip,
        user_agent: user_agent || request.headers.get('user-agent'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Create activity API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 