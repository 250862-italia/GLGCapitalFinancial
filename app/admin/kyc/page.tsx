"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Download, User, Shield, Plus, Edit, Trash2, Search, Filter, Upload, Image as ImageIcon, Calendar, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface KYCRecord {
  id: string;
  "client_id": string;
  "document_type": string;
  "document_number": string;
  "document_image_url": string;
  status: string;
  notes?: string;
  "verified_at"?: string;
  "created_at": string;
  "updated_at": string;
  clients?: {
    "first_name": string;
    "last_name": string;
    email: string;
    phone: string;
    "date_of_birth": string;
    nationality: string;
    address?: string;
    city?: string;
    country?: string;
  };
}

export default function AdminKYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadingSchema, setReloadingSchema] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchKYC = async () => {
      setLoading(true);
      setError(null);
      try {
        // First get KYC records
        const { data: kycData, error: kycError } = await supabase
          .from('kyc_records')
          .select('*')
          .order('"created_at"', { ascending: false });

        if (kycError) throw kycError;

        // Then get client data for each KYC record
        const recordsWithClients = await Promise.all(
          (kycData || []).map(async (record) => {
            const { data: clientData } = await supabase
              .from('clients')
              .select('"first_name", "last_name", email, phone, "date_of_birth", nationality, address, city, country')
              .eq('id', record.client_id)
              .single();

            return {
              ...record,
              clients: clientData || null
            };
          })
        );

        setRecords(recordsWithClients);
        setFilteredRecords(recordsWithClients);
      } catch (err: any) {
        setError(err.message || 'Errore nel caricamento delle KYC');
      } finally {
        setLoading(false);
      }
    };
    fetchKYC();
  }, []);

  // Filtri e ricerca
  useEffect(() => {
    let filtered = records;

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.clients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.clients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.clients?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro per stato
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Filtro per tipo documento
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.document_type === documentTypeFilter);
    }

    setFilteredRecords(filtered);
  }, [records, searchTerm, statusFilter, documentTypeFilter]);

  // Funzione per aggiornare lo stato della KYC
  const updateStatus = async (id: string, status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('kyc_records')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      setRecords(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    } catch (err: any) {
      alert('Errore durante l\'aggiornamento dello stato: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Funzione per ricaricare il cache dello schema
  const reloadSchema = async () => {
    setReloadingSchema(true);
    try {
      const response = await fetch('/api/admin/reload-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reload schema');
      }

      alert('Schema cache reloaded successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Schema reload error:', error);
      alert('Error reloading schema cache. Please try again.');
    } finally {
      setReloadingSchema(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return { bg: '#bbf7d0', color: '#16a34a' };
      case 'rejected': return { bg: '#fee2e2', color: '#dc2626' };
      case 'pending': return { bg: '#fef3c7', color: '#b45309' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>KYC Management</h1>
        <button 
          onClick={reloadSchema}
          disabled={reloadingSchema}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '0.5rem 1rem',
            cursor: reloadingSchema ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 14
          }}
        >
          {reloadingSchema ? 'Reloading...' : 'Reload Schema'}
        </button>
      </div>

      {/* Filtri e Ricerca */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '1.5rem', 
        borderRadius: 8, 
        marginBottom: 24,
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Cerca per nome, email, tipo documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              width: 300
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            background: 'white'
          }}
        >
          <option value="all">Tutti gli stati</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={documentTypeFilter}
          onChange={(e) => setDocumentTypeFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            background: 'white'
          }}
        >
          <option value="all">Tutti i documenti</option>
          <option value="PERSONAL_INFO">Personal Info</option>
          <option value="PROOF_OF_ADDRESS">Proof of Address</option>
          <option value="BANK_STATEMENT">Bank Statement</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
          {filteredRecords.length} di {records.length} record
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <p>Caricamento KYC...</p>
        </div>
      ) : error ? (
        <p style={{ color: '#dc2626' }}>{error}</p>
      ) : filteredRecords.length === 0 ? (
        <p>Nessun record KYC trovato.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Cliente</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Tipo Documento</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Stato</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Data Invio</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Documento</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => { setSelectedRecord(record); setShowModal(true); }}>
                  <td style={{ padding: 12 }}>
                    <div>
                      <strong>{record.clients?.first_name} {record.clients?.last_name}</strong>
                      <br />
                      <small style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} />
                        {record.clients?.email}
                      </small>
                      {record.clients?.phone && (
                        <small style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={12} />
                          {record.clients.phone}
                        </small>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{record.document_type}</div>
                    <small style={{ color: '#6b7280' }}>{record.document_number}</small>
                  </td>
                  <td style={{ padding: 12 }}>
                    {(() => {
                      const colors = getStatusColor(record.status);
                      return (
                        <span style={{
                          background: colors.bg,
                          color: colors.color,
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {record.status}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: 12 }}>
                    <small style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {formatDate(record.created_at)}
                    </small>
                  </td>
                  <td style={{ padding: 12 }}>
                    {record.document_image_url ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <img 
                          src={record.document_image_url} 
                          alt="Document"
                          style={{ 
                            width: 40, 
                            height: 40, 
                            objectFit: 'cover', 
                            borderRadius: 4,
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <div>
                          <a 
                            href={record.document_image_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              color: '#3b82f6', 
                              textDecoration: 'underline',
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye size={12} />
                            Visualizza
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: 12 }}>Nessun documento</span>
                    )}
                  </td>
                  <td style={{ padding: 12 }}>
                    {record.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateStatus(record.id, 'approved'); }} 
                          style={{ 
                            background: '#10b981', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 4, 
                            padding: '0.25rem 0.5rem', 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            fontSize: 12
                          }}
                        >
                          Approva
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateStatus(record.id, 'rejected'); }} 
                          style={{ 
                            background: '#ef4444', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 4, 
                            padding: '0.25rem 0.5rem', 
                            cursor: 'pointer', 
                            fontWeight: 600,
                            fontSize: 12
                          }}
                        >
                          Rifiuta
                        </button>
                      </div>
                    )}
                    {record.status === 'approved' && <span style={{ color: '#10b981', fontWeight: 700, fontSize: 12 }}>Approvato</span>}
                    {record.status === 'rejected' && <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 12 }}>Rifiutato</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal per dettagli */}
      {showModal && selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2rem',
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            
            <h2 style={{ marginBottom: '1.5rem' }}>Dettagli KYC - {selectedRecord.clients?.first_name} {selectedRecord.clients?.last_name}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3>Informazioni Cliente</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Nome:</strong> {selectedRecord.clients?.first_name} {selectedRecord.clients?.last_name}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Email:</strong> {selectedRecord.clients?.email}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Telefono:</strong> {selectedRecord.clients?.phone || 'Non fornito'}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Data di nascita:</strong> {selectedRecord.clients?.date_of_birth || 'Non fornita'}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Nazionalità:</strong> {selectedRecord.clients?.nationality || 'Non fornita'}
                </div>
                {selectedRecord.clients?.address && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Indirizzo:</strong> {selectedRecord.clients.address}, {selectedRecord.clients.city}, {selectedRecord.clients.country}
                  </div>
                )}
              </div>
              
              <div>
                <h3>Informazioni Documento</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Tipo:</strong> {selectedRecord.document_type}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Numero:</strong> {selectedRecord.document_number}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Stato:</strong> 
                  <span style={{
                    background: getStatusColor(selectedRecord.status).bg,
                    color: getStatusColor(selectedRecord.status).color,
                    padding: '4px 8px',
                    borderRadius: 4,
                    marginLeft: '0.5rem',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {selectedRecord.status}
                  </span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Data invio:</strong> {formatDate(selectedRecord.created_at)}
                </div>
                {selectedRecord.notes && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Note:</strong> {selectedRecord.notes}
                  </div>
                )}
              </div>
            </div>
            
            {selectedRecord.document_image_url && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Documento</h3>
                <img 
                  src={selectedRecord.document_image_url} 
                  alt="Document"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 400, 
                    objectFit: 'contain',
                    border: '1px solid #e5e7eb',
                    borderRadius: 4
                  }}
                />
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <a 
                    href={selectedRecord.document_image_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: 4,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Eye size={16} />
                    Visualizza in nuova finestra
                  </a>
                  <a 
                    href={selectedRecord.document_image_url} 
                    download
                    style={{ 
                      background: '#059669',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: 4,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Download size={16} />
                    Scarica
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 