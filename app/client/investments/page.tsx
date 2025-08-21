'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GLGLogo from '@/components/GLGLogo';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Shield,
  Star,
  Eye,
  Plus,
  Filter,
  Search
} from 'lucide-react';

interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  expectedReturn: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  status: 'active' | 'inactive';
  features: string[];
}

export default function ClientInvestmentsPage() {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('clientToken');
    if (!token) {
      router.push('/client/login');
      return;
    }

    fetchPackages();
  }, [router]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/packages');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPackages(data.packages || []);
        } else {
          setError(data.message || 'Errore nel caricamento dei pacchetti');
        }
      } else {
        setError('Errore nel caricamento dei pacchetti');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || pkg.riskLevel === selectedRisk;
    
    return matchesSearch && matchesCategory && matchesRisk;
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
      default: return 'Sconosciuto';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
                <p className="text-sm text-gray-600">Pacchetti di Investimento</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/client/dashboard"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pacchetti di Investimento Disponibili
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scopri i nostri pacchetti di investimento progettati per massimizzare i tuoi rendimenti
            con diversi livelli di rischio e durata
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca pacchetti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutte le Categorie</option>
              <option value="equity">Equity Pledge</option>
              <option value="bonds">Obbligazioni</option>
              <option value="stocks">Azioni</option>
              <option value="real-estate">Real Estate</option>
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tutti i Rischi</option>
              <option value="low">Basso Rischio</option>
              <option value="medium">Medio Rischio</option>
              <option value="high">Alto Rischio</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedRisk('all');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset Filtri
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun pacchetto trovato
            </h3>
            <p className="text-gray-500">
              Prova a modificare i filtri di ricerca o riprova più tardi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                {/* Package Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(pkg.riskLevel)}`}>
                      {getRiskLabel(pkg.riskLevel)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{pkg.description}</p>
                </div>

                {/* Package Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {pkg.expectedReturn}%
                      </div>
                      <div className="text-sm text-gray-500">Rendimento Atteso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {pkg.duration} mesi
                      </div>
                      <div className="text-sm text-gray-500">Durata</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Investimento Minimo:</span>
                      <span className="font-medium">€{pkg.minAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Investimento Massimo:</span>
                      <span className="font-medium">€{pkg.maxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Categoria:</span>
                      <span className="font-medium capitalize">{pkg.category}</span>
                    </div>
                  </div>

                  {/* Features */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Caratteristiche:</h4>
                      <div className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-400 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link 
                      href={`/client/investments/${pkg.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Investi Ora
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link
            href="/client/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
