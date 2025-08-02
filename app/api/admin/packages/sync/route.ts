import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { syncPackages } from '@/lib/packages-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting packages sync from Supabase...');
    
    // Verifica autenticazione admin
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    // Carica pacchetti da Supabase
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase packages error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch packages from database',
        details: error.message
      }, { status: 500 });
    }

    // Sincronizza con storage locale
    if (packages && packages.length > 0) {
      syncPackages(packages);
      console.log('✅ Packages synced from Supabase:', packages.length);
      
      return NextResponse.json({
        success: true,
        message: `Synced ${packages.length} packages from database`,
        data: packages
      });
    } else {
      console.log('⚠️ No packages found in database, using local data');
      return NextResponse.json({
        success: true,
        message: 'No packages in database, using local storage',
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Error syncing packages:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 