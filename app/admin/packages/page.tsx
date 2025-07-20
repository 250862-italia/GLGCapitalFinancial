"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from 'react';

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
      min_investment: '',
      max_investment: '',
      duration_months: '',
      expected_return: '',
      status: 'active'
    };
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/packages', {
        headers: {
          'x-admin-session': adminToken
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch packages');
      }

      const data = await response.json();
      setPackages(data.packages || []);
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || err?.error || 'Failed to fetch packages';
      setError(errorMessage);
    }
    
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
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found. Please login again.');
        setSaving(false);
        return;
      }

      const packageData = {
        name: form.name,
        description: form.description,
        min_investment: Number(form.min_investment),
        max_investment: Number(form.max_investment),
        duration_months: Number(form.duration_months),
        expected_return: Number(form.expected_return),
        status: form.status
      };

      let response;
      if (isEdit && form.id) {
        // Update existing package
        response = await fetch('/api/admin/packages', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-session': adminToken
          },
          body: JSON.stringify({
            id: form.id,
            ...packageData
          })
        });
      } else {
        // Create new package
        response = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-session': adminToken
          },
          body: JSON.stringify(packageData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save package');
      }

      closeModal();
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || err?.error || 'Failed to save package';
      setError(errorMessage);
    }
    
    setSaving(false);
    fetchPackages();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Sei sicuro di voler eliminare questo pacchetto?')) return;
    setSaving(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found. Please login again.');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/packages?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-session': adminToken
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete package');
      }

      console.log('Package deleted successfully');
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : err?.message || err?.error || 'Failed to delete package';
      setError(errorMessage);
    }
    
    setSaving(false);
    fetchPackages();
  }

  const containerStyle = { maxWidth: 1200, margin: '0 auto', padding: '20px' };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
  const titleStyle = { fontSize: '24px', fontWeight: 'bold', color: '#1f2937' };
  const buttonStyle = { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
  const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
  const thStyle: CSSProperties = { background: '#f8fafc', padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid #f3f4f6' };
  const actionBtnStyle = { background: '#059669', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' };
  const modalStyle: CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalContentStyle = { background: '#fff', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' };
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' };

  if (error) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
    return <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '24px', borderRadius: '8px', margin: '40px auto', maxWidth: 600, fontSize: 18 }}>{errorMessage}</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Gestione Pacchetti Investimento</h1>
        <button onClick={openAdd} style={buttonStyle}>Aggiungi Pacchetto</button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Caricamento...</div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Descrizione</th>
              <th style={thStyle}>Min Invest.</th>
              <th style={thStyle}>Max Invest.</th>
              <th style={thStyle}>Durata (mesi)</th>
              <th style={thStyle}>Rendimento (%)</th>
              <th style={thStyle}>Stato</th>
              <th style={thStyle}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} style={{ background: pkg.status === 'active' ? '#f0fdf4' : '#fff', borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}>
                <td style={tdStyle}>{pkg.name}</td>
                <td style={{ ...tdStyle, maxWidth: 220, whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.description}</td>
                <td style={tdStyle}>€{pkg.min_investment?.toLocaleString()}</td>
                <td style={tdStyle}>€{pkg.max_investment?.toLocaleString()}</td>
                <td style={tdStyle}>{pkg.duration_months} mesi</td>
                <td style={tdStyle}>{pkg.expected_return}%</td>
                <td style={tdStyle}>
                  <span style={{ 
                    background: pkg.status === 'active' ? '#bbf7d0' : pkg.status === 'inactive' ? '#fee2e2' : '#fef3c7', 
                    color: pkg.status === 'active' ? '#16a34a' : pkg.status === 'inactive' ? '#b91c1c' : '#d97706', 
                    borderRadius: 6, 
                    padding: '2px 10px', 
                    fontWeight: 700 
                  }}>
                    {pkg.status === 'active' ? 'Attivo' : pkg.status === 'inactive' ? 'Non attivo' : 'Esaurito'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => openEdit(pkg)} style={actionBtnStyle}>Modifica</button>
                  <button onClick={() => handleDelete(pkg.id)} style={{ ...actionBtnStyle, background: '#dc2626', color: '#fff', marginLeft: 8 }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              {isEdit ? 'Modifica Pacchetto' : 'Aggiungi Pacchetto'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label>
                  Nome Pacchetto*
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </label>
                <label>
                  Descrizione*
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} />
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ flex: 1 }}>
                    Min. Investimento (€)*
                    <input required type="number" value={form.min_investment} onChange={e => setForm({ ...form, min_investment: e.target.value })} style={inputStyle} />
                  </label>
                  <label style={{ flex: 1 }}>
                    Max. Investimento (€)*
                    <input required type="number" value={form.max_investment} onChange={e => setForm({ ...form, max_investment: e.target.value })} style={inputStyle} />
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ flex: 1 }}>
                    Durata (mesi)*
                    <input required type="number" value={form.duration_months} onChange={e => setForm({ ...form, duration_months: e.target.value })} style={inputStyle} />
                  </label>
                  <label style={{ flex: 1 }}>
                    Rendimento Atteso (%)*
                    <input required type="number" step="0.01" value={form.expected_return} onChange={e => setForm({ ...form, expected_return: e.target.value })} style={inputStyle} />
                  </label>
                </div>
                <label>
                  Stato
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                    <option value="active">Attivo</option>
                    <option value="inactive">Non attivo</option>
                    <option value="sold_out">Esaurito</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="submit" disabled={saving} style={{ ...actionBtnStyle, background: '#2563eb', color: '#fff', flex: 1, padding: '12px' }}>{saving ? 'Salva...' : 'Salva'}</button>
                <button type="button" onClick={closeModal} style={{ ...actionBtnStyle, background: '#64748b', color: '#fff', flex: 1, padding: '12px' }}>Annulla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 