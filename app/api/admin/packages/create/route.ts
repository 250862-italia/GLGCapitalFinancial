import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting package creation...');
    
    // Verifica autenticazione admin
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    const body = await request.json();

    // Crea il nuovo pacchetto nel database
    const { data, error } = await supabaseAdmin
      .from('packages')
      .insert({
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase create error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create package in database',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Package created in database:', data.name);
    
    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
      data: data
    });

  } catch (error) {
    console.error('❌ Error creating package:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 