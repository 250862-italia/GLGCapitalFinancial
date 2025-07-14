import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getMockData } from '@/lib/fallback-data';



export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      console.log('Supabase error, using fallback data:', error.message);
      return NextResponse.json(getMockData('settings'));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    console.log('Using fallback data due to exception');
    return NextResponse.json(getMockData('settings'));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .upsert(body, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 