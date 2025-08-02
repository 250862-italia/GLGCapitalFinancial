import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🔄 Starting package deletion...');
    
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
        error: 'Package ID is required'
      }, { status: 400 });
    }

    // Elimina il pacchetto dal database
    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete package from database',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Package deleted from database:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting package:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 