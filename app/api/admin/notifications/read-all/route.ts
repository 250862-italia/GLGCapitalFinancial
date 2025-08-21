import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Funzione per verificare il token admin
function verifyAdminToken(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.substring(7);
    return token.length > 10;
  } catch (error) {
    return false;
  }
}

// PUT - Marca tutte le notifiche come lette
export async function PUT(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Aggiorna tutte le notifiche non lette nel database
    const { data: notifications, error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('read', false)
      .select();

    if (error) {
      console.error('❌ Errore nell\'aggiornamento notifiche:', error);
      return NextResponse.json(
        { success: false, error: 'Errore nell\'aggiornamento delle notifiche' },
        { status: 500 }
      );
    }

    console.log('✅ Tutte le notifiche marcate come lette');
    return NextResponse.json({
      success: true,
      message: 'Tutte le notifiche marcate come lette',
      updatedCount: notifications?.length || 0
    });

  } catch (error) {
    console.error('❌ Errore generale marcatura notifiche:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
