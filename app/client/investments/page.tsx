'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, TrendingUp, DollarSign, Calendar, Clock } from 'lucide-react';
import { usePackagesUpdates } from '@/lib/use-packages-updates';

export default function ClientInvestmentsPage() {
  const { packages, loading, error, lastUpdate, refreshPackages } = usePackagesUpdates();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filtra i pacchetti
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || pkg.riskLevel === riskFilter;
    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
    return matchesSearch && matchesRisk && matchesCategory;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Basso';
      case 'medium': return 'Medio';
      case 'high': return 'Alto';
      default: return risk;
    }
  };

  if (loading && packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Caricamento pacchetti di investimento...</p>
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
            onClick={refreshPackages}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pacchetti di Investimento</h1>
          <p className="text-gray-600">Scegli il pacchetto che meglio si adatta ai tuoi obiettivi finanziari</p>
          
          {/* Ultimo aggiornamento */}
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}</span>
            <button 
              onClick={refreshPackages}
              className="ml-4 text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Aggiorna ora
            </button>
          </div>
        </div>

        {/* Filtri e Ricerca */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ricerca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca pacchetti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Rischio */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti i rischi</option>
              <option value="low">Rischio basso</option>
              <option value="medium">Rischio medio</option>
              <option value="high">Rischio alto</option>
            </select>

            {/* Filtro Categoria */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutte le categorie</option>
              <option value="investment">Investimento</option>
              <option value="equity">Equity</option>
              <option value="bonds">Obbligazioni</option>
              <option value="real-estate">Immobiliare</option>
            </select>
          </div>
        </div>

        {/* Risultati */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredPackages.length} pacchetti disponibili
            </h2>
            <div className="text-sm text-gray-500">
              {packages.length} totali
            </div>
          </div>
        </div>

        {/* Grid Pacchetti */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun pacchetto trovato</h3>
            <p className="text-gray-600">Prova a modificare i filtri di ricerca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header Card */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(pkg.riskLevel)}`}>
                      {getRiskLabel(pkg.riskLevel)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pkg.description}</p>
                  
                  {/* Statistiche */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Rendimento</p>
                        <p className="font-semibold text-green-600">{pkg.expectedReturn}%</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Durata</p>
                        <p className="font-semibold text-blue-600">{pkg.duration} mesi</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Range Investimento */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Range di investimento</p>
                    <p className="text-sm font-medium text-gray-900">
                      €{pkg.minAmount.toLocaleString()} - €{pkg.maxAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Caratteristiche principali</p>
                    <ul className="space-y-1">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Footer Card */}
                <div className="bg-gray-50 px-6 py-4">
                  <Link 
                    href={`/client/investments/${pkg.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Investi Ora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
