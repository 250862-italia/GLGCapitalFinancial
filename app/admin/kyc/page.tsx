"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface KYCRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  document_type: 'passport' | 'id_card' | 'drivers_license' | 'utility_bill';
  document_url: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  verification_level: 'basic' | 'enhanced' | 'full';
}

export default function AdminKYCPage() {
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const fetchKYCRequests = async () => {
    setLoading(true);
    try {
      // Simulate KYC data since we don't have a real KYC table
      const mockKYCData: KYCRequest[] = [
        {
          id: '1',
          user_id: 'user-1',
          user_email: 'john.doe@example.com',
          user_name: 'John Doe',
          status: 'pending',
          document_type: 'passport',
          document_url: '/documents/passport-1.pdf',
          submitted_at: '2024-01-15T10:30:00Z',
          verification_level: 'basic'
        },
        {
          id: '2',
          user_id: 'user-2',
          user_email: 'jane.smith@example.com',
          user_name: 'Jane Smith',
          status: 'approved',
          document_type: 'id_card',
          document_url: '/documents/id-card-2.pdf',
          submitted_at: '2024-01-10T14:20:00Z',
          reviewed_at: '2024-01-12T09:15:00Z',
          reviewer_notes: 'Documents verified successfully',
          verification_level: 'enhanced'
        },
        {
          id: '3',
          user_id: 'user-3',
          user_email: 'mike.wilson@example.com',
          user_name: 'Mike Wilson',
          status: 'rejected',
          document_type: 'drivers_license',
          document_url: '/documents/license-3.pdf',
          submitted_at: '2024-01-08T16:45:00Z',
          reviewed_at: '2024-01-09T11:30:00Z',
          reviewer_notes: 'Document expired, please provide current ID',
          verification_level: 'basic'
        }
      ];
      
      setKycRequests(mockKYCData);
    } catch (error) {
      setError("Failed to load KYC requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: KYCRequest['status'], notes?: string) => {
    try {
      // In a real implementation, this would update the database
      setKycRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: newStatus, 
              reviewed_at: new Date().toISOString(),
              reviewer_notes: notes 
            }
          : req
      ));
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      setError("Failed to update KYC status");
    }
  };

  const filteredRequests = kycRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: KYCRequest['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'under_review': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: KYCRequest['status']) => {
    switch (status) {
      case 'pending': return 'In Attesa';
      case 'approved': return 'Approvato';
      case 'rejected': return 'Rifiutato';
      case 'under_review': return 'In Revisione';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <span style={{ marginLeft: '1rem' }}>Caricamento richieste KYC...</span>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--primary)' }}>
              Gestione KYC
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Verifica e gestione delle richieste di identificazione clienti
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>
              Totale: {kycRequests.length}
            </span>
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>
              In attesa: {kycRequests.filter(r => r.status === 'pending').length}
            </span>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Cerca per nome o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              minWidth: '250px'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white'
            }}
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In attesa</option>
            <option value="under_review">In revisione</option>
            <option value="approved">Approvato</option>
            <option value="rejected">Rifiutato</option>
          </select>
        </div>

        {/* KYC Requests Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e3eb' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Tipo Documento</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Stato</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Livello Verifica</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Data Invio</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid #e0e3eb' }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{request.user_name}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{request.user_email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: '#f3f4f6', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '14px' 
                    }}>
                      {request.document_type === 'passport' ? 'Passaporto' :
                       request.document_type === 'id_card' ? 'Carta d\'Identità' :
                       request.document_type === 'drivers_license' ? 'Patente' : 'Bolletta'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: getStatusColor(request.status) + '20',
                      color: getStatusColor(request.status),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: '#f3f4f6', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '14px' 
                    }}>
                      {request.verification_level === 'basic' ? 'Base' :
                       request.verification_level === 'enhanced' ? 'Avanzato' : 'Completo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {new Date(request.submitted_at).toLocaleDateString('it-IT')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Gestisci
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Nessuna richiesta KYC trovata
          </div>
        )}

        {/* KYC Review Modal */}
        {showModal && selectedRequest && (
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
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '1rem' }}>
                Revisione KYC - {selectedRequest.user_name}
              </h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Email:</strong> {selectedRequest.user_email}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Tipo Documento:</strong> {selectedRequest.document_type}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Stato Attuale:</strong> 
                <span style={{ 
                  background: getStatusColor(selectedRequest.status) + '20',
                  color: getStatusColor(selectedRequest.status),
                  padding: '4px 8px',
                  borderRadius: '4px',
                  marginLeft: '8px'
                }}>
                  {getStatusText(selectedRequest.status)}
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Note del revisore:
                </label>
                <textarea
                  defaultValue={selectedRequest.reviewer_notes || ''}
                  id="reviewer-notes"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    minHeight: '100px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Rifiuta
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Approva
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  );
} 