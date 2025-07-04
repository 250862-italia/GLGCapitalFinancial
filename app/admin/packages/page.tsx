"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(emptyForm());
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  function emptyForm() {
    return {
      id: null,
      name: '',
      description: '',
      price: '',
      daily_return: '',
      duration: '',
      min_investment: '',
      max_investment: '',
      currency: 'USD',
      category: '',
      is_active: true
    };
  }

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line
  }, []);

  async function fetchPackages() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setPackages(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyForm());
    setIsEdit(false);
    setShowModal(true);
  }
  function openEdit(pkg: any) {
    setForm({ ...pkg });
    setIsEdit(true);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setForm(emptyForm());
    setIsEdit(false);
  }

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    let res;
    if (isEdit && form.id) {
      res = await supabase.from('packages').update({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        daily_return: Number(form.daily_return),
        duration: Number(form.duration),
        min_investment: Number(form.min_investment),
        max_investment: Number(form.max_investment),
        currency: form.currency,
        category: form.category,
        is_active: form.is_active
      }).eq('id', form.id);
    } else {
      res = await supabase.from('packages').insert([
        {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          daily_return: Number(form.daily_return),
          duration: Number(form.duration),
          min_investment: Number(form.min_investment),
          max_investment: Number(form.max_investment),
          currency: form.currency,
          category: form.category,
          is_active: form.is_active
        }
      ]);
    }
    if (res.error) setError(res.error.message);
    else closeModal();
    setSaving(false);
    fetchPackages();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Sei sicuro di voler eliminare questo pacchetto?')) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) setError(error.message);
    setSaving(false);
    fetchPackages();
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Pacchetti Investimento</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>Gestisci i pacchetti disponibili per gli investitori.</p>
        </div>
        <button onClick={openAdd} style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', border: 0, borderRadius: 8, fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>+ Aggiungi Pacchetto</button>
      </div>
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8, marginBottom: 24, fontWeight: 600 }}>{error}</div>}
      {loading ? (
        <div style={{ color: '#2563eb', fontWeight: 600, fontSize: 20 }}>Caricamento...</div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 24px rgba(30,41,59,0.07)', borderRadius: 16, background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1e293b', position: 'sticky' as const, top: 0, zIndex: 1 }}>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Descrizione</th>
                <th style={thStyle}>Prezzo</th>
                <th style={thStyle}>Rend. Giornaliero</th>
                <th style={thStyle}>Durata</th>
                <th style={thStyle}>Min. Invest.</th>
                <th style={thStyle}>Max Invest.</th>
                <th style={thStyle}>Categoria</th>
                <th style={thStyle}>Stato</th>
                <th style={thStyle}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id} style={{ background: pkg.is_active ? '#f0fdf4' : '#fff', borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}>
                  <td style={tdStyle}>{pkg.name}</td>
                  <td style={{ ...tdStyle, maxWidth: 220, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.description}</td>
                  <td style={tdStyle}>{pkg.price?.toLocaleString('it-IT', { style: 'currency', currency: pkg.currency || 'USD' })}</td>
                  <td style={tdStyle}>{(pkg.daily_return)?.toLocaleString('it-IT', { style: 'percent', minimumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>{pkg.duration} mesi</td>
                  <td style={tdStyle}>{pkg.min_investment}</td>
                  <td style={tdStyle}>{pkg.max_investment}</td>
                  <td style={tdStyle}><span style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>{pkg.category}</span></td>
                  <td style={tdStyle}>
                    <span style={{ background: pkg.is_active ? '#bbf7d0' : '#fee2e2', color: pkg.is_active ? '#16a34a' : '#b91c1c', borderRadius: 6, padding: '2px 10px', fontWeight: 700 }}>
                      {pkg.is_active ? 'Attivo' : 'Non attivo'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(pkg)} style={actionBtnStyle}>Modifica</button>
                    <button onClick={() => handleDelete(pkg.id)} style={{ ...actionBtnStyle, background: '#dc2626', color: '#fff', marginLeft: 8 }}>Elimina</button>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 32, color: '#64748b', fontWeight: 600 }}>Nessun pacchetto trovato.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{isEdit ? 'Modifica Pacchetto' : 'Nuovo Pacchetto'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <textarea required placeholder="Descrizione" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: 60 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <input required type="number" placeholder="Prezzo" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
                <input required type="number" step="0.001" placeholder="Rend. Giornaliero" value={form.daily_return} onChange={e => setForm({ ...form, daily_return: e.target.value })} style={inputStyle} />
                <input required type="number" placeholder="Durata (mesi)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input required type="number" placeholder="Min. Invest." value={form.min_investment} onChange={e => setForm({ ...form, min_investment: e.target.value })} style={inputStyle} />
                <input required type="number" placeholder="Max Invest." value={form.max_investment} onChange={e => setForm({ ...form, max_investment: e.target.value })} style={inputStyle} />
                <input required placeholder="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{ fontWeight: 600 }}>Attivo</label>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} style={inputStyle}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" disabled={saving} style={{ ...actionBtnStyle, background: '#2563eb', color: '#fff', flex: 1 }}>{saving ? 'Salva...' : 'Salva'}</button>
                <button type="button" onClick={closeModal} style={{ ...actionBtnStyle, background: '#64748b', color: '#fff', flex: 1 }}>Annulla</button>
              </div>
            </form>
          </div>
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
  textAlign: 'left' as const,
  background: '#f1f5f9',
  position: 'sticky' as const,
  top: 0,
  zIndex: 1
};

const tdStyle = {
  padding: '14px 10px',
  fontSize: 15,
  borderBottom: '1px solid #e5e7eb',
  background: 'inherit',
  maxWidth: 220,
  verticalAlign: 'top'
};

const actionBtnStyle = {
  background: '#f1f5f9',
  color: '#2563eb',
  border: 'none',
  borderRadius: 6,
  padding: '6px 14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 15,
  transition: 'background 0.2s, color 0.2s'
};

const modalOverlayStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(30,41,59,0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(30,41,59,0.18)',
  padding: 32,
  minWidth: 340,
  maxWidth: 480
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #e5e7eb',
  fontSize: 15,
  width: '100%'
}; 