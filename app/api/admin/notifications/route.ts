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
      
      // Se la tabella non esiste, restituisci notifiche temporanee
      if (error.code === '42P01') { // Tabella non esistente
        console.log('⚠️ Tabella admin_notifications non esiste, usando notifiche temporanee');
        
        const tempNotifications = [
          {
            id: 'temp-1',
            type: 'package_update',
            title: 'Pacchetto Aggiornato',
            message: 'Il pacchetto "Premium Plus" è stato aggiornato dall\'amministratore',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 ora fa
            read: false,
            data: {
              package_id: '1',
              package_name: 'Premium Plus',
              changes: { expected_return: 12.5, risk_level: 'medium' }
            }
          },
          {
            id: 'temp-2',
            type: 'investment_request',
            title: 'Nuova Richiesta di Investimento',
            message: 'Mario Rossi ha richiesto di investire €25,000 nel Pacchetto Premium',
            timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min fa
            read: false,
            data: {
              client_name: 'Mario Rossi',
              client_email: 'mario.rossi@example.com',
              amount: 25000,
              package_name: 'Pacchetto Premium'
            }
          }
        ];
        
        return NextResponse.json({
          success: true,
          notifications: tempNotifications,
          total: tempNotifications.length,
          message: 'Notifiche temporanee (tabella non ancora creata)'
        });
      }
      
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
      
      // Se la tabella non esiste, logga l'errore ma non fallisce
      if (error.code === '42P01') { // Tabella non esistente
        console.log('⚠️ Tabella admin_notifications non esiste, notifica non salvata');
        console.log('📝 Notifica che sarebbe stata creata:', {
          type: body.type,
          title: body.title,
          message: body.message,
          data: body.data
        });
        
        // Restituisci successo per non bloccare il flusso principale
        return NextResponse.json({
          success: true,
          message: 'Notifica loggata (tabella non ancora creata)',
          notification: {
            id: 'temp-' + Date.now(),
            type: body.type,
            title: body.title,
            message: body.message,
            timestamp: new Date().toISOString(),
            read: false,
            data: body.data || null
          }
        });
      }
      
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
