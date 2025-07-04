"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  status: 'active' | 'inactive' | 'pending';
  kycStatus: 'pending' | 'approved' | 'rejected';
  registrationdate: string;
}

const emptyClient = (): Partial<Client> => ({
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  status: 'active',
  kycStatus: 'pending',
  registrationdate: new Date().toISOString().split('T')[0],
});

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Client>>(emptyClient());
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line
  }, []);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('clients').select('*').order('registrationdate', { ascending: false });
    if (error) setError(error.message);
    else setClients(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyClient());
    setIsEdit(false);
    setShowModal(true);
  }
  function openEdit(client: Client) {
    setForm({ ...client });
    setIsEdit(true);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setForm(emptyClient());
    setIsEdit(false);
  }

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    if (!isEdit && clients.some(c => c.email === form.email)) {
      setError("Esiste già un cliente con questa email.");
      setSaving(false);
      return;
    }
    let res;
    if (isEdit && form.id) {
      res = await supabase.from('clients').update({
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        position: form.position,
        status: form.status,
        kycStatus: form.kycStatus,
        registrationdate: form.registrationdate
      }).eq('id', form.id);
    } else {
      res = await supabase.from('clients').insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          position: form.position,
          status: form.status,
          kycStatus: form.kycStatus,
          registrationdate: form.registrationdate
        }
      ]);
    }
    if (res.error) {
      setError(res.error.message);
      setSaving(false);
      console.error('Errore inserimento cliente:', res.error);
      return;
    } else {
      setSuccessMsg(isEdit ? 'Cliente aggiornato con successo!' : 'Cliente aggiunto con successo!');
      closeModal();
      fetchClients();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) setError(error.message);
    setSaving(false);
    fetchClients();
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Gestione Clienti</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>Visualizza, aggiungi, modifica o elimina i clienti.</p>
        </div>
        <button onClick={openAdd} style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', border: 0, borderRadius: 8, fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>+ Aggiungi Cliente</button>
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
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Telefono</th>
                <th style={thStyle}>Azienda</th>
                <th style={thStyle}>Ruolo</th>
                <th style={thStyle}>Stato</th>
                <th style={thStyle}>KYC</th>
                <th style={thStyle}>Registrato il</th>
                <th style={thStyle}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}>
                  <td style={tdStyle}>{client.name}</td>
                  <td style={tdStyle}>{client.email}</td>
                  <td style={tdStyle}>{client.phone}</td>
                  <td style={tdStyle}>{client.company}</td>
                  <td style={tdStyle}>{client.position}</td>
                  <td style={tdStyle}><span style={{ background: client.status === 'active' ? '#bbf7d0' : client.status === 'pending' ? '#fef3c7' : '#fee2e2', color: client.status === 'active' ? '#16a34a' : client.status === 'pending' ? '#b45309' : '#b91c1c', borderRadius: 6, padding: '2px 10px', fontWeight: 700 }}>{client.status}</span></td>
                  <td style={tdStyle}><span style={{ background: client.kycStatus === 'approved' ? '#bbf7d0' : client.kycStatus === 'pending' ? '#fef3c7' : '#fee2e2', color: client.kycStatus === 'approved' ? '#16a34a' : client.kycStatus === 'pending' ? '#b45309' : '#b91c1c', borderRadius: 6, padding: '2px 10px', fontWeight: 700 }}>{client.kycStatus}</span></td>
                  <td style={tdStyle}>{client.registrationdate}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(client)} style={actionBtnStyle}>Modifica</button>
                    <button onClick={() => handleDelete(client.id)} style={{ ...actionBtnStyle, background: '#dc2626', color: '#fff', marginLeft: 8 }}>Elimina</button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#64748b', fontWeight: 600 }}>Nessun cliente trovato.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{isEdit ? 'Modifica Cliente' : 'Nuovo Cliente'}</h2>
            {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 6, marginBottom: 10, fontWeight: 600 }}>{error}</div>}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required placeholder="Nome" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input required type="email" placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <input required placeholder="Telefono" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              <input placeholder="Azienda" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} style={inputStyle} />
              <input placeholder="Ruolo" value={form.position || ''} onChange={e => setForm({ ...form, position: e.target.value })} style={inputStyle} />
              <select value={form.status || 'active'} onChange={e => setForm({ ...form, status: e.target.value as Client['status'] })} style={inputStyle}>
                <option value="active">Attivo</option>
                <option value="inactive">Non attivo</option>
                <option value="pending">In attesa</option>
              </select>
              <select value={form.kycStatus || 'pending'} onChange={e => setForm({ ...form, kycStatus: e.target.value as Client['kycStatus'] })} style={inputStyle}>
                <option value="pending">KYC in attesa</option>
                <option value="approved">KYC approvato</option>
                <option value="rejected">KYC rifiutato</option>
              </select>
              <input required type="date" placeholder="Data registrazione" value={form.registrationdate || ''} onChange={e => setForm({ ...form, registrationdate: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={closeModal} style={{ ...actionBtnStyle, background: '#e5e7eb', color: '#1e293b' }}>Annulla</button>
                <button type="submit" disabled={saving} style={{ ...actionBtnStyle, background: '#2563eb', color: '#fff' }}>{saving ? 'Salvataggio...' : isEdit ? 'Salva Modifiche' : 'Aggiungi Cliente'}</button>
              </div>
            </form>
            {successMsg && <div style={{ background: '#bbf7d0', color: '#166534', padding: 14, borderRadius: 8, margin: '18px 0', fontWeight: 700, textAlign: 'center' }}>{successMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 8px', fontWeight: 700, fontSize: 15, background: '#f1f5f9', borderBottom: '1px solid #e5e7eb', textAlign: 'left' as const };
const tdStyle = { padding: '10px 8px', fontSize: 15, borderBottom: '1px solid #e5e7eb', textAlign: 'left' as const };
const actionBtnStyle = { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const modalOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex' as const, alignItems: 'center', justifyContent: 'center', zIndex: 10000 };
const modalStyle = { background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, boxShadow: '0 4px 32px rgba(30,41,59,0.18)' };
const inputStyle = { padding: '10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 15, width: '100%' }; 