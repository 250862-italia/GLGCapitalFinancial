import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get all informational requests
    const { data, error } = await supabase
      .from('informational_requests')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching informational requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Error fetching informational requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, status, processedBy } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' },
        { status: 400 }
      );
    }

    const updates: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'PROCESSED' || status === 'COMPLETED') {
      updates.processedAt = new Date().toISOString();
      updates.processedBy = processedBy;
    }

    const { data, error } = await supabase
      .from('informational_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating informational request:', error);
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Request updated successfully'
    });

  } catch (error) {
    console.error('Error updating informational request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 