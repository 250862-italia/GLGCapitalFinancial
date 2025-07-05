"use client";
import { useState, useEffect } from 'react';
import { 
  FileText, 
  Mail, 
  User, 
  Phone, 
  Building, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface InformationalRequest {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  additionalNotes: string | null;
  status: 'PENDING' | 'PROCESSED' | 'COMPLETED' | 'CANCELLED';
  emailSent: boolean;
  emailSentAt: string | null;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function InformationalRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<InformationalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<InformationalRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/admin/informational-requests');
      
      if (!response.ok) {
        throw new Error('Failed to load requests');
      }

      const result = await response.json();
      setRequests(result.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/informational-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          processedBy: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      // Reload requests
      await loadRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      setError('Failed to update request');
    }
  };

  const resendEmail = async (request: InformationalRequest) => {
    try {
      const response = await fetch('/api/admin/informational-requests/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resend email');
      }

      // Reload requests
      await loadRequests();
    } catch (error) {
      console.error('Error resending email:', error);
      setError('Failed to resend email');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.country && request.country.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} color="#059669" />;
      case 'PROCESSED':
        return <CheckCircle size={16} color="#3b82f6" />;
      case 'PENDING':
        return <Clock size={16} color="#f59e0b" />;
      case 'CANCELLED':
        return <XCircle size={16} color="#dc2626" />;
      default:
        return <AlertCircle size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#059669';
      case 'PROCESSED':
        return '#3b82f6';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELLED':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <span style={{ marginLeft: '1rem' }}>Loading requests...</span>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 700, 
              color: '#1f2937', 
              marginBottom: '0.5rem' 
            }}>
              Informational Requests
            </h1>
            <p style={{ color: '#6b7280' }}>
              Manage client requests for GLG Equity Pledge documentation
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            background: 'white',
            padding: '0.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>
              Total: {requests.length}
            </span>
            <span style={{ fontWeight: 600, color: '#059669' }}>
              Pending: {requests.filter(r => r.status === 'PENDING').length}
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#dc2626'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search by name, email, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: '16px'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '16px',
              minWidth: '150px'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSED">Processed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Requests Table */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
            gap: '1rem',
            fontWeight: 600,
            color: '#374151',
            fontSize: '14px'
          }}>
            <div>Client</div>
            <div>Contact</div>
            <div>Country</div>
            <div>Status</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          {filteredRequests.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                  gap: '1rem',
                  alignItems: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Client */}
                <div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>
                    {request.firstName} {request.lastName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {request.country && request.city ? `${request.city}, ${request.country}` : 'Location not specified'}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {request.email}
                  </div>
                  {request.phone && (
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {request.phone}
                    </div>
                  )}
                </div>

                {/* Country */}
                <div>
                  {request.country && (
                    <div style={{ fontSize: '14px', color: '#1f2937' }}>
                      {request.country}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getStatusIcon(request.status)}
                  <span style={{ 
                    color: getStatusColor(request.status),
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {request.status}
                  </span>
                </div>

                {/* Date */}
                <div>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(request.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                  >
                    View
                  </button>

                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'PROCESSED')}
                      style={{
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
                    >
                      Process
                    </button>
                  )}

                  {!request.emailSent && (
                    <button
                      onClick={() => resendEmail(request)}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#d97706'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#f59e0b'}
                    >
                      <Send size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Request Details Modal */}
        {selectedRequest && (
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
            zIndex: 1000,
            padding: '2rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: '2rem',
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>
                  Request Details
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Client Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>Name</label>
                      <div style={{ fontWeight: 500 }}>
                        {selectedRequest.firstName} {selectedRequest.lastName}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>Email</label>
                      <div style={{ fontWeight: 500 }}>{selectedRequest.email}</div>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>Phone</label>
                      <div style={{ fontWeight: 500 }}>
                        {selectedRequest.phone || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>Location</label>
                      <div style={{ fontWeight: 500 }}>
                        {selectedRequest.city && selectedRequest.country 
                          ? `${selectedRequest.city}, ${selectedRequest.country}`
                          : 'Not provided'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRequest.additionalNotes && (
                  <div>
                    <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                      Additional Notes
                    </h3>
                    <div style={{ 
                      background: '#f9fafb', 
                      padding: '1rem', 
                      borderRadius: 8,
                      fontSize: '14px',
                      lineHeight: '1.6'
                    }}>
                      {selectedRequest.additionalNotes}
                    </div>
                  </div>
                )}

                <div>
                  <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Request Status
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>Status</label>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontWeight: 500,
                        color: getStatusColor(selectedRequest.status)
                      }}>
                        {getStatusIcon(selectedRequest.status)}
                        {selectedRequest.status}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>Email Sent</label>
                      <div style={{ fontWeight: 500 }}>
                        {selectedRequest.emailSent ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', color: '#6b7280' }}>Created</label>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(selectedRequest.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {selectedRequest.processedAt && (
                      <div>
                        <label style={{ fontSize: '14px', color: '#6b7280' }}>Processed</label>
                        <div style={{ fontWeight: 500 }}>
                          {new Date(selectedRequest.processedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'flex-end',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1.5rem'
                }}>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    style={{
                      background: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                  {selectedRequest.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'PROCESSED');
                        setSelectedRequest(null);
                      }}
                      style={{
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Mark as Processed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  );
} 