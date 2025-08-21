import { NextRequest, NextResponse } from 'next/server';

interface Notification {
  id: string;
  type: 'investment' | 'document' | 'support' | 'system';
  title: string;
  message: string;
  client_name?: string;
  client_email?: string;
  amount?: number;
  package_name?: string;
  status: 'unread' | 'read';
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

// Simula un database di notifiche (in produzione sarebbe un database reale)
let notifications: Notification[] = [
  {
    id: '1',
    type: 'investment',
    title: 'Nuova Richiesta di Investimento',
    message: 'Mario Rossi ha richiesto di investire €5,000 nel Pacchetto Premium',
    client_name: 'Mario Rossi',
    client_email: 'mario.rossi@example.com',
    amount: 5000,
    package_name: 'Pacchetto Premium',
    status: 'unread',
    created_at: new Date().toISOString(),
    priority: 'high'
  }
];

// GET - Recupera tutte le notifiche
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'all', 'unread', 'read'
    const type = searchParams.get('type'); // 'all', 'investment', 'document', etc.
    
    let filteredNotifications = [...notifications];
    
    // Filtra per status
    if (status && status !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.status === status);
    }
    
    // Filtra per tipo
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    // Ordina per data (più recenti prima)
    filteredNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return NextResponse.json({
      success: true,
      message: 'Notifiche recuperate con successo',
      data: {
        notifications: filteredNotifications,
        total: filteredNotifications.length,
        unread: notifications.filter(n => n.status === 'unread').length
      }
    });

  } catch (error) {
    console.error('Errore nel recupero delle notifiche:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        message: 'Impossibile recuperare le notifiche'
      },
      { status: 500 }
    );
  }
}

// POST - Crea una nuova notifica
export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();
    
    // Validazione dei dati richiesti
    if (!notificationData.type || !notificationData.title || !notificationData.message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tipo, titolo e messaggio sono richiesti' 
        },
        { status: 400 }
      );
    }

    // Crea la nuova notifica
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      client_name: notificationData.client_name,
      client_email: notificationData.client_email,
      amount: notificationData.amount,
      package_name: notificationData.package_name,
      status: 'unread',
      created_at: new Date().toISOString(),
      priority: notificationData.priority || 'medium'
    };

    // Aggiungi la notifica all'array
    notifications.unshift(newNotification);
    
    // Log per debugging
    console.log('🔔 Nuova notifica di richiesta di investimento creata:', {
      id: newNotification.id,
      type: newNotification.type,
      title: newNotification.title,
      client: newNotification.client_name,
      timestamp: newNotification.created_at
    });

    return NextResponse.json({
      success: true,
      message: 'Notifica creata con successo',
      data: newNotification
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione della notifica:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        message: 'Impossibile creare la notifica'
      },
      { status: 500 }
    );
  }
}

// PUT - Marca una notifica come letta
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID notifica richiesto' 
        },
        { status: 400 }
      );
    }

    // Trova e aggiorna la notifica
    const notificationIndex = notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notifica non trovata' 
        },
        { status: 404 }
      );
    }

    // Aggiorna lo status
    if (status) {
      notifications[notificationIndex].status = status;
    }

    return NextResponse.json({
      success: true,
      message: 'Notifica aggiornata con successo',
      data: notifications[notificationIndex]
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento della notifica:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        message: 'Impossibile aggiornare la notifica'
      },
      { status: 500 }
    );
  }
}
