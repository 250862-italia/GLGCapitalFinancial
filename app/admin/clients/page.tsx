"use client";
import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, Eye, Edit, Trash2, Plus, Search, Filter, 
  Building, MapPin, CreditCard, Shield, Save, X, AlertCircle 
} from 'lucide-react';
import { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient, 
  syncClients,
  generateClientCode,
  type Client 
} from '@/lib/clients-storage';

interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  date_of_birth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  iban: string;
  bic: string;
  account_holder: string;
  usdt_wallet: string;
  status: string;
  risk_profile: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    date_of_birth: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    iban: '',
    bic: '',
    account_holder: '',
    usdt_wallet: '',
    status: 'active',
    risk_profile: 'moderate'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting fetchClients...');
      
      // Carica i clienti dal storage locale
      const localClients = getClients();
      setClients(localClients);
      setDataSource('local');
      console.log('✅ Clients loaded from local storage:', localClients.length);
      
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError('Errore nel caricamento dei clienti');
      setDataSource('local');
    }
    
    setLoading(false);
  };

  const handleCreateClient = async () => {
    try {
      const newClient = createClient({
        user_id: `user_${Date.now()}`,
        profile_id: `profile_${Date.now()}`,
        client_code: generateClientCode(),
        profile_photo: '',
        investment_preferences: { type: 'balanced', sectors: ['general'] },
        total_invested: 0,
        ...formData
      });

      console.log('✅ Client created:', newClient.first_name, newClient.last_name);
      setShowCreateModal(false);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('❌ Error creating client:', error);
      setError('Errore nella creazione del cliente');
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      const updatedClient = updateClient(editingClient.id, formData);
      
      if (updatedClient) {
        console.log('✅ Client updated:', updatedClient.first_name, updatedClient.last_name);
        setShowEditModal(false);
        setEditingClient(null);
        resetForm();
        fetchClients();
      } else {
        throw new Error('Failed to update client');
      }
    } catch (error) {
      console.error('❌ Error updating client:', error);
      setError('Errore nell\'aggiornamento del cliente');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) {
      return;
    }

    try {
      const success = deleteClient(clientId);
      
      if (success) {
        console.log('✅ Client deleted successfully');
        fetchClients();
      } else {
        throw new Error('Failed to delete client');
      }
    } catch (error) {
      console.error('❌ Error deleting client:', error);
      setError('Errore nell\'eliminazione del cliente');
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      position: client.position,
      date_of_birth: client.date_of_birth,
      nationality: client.nationality,
      address: client.address,
      city: client.city,
      country: client.country,
      postal_code: client.postal_code,
      iban: client.iban,
      bic: client.bic,
      account_holder: client.account_holder,
      usdt_wallet: client.usdt_wallet,
      status: client.status,
      risk_profile: client.risk_profile
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      date_of_birth: '',
      nationality: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      iban: '',
      bic: '',
      account_holder: '',
      usdt_wallet: '',
      status: 'active',
      risk_profile: 'moderate'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskProfileColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'aggressive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento clienti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Clienti</h1>
          <p className="text-gray-600">Gestisci i clienti e le loro informazioni</p>
          
          {/* Data Source Indicator */}
          <div className="mt-2 flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              dataSource === 'supabase' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {dataSource === 'supabase' ? '🟢 Database Supabase' : '🔵 Storage Locale'}
            </div>
            <span className="text-sm text-gray-500">
              {clients.length > 0 ? `${clients.length} clienti caricati` : 'Nessun cliente trovato'}
            </span>
          </div>
          
          {dataSource === 'local' && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Storage Locale Attivo</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    I clienti vengono salvati nel browser. Le modifiche sono persistenti e funzionano offline.
                    <br />
                    <span className="font-medium">CRUD completo disponibile!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Errore</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Cliente
          </button>
          
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca clienti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivo</option>
              <option value="pending">In attesa</option>
              <option value="inactive">Inattivo</option>
            </select>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {client.first_name} {client.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{client.client_code}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskProfileColor(client.risk_profile)}`}>
                    {client.risk_profile}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{client.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{client.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{client.company}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{client.city}, {client.country}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">€{client.total_invested.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditClient(client)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-md text-sm transition-colors duration-200 flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifica
                </button>
                <button
                  onClick={() => handleDeleteClient(client.id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-md text-sm transition-colors duration-200 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <User className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun cliente</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Nessun cliente trovato con i filtri applicati.' 
                : 'Inizia creando il tuo primo cliente.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                + Nuovo Cliente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ClientForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateClient}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          submitText="Crea Cliente"
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ClientForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateClient}
          onCancel={() => {
            setShowEditModal(false);
            setEditingClient(null);
            resetForm();
          }}
          submitText="Aggiorna Cliente"
        />
      )}
    </div>
  );
}

function ClientForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  submitText 
}: {
  formData: ClientFormData;
  setFormData: (data: ClientFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitText: string;
}) {
  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{submitText}</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Azienda</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posizione</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data di Nascita</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazionalità</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => handleChange('iban', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BIC</label>
                <input
                  type="text"
                  value={formData.bic}
                  onChange={(e) => handleChange('bic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intestatario Conto</label>
                <input
                  type="text"
                  value={formData.account_holder}
                  onChange={(e) => handleChange('account_holder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wallet USDT</label>
                <input
                  type="text"
                  value={formData.usdt_wallet}
                  onChange={(e) => handleChange('usdt_wallet', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Attivo</option>
                  <option value="pending">In attesa</option>
                  <option value="inactive">Inattivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profilo di Rischio</label>
                <select
                  value={formData.risk_profile}
                  onChange={(e) => handleChange('risk_profile', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="conservative">Conservativo</option>
                  <option value="moderate">Moderato</option>
                  <option value="aggressive">Aggressivo</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 