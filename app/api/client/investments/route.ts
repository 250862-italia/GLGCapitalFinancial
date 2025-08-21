import { NextRequest, NextResponse } from 'next/server';
import { createInvestment, getInvestments } from '@/lib/data-manager';

// GET - Recupera gli investimenti del cliente
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

    // Recupera tutti gli investimenti e filtra per cliente
    const allInvestments = await getInvestments();
    const clientInvestments = allInvestments.filter(inv => 
      inv.client_email === clientEmail || inv.client_id === clientId
    );

    return NextResponse.json({
      success: true,
      message: 'Investimenti del cliente recuperati con successo',
      data: {
        investments: clientInvestments,
        total: clientInvestments.length
      }
    });

  } catch (error) {
    console.error('Errore nel recupero degli investimenti del cliente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile recuperare gli investimenti'
      },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo investimento
export async function POST(request: NextRequest) {
  try {
    const investmentData = await request.json();
    
    // Validazione dei dati richiesti
    const requiredFields = ['client_id', 'package_id', 'amount', 'client_email', 'client_name'];
    const missingFields = requiredFields.filter(field => !investmentData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Campi mancanti: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Prepara i dati per la creazione
    const newInvestmentData = {
      client_id: investmentData.client_id,
      package_id: investmentData.package_id,
      amount: parseFloat(investmentData.amount),
      client_email: investmentData.client_email,
      client_name: investmentData.client_name,
      status: 'pending', // Status iniziale
      investment_date: new Date().toISOString(),
      notes: investmentData.notes || `Investimento creato da ${investmentData.client_name}`,
      payment_method: investmentData.payment_method || 'bank_transfer',
      expected_return: investmentData.expected_return || 0,
      duration_months: investmentData.duration_months || 12
    };

    // Crea l'investimento nel database
    const newInvestment = await createInvestment(newInvestmentData);

    // Log per debugging
    console.log('✅ Nuova richiesta di investimento creata:', {
      id: newInvestment.id,
      client: newInvestment.client_name,
      amount: newInvestment.amount,
      package: newInvestment.package_id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Richiesta di investimento inviata con successo! L\'admin riceverà una notifica.',
      data: newInvestment
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione dell\'investimento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile creare l\'investimento. Riprova più tardi.'
      },
      { status: 500 }
    );
  }
}
