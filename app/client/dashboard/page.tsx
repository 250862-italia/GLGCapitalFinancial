'use client';

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

export default function ClientDashboardPage() {
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
                <p className="text-2xl font-bold text-gray-900">€25,000</p>
                <p className="text-sm text-green-600">+12.5% questo mese</p>
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
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-blue-600">2 in crescita</p>
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
                <p className="text-2xl font-bold text-gray-900">Moderato</p>
                <p className="text-sm text-purple-600">Bilanciato</p>
              </div>
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
