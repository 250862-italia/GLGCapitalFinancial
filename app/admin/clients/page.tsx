'use client';

import { useState, useEffect } from 'react';
import AdminProtected from '@/components/AdminProtected';
import { useAdminAuth } from '@/lib/use-admin-auth';
import {
  Users2, Plus, Edit, Trash2, Search, Filter,
  ArrowUpDown, Eye, MoreHorizontal, RefreshCw, User, Building, MapPin, Shield
} from 'lucide-react';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  risk_profile: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  total_investments: number;
}

export default function ClientsPage() {
  const { user, logout } = useAdminAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    risk_profile: 'moderate' as const,
    status: 'active' as const
  });

  // Carica i clienti
  useEffect(() => {
    fetchClients();
    
    // Aggiorna i clienti ogni 30 secondi per sincronizzazione in tempo reale
    const interval = setInterval(fetchClients, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        console.error('Errore nel caricamento clienti');
      }
    } catch (error) {
      console.error('Errore di connessione:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtra i clienti
  const filteredClients = clients.filter(client => {
    const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Gestisce l'aggiunta di un nuovo cliente
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchClients();
        setShowAddModal(false);
        setFormData({
          first_name: '', last_name: '', email: '', phone: '', company: '', position: '',
          address: '', city: '', country: '', postal_code: '', risk_profile: 'moderate', status: 'active'
        });
      }
    } catch (error) {
      console.error('Errore nell\'aggiunta del cliente:', error);
    }
  };

  // Gestisce l'aggiornamento di un cliente
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchClients();
        setShowEditModal(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del cliente:', error);
    }
  };

  // Gestisce l'eliminazione di un cliente
  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchClients();
        setShowDeleteModal(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione del cliente:', error);
    }
  };

  // Apre il modal di visualizzazione
  const openViewModal = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  // Apre il modal di modifica
  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      position: client.position || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
      postal_code: client.postal_code || '',
      risk_profile: client.risk_profile || 'moderate',
      status: client.status
    });
    setShowEditModal(true);
  };

  // Apre il modal di eliminazione
  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskProfileColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'pending': return 'In Attesa';
      default: return status;
    }
  };

  const getRiskProfileText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Basso';
      case 'moderate': return 'Moderato';
      case 'high': return 'Alto';
      default: return risk;
    }
  };

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users2 className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestione Clienti</h1>
                  <p className="text-gray-600">Gestisci i clienti del sistema GLG Capital Group</p>
                  <p className="text-sm text-blue-600 mt-1">🔄 Sincronizzazione in tempo reale attiva</p>
                </div>
              </div>
              <button
                onClick={fetchClients}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Aggiorna
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca per nome, email o azienda..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="active">Attivo</option>
                  <option value="inactive">Inattivo</option>
                  <option value="pending">In Attesa</option>
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Cliente
                </button>
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Caricamento clienti...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contatti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azienda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profilo Rischio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ultimo Aggiornamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {client.first_name} {client.last_name}
                              </div>
                              <div className="text-sm text-gray-500">ID: {client.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.email}</div>
                          <div className="text-sm text-gray-500">{client.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.company || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{client.position || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskProfileColor(client.risk_profile)}`}>
                            {getRiskProfileText(client.risk_profile)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {getStatusText(client.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.updated_at ? new Date(client.updated_at).toLocaleDateString('it-IT') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openViewModal(client)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Visualizza dettagli"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(client)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Modifica"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(client)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Elimina"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredClients.length === 0 && (
              <div className="p-8 text-center">
                <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nessun cliente trovato</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Client Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Aggiungi Nuovo Cliente</h2>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Azienda</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posizione</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profilo di Rischio</label>
                    <select
                      value={formData.risk_profile}
                      onChange={(e) => setFormData({...formData, risk_profile: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Basso</option>
                      <option value="moderate">Moderato</option>
                      <option value="high">Alto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Attivo</option>
                      <option value="inactive">Inattivo</option>
                      <option value="pending">In Attesa</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Aggiungi Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Modifica Cliente</h2>
              <form onSubmit={handleUpdateClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Azienda</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posizione</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profilo di Rischio</label>
                    <select
                      value={formData.risk_profile}
                      onChange={(e) => setFormData({...formData, risk_profile: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Basso</option>
                      <option value="moderate">Moderato</option>
                      <option value="high">Alto</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Attivo</option>
                    <option value="inactive">Inattivo</option>
                    <option value="pending">In Attesa</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {showViewModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Dettagli Cliente</h2>
              <div className="space-y-6">
                {/* Informazioni Personali */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Informazioni Personali
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-gray-900">{selectedClient.first_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cognome</label>
                      <p className="text-gray-900">{selectedClient.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedClient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefono</label>
                      <p className="text-gray-900">{selectedClient.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Informazioni Aziendali */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Informazioni Aziendali
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Azienda</label>
                      <p className="text-gray-900">{selectedClient.company || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Posizione</label>
                      <p className="text-gray-900">{selectedClient.position || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Indirizzo */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Indirizzo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Indirizzo</label>
                      <p className="text-gray-900">{selectedClient.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Città</label>
                      <p className="text-gray-900">{selectedClient.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CAP</label>
                      <p className="text-gray-900">{selectedClient.postal_code || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Paese</label>
                    <p className="text-gray-900">{selectedClient.country || 'N/A'}</p>
                  </div>
                </div>

                {/* Preferenze e Stato */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Preferenze e Stato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profilo di Rischio</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskProfileColor(selectedClient.risk_profile)}`}>
                          {getRiskProfileText(selectedClient.risk_profile)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Stato</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                          {getStatusText(selectedClient.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadati */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Metadati</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">ID Cliente:</label>
                      <p className="text-gray-900 font-mono">{selectedClient.id}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Data Creazione:</label>
                      <p className="text-gray-900">
                        {selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString('it-IT') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Ultimo Aggiornamento:</label>
                      <p className="text-gray-900">
                        {selectedClient.updated_at ? new Date(selectedClient.updated_at).toLocaleDateString('it-IT') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Investimenti Totali:</label>
                      <p className="text-gray-900">{selectedClient.total_investments || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Conferma Eliminazione</h2>
              <p className="text-gray-600 mb-6">
                Sei sicuro di voler eliminare il cliente <strong>{selectedClient.first_name} {selectedClient.last_name}</strong>?
                Questa azione non può essere annullata.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteClient}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Elimina
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtected>
  );
} 