"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, User, Shield, AlertTriangle, CheckCircle, XCircle, Clock, BarChart3, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuditEvent {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending';
}

interface AuditStats {
  total_events: number;
  by_action: Record<string, number>;
  by_severity: Record<string, number>;
  by_status: Record<string, number>;
  by_day: Record<string, number>;
}

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditStats>({
    total_events: 0,
    by_action: {},
    by_severity: {},
    by_status: {},
    by_day: {}
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  const fetchAuditEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch audit events
      const { data: auditData, error: auditError } = await supabase
        .from('audit_trail')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (auditError) throw auditError;

      setEvents(auditData || []);
      setFilteredEvents(auditData || []);
      
      // Calculate statistics
      const stats: AuditStats = {
        total_events: auditData?.length || 0,
        by_action: {},
        by_severity: {},
        by_status: {},
        by_day: {}
      };

      auditData?.forEach((event: AuditEvent) => {
        // Count by action
        stats.by_action[event.action] = (stats.by_action[event.action] || 0) + 1;
        
        // Count by severity
        stats.by_severity[event.severity] = (stats.by_severity[event.severity] || 0) + 1;
        
        // Count by status
        stats.by_status[event.status] = (stats.by_status[event.status] || 0) + 1;
        
        // Count by day
        const day = event.timestamp.split('T')[0];
        stats.by_day[day] = (stats.by_day[day] || 0) + 1;
      });

      setStats(stats);
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento dell\'audit trail');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(event => event.action === actionFilter);
    }

    // Entity type filter
    if (entityTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.entity_type === entityTypeFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(event => new Date(event.timestamp) >= today);
          break;
        case 'week':
          filtered = filtered.filter(event => new Date(event.timestamp) >= weekAgo);
          break;
        case 'month':
          filtered = filtered.filter(event => new Date(event.timestamp) >= monthAgo);
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, actionFilter, entityTypeFilter, severityFilter, statusFilter, dateFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: '#fee2e2', color: '#dc2626' };
      case 'high': return { bg: '#fef3c7', color: '#d97706' };
      case 'medium': return { bg: '#dbeafe', color: '#2563eb' };
      case 'low': return { bg: '#f0fdf4', color: '#16a34a' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'failure': return { bg: '#fee2e2', color: '#dc2626' };
      case 'pending': return { bg: '#fef3c7', color: '#d97706' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('approved')) return <CheckCircle size={16} />;
    if (action.includes('rejected')) return <XCircle size={16} />;
    if (action.includes('pending')) return <Clock size={16} />;
    if (action.includes('error')) return <AlertTriangle size={16} />;
    if (action.includes('upload')) return <Shield size={16} />;
    return <User size={16} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportAuditTrail = () => {
    const csvData = filteredEvents.map(event => ({
      'ID': event.id,
      'User ID': event.user_id,
      'Action': event.action,
      'Entity Type': event.entity_type,
      'Entity ID': event.entity_id,
      'Severity': event.severity,
      'Status': event.status,
      'Timestamp': formatDate(event.timestamp),
      'Details': JSON.stringify(event.details)
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Audit Trail</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={fetchAuditEvents}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={16} />
            Aggiorna
          </button>
          <button 
            onClick={exportAuditTrail}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={16} />
            Esporta CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BarChart3 size={20} color="#3b82f6" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Totale Eventi</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.total_events}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={20} color="#16a34a" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Successi</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{stats.by_status.success || 0}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <XCircle size={20} color="#dc2626" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Errori</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{stats.by_status.failure || 0}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} color="#d97706" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Alta Severità</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>
            {(stats.by_severity.high || 0) + (stats.by_severity.critical || 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
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
            placeholder="Cerca per user ID, azione, entità..."
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
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            background: 'white'
          }}
        >
          <option value="all">Tutte le azioni</option>
          <option value="kyc_submitted">KYC Submitted</option>
          <option value="kyc_approved">KYC Approved</option>
          <option value="kyc_rejected">KYC Rejected</option>
          <option value="kyc_document_uploaded">Document Uploaded</option>
          <option value="system_error">System Error</option>
        </select>

        <select
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            background: 'white'
          }}
        >
          <option value="all">Tutti i tipi</option>
          <option value="kyc_record">KYC Record</option>
          <option value="client">Client</option>
          <option value="document">Document</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            background: 'white'
          }}
        >
          <option value="all">Tutte le severità</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

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
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            background: 'white'
          }}
        >
          <option value="all">Tutte le date</option>
          <option value="today">Oggi</option>
          <option value="week">Ultima settimana</option>
          <option value="month">Ultimo mese</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: 14, color: '#6b7280' }}>
          {filteredEvents.length} di {events.length} eventi
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <p>Caricamento audit trail...</p>
        </div>
      ) : error ? (
        <p style={{ color: '#dc2626' }}>{error}</p>
      ) : filteredEvents.length === 0 ? (
        <p>Nessun evento audit trovato.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Azione</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>User ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Entità</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Severità</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Stato</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Timestamp</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getActionIcon(event.action)}
                      <span style={{ fontWeight: 600 }}>{event.action}</span>
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <code style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: 12 }}>
                      {event.user_id}
                    </code>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{event.entity_type}</div>
                      <small style={{ color: '#6b7280' }}>{event.entity_id}</small>
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    {(() => {
                      const colors = getSeverityColor(event.severity);
                      return (
                        <span style={{
                          background: colors.bg,
                          color: colors.color,
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {event.severity}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: 12 }}>
                    {(() => {
                      const colors = getStatusColor(event.status);
                      return (
                        <span style={{
                          background: colors.bg,
                          color: colors.color,
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {event.status}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: 12 }}>
                    <small style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {formatDate(event.timestamp)}
                    </small>
                  </td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Eye size={12} />
                      Dettagli
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal per dettagli evento */}
      {showModal && selectedEvent && (
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
            
            <h2 style={{ marginBottom: '1.5rem' }}>Dettagli Evento Audit</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3>Informazioni Base</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>ID:</strong> {selectedEvent.id}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>User ID:</strong> {selectedEvent.user_id}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Azione:</strong> {selectedEvent.action}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Tipo Entità:</strong> {selectedEvent.entity_type}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>ID Entità:</strong> {selectedEvent.entity_id}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Timestamp:</strong> {formatDate(selectedEvent.timestamp)}
                </div>
              </div>
              
              <div>
                <h3>Stato e Severità</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Severità:</strong> 
                  <span style={{
                    background: getSeverityColor(selectedEvent.severity).bg,
                    color: getSeverityColor(selectedEvent.severity).color,
                    padding: '4px 8px',
                    borderRadius: 4,
                    marginLeft: '0.5rem',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {selectedEvent.severity}
                  </span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Stato:</strong> 
                  <span style={{
                    background: getStatusColor(selectedEvent.status).bg,
                    color: getStatusColor(selectedEvent.status).color,
                    padding: '4px 8px',
                    borderRadius: 4,
                    marginLeft: '0.5rem',
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {selectedEvent.status}
                  </span>
                </div>
                {selectedEvent.ip_address && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>IP Address:</strong> {selectedEvent.ip_address}
                  </div>
                )}
                {selectedEvent.user_agent && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>User Agent:</strong> 
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: '0.25rem' }}>
                      {selectedEvent.user_agent}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <h3>Dettagli</h3>
              <pre style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: 8,
                overflow: 'auto',
                fontSize: 12,
                border: '1px solid #e5e7eb'
              }}>
                {JSON.stringify(selectedEvent.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 