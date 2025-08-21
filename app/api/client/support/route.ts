import { NextRequest, NextResponse } from 'next/server';

interface SupportTicket {
  id: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  client_email: string;
  client_name: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  response?: string;
}

// Simula un database di ticket di supporto (in produzione sarebbe un database reale)
let supportTickets: SupportTicket[] = [
  {
    id: '1',
    category: 'investment',
    priority: 'medium',
    subject: 'Richiesta informazioni su pacchetti di investimento',
    message: 'Buongiorno, vorrei sapere di più sui pacchetti di investimento disponibili e sui rendimenti attesi.',
    client_email: 'mario.rossi@example.com',
    client_name: 'Mario Rossi',
    status: 'resolved',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-16T14:30:00Z',
    assigned_to: 'admin@glgcapital.com',
    response: 'Gentile Mario, abbiamo inviato via email tutte le informazioni richieste sui nostri pacchetti di investimento. Se ha bisogno di ulteriori chiarimenti, non esiti a contattarci.'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('clientEmail');
    const clientId = searchParams.get('clientId');

    if (!clientEmail && !clientId) {
      return NextResponse.json(
        { success: false, error: 'Email o ID cliente richiesti' },
        { status: 400 }
      );
    }

    // Filtra i ticket per il cliente specifico
    const clientTickets = supportTickets.filter(ticket => 
      ticket.client_email === clientEmail || ticket.client_email.includes(clientId || '')
    );

    // Ordina per data (più recenti prima)
    clientTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      message: 'Ticket di supporto del cliente recuperati con successo',
      data: {
        tickets: clientTickets,
        total: clientTickets.length,
        open: clientTickets.filter(t => t.status === 'open').length,
        resolved: clientTickets.filter(t => t.status === 'resolved').length
      }
    });

  } catch (error) {
    console.error('Errore nel recupero dei ticket di supporto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        message: 'Impossibile recuperare i ticket di supporto'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticketData = await request.json();
    
    // Validazione dei dati richiesti
    const requiredFields = ['category', 'priority', 'subject', 'message', 'client_email', 'client_name'];
    const missingFields = requiredFields.filter(field => !ticketData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Campi mancanti: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Crea il nuovo ticket
    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      category: ticketData.category,
      priority: ticketData.priority,
      subject: ticketData.subject,
      message: ticketData.message,
      client_email: ticketData.client_email,
      client_name: ticketData.client_name,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Aggiungi il ticket all'array
    supportTickets.unshift(newTicket);
    
    // Log per debugging
    console.log('🔔 Nuovo ticket di supporto creato:', {
      id: newTicket.id,
      subject: newTicket.subject,
      client: newTicket.client_name,
      priority: newTicket.priority,
      timestamp: newTicket.created_at
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket di supporto creato con successo! Il nostro team ti risponderà entro 24 ore.',
      data: newTicket
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione del ticket di supporto:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        message: 'Impossibile creare il ticket di supporto. Riprova più tardi.'
      },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un ticket (es. per risposta admin)
export async function PUT(request: NextRequest) {
  try {
    const { id, status, response, assigned_to } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID ticket richiesto' 
        },
        { status: 400 }
      );
    }

    // Trova e aggiorna il ticket
    const ticketIndex = supportTickets.findIndex(t => t.id === id);
    if (ticketIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ticket non trovato' 
        },
        { status: 404 }
      );
    }

    // Aggiorna i campi forniti
    if (status) supportTickets[ticketIndex].status = status;
    if (response) supportTickets[ticketIndex].response = response;
    if (assigned_to) supportTickets[ticketIndex].assigned_to = assigned_to;
    
    supportTickets[ticketIndex].updated_at = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Ticket aggiornato con successo',
      data: supportTickets[ticketIndex]
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento del ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        message: 'Impossibile aggiornare il ticket'
      },
      { status: 500 }
    );
  }
}
