"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, User, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { InvestmentFormData } from "@/types/investment";
import { fetchJSONWithCSRF } from "@/lib/csrf-client";
import InvestmentNotifications from "@/components/admin/InvestmentNotifications";

// Tipo per investimenti con join
interface InvestmentWithJoin extends InvestmentFormData {
  client?: { name?: string; email?: string };
  package?: { name?: string };
}

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentWithJoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentFormData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<InvestmentFormData | null>(null);
  const router = useRouter();

  // Carica investimenti reali
  const loadInvestments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchJSONWithCSRF("/api/investments");
      const data = await res.json();
      if (res.ok) setInvestments(data);
      else setError(data.error || "Errore nel caricamento investimenti");
    } catch (e) {
      setError("Errore di rete");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  // CRUD
  const handleCreateOrEdit = async (formData: InvestmentFormData) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetchJSONWithCSRF("/api/investments", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(isEdit ? "Investimento aggiornato!" : "Investimento creato!");
        setShowForm(false);
        loadInvestments();
      } else {
        setError(data.error || "Errore salvataggio investimento");
      }
    } catch (e) {
      setError("Errore di rete");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!investmentToDelete) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetchJSONWithCSRF(`/api/investments?id=${investmentToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Investimento eliminato!");
        setShowDeleteModal(false);
        loadInvestments();
      } else {
        setError(data.error || "Errore eliminazione investimento");
      }
    } catch (e) {
      setError("Errore di rete");
    }
    setLoading(false);
  };

  // Azioni rapide: conferma/rifiuta
  const handleChangeStatus = async (invId: string, newStatus: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetchJSONWithCSRF("/api/investments", {
        method: "PUT",
        body: JSON.stringify({ id: invId, status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Stato investimento aggiornato!");
        loadInvestments();
      } else {
        setError(data.error || "Errore aggiornamento stato");
      }
    } catch (e) {
      setError("Errore di rete");
    }
    setLoading(false);
  };

  // Handlers UI
  const openAddForm = () => {
    setIsEdit(false);
    setSelectedInvestment(null);
    setShowForm(true);
  };
  const openEditForm = (inv: InvestmentFormData) => {
    setIsEdit(true);
    setSelectedInvestment(inv);
    setShowForm(true);
  };
  const openDeleteModal = (inv: InvestmentFormData) => {
    setInvestmentToDelete(inv);
    setShowDeleteModal(true);
  };

  // Filters
  const filtered = investments.filter((inv) =>
    (!statusFilter || inv.status === statusFilter)
  );

  // Get admin user ID for notifications
  const getAdminId = () => {
    try {
      const adminUser = localStorage.getItem('admin_user');
      if (adminUser) {
        const adminData = JSON.parse(adminUser);
        return adminData.id || 'admin';
      }
    } catch (e) {
      console.warn('Error parsing admin user data:', e);
    }
    return 'admin';
  };

  return (
    <>
      {/* Real-time investment notifications */}
      <InvestmentNotifications adminId={getAdminId()} />
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)", padding: "2rem" }}>
      <section style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--primary)", fontSize: 32, fontWeight: 900, margin: 0 }}>Gestione Investimenti</h1>
        <button
          onClick={openAddForm}
          style={{ background: "var(--accent)", color: "var(--primary)", border: "none", padding: "0.75rem 1.5rem", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={20} /> Nuovo Investimento
        </button>
      </section>
      <section style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Cerca per nome o email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 2, padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 16 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 16 }}>
          <option value="">Tutti gli stati</option>
          <option value="active">Attivo</option>
          <option value="completed">Completato</option>
          <option value="cancelled">Cancellato</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ flex: 1, padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 16 }}>
          <option value="">Tutti i tipi</option>
          <option value="Equity Pledge">Equity Pledge</option>
          <option value="Bond">Bond</option>
        </select>
      </section>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
          <CheckCircle size={20} /> {success}
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={32} className="animate-spin" /> Caricamento investimenti...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e3eb" }}>
                <th style={{ textAlign: "left", padding: "1rem" }}>Cliente</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Email</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Pacchetto</th>
                <th style={{ textAlign: "right", padding: "1rem" }}>Importo</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Stato</th>
                <th style={{ textAlign: "center", padding: "1rem" }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #e0e3eb" }}>
                  <td style={{ padding: "1rem" }}>{inv.client?.name || ''}</td>
                  <td style={{ padding: "1rem" }}>{inv.client?.email || ''}</td>
                  <td style={{ padding: "1rem" }}>{inv.package?.name || ''}</td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>{inv.amount?.toLocaleString() || '-'}</td>
                  <td style={{ padding: "1rem" }}>{inv.status || '-'}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button onClick={() => inv.id && handleChangeStatus(inv.id, 'active')} style={{ background: "#059669", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: 6, cursor: "pointer" }} title="Conferma">Conferma</button>
                      <button onClick={() => inv.id && handleChangeStatus(inv.id, 'cancelled')} style={{ background: "#dc2626", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: 6, cursor: "pointer" }} title="Rifiuta">Rifiuta</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modale form aggiunta/modifica (mock, da collegare a form reale) */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2 style={{ marginBottom: 16 }}>{isEdit ? "Modifica" : "Nuovo"} Investimento</h2>
          <InvestmentForm
            initialData={selectedInvestment ?? undefined}
            onSubmit={handleCreateOrEdit}
            onCancel={() => setShowForm(false)}
            loading={loading}
            isEdit={isEdit}
          />
        </Modal>
      )}
      {/* Modale conferma eliminazione */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <h2>Conferma eliminazione</h2>
          <p>Vuoi davvero eliminare questo investimento?</p>
          <div style={{ display: "flex", gap: "1rem", marginTop: 24 }}>
            <button onClick={handleDelete} style={{ background: "#dc2626", color: "white", padding: "0.75rem 1.5rem", borderRadius: 8, border: "none", fontWeight: 700 }}>Elimina</button>
            <button onClick={() => setShowDeleteModal(false)} style={{ background: "#6b7280", color: "white", padding: "0.75rem 1.5rem", borderRadius: 8, border: "none", fontWeight: 600 }}>Annulla</button>
          </div>
        </Modal>
      )}
      </div>
    </>
  );
}

// --- COMPONENTE FORM ---
function InvestmentForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  isEdit
}: {
  initialData?: Partial<InvestmentFormData>;
  onSubmit: (data: InvestmentFormData) => void;
  onCancel: () => void;
  loading: boolean;
  isEdit: boolean;
}) {
  const [form, setForm] = useState({
    client_id: initialData?.client_id || '',
    package_id: initialData?.package_id || '',
    amount: initialData?.amount?.toString() || '',
    currency: initialData?.currency || 'EUR',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    status: initialData?.status || 'active',
    total_returns: initialData?.total_returns?.toString() || '',
    daily_returns: initialData?.daily_returns?.toString() || '',
    payment_method: initialData?.payment_method || 'bank',
    notes: initialData?.notes || ''
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!form.client_id || !form.amount || !form.package_id) {
      setError('Compila tutti i campi obbligatori');
      return;
    }
    onSubmit({
      id: initialData?.id,
      client_id: form.client_id,
      package_id: form.package_id,
      amount: Number(form.amount),
      currency: form.currency,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status as 'active' | 'completed' | 'cancelled',
      total_returns: Number(form.total_returns),
      daily_returns: Number(form.daily_returns),
      payment_method: form.payment_method as 'bank' | 'usdt',
      notes: form.notes
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label>
        ID Cliente*
        <input name="client_id" value={form.client_id} onChange={handleChange} style={inputStyle} required />
      </label>
      <label>
        ID Pacchetto*
        <input name="package_id" value={form.package_id} onChange={handleChange} style={inputStyle} required />
      </label>
      <label>
        Importo (€)*
        <input name="amount" type="number" value={form.amount} onChange={handleChange} style={inputStyle} required />
      </label>
      <label>
        Valuta
        <input name="currency" value={form.currency} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Data Inizio
        <input name="start_date" type="date" value={form.start_date} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Data Fine
        <input name="end_date" type="date" value={form.end_date} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Stato
        <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
          <option value="active">Attivo</option>
          <option value="completed">Completato</option>
          <option value="cancelled">Cancellato</option>
        </select>
      </label>
      <label>
        Rendimento Totale
        <input name="total_returns" type="number" value={form.total_returns} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Rendimento Giornaliero
        <input name="daily_returns" type="number" value={form.daily_returns} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Metodo Pagamento
        <select name="payment_method" value={form.payment_method} onChange={handleChange} style={inputStyle}>
          <option value="bank">Bonifico</option>
          <option value="usdt">USDT</option>
        </select>
      </label>
      <label>
        Note
        <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...inputStyle, minHeight: 60 }} />
      </label>
      {error && <div style={{ color: '#dc2626', fontWeight: 600 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 1 }}>{isEdit ? 'Salva Modifiche' : 'Crea Investimento'}</button>
        <button type="button" onClick={onCancel} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer', flex: 1 }}>Annulla</button>
      </div>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16, marginTop: 4 }; 