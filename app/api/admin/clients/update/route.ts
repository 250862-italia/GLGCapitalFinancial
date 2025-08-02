import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Starting client update...');
    
    // Verifica autenticazione admin
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 });
    }

    // Aggiorna il cliente nel database
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update client in database',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Client updated in database:', data.first_name, data.last_name);
    
    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      data: data
    });

  } catch (error) {
    console.error('❌ Error updating client:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 