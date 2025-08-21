'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GLGLogo from '@/components/GLGLogo';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Shield,
  ArrowRight,
  Settings
} from 'lucide-react';

interface DashboardStats {
  totalPortfolio: number;
  monthlyReturn: number;
  activeInvestments: number;
  growingInvestments: number;
  riskLevel: string;
  riskDescription: string;
  totalInvestments: number;
  totalReturns: number;
}

export default function ClientDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPortfolio: 0,
    monthlyReturn: 0,
    activeInvestments: 0,
    growingInvestments: 0,
    riskLevel: 'Moderato',
    riskDescription: 'Bilanciato',
    totalInvestments: 0,
    totalReturns: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Recupera i dati del cliente dal localStorage
      const clientUser = localStorage.getItem('clientUser');
      if (!clientUser) {
        setError('Utente non autenticato');
        setLoading(false);
        return;
      }

      const user = JSON.parse(clientUser);
      
      // Recupera gli investimenti del cliente
      const investmentsResponse = await fetch(`/api/client/investments?clientEmail=${user.email}`);
      if (investmentsResponse.ok) {
        const investmentsData = await investmentsResponse.json();
        const investments = investmentsData.data.investments || [];
        
        // Calcola le statistiche
        const totalPortfolio = investments.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
        const activeInvestments = investments.filter((inv: any) => inv.status === 'active' || inv.status === 'pending').length;
        const growingInvestments = investments.filter((inv: any) => inv.status === 'active').length;
        
        // Calcola il rendimento mensile (simulato per ora)
        const monthlyReturn = totalPortfolio > 0 ? 8.5 : 0; // 8.5% mensile simulato
        
        // Determina il livello di rischio basato sugli investimenti
        let riskLevel = 'Basso';
        let riskDescription = 'Conservativo';
        
        if (totalPortfolio > 50000) {
          riskLevel = 'Alto';
          riskDescription = 'Aggressivo';
        } else if (totalPortfolio > 20000) {
          riskLevel = 'Moderato';
          riskDescription = 'Bilanciato';
        }
        
        setStats({
          totalPortfolio,
          monthlyReturn,
          activeInvestments,
          growingInvestments,
          riskLevel,
          riskDescription,
          totalInvestments: investments.length,
          totalReturns: totalPortfolio * (monthlyReturn / 100)
        });
      } else {
        setError('Errore nel caricamento degli investimenti');
      }
    } catch (error) {
      console.error('Errore nel fetch delle statistiche:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Errore nel caricamento</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GLGLogo size="sm" showText={false} />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">GLG Capital Group</h1>
                <p className="text-sm text-gray-600">Client Dashboard</p>
              </div>
            </div>
                                    <div className="flex items-center space-x-4">
                          <Link
                            href="/client/settings"
                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Settings className="h-5 w-5 mr-2" />
                            Impostazioni
                          </Link>
                          <Link
                            href="/client/login"
                            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <LogOut className="h-5 w-5 mr-2" />
                            Logout
                          </Link>
                        </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-3xl font-bold text-gray-900">Benvenuto nella tua Dashboard</h2>
              <p className="text-lg text-gray-600">Gestisci i tuoi investimenti e monitora il tuo portafoglio</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Portafoglio Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{stats.totalPortfolio.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{stats.monthlyReturn.toFixed(1)}% questo mese
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Investimenti Attivi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInvestments}</p>
                <p className="text-sm text-blue-600">{stats.growingInvestments} in crescita</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rischio Medio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.riskLevel}</p>
                <p className="text-sm text-purple-600">{stats.riskDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Statistiche Dettagliate</h3>
            <button
              onClick={fetchDashboardStats}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Aggiorna Dati
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalInvestments}</div>
              <div className="text-sm text-gray-600">Totale Investimenti</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">€{stats.totalReturns.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Rendimenti Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.activeInvestments}</div>
              <div className="text-sm text-gray-600">Investimenti Attivi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.growingInvestments}</div>
              <div className="text-sm text-gray-600">In Crescita</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/client/investments" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Nuovo Investimento</h3>
                <p className="text-gray-600">Scopri nuove opportunità</p>
              </div>
            </div>
            <div className="flex items-center text-blue-600">
              <span className="text-sm font-medium">Inizia ora</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Link>

          <Link href="/client/profile" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Profilo Personale</h3>
                <p className="text-gray-600">Aggiorna le tue informazioni</p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <span className="text-sm font-medium">Gestisci profilo</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Link>

          <Link href="/client/documents" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Documenti</h3>
                <p className="text-gray-600">Gestisci i tuoi documenti</p>
              </div>
            </div>
            <div className="flex items-center text-orange-600">
              <span className="text-sm font-medium">Visualizza</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Link>

          <Link href="/client/transactions" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Transazioni</h3>
                <p className="text-gray-600">Storico completo</p>
              </div>
            </div>
            <div className="flex items-center text-purple-600">
              <span className="text-sm font-medium">Visualizza</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Link>

          <Link href="/client/support" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Mail className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Supporto</h3>
                <p className="text-gray-600">Contatta il team</p>
              </div>
            </div>
            <div className="flex items-center text-red-600">
              <span className="text-sm font-medium">Richiedi aiuto</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Link>

          <Link href="/client/settings" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Impostazioni</h3>
                <p className="text-gray-600">Personalizza la tua esperienza</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-sm font-medium">Configura</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Nuovo investimento completato</p>
                <p className="text-xs text-gray-500">Pacchetto Premium - €5,000</p>
              </div>
              <span className="text-xs text-gray-400">2 ore fa</span>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Rendimento mensile ricevuto</p>
                <p className="text-xs text-gray-500">€125 accreditati sul conto</p>
              </div>
              <span className="text-xs text-gray-400">1 giorno fa</span>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Profilo di rischio aggiornato</p>
                <p className="text-xs text-gray-500">Nuova valutazione completata</p>
              </div>
              <span className="text-xs text-gray-400">3 giorni fa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
