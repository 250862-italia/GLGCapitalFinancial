"use client";
import { useState, useEffect } from 'react';
// import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import { supabase } from '@/lib/supabase';
import { 
  User, Mail, Phone, Calendar, Eye, Edit, Trash2, Plus, Search, Filter, 
  Building, MapPin, CreditCard, Shield, Save, X, AlertCircle 
} from 'lucide-react';

interface Client {
  id: string;
  user_id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  date_of_birth: string;
  nationality: string;
  profile_photo: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  iban: string;
  bic: string;
  account_holder: string;
  usdt_wallet: string;
  client_code: string;
  status: string;
  risk_profile: string;
  investment_preferences: any;
  total_invested: number;
  created_at: string;
  updated_at: string;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
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
    try {
      console.log('🔄 Fetching clients from database...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching clients:', error);
        return;
      }

      // Filtra i clienti corrotti che sono oggetti errore
      const validClients = (data || []).filter(client => {
        if (!client || typeof client !== 'object') {
          console.warn('⚠️ Skipping invalid client (not an object):', client);
          return false;
        }
        
        // Controlla se è un oggetto errore
        if (client.type && client.message && client.code) {
          console.warn('⚠️ Skipping error object in clients:', client);
          return false;
        }
        
        // Controlla se ha i campi minimi richiesti
        if (!client.id || !client.first_name || !client.last_name) {
          console.warn('⚠️ Skipping client with missing required fields:', client);
          return false;
        }
        
        return true;
      });

      console.log('✅ Clients fetched:', validClients.length, 'valid clients out of', data?.length || 0, 'total');
      if (validClients.length > 0) {
        console.log('📊 Sample valid client data:', validClients[0]);
      }
      
