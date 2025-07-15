"use client";
import { useState, useEffect } from 'react';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Calendar, Eye, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';

interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  created_at: string;
  status: string;
  kyc_status: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
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
          <h1 style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Gestione Clienti
          </h1>
          <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
            Visualizza e gestisci tutti i clienti registrati
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary)',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Nuovo Cliente
        </button>
      </div>

      {/* Message */}
      <div style={{ 
        background: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: 8, 
        padding: '1rem', 
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <User size={20} color="#16a34a" />
        <span style={{ color: '#16a34a', fontWeight: 600 }}>
          Accesso diretto abilitato - Autenticazione temporaneamente disabilitata
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Cerca per nome, cognome o email..."
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
        </select>
      </div>

      {/* Clients Table */}
      <div style={{ background: 'var(--secondary)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Cliente</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Contatti</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Paese</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Stato</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>KYC</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--primary)' }}>Data Registrazione</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={client.id} style={{ 
                  borderBottom: index < filteredClients.length - 1 ? '1px solid #e5e7eb' : 'none',
                  background: index % 2 === 0 ? '#fff' : '#f9fafb'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {client.first_name} {client.last_name}
                      </div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>ID: {client.user_id}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Mail size={14} color="#6b7280" />
                        <span style={{ fontSize: 14 }}>{client.email || 'N/A'}</span>
                      </div>
                      {client.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={14} color="#6b7280" />
                          <span style={{ fontSize: 14 }}>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: 14 }}>{client.country || 'N/A'}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getStatusColor(client.status || 'pending')}20`,
                      color: getStatusColor(client.status || 'pending')
                    }}>
                      {client.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getKYCStatusColor(client.kyc_status || 'pending')}20`,
                      color: getKYCStatusColor(client.kyc_status || 'pending')
                    }}>
                      {client.kyc_status || 'pending'}
                    </span>
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
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        style={{
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: 6,
                          background: '#10b981',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
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
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
            maxWidth: '600px',
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
            
            <div style={{ display: 'grid', gap: '1rem' }}>
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
                <strong>Paese:</strong> {selectedClient.country || 'N/A'}
              </div>
              <div>
                <strong>Stato:</strong> {selectedClient.status || 'pending'}
              </div>
              <div>
                <strong>KYC Status:</strong> {selectedClient.kyc_status || 'pending'}
              </div>
              <div>
                <strong>Data Registrazione:</strong> {new Date(selectedClient.created_at).toLocaleString('it-IT')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 