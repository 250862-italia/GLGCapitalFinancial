'use client';

import { useState, useEffect } from 'react';
import AdminProtected from '@/components/AdminProtected';
import { useAdminAuth } from '@/lib/use-admin-auth';
import {
  CreditCard, Plus, Edit, Trash2, Search, Filter,
  TrendingUp, DollarSign, Calendar, RefreshCw
} from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string;
  min_investment: number;
  max_investment: number;
  expected_return: number;
  duration_months: number;
  risk_level: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  total_investors: number;
  total_amount: number;
}

export default function PackagesPage() {
  const { user, logout } = useAdminAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_investment: '',
    max_investment: '',
    expected_return: '',
    duration_months: '',
    risk_level: 'medium' as const,
    status: 'active' as const
  });

  // Carica i pacchetti
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('Token di autenticazione mancante');
        return;
      }

      const response = await fetch('/api/admin/packages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      } else {
        console.error('Errore nel caricamento pacchetti:', response.status);
      }
    } catch (error) {
      console.error('Errore di connessione:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtra i pacchetti
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || pkg.risk_level === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Gestisce l'aggiunta di un nuovo pacchetto
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('Token di autenticazione mancante');
        return;
      }

      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          min_investment: parseFloat(formData.min_investment),
          max_investment: parseFloat(formData.max_investment),
          expected_return: parseFloat(formData.expected_return),
          duration_months: parseInt(formData.duration_months)
        })
      });

      if (response.ok) {
        await fetchPackages();
        setShowAddModal(false);
        setFormData({
          name: '', description: '', min_investment: '', max_investment: '',
          expected_return: '', duration_months: '', risk_level: 'medium', status: 'active'
        });
      } else {
        const errorData = await response.json();
        console.error('Errore nella creazione pacchetto:', errorData);
      }
    } catch (error) {
      console.error('Errore di connessione:', error);
    }
  };

  // Gestisce l'aggiornamento di un pacchetto
  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('Token di autenticazione mancante');
        return;
      }

      const response = await fetch(`/api/admin/packages/${selectedPackage.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          min_investment: parseFloat(formData.min_investment),
          max_investment: parseFloat(formData.max_investment),
          expected_return: parseFloat(formData.expected_return),
          duration_months: parseInt(formData.duration_months)
        })
      });

      if (response.ok) {
        await fetchPackages();
        setShowEditModal(false);
        setSelectedPackage(null);
        setFormData({
          name: '', description: '', min_investment: '', max_investment: '',
          expected_return: '', duration_months: '', risk_level: 'medium', status: 'active'
        });
      } else {
        const errorData = await response.json();
        console.error('Errore nell\'aggiornamento del pacchetto:', errorData);
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del pacchetto:', error);
    }
  };

  // Gestisce l'eliminazione di un pacchetto
  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('Token di autenticazione mancante');
        return;
      }

      const response = await fetch(`/api/admin/packages/${selectedPackage.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedPackage.id })
      });

      if (response.ok) {
        await fetchPackages();
        setShowDeleteModal(false);
        setSelectedPackage(null);
      } else {
        const errorData = await response.json();
        console.error('Errore nell\'eliminazione del pacchetto:', errorData);
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione del pacchetto:', error);
    }
  };

  // Apre il modal di modifica
  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      min_investment: pkg.min_investment.toString(),
      max_investment: pkg.max_investment.toString(),
      expected_return: pkg.expected_return.toString(),
      duration_months: pkg.duration_months.toString(),
      risk_level: pkg.risk_level,
      status: pkg.status
    });
    setShowEditModal(true);
  };

  // Apre il modal di eliminazione
  const openDeleteModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Basso';
      case 'medium': return 'Medio';
      case 'high': return 'Alto';
      default: return risk;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'draft': return 'Bozza';
      default: return status;
    }
  };

  return (
    <AdminProtected>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestione Pacchetti</h1>
                <p className="text-gray-600">Gestisci i pacchetti di investimento GLG Capital Group</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuovo Pacchetto</span>
              </button>
            </div>
          </div>

          {/* Filtri e Ricerca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca pacchetti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Attivo</option>
                <option value="inactive">Inattivo</option>
                <option value="draft">Bozza</option>
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i rischi</option>
                <option value="low">Basso</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
              </select>
              <button
                onClick={fetchPackages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Aggiorna</span>
              </button>
            </div>
          </div>

          {/* Tabella Pacchetti */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Caricamento pacchetti...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pacchetto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Investimento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rendimento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durata
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rischio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statistiche
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPackages.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{pkg.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Min: €{pkg.min_investment.toLocaleString()}</div>
                            <div>Max: €{pkg.max_investment.toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {pkg.expected_return}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pkg.duration_months} mesi
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(pkg.risk_level)}`}>
                            {getRiskLevelText(pkg.risk_level)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                            {getStatusText(pkg.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{pkg.total_investors} investitori</div>
                          <div>€{pkg.total_amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(pkg)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(pkg)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Aggiungi Pacchetto */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nuovo Pacchetto</h3>
                <form onSubmit={handleAddPackage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Min Investimento (€)</label>
                      <input
                        type="number"
                        required
                        value={formData.min_investment}
                        onChange={(e) => setFormData({...formData, min_investment: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Investimento (€)</label>
                      <input
                        type="number"
                        required
                        value={formData.max_investment}
                        onChange={(e) => setFormData({...formData, max_investment: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rendimento (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.expected_return}
                        onChange={(e) => setFormData({...formData, expected_return: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Durata (mesi)</label>
                      <input
                        type="number"
                        required
                        value={formData.duration_months}
                        onChange={(e) => setFormData({...formData, duration_months: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Livello Rischio</label>
                      <select
                        value={formData.risk_level}
                        onChange={(e) => setFormData({...formData, risk_level: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Basso</option>
                        <option value="medium">Medio</option>
                        <option value="high">Alto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stato</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Attivo</option>
                        <option value="inactive">Inattivo</option>
                        <option value="draft">Bozza</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Salva
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Modifica Pacchetto */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifica Pacchetto</h3>
                <form onSubmit={handleUpdatePackage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Min Investimento (€)</label>
                      <input
                        type="number"
                        required
                        value={formData.min_investment}
                        onChange={(e) => setFormData({...formData, min_investment: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max Investimento (€)</label>
                      <input
                        type="number"
                        required
                        value={formData.max_investment}
                        onChange={(e) => setFormData({...formData, max_investment: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rendimento (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.expected_return}
                        onChange={(e) => setFormData({...formData, expected_return: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Durata (mesi)</label>
                      <input
                        type="number"
                        required
                        value={formData.duration_months}
                        onChange={(e) => setFormData({...formData, duration_months: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Livello Rischio</label>
                      <select
                        value={formData.risk_level}
                        onChange={(e) => setFormData({...formData, risk_level: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Basso</option>
                        <option value="medium">Medio</option>
                        <option value="high">Alto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stato</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Attivo</option>
                        <option value="inactive">Inattivo</option>
                        <option value="draft">Bozza</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Aggiorna
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Annulla
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Elimina Pacchetto */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Conferma Eliminazione</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Sei sicuro di voler eliminare il pacchetto <strong>{selectedPackage?.name}</strong>?
                  Questa azione non può essere annullata.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeletePackage}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Elimina
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtected>
  );
} 