import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Execute the reload_schema_cache function
    const { data, error } = await supabaseAdmin!.rpc('reload_schema_cache');
    
    if (error) {
      console.error('Schema cache reload error:', error);
      return NextResponse.json(
        { error: 'Failed to reload schema cache', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Schema cache reloaded successfully'
    })

  } catch (error) {
    console.error('Schema reload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 