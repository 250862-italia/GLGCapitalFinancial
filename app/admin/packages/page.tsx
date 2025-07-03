"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: null,
    nome: '',
    descrizione: '',
    percentuale: '',
    minimo: '',
    massimo: ''
  });
  const [editing, setEditing] = useState(false);

  // Fetch packages
  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('packages').select('*').order('id', { ascending: true });
      console.log('DEBUG: Risposta Supabase', { data, error });
      if (error) setError(error.message);
      else setPackages(data || []);
    } catch (e) {
      console.error('DEBUG: Errore JS fetchPackages', e);
      setError((e as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  // Handle form input
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update package
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editing && form.id) {
        // Update
        const { error } = await supabase.from('packages').update({
          nome: form.nome,
          descrizione: form.descrizione,
          percentuale: form.percentuale,
          minimo: form.minimo,
          massimo: form.massimo
        }).eq('id', form.id);
        if (error) setError(error.message);
      } else {
        // Insert
        const { error } = await supabase.from('packages').insert([
          {
            nome: form.nome,
            descrizione: form.descrizione,
            percentuale: form.percentuale,
            minimo: form.minimo,
            massimo: form.massimo
          }
        ]);
        if (error) setError(error.message);
      }
      setForm({ id: null, nome: '', descrizione: '', percentuale: '', minimo: '', massimo: '' });
      setEditing(false);
      await fetchPackages();
    } catch (e) {
      console.error('DEBUG: Errore JS handleSubmit', e);
      setError((e as Error).message);
    }
    setLoading(false);
  };

  // Edit package
  const handleEdit = (pkg: any) => {
    setForm(pkg);
    setEditing(true);
  };

  // Delete package
  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) setError(error.message);
      await fetchPackages();
    } catch (e) {
      console.error('DEBUG: Errore JS handleDelete', e);
      setError((e as Error).message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h1>Gestione Pacchetti</h1>
      {loading && <div style={{ background: '#e0e7ff', color: '#3730a3', padding: 12, fontWeight: 600, marginBottom: 16 }}>Caricamento...</div>}
      {error && <div style={{ background: '#fee', color: '#900', padding: 16, fontWeight: 700, marginBottom: 16 }}>ERRORE: {error}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 32, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
        <h2>{editing ? 'Modifica Pacchetto' : 'Nuovo Pacchetto'}</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="percentuale" placeholder="%" value={form.percentuale} onChange={handleChange} required style={{ width: 80 }} />
          <input name="minimo" placeholder="Minimo" value={form.minimo} onChange={handleChange} required style={{ width: 100 }} />
          <input name="massimo" placeholder="Massimo" value={form.massimo} onChange={handleChange} required style={{ width: 100 }} />
        </div>
        <textarea name="descrizione" placeholder="Descrizione" value={form.descrizione} onChange={handleChange} required style={{ width: '100%', marginTop: 8 }} />
        <div style={{ marginTop: 8 }}>
          <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', border: 0, borderRadius: 4, fontWeight: 600 }}>
            {editing ? 'Salva Modifiche' : 'Aggiungi Pacchetto'}
          </button>
          {editing && <button type="button" onClick={() => { setForm({ id: null, nome: '', descrizione: '', percentuale: '', minimo: '', massimo: '' }); setEditing(false); }} style={{ marginLeft: 8 }}>Annulla</button>}
        </div>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Nome</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Descrizione</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>%</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Minimo</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Massimo</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{pkg.nome}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{pkg.descrizione}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{pkg.percentuale}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{pkg.minimo}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{pkg.massimo}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                <button onClick={() => handleEdit(pkg)} style={{ marginRight: 8 }}>Modifica</button>
                <button onClick={() => handleDelete(pkg.id)} style={{ color: '#b91c1c' }}>Elimina</button>
              </td>
            </tr>
          ))}
          {packages.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>Nessun pacchetto presente.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 