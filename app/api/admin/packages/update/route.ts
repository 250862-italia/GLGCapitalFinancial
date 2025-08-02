import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Starting package update...');
    
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
        error: 'Package ID is required'
      }, { status: 400 });
    }

    // Aggiorna il pacchetto nel database
    const { data, error } = await supabaseAdmin
      .from('packages')
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
        error: 'Failed to update package in database',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Package updated in database:', data.name);
    
    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
      data: data
    });

  } catch (error) {
    console.error('❌ Error updating package:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 