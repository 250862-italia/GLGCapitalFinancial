import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build query
    let query = supabaseAdmin
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email,
          role
        ),
        clients:client_id (
          id,
          client_code,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) {
      query = query.eq('action_type', type);
    }

    if (category) {
      query = query.eq('action_category', category);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Execute query
    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    // Format response
    const formattedActivities = activities?.map(activity => ({
      id: activity.id,
      user_id: activity.user_id,
      client_id: activity.client_id,
      action_type: activity.action_type,
      action_category: activity.action_category,
      description: activity.description,
      priority: activity.priority,
      status: activity.status,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
      metadata: activity.metadata,
      ip_address: activity.ip_address,
      user_agent: activity.user_agent,
      execution_time_ms: activity.execution_time_ms,
      error_message: activity.error_message,
      is_realtime_event: activity.is_realtime_event,
      broadcast_to_admin: activity.broadcast_to_admin,
      broadcast_to_user: activity.broadcast_to_user,
      user: activity.profiles ? {
        id: activity.profiles.id,
        first_name: activity.profiles.first_name,
        last_name: activity.profiles.last_name,
        email: activity.profiles.email,
        role: activity.profiles.role
      } : null,
      client: activity.clients ? {
        id: activity.clients.id,
        client_code: activity.clients.client_code,
        first_name: activity.clients.first_name,
        last_name: activity.clients.last_name,
        email: activity.clients.email
      } : null
    })) || [];

    // Get summary statistics
    const { data: stats } = await supabaseAdmin
      .from('activities')
      .select('action_category, priority, status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    const summary = {
      total: count || 0,
      last_24h: stats?.length || 0,
      by_category: {} as Record<string, number>,
      by_priority: {} as Record<string, number>,
      by_status: {} as Record<string, number>
    };

    stats?.forEach(activity => {
      // Count by category
      summary.by_category[activity.action_category] = (summary.by_category[activity.action_category] || 0) + 1;
      
      // Count by priority
      summary.by_priority[activity.priority] = (summary.by_priority[activity.priority] || 0) + 1;
      
      // Count by status
      summary.by_status[activity.status] = (summary.by_status[activity.status] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: formattedActivities,
      summary,
      pagination: {
        limit,
        offset,
        total: count || 0,
        has_more: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Activities API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const {
      user_id,
      client_id,
      action_type,
      action_category,
      description,
      metadata = {},
      priority = 'medium',
      status = 'completed',
      ip_address,
      user_agent,
      session_id,
      execution_time_ms,
      error_message,
      is_realtime_event = true,
      broadcast_to_admin = false,
      broadcast_to_user = true
    } = body;

    // Validate required fields
    if (!action_type || !action_category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: action_type, action_category, description' },
        { status: 400 }
      );
    }

    // Insert activity
    const { data: activity, error } = await supabaseAdmin
      .from('activities')
      .insert({
        user_id,
        client_id,
        action_type,
        action_category,
        description,
        metadata,
        priority,
        status,
        ip_address,
        user_agent,
        session_id,
        execution_time_ms,
        error_message,
        is_realtime_event,
        broadcast_to_admin,
        broadcast_to_user
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity logged successfully'
    });

  } catch (error) {
    console.error('Create activity API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    // Update activity
    const { data: activity, error } = await supabaseAdmin
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating activity:', error);
      return NextResponse.json(
        { error: 'Failed to update activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity updated successfully'
    });

  } catch (error) {
    console.error('Update activity API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    // Delete activity
    const { error } = await supabaseAdmin
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting activity:', error);
      return NextResponse.json(
        { error: 'Failed to delete activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 