import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting client creation...');
    
    // Verifica autenticazione admin
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    const body = await request.json();

    // Genera un client_code univoco
    const clientCode = `CLI${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Crea il nuovo cliente nel database
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        ...body,
        client_code: clientCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase create error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create client in database',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Client created in database:', data.first_name, data.last_name);
    
    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      data: data
    });

  } catch (error) {
    console.error('❌ Error creating client:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 