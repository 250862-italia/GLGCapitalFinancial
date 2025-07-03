"use client";
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Le variabili d'ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY non sono settate. Controlla la configurazione su Vercel e in locale.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [clientPackages, setClientPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: null,
    nome: '',
    email: '',
    stato: '',
    kyc: ''
  });
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState<{ [clientId: number]: string }>({});

  // Fetch clients, packages, and client_packages
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    const [{ data: clientsData, error: clientsError }, { data: packagesData, error: packagesError }, { data: clientPackagesData, error: clientPackagesError }] = await Promise.all([
      supabase.from('clients').select('*').order('id', { ascending: true }),
      supabase.from('packages').select('*').order('id', { ascending: true }),
      supabase.from('client_packages').select('*')
    ]);
    if (clientsError) setError(clientsError.message);
    else setClients(clientsData || []);
    if (packagesError) setError(packagesError.message);
    else setPackages(packagesData || []);
    if (clientPackagesError) setError(clientPackagesError.message);
    else setClientPackages(clientPackagesData || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Handle form input
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update client
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (editing && form.id) {
      // Update
      const { error } = await supabase.from('clients').update({
        nome: form.nome,
        email: form.email,
        stato: form.stato,
        kyc: form.kyc
      }).eq('id', form.id);
      if (error) setError(error.message);
    } else {
      // Insert
      const { error } = await supabase.from('clients').insert([
        {
          nome: form.nome,
          email: form.email,
          stato: form.stato,
          kyc: form.kyc
        }
      ]);
      if (error) setError(error.message);
    }
    setForm({ id: null, nome: '', email: '', stato: '', kyc: '' });
    setEditing(false);
    await fetchAll();
    setLoading(false);
  };

  // Edit client
  const handleEdit = (client: any) => {
    setForm(client);
    setEditing(true);
  };

  // Delete client
  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) setError(error.message);
    await fetchAll();
    setLoading(false);
  };

  // Assign package to client
  const handleAssignPackage = async (clientId: number) => {
    const packageId = assigning[clientId];
    if (!packageId) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('client_packages').insert([
      { client_id: clientId, package_id: packageId }
    ]);
    if (error) setError(error.message);
    setAssigning({ ...assigning, [clientId]: '' });
    await fetchAll();
    setLoading(false);
  };

  // Get packages for a client
  const getClientPackages = (clientId: number) => {
    const pkgs = clientPackages.filter(cp => cp.client_id === clientId).map(cp => {
      return packages.find((p: any) => p.id === cp.package_id);
    }).filter(Boolean);
    return pkgs;
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>
      <h1>Gestione Clienti</h1>
      {loading && <div style={{ background: '#e0e7ff', color: '#3730a3', padding: 12, fontWeight: 600, marginBottom: 16 }}>Caricamento...</div>}
      {error && <div style={{ background: '#fee', color: '#900', padding: 16, fontWeight: 700, marginBottom: 16 }}>ERRORE: {error}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: 32, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
        <h2>{editing ? 'Modifica Cliente' : 'Nuovo Cliente'}</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ flex: 1 }} />
          <input name="stato" placeholder="Stato" value={form.stato} onChange={handleChange} required style={{ width: 120 }} />
          <input name="kyc" placeholder="KYC" value={form.kyc} onChange={handleChange} required style={{ width: 100 }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', border: 0, borderRadius: 4, fontWeight: 600 }}>
            {editing ? 'Salva Modifiche' : 'Aggiungi Cliente'}
          </button>
          {editing && <button type="button" onClick={() => { setForm({ id: null, nome: '', email: '', stato: '', kyc: '' }); setEditing(false); }} style={{ marginLeft: 8 }}>Annulla</button>}
        </div>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Nome</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Email</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Stato</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>KYC</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Pacchetti Acquistati</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{client.nome}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{client.email}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{client.stato}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{client.kyc}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {getClientPackages(client.id).map((pkg: any) => (
                    <li key={pkg.id} style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{pkg.nome}</span> <span style={{ color: '#64748b' }}>({pkg.percentuale}%)</span>
                    </li>
                  ))}
                  {getClientPackages(client.id).length === 0 && <li>Nessun pacchetto</li>}
                </ul>
                <div style={{ marginTop: 8 }}>
                  <select
                    value={assigning[client.id] || ''}
                    onChange={e => setAssigning({ ...assigning, [client.id]: e.target.value })}
                    style={{ marginRight: 8 }}
                  >
                    <option value="">Assegna pacchetto...</option>
                    {packages.map((pkg: any) => (
                      <option key={pkg.id} value={pkg.id}>{pkg.nome} ({pkg.percentuale}%)</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignPackage(client.id)}
                    disabled={!assigning[client.id]}
                    style={{ background: '#22c55e', color: '#fff', padding: '4px 12px', border: 0, borderRadius: 4, fontWeight: 600 }}
                  >
                    Assegna
                  </button>
                </div>
              </td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>
                <button onClick={() => handleEdit(client)} style={{ marginRight: 8 }}>Modifica</button>
                <button onClick={() => handleDelete(client.id)} style={{ color: '#b91c1c' }}>Elimina</button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 16 }}>Nessun cliente presente.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 