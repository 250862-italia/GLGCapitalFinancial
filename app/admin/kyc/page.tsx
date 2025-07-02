"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Download, User, Shield, Plus, Edit, Trash2, Search, Filter, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface KYCApplication {
  id: string;
  user_id: string;
  personal_info: any;
  financial_profile: any;
  documents: any;
  verification_status: string;
  submitted_at: string;
}

export default function AdminKYCPage() {
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKYC = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('kyc_applications')
          .select('*')
          .order('submitted_at', { ascending: false });
        if (error) throw error;
        setApplications(data || []);
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
        .from('kyc_applications')
        .update({ verification_status: status })
        .eq('id', id);
      if (error) throw error;
      setApplications(prev => prev.map(app => app.id === id ? { ...app, verification_status: status } : app));

      // Recupera la KYC aggiornata per l'email
      const app = applications.find(a => a.id === id);
      const email = app?.personal_info?.email;
      const name = app?.personal_info?.firstName || '';
      if (email) {
        const subject = status === 'approved'
          ? 'La tua KYC è stata approvata'
          : 'La tua KYC è stata rifiutata';
        const body = status === 'approved'
          ? `<p>Ciao ${name},<br/>la tua richiesta KYC è stata <b>APPROVATA</b>. Ora puoi operare liberamente sulla piattaforma.</p>`
          : `<p>Ciao ${name},<br/>la tua richiesta KYC è stata <b>RIFIUTATA</b>. Contatta il supporto per maggiori dettagli.</p>`;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: email, subject, html: body })
        });
      }
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
      ) : applications.length === 0 ? (
        <p>No KYC applications found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>User ID</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Name</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Status</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Submitted At</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>ID Document</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Proof of Address</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Bank Statement</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 12 }}>{app.user_id}</td>
                <td style={{ padding: 12 }}>{app.personal_info?.firstName || '-'}</td>
                <td style={{ padding: 12 }}>{app.verification_status}</td>
                <td style={{ padding: 12 }}>{new Date(app.submitted_at).toLocaleString()}</td>
                <td style={{ padding: 12 }}>
                  {app.documents?.idDocument ? (
                    <a href={app.documents.idDocument} target="_blank" rel="noopener noreferrer">View</a>
                  ) : '-' }
                </td>
                <td style={{ padding: 12 }}>
                  {app.documents?.proofOfAddress ? (
                    <a href={app.documents.proofOfAddress} target="_blank" rel="noopener noreferrer">View</a>
                  ) : '-' }
                </td>
                <td style={{ padding: 12 }}>
                  {app.documents?.bankStatement ? (
                    <a href={app.documents.bankStatement} target="_blank" rel="noopener noreferrer">View</a>
                  ) : '-' }
                </td>
                <td style={{ padding: 12 }}>
                  {app.verification_status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(app.id, 'approved')} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', marginRight: 8, cursor: 'pointer', fontWeight: 600 }}>Approva</button>
                      <button onClick={() => updateStatus(app.id, 'rejected')} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 }}>Rifiuta</button>
                    </>
                  )}
                  {app.verification_status === 'approved' && <span style={{ color: '#10b981', fontWeight: 700 }}>Approvata</span>}
                  {app.verification_status === 'rejected' && <span style={{ color: '#ef4444', fontWeight: 700 }}>Rifiutata</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 