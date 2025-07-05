"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Download, User, Shield, Plus, Edit, Trash2, Search, Filter, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface KYCRecord {
  id: string;
  client_id: string;
  document_type: string;
  document_number: string;
  document_image_url: string;
  status: string;
  notes?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    nationality: string;
  };
}

export default function AdminKYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadingSchema, setReloadingSchema] = useState(false);

  useEffect(() => {
    const fetchKYC = async () => {
      setLoading(true);
      setError(null);
      try {
        // First get KYC records
        const { data: kycData, error: kycError } = await supabase
          .from('kyc_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (kycError) throw kycError;

        // Then get client data for each KYC record
        const recordsWithClients = await Promise.all(
          (kycData || []).map(async (record) => {
            const { data: clientData } = await supabase
              .from('clients')
              .select('first_name, last_name, email, phone, date_of_birth, nationality')
              .eq('id', record.client_id)
              .single();

            return {
              ...record,
              clients: clientData || null
            };
          })
        );

        setRecords(recordsWithClients);
      } catch (err: any) {
        setError(err.message || 'Errore nel caricamento delle KYC');
      } finally {
        setLoading(false);
      }
    };
    fetchKYC();
  }, []);

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
      // Reload the page data
      window.location.reload();
    } catch (error) {
      console.error('Schema reload error:', error);
      alert('Error reloading schema cache. Please try again.');
    } finally {
      setReloadingSchema(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: '#dc2626' }}>{error}</p>
      ) : records.length === 0 ? (
        <p>No KYC records found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Client</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Document Type</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Document Number</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Status</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Notes</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Document</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 12 }}>
                  <div>
                    <strong>{app.clients?.first_name} {app.clients?.last_name}</strong>
                    <br />
                    <small style={{ color: '#6b7280' }}>{app.clients?.email}</small>
                    <br />
                    <small style={{ color: '#6b7280' }}>{app.clients?.phone}</small>
                  </div>
                </td>
                <td style={{ padding: 12 }}>{app.document_type}</td>
                <td style={{ padding: 12 }}>{app.document_number}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    background: app.status === 'approved' ? '#bbf7d0' : 
                               app.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                    color: app.status === 'approved' ? '#16a34a' : 
                          app.status === 'rejected' ? '#dc2626' : '#b45309',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {app.status}
                  </span>
                </td>
                <td style={{ padding: 12, maxWidth: 200 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {app.notes ? (
                      <div style={{ wordBreak: 'break-word' }}>
                        {app.notes.length > 100 ? 
                          `${app.notes.substring(0, 100)}...` : 
                          app.notes
                        }
                      </div>
                    ) : '-'}
                  </div>
                </td>
                <td style={{ padding: 12 }}>
                  {app.document_image_url ? (
                    <a href={app.document_image_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View</a>
                  ) : '-' }
                </td>
                <td style={{ padding: 12 }}>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(app.id, 'approved')} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', marginRight: 8, cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                      <button onClick={() => updateStatus(app.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                    </>
                  )}
                  {app.status === 'approved' && <span style={{ color: '#10b981', fontWeight: 700 }}>Approved</span>}
                  {app.status === 'rejected' && <span style={{ color: '#ef4444', fontWeight: 700 }}>Rejected</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 