import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { syncClients } from '@/lib/clients-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting clients sync from Supabase...');
    
    // Verifica autenticazione admin
    const adminToken = request.headers.get('x-admin-token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 });
    }

    // Carica clienti da Supabase
    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase clients error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch clients from database',
        details: error.message
      }, { status: 500 });
    }

    // Sincronizza con storage locale
    if (clients && clients.length > 0) {
      syncClients(clients);
      console.log('✅ Clients synced from Supabase:', clients.length);
      
      return NextResponse.json({
        success: true,
        message: `Synced ${clients.length} clients from database`,
        data: clients
      });
    } else {
      console.log('⚠️ No clients found in database, using local data');
      return NextResponse.json({
        success: true,
        message: 'No clients in database, using local storage',
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Error syncing clients:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 