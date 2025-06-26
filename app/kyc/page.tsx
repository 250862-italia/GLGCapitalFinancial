"use client";

import { useState } from 'react';

export default function KYCPage() {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [residenceFile, setResidenceFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Qui andrebbe la logica di upload su Supabase Storage
    setSubmitted(true);
    setStatus('pending');
  };

  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h1>KYC Verification</h1>
      <p style={{ color: '#0a2540', marginBottom: 24 }}>
        Please upload the required documents to complete your KYC (Know Your Customer) verification. Your documents will be securely stored and accessible only to authorized personnel.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: 24 }}>
        <label>
          Identity Document (ID Card or Passport):
          <input type="file" accept="image/*,application/pdf" required onChange={e => setIdFile(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: 8 }} />
        </label>
        <label>
          Proof of Residence:
          <input type="file" accept="image/*,application/pdf" required onChange={e => setResidenceFile(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: 8 }} />
        </label>
        <button type="submit" style={{ background: '#0a2540', color: '#fff', padding: '0.75rem', border: 'none', borderRadius: 4, fontWeight: 600 }}>
          Submit Documents
        </button>
      </form>
      {submitted && (
        <div style={{ marginBottom: 24, color: '#1a3556', fontWeight: 600 }}>
          Documents submitted! Your KYC status is: <span style={{ color: status === 'verified' ? 'green' : status === 'rejected' ? 'red' : '#bfa500' }}>{status.toUpperCase()}</span>
        </div>
      )}
      <div style={{ fontSize: 14, color: '#555', marginTop: 24 }}>
        <strong>Privacy Notice:</strong> Your documents are encrypted and securely stored. Only authorized staff can access them. You can request deletion at any time in accordance with privacy regulations.
      </div>
    </main>
  );
}
