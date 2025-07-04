"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Download, User, Shield, Plus, Edit, Trash2, Search, Filter, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

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
}

export default function AdminKYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKYC = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('kyc_records')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRecords(data || []);
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>KYC Management</h1>
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
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Client ID</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Document Type</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Document Number</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Status</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Document</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 12 }}>{app.client_id}</td>
                <td style={{ padding: 12 }}>{app.document_type}</td>
                <td style={{ padding: 12 }}>{app.document_number}</td>
                <td style={{ padding: 12 }}>{app.status}</td>
                <td style={{ padding: 12 }}>
                  {app.document_image_url ? (
                    <a href={app.document_image_url} target="_blank" rel="noopener noreferrer">View</a>
                  ) : '-' }
                </td>
                <td style={{ padding: 12 }}>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(app.id, 'approved')} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', marginRight: 8, cursor: 'pointer', fontWeight: 600 }}>Approva</button>
                      <button onClick={() => updateStatus(app.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 }}>Rifiuta</button>
                    </>
                  )}
                  {app.status === 'approved' && <span style={{ color: '#10b981', fontWeight: 700 }}>Approvata</span>}
                  {app.status === 'rejected' && <span style={{ color: '#ef4444', fontWeight: 700 }}>Rifiutata</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 