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
      status: 'pending', // Status iniziale
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + (investmentData.duration_months || 12) * 30 * 24 * 60 * 60 * 1000).toISOString(), // +X mesi
      expected_return: investmentData.expected_return || 0,
      actual_return: 0,
      total_returns: 0,
      daily_returns: 0,
      monthly_returns: 0,
      fees_paid: 0,
      payment_method: investmentData.payment_method || 'bank_transfer',
      notes: investmentData.notes || `Richiesta di investimento da ${investmentData.client_name}`
    };

    // Crea l'investimento nel database
    const newInvestment = await createInvestment(newInvestmentData);

    // Crea una notifica per l'admin
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'investment',
          title: 'Nuova Richiesta di Investimento',
          message: `${investmentData.client_name} ha richiesto di investire €${investmentData.amount} nel pacchetto ${investmentData.package_id}`,
          client_name: investmentData.client_name,
          client_email: investmentData.client_email,
          amount: parseFloat(investmentData.amount),
          package_name: investmentData.package_id,
          priority: 'high'
        })
      });
    } catch (notificationError) {
      console.warn('⚠️ Impossibile creare notifica admin:', notificationError);
    }

    // Log per debugging
    console.log('✅ Nuova richiesta di investimento creata:', {
      id: newInvestment.id,
      client: investmentData.client_name,
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
