import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    const { user_id } = params;
    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    // Fetch notifications from Supabase
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add other handlers (POST, PUT, DELETE) as needed, using only Supabase 