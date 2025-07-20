"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';

interface KYCRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  document_type: string;
  submitted_at: string;
  updated_at: string;
  verification_level: string;
  
  // Personal Information
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    nationality?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
  };

  // Banking Information
  banking_info: {
    iban?: string;
    bic?: string;
    account_holder?: string;
    usdt_wallet?: string;
  };

  // Financial Information
  financial_info: {
    annual_income?: number;
    net_worth?: number;
    investment_experience?: string;
    risk_tolerance?: string;
    monthly_investment_budget?: number;
    emergency_fund?: number;
    debt_amount?: number;
    credit_score?: number;
    employment_status?: string;
    employer_name?: string;
    job_title?: string;
    years_employed?: number;
    source_of_funds?: string;
    tax_residency?: string;
    tax_id?: string;
  };

  // Investment Profile
  investment_profile: {
    total_invested?: number;
    risk_profile?: string;
    investment_goals?: any;
    preferred_investment_types?: any;
  };
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
    setError("");
    try {
      // Get admin session
      const adminToken = localStorage.getItem('admin_token');
      
      if (!adminToken) {
        setError("Sessione admin non valida");
        setLoading(false);
        return;
      }

      const response = await fetchJSONWithCSRF('/api/admin/kyc', {
        headers: {
          'x-admin-session': adminToken
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to fetch KYC data');
      }

      const result = await response.json();
      
      if (result.success) {
        setKycRequests(result.data);
        if (result.message) {
          console.log('ℹ️ KYC API message:', result.message);
        }
      } else {
        throw new Error(result.error || result.details || 'Failed to fetch KYC data');
      }
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load KYC requests';
      setError(errorMessage);
      
      // If it's a database error, show helpful message
      if (errorMessage.includes('relation') || errorMessage.includes('table')) {
        setError("Database table not found. Please run the SQL migration script first.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: KYCRequest['status'], notes?: string) => {
    try {
      // Get admin session
      const adminToken = localStorage.getItem('admin_token');
      
      if (!adminToken) {
        setError("Sessione admin non valida");
        return;
      }

      const response = await fetchJSONWithCSRF('/api/admin/kyc', {
        method: 'PUT',
        headers: {
          'x-admin-session': adminToken
        },
        body: JSON.stringify({
          clientId: requestId,
          status: newStatus,
          notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update KYC status');
      }

      // Update local state
      setKycRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: newStatus, updated_at: new Date().toISOString() }
          : req
      ));
      
      setShowModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating KYC status:', error);
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

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Errore nel caricamento KYC:</div>
            <div style={{ marginBottom: '8px' }}>{error}</div>
            {error.includes('Database table not found') && (
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                <strong>Soluzione:</strong> Esegui lo script SQL nel Supabase Dashboard:
                <ol style={{ marginTop: '4px', marginLeft: '20px' }}>
                  <li>Vai su <strong>Supabase Dashboard</strong> → <strong>SQL Editor</strong></li>
                  <li>Copia e incolla il contenuto del file <code>create-clients-table-kyc.sql</code></li>
                  <li>Esegui lo script</li>
                  <li>Ricarica questa pagina</li>
                </ol>
              </div>
            )}
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
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Stato</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Informazioni Bancarie</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Informazioni Finanziarie</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Data Registrazione</th>
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
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {request.personal_info.country || 'N/A'}
                      </div>
                    </div>
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
                    <div style={{ fontSize: '14px' }}>
                      <div><strong>IBAN:</strong> {request.banking_info.iban || 'N/A'}</div>
                      <div><strong>Intestatario:</strong> {request.banking_info.account_holder || 'N/A'}</div>
                      <div><strong>Wallet USDT:</strong> {request.banking_info.usdt_wallet ? 'Presente' : 'N/A'}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '14px' }}>
                      <div><strong>Reddito:</strong> {formatCurrency(request.financial_info.annual_income)}</div>
                      <div><strong>Patrimonio:</strong> {formatCurrency(request.financial_info.net_worth)}</div>
                      <div><strong>Esperienza:</strong> {request.financial_info.investment_experience || 'N/A'}</div>
                    </div>
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
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '1rem' }}>
                Revisione KYC - {selectedRequest.user_name}
              </h2>
              
              {/* Personal Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                  Informazioni Personali
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '14px' }}>
                  <div><strong>Nome:</strong> {selectedRequest.personal_info.first_name}</div>
                  <div><strong>Cognome:</strong> {selectedRequest.personal_info.last_name}</div>
                  <div><strong>Email:</strong> {selectedRequest.personal_info.email}</div>
                  <div><strong>Telefono:</strong> {selectedRequest.personal_info.phone || 'N/A'}</div>
                  <div><strong>Data di Nascita:</strong> {selectedRequest.personal_info.date_of_birth || 'N/A'}</div>
                  <div><strong>Nazionalità:</strong> {selectedRequest.personal_info.nationality || 'N/A'}</div>
                  <div><strong>Indirizzo:</strong> {selectedRequest.personal_info.address || 'N/A'}</div>
                  <div><strong>Città:</strong> {selectedRequest.personal_info.city || 'N/A'}</div>
                  <div><strong>Paese:</strong> {selectedRequest.personal_info.country || 'N/A'}</div>
                  <div><strong>CAP:</strong> {selectedRequest.personal_info.postal_code || 'N/A'}</div>
                </div>
              </div>

              {/* Banking Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem', color: '#059669' }}>
                  Informazioni Bancarie
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '14px' }}>
                  <div><strong>IBAN:</strong> {selectedRequest.banking_info.iban || 'N/A'}</div>
                  <div><strong>BIC/SWIFT:</strong> {selectedRequest.banking_info.bic || 'N/A'}</div>
                  <div><strong>Intestatario:</strong> {selectedRequest.banking_info.account_holder || 'N/A'}</div>
                  <div><strong>Wallet USDT:</strong> {selectedRequest.banking_info.usdt_wallet || 'N/A'}</div>
                </div>
              </div>

              {/* Financial Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem', color: '#dc2626' }}>
                  Informazioni Finanziarie
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '14px' }}>
                  <div><strong>Reddito Annuale:</strong> {formatCurrency(selectedRequest.financial_info.annual_income)}</div>
                  <div><strong>Patrimonio Netto:</strong> {formatCurrency(selectedRequest.financial_info.net_worth)}</div>
                  <div><strong>Budget Mensile Investimenti:</strong> {formatCurrency(selectedRequest.financial_info.monthly_investment_budget)}</div>
                  <div><strong>Fondo di Emergenza:</strong> {formatCurrency(selectedRequest.financial_info.emergency_fund)}</div>
                  <div><strong>Debito Totale:</strong> {formatCurrency(selectedRequest.financial_info.debt_amount)}</div>
                  <div><strong>Credit Score:</strong> {selectedRequest.financial_info.credit_score || 'N/A'}</div>
                  <div><strong>Stato Occupazionale:</strong> {selectedRequest.financial_info.employment_status || 'N/A'}</div>
                  <div><strong>Datore di Lavoro:</strong> {selectedRequest.financial_info.employer_name || 'N/A'}</div>
                  <div><strong>Posizione:</strong> {selectedRequest.financial_info.job_title || 'N/A'}</div>
                  <div><strong>Anni di Impiego:</strong> {selectedRequest.financial_info.years_employed || 'N/A'}</div>
                  <div><strong>Fonte dei Fondi:</strong> {selectedRequest.financial_info.source_of_funds || 'N/A'}</div>
                  <div><strong>Residenza Fiscale:</strong> {selectedRequest.financial_info.tax_residency || 'N/A'}</div>
                  <div><strong>Esperienza Investimenti:</strong> {selectedRequest.financial_info.investment_experience || 'N/A'}</div>
                  <div><strong>Tolleranza al Rischio:</strong> {selectedRequest.financial_info.risk_tolerance || 'N/A'}</div>
                </div>
              </div>

              {/* Investment Profile */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem', color: '#7c3aed' }}>
                  Profilo di Investimento
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '14px' }}>
                  <div><strong>Totale Investito:</strong> {formatCurrency(selectedRequest.investment_profile.total_invested)}</div>
                  <div><strong>Profilo di Rischio:</strong> {selectedRequest.investment_profile.risk_profile || 'N/A'}</div>
                </div>
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
                  Chiudi
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