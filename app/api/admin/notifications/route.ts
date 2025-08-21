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
    // In produzione, dovresti verificare il JWT token
    return token.length > 10;
  } catch (error) {
    return false;
  }
}

// GET - Recupera tutte le notifiche admin
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Recupera le notifiche dal database
    const { data: notifications, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('❌ Errore nel recupero notifiche:', error);
      return NextResponse.json(
        { success: false, error: 'Errore nel recupero delle notifiche' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      total: notifications?.length || 0
    });

  } catch (error) {
    console.error('❌ Errore generale notifiche:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST - Crea una nuova notifica
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validazione dati
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Dati mancanti per la notifica' },
        { status: 400 }
      );
    }

    // Crea la notifica nel database
    const { data: notification, error } = await supabase
      .from('admin_notifications')
      .insert([{
        type: body.type,
        title: body.title,
        message: body.message,
        timestamp: new Date().toISOString(),
        read: false,
        data: body.data || null
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Errore nella creazione notifica:', error);
      return NextResponse.json(
        { success: false, error: 'Errore nella creazione della notifica' },
        { status: 500 }
      );
    }

    console.log('✅ Notifica creata con successo:', notification);
    return NextResponse.json({
      success: true,
      message: 'Notifica creata con successo',
      notification
    });

  } catch (error) {
    console.error('❌ Errore generale creazione notifica:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
