import { NextRequest, NextResponse } from 'next/server';
import { getInvestments } from '@/lib/data-manager';

interface Transaction {
  id: string;
  type: 'investment' | 'return' | 'withdrawal' | 'deposit' | 'fee';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: string;
  date: string;
  reference: string;
  fees?: number;
  net_amount?: number;
}

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

    // Converte gli investimenti in transazioni
    const transactions: Transaction[] = clientInvestments.map((inv, index) => {
      const baseTransaction: Transaction = {
        id: `inv-${inv.id}`,
        type: 'investment',
        amount: inv.amount,
        currency: 'EUR',
        status: inv.status === 'active' ? 'completed' : inv.status === 'pending' ? 'pending' : 'completed',
        description: `Investimento in Pacchetto ${inv.package_id}`,
        date: inv.start_date,
        reference: `INV-${String(index + 1).padStart(3, '0')}`,
        fees: 0,
        net_amount: inv.amount
      };

      return baseTransaction;
    });

    // Aggiunge transazioni simulate per rendimenti e commissioni
    if (transactions.length > 0) {
      // Rendimento mensile simulato
      const totalInvestment = transactions.reduce((sum, t) => sum + t.amount, 0);
      if (totalInvestment > 0) {
        const monthlyReturn = totalInvestment * 0.085; // 8.5% mensile
        transactions.push({
          id: 'ret-001',
          type: 'return',
          amount: monthlyReturn,
          currency: 'EUR',
          status: 'completed',
          description: 'Rendimento mensile investimenti',
          date: new Date().toISOString().split('T')[0],
          reference: 'RET-001'
        });

        // Commissione di gestione
        const managementFee = totalInvestment * 0.01; // 1% mensile
        transactions.push({
          id: 'fee-001',
          type: 'fee',
          amount: managementFee,
          currency: 'EUR',
          status: 'completed',
          description: 'Commissione di gestione mensile',
          date: new Date().toISOString().split('T')[0],
          reference: 'FEE-001'
        });
      }
    }

    // Ordina per data (più recenti prima)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      message: 'Transazioni del cliente recuperate con successo',
      data: {
        transactions,
        total: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0)
      }
    });

  } catch (error) {
    console.error('Errore nel recupero delle transazioni del cliente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile recuperare le transazioni'
      },
      { status: 500 }
    );
  }
}
