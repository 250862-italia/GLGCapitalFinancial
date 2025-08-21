import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Mock data for packages (in produzione, questo verrebbe dal database)
const MOCK_PACKAGES = [
  {
    id: '1',
    name: 'Equity Pledge Premium',
    description: 'Pacchetto di investimento premium con rendimenti garantiti e rischio controllato',
    minAmount: 10000,
    maxAmount: 1000000,
    expectedReturn: 8.5,
    duration: 24,
    riskLevel: 'low',
    category: 'equity',
    status: 'active',
    features: [
      'Rendimento garantito del 8.5% annuo',
      'Durata flessibile 24 mesi',
      'Rischio controllato e monitorato',
      'Supporto dedicato 24/7',
      'Report mensili dettagliati'
    ]
  },
  {
    id: '2',
    name: 'Growth Portfolio Plus',
    description: 'Portafoglio di crescita con focus su tecnologie innovative e mercati emergenti',
    minAmount: 25000,
    maxAmount: 500000,
    expectedReturn: 12.0,
    duration: 36,
    riskLevel: 'medium',
    category: 'stocks',
    status: 'active',
    features: [
      'Rendimento atteso del 12% annuo',
      'Diversificazione su 15+ settori',
      'Gestione attiva del portafoglio',
      'Rebalancing trimestrale',
      'Analisi di mercato inclusa'
    ]
  },
  {
    id: '3',
    name: 'Real Estate Investment Trust',
    description: 'Investimento immobiliare con rendimenti stabili e beni tangibili',
    minAmount: 50000,
    maxAmount: 2000000,
    expectedReturn: 6.8,
    duration: 60,
    riskLevel: 'low',
    category: 'real-estate',
    status: 'active',
    features: [
      'Rendimento stabile del 6.8% annuo',
      'Investimento in immobili premium',
      'Gestione professionale inclusa',
      'Dividendi trimestrali',
      'Valore immobiliare sottostante'
    ]
  },
  {
    id: '4',
    name: 'High Yield Bonds Portfolio',
    description: 'Portafoglio obbligazionario ad alto rendimento per investitori esperti',
    minAmount: 15000,
    maxAmount: 300000,
    expectedReturn: 9.2,
    duration: 48,
    riskLevel: 'high',
    category: 'bonds',
    status: 'active',
    features: [
      'Rendimento elevato del 9.2% annuo',
      'Diversificazione su 20+ emittenti',
      'Gestione del rischio professionale',
      'Liquidità mensile',
      'Monitoraggio continuo del credito'
    ]
  },
  {
    id: '5',
    name: 'Sustainable Growth Fund',
    description: 'Fondo di investimento sostenibile con focus su ESG e impatto sociale',
    minAmount: 20000,
    maxAmount: 400000,
    expectedReturn: 10.5,
    duration: 30,
    riskLevel: 'medium',
    category: 'equity',
    status: 'active',
    features: [
      'Rendimento del 10.5% annuo',
      'Investimenti ESG certificati',
      'Impatto sociale misurabile',
      'Report di sostenibilità',
      'Transparenza completa'
    ]
  },
  {
    id: '6',
    name: 'Tech Innovation Fund',
    description: 'Fondo specializzato in tecnologie emergenti e startup innovative',
    minAmount: 30000,
    maxAmount: 600000,
    expectedReturn: 15.0,
    duration: 42,
    riskLevel: 'high',
    category: 'stocks',
    status: 'active',
    features: [
      'Rendimento potenziale del 15% annuo',
      'Accesso a startup pre-IPO',
      'Portfolio di 25+ aziende tech',
      'Due diligence approfondita',
      'Exit strategy pianificata'
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    // Filter only active packages
    const activePackages = MOCK_PACKAGES.filter(pkg => pkg.status === 'active');
    
    // Return packages with success response
    return NextResponse.json({
      success: true,
      packages: activePackages,
      total: activePackages.length,
      message: 'Pacchetti caricati con successo'
    });
    
  } catch (error) {
    console.error('Error fetching client packages:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore interno del server',
        message: 'Impossibile caricare i pacchetti'
      },
      { status: 500 }
    );
  }
}
