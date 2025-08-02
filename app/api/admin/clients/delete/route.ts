import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔄 Starting client deletion...');
    
    // Verifica autenticazione admin
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 });
    }

    // Elimina il cliente dal database
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete client from database',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Client deleted from database:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting client:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 