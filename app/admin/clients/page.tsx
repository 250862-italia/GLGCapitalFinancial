"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  nationality?: string;
  kyc_status?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

const emptyClient = (): Partial<Client> => ({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  status: 'active',
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
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
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
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        status: form.status
      }).eq('id', form.id);
    } else {
      res = await supabase.from('clients').insert([
        {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          status: form.status
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
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', margin: 0 }}>Client Management</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>View, add, edit or delete clients.</p>
        </div>
        <button onClick={openAdd} style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', border: 0, borderRadius: 8, fontWeight: 700, fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>+ Add Client</button>
      </div>
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8, marginBottom: 24, fontWeight: 600 }}>{error}</div>}
      {loading ? (
        <div style={{ color: '#2563eb', fontWeight: 600, fontSize: 20 }}>Caricamento...</div>
      ) : (
        <div style={{ overflowX: 'auto', boxShadow: '0 4px 24px rgba(30,41,59,0.07)', borderRadius: 16, background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1e293b', position: 'sticky' as const, top: 0, zIndex: 1 }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>KYC Status</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}>
                  <td style={tdStyle}>
                    <div>
                      <strong>{client.first_name} {client.last_name}</strong>
                      {client.date_of_birth && (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          DOB: {new Date(client.date_of_birth).toLocaleDateString()}
                        </div>
                      )}
                      {client.nationality && (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {client.nationality}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>{client.email}</td>
                  <td style={tdStyle}>{client.phone}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: client.kyc_status === 'approved' ? '#bbf7d0' : 
                                 client.kyc_status === 'rejected' ? '#fee2e2' : 
                                 client.kyc_status === 'pending' ? '#fef3c7' : '#f3f4f6',
                      color: client.kyc_status === 'approved' ? '#16a34a' : 
                            client.kyc_status === 'rejected' ? '#dc2626' : 
                            client.kyc_status === 'pending' ? '#b45309' : '#6b7280',
                      borderRadius: 6,
                      padding: '2px 10px',
                      fontWeight: 700,
                      fontSize: 12
                    }}>
                      {client.kyc_status || 'Not Started'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      background: client.status === 'active' ? '#bbf7d0' : 
                                 client.status === 'pending' ? '#fef3c7' : '#fee2e2',
                      color: client.status === 'active' ? '#16a34a' : 
                            client.status === 'pending' ? '#b45309' : '#b91c1c',
                      borderRadius: 6,
                      padding: '2px 10px',
                      fontWeight: 700
                    }}>
                      {client.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(client.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(client)} style={actionBtnStyle}>Edit</button>
                    <button onClick={() => handleDelete(client.id)} style={{ ...actionBtnStyle, background: '#dc2626' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#64748b', fontWeight: 600 }}>Nessun cliente trovato.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
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
            background: '#fff',
            padding: '2rem',
            borderRadius: 12,
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>
              {isEdit ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={form.first_name || ''}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={form.last_name || ''}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Status
                </label>
                <select
                  value={form.status || 'active'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#374151',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#2563eb',
                    color: '#fff',
                    border: 0,
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {successMsg && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#bbf7d0',
          color: '#16a34a',
          padding: '1rem 1.5rem',
          borderRadius: 8,
          fontWeight: 600,
          zIndex: 1001,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {successMsg}
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '1rem',
  textAlign: 'left' as const,
  fontWeight: 700,
  fontSize: 14,
  borderBottom: '2px solid #e5e7eb'
};

const tdStyle = {
  padding: '1rem',
  fontSize: 14,
  color: '#374151'
};

const actionBtnStyle = {
  background: '#2563eb',
  color: '#fff',
  border: 0,
  padding: '0.5rem 1rem',
  borderRadius: 6,
  marginRight: '0.5rem',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  color: '#374151'
}; 