      setClients(validClients);
    } catch (error) {
      console.error('❌ Unexpected error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    // Prima verifica che il cliente sia valido
    if (!isValidClient(client)) {
      console.warn('⚠️ Skipping invalid client:', client);
      return false;
    }

    const matchesSearch = 
      client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateClient = async () => {
    console.log('🔄 Creating client with data:', formData);
    
    // Validazione campi obbligatori
    if (!formData.first_name || !formData.last_name || !formData.email) {
      alert('Per favore compila i campi obbligatori: Nome, Cognome e Email');
      return;
    }

    try {
      // Creiamo direttamente il cliente senza profilo
      const clientData = {
        ...formData,
        user_id: null, // Nessun riferimento a auth.users
        profile_id: null, // Nessun riferimento a profiles
        client_code: 'CLI-' + Date.now(),
        total_invested: 0,
        investment_preferences: {}
      };

      console.log('📤 Creating client with data:', clientData);

      const { data: clientDataResult, error: clientError } = await supabase
        .from('clients')
        .insert([clientData])
        .select();

      if (clientError) {
        console.error('❌ Error creating client:', clientError);
        
        // Se l'errore è dovuto ai vincoli di foreign key, proviamo senza user_id e profile_id
        if (clientError.message.includes('foreign key constraint')) {
          console.log('🔄 Retrying without foreign key constraints...');
          
          const clientDataWithoutFK = {
            ...formData,
            client_code: 'CLI-' + Date.now(),
            total_invested: 0,
            investment_preferences: {}
          };

          const { data: retryResult, error: retryError } = await supabase
            .from('clients')
            .insert([clientDataWithoutFK])
            .select();

          if (retryError) {
            console.error('❌ Error on retry:', retryError);
            alert(`Errore nella creazione del cliente: ${retryError.message}`);
            return;
          }

          console.log('✅ Client created successfully (retry):', retryResult);
          setClients([...(retryResult || []), ...clients]);
          setShowCreateModal(false);
          resetForm();
          alert('Cliente creato con successo!');
          return;
        }
        
        alert(`Errore nella creazione del cliente: ${clientError.message}`);
        return;
      }

      console.log('✅ Client created successfully:', clientDataResult);
      
      setClients([...(clientDataResult || []), ...clients]);
      setShowCreateModal(false);
      resetForm();
      
      alert('Cliente creato con successo!');
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert('Errore inaspettato durante la creazione del cliente');
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', editingClient.id);

      if (error) {
        console.error('Error updating client:', error);
        return;
      }

      setClients(clients.map(client => 
        client.id === editingClient.id 
          ? { ...client, ...formData }
          : client
      ));
      setShowEditModal(false);
      setEditingClient(null);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        return;
      }

      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      position: client.position || '',
      date_of_birth: client.date_of_birth || '',
      nationality: client.nationality || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
      postal_code: client.postal_code || '',
      iban: client.iban || '',
      bic: client.bic || '',
      account_holder: client.account_holder || '',
      usdt_wallet: client.usdt_wallet || '',
      status: client.status || 'active',
      risk_profile: client.risk_profile || 'moderate'
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
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'suspended': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRiskProfileColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Funzione per sanitizzare i valori prima del rendering
  const sanitizeValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Sì' : 'No';
    if (typeof value === 'object') {
      // Controllo specifico per oggetti errore
      if (value.type && value.message && value.code) {
        console.warn('⚠️ Found error object in client data:', value);
        return 'Errore dati';
      }
      try {
        return JSON.stringify(value);
      } catch {
        return 'Dato non valido';
      }
    }
    return String(value);
  };

  // Funzione per verificare se un cliente ha dati validi
  const isValidClient = (client: any): boolean => {
    if (!client || typeof client !== 'object') return false;
    if (client.type && client.message && client.code) return false;
    return true;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Caricamento clienti...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#1a2238', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Gestione Clienti
          </h1>
                      <p style={{ color: '#374151', opacity: 0.8 }}>
              Visualizza e gestisci tutti i clienti registrati ({clients.length} totali)
            </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#1a2238',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2d3748';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1a2238';
          }}
        >
          <Plus size={16} />
          Nuovo Cliente
        </button>
      </div>



      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Cerca per nome, cognome, email o azienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 16,
            background: '#fff'
          }}
        >
          <option value="all">Tutti gli stati</option>
          <option value="active">Attivo</option>
          <option value="pending">In attesa</option>
          <option value="suspended">Sospeso</option>
          <option value="inactive">Inattivo</option>
        </select>
      </div>

      {/* Clients Table */}
      <div style={{ background: 'var(--secondary)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Cliente</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Azienda</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Contatti</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Località</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Stato</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Profilo Rischio</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Investito</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Data Registrazione</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => {
                // Controllo di sicurezza finale prima del rendering
                if (!isValidClient(client)) {
                  console.warn('⚠️ Skipping invalid client during rendering:', client);
                  return null;
                }
                
                return (
                  <tr key={client.id} style={{ 
                    borderBottom: index < filteredClients.length - 1 ? '1px solid #e5e7eb' : 'none',
                    background: index % 2 === 0 ? '#fff' : '#f9fafb'
                  }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {sanitizeValue(client.first_name)} {sanitizeValue(client.last_name)}
                      </div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>ID: {sanitizeValue(client.client_code || client.id)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Building size={14} color="#6b7280" />
                        <span style={{ fontSize: 14 }}>{sanitizeValue(client.company)}</span>
                      </div>
                      {client.position && (
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{sanitizeValue(client.position)}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Mail size={14} color="#6b7280" />
                        <span style={{ fontSize: 14 }}>{sanitizeValue(client.email)}</span>
                      </div>
                      {client.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={14} color="#6b7280" />
                          <span style={{ fontSize: 14 }}>{sanitizeValue(client.phone)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <MapPin size={14} color="#6b7280" />
                        <span style={{ fontSize: 14 }}>{sanitizeValue(client.city)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{sanitizeValue(client.country)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getStatusColor(sanitizeValue(client.status) || 'pending')}20`,
                      color: getStatusColor(sanitizeValue(client.status) || 'pending')
                    }}>
                      {sanitizeValue(client.status) || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getRiskProfileColor(sanitizeValue(client.risk_profile) || 'moderate')}20`,
                      color: getRiskProfileColor(sanitizeValue(client.risk_profile) || 'moderate')
                    }}>
                      {sanitizeValue(client.risk_profile) || 'moderate'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CreditCard size={14} color="#6b7280" />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>
                        €{(client.total_invested || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="#6b7280" />
                      <span style={{ fontSize: 14 }}>
                        {new Date(client.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowModal(true);
                        }}
                        style={{
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: 6,
                          background: '#3b82f6',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                        title="Visualizza dettagli"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        style={{
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: 6,
                          background: '#10b981',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                        title="Modifica cliente"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        style={{
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: 6,
                          background: '#ef4444',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                        title="Elimina cliente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <User size={64} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 600, marginBottom: '0.5rem' }}>
            Nessun cliente trovato
          </h3>
          <p style={{ color: '#6b7280' }}>
            {searchTerm || filterStatus !== 'all' 
              ? 'Prova a modificare i filtri di ricerca' 
              : 'Non ci sono ancora clienti registrati'
            }
          </p>
        </div>
      )}

      {/* Client Details Modal */}
      {showModal && selectedClient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700 }}>
                Dettagli Cliente
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Personal Information */}
              <div>
                <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>
                  Informazioni Personali
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <strong>Nome:</strong> {selectedClient.first_name} {selectedClient.last_name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedClient.email || 'N/A'}
                  </div>
                  <div>
                    <strong>Telefono:</strong> {selectedClient.phone || 'N/A'}
                  </div>
                  <div>
                    <strong>Data di Nascita:</strong> {selectedClient.date_of_birth || 'N/A'}
                  </div>
                  <div>
                    <strong>Nazionalità:</strong> {selectedClient.nationality || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>
                  Informazioni Aziendali
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <strong>Azienda:</strong> {selectedClient.company || 'N/A'}
                  </div>
                  <div>
                    <strong>Posizione:</strong> {selectedClient.position || 'N/A'}
                  </div>
                  <div>
                    <strong>Stato:</strong> 
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getStatusColor(selectedClient.status || 'pending')}20`,
                      color: getStatusColor(selectedClient.status || 'pending'),
                      marginLeft: '0.5rem'
                    }}>
                      {selectedClient.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <strong>Profilo Rischio:</strong>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getRiskProfileColor(selectedClient.risk_profile || 'moderate')}20`,
                      color: getRiskProfileColor(selectedClient.risk_profile || 'moderate'),
                      marginLeft: '0.5rem'
                    }}>
                      {selectedClient.risk_profile || 'moderate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>
                  Indirizzo
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <strong>Indirizzo:</strong> {selectedClient.address || 'N/A'}
                  </div>
                  <div>
                    <strong>Città:</strong> {selectedClient.city || 'N/A'}
                  </div>
                  <div>
                    <strong>Paese:</strong> {selectedClient.country || 'N/A'}
                  </div>
                  <div>
                    <strong>CAP:</strong> {selectedClient.postal_code || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 600, marginBottom: '1rem' }}>
                  Informazioni Bancarie
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <strong>IBAN:</strong> {selectedClient.iban || 'N/A'}
                  </div>
                  <div>
                    <strong>BIC:</strong> {selectedClient.bic || 'N/A'}
                  </div>
                  <div>
                    <strong>Intestatario:</strong> {selectedClient.account_holder || 'N/A'}
                  </div>
                  <div>
                    <strong>Wallet USDT:</strong> {selectedClient.usdt_wallet || 'N/A'}
                  </div>
                  <div>
                    <strong>Totale Investito:</strong> €{(selectedClient.total_invested || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <div>
                <strong>Codice Cliente:</strong> {selectedClient.client_code || 'N/A'}
              </div>
              <div>
                <strong>Data Registrazione:</strong> {new Date(selectedClient.created_at).toLocaleString('it-IT')}
              </div>
              <div>
                <strong>Ultimo Aggiornamento:</strong> {new Date(selectedClient.updated_at).toLocaleString('it-IT')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700 }}>
                Nuovo Cliente
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
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
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && editingClient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700 }}>
                Modifica Cliente
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingClient(null);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <ClientForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateClient}
              onCancel={() => {
                setShowEditModal(false);
                setEditingClient(null);
                resetForm();
              }}
              submitText="Salva Modifiche"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Client Form Component
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
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nome *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cognome *</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Telefono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Azienda</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Posizione</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Data di Nascita</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleChange('date_of_birth', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nazionalità</label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Indirizzo</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 16
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Città</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Paese</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>CAP</label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>IBAN</label>
          <input
            type="text"
            value={formData.iban}
            onChange={(e) => handleChange('iban', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>BIC</label>
          <input
            type="text"
            value={formData.bic}
            onChange={(e) => handleChange('bic', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Intestatario</label>
          <input
            type="text"
            value={formData.account_holder}
            onChange={(e) => handleChange('account_holder', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Wallet USDT</label>
          <input
            type="text"
            value={formData.usdt_wallet}
            onChange={(e) => handleChange('usdt_wallet', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Stato</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          >
            <option value="active">Attivo</option>
            <option value="pending">In attesa</option>
            <option value="suspended">Sospeso</option>
            <option value="inactive">Inattivo</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Profilo Rischio</label>
          <select
            value={formData.risk_profile}
            onChange={(e) => handleChange('risk_profile', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16
            }}
          >
            <option value="low">Basso</option>
            <option value="moderate">Moderato</option>
            <option value="high">Alto</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          Annulla
        </button>
        <button
          onClick={() => {
            console.log('🖱️ Button clicked:', submitText);
            onSubmit();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            background: '#1a2238',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2d3748';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1a2238';
          }}
        >
          {submitText}
        </button>
      </div>
    </div>
  );
} 