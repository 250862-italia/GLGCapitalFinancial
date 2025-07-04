"use client";
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

export default function AdminPackagesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Variabili d'ambiente Supabase mancanti.");
      setLoading(false);
      return;
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabase.from('packages').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setPackages(data || []);
        setLoading(false);
      });
  }, [supabaseUrl, supabaseAnonKey]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, color: '#1e293b' }}>Pacchetti Investimento</h1>
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8, marginBottom: 24, fontWeight: 600 }}>{error}</div>}
      {loading ? (
        <div style={{ color: '#2563eb', fontWeight: 600, fontSize: 20 }}>Caricamento...</div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 24px rgba(30,41,59,0.07)', borderRadius: 16, background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1e293b' }}>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Descrizione</th>
                <th style={thStyle}>Prezzo</th>
                <th style={thStyle}>Rend. Giornaliero</th>
                <th style={thStyle}>Durata (mesi)</th>
                <th style={thStyle}>Min. Invest.</th>
                <th style={thStyle}>Max Invest.</th>
                <th style={thStyle}>Categoria</th>
                <th style={thStyle}>Stato</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id} style={{ background: pkg.is_active || pkg.active || pkg.isActive ? '#f0fdf4' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{pkg.name}</td>
                  <td style={{ ...tdStyle, maxWidth: 220, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.description}</td>
                  <td style={tdStyle}>{pkg.price?.toLocaleString('it-IT', { style: 'currency', currency: pkg.currency || 'USD' })}</td>
                  <td style={tdStyle}>{(pkg.daily_return || pkg.dailyReturn)?.toLocaleString('it-IT', { style: 'percent', minimumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>{pkg.duration}</td>
                  <td style={tdStyle}>{pkg.min_investment || pkg.minInvestment}</td>
                  <td style={tdStyle}>{pkg.max_investment || pkg.maxInvestment}</td>
                  <td style={tdStyle}>{pkg.category}</td>
                  <td style={{ ...tdStyle, color: (pkg.is_active || pkg.active || pkg.isActive) ? '#16a34a' : '#b91c1c', fontWeight: 700 }}>
                    {(pkg.is_active || pkg.active || pkg.isActive) ? 'Attivo' : 'Non attivo'}
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#64748b', fontWeight: 600 }}>Nessun pacchetto trovato.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '16px 12px',
  fontWeight: 700,
  fontSize: 16,
  borderBottom: '2px solid #e5e7eb',
  textAlign: 'left',
  background: '#f1f5f9',
};

const tdStyle = {
  padding: '14px 10px',
  fontSize: 15,
  borderBottom: '1px solid #e5e7eb',
  background: 'inherit',
}; 