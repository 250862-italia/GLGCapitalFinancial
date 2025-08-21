import { NextRequest, NextResponse } from 'next/server';
import { getPackages } from '@/lib/data-manager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Recupera i pacchetti dal database reale
    const packages = await getPackages();
    
    // Filtra solo i pacchetti attivi
    const activePackages = packages.filter(pkg => pkg.status === 'active');
    
    // Mappa i dati per mantenere la compatibilità con il frontend client
    const mappedPackages = activePackages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      minAmount: pkg.min_investment,
      maxAmount: pkg.max_investment || 0,
      expectedReturn: pkg.expected_return,
      duration: pkg.duration_months,
      riskLevel: pkg.risk_level,
      category: 'investment', // Default category
      status: pkg.status,
      features: [
        `Rendimento del ${pkg.expected_return}% annuo`,
        `Durata ${pkg.duration_months} mesi`,
        `Investimento minimo €${pkg.min_investment.toLocaleString()}`,
        pkg.max_investment ? `Investimento massimo €${pkg.max_investment.toLocaleString()}` : 'Investimento massimo illimitato',
        `Rischio ${pkg.risk_level === 'low' ? 'basso' : pkg.risk_level === 'medium' ? 'medio' : 'alto'}`
      ]
    }));
    
    // Return packages with success response
    return NextResponse.json({
      success: true,
      packages: mappedPackages,
      total: mappedPackages.length,
      message: 'Pacchetti caricati con successo dal database'
    });
    
  } catch (error) {
    console.error('Error fetching client packages from database:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore di connessione al database',
        message: 'Impossibile caricare i pacchetti dal database'
      },
      { status: 500 }
    );
  }
}
