"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, User, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

// Definisci il tipo per i dati del form investimento
interface InvestmentFormData {
  id?: string;
  clientId: string;
  packageId: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalReturns: number;
  dailyReturns: number;
  paymentMethod: 'bank' | 'usdt';
  notes?: string;
}

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const router = useRouter();

  // Carica investimenti reali
  const loadInvestments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/investments");
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
      const res = await fetch("/api/investments", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
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
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`/api/investments?id=${investmentToDelete.id}`, { method: "DELETE" });
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

  // Handlers UI
  const openAddForm = () => {
    setIsEdit(false);
    setSelectedInvestment(null);
    setShowForm(true);
  };
  const openEditForm = (inv) => {
    setIsEdit(true);
    setSelectedInvestment(inv);
    setShowForm(true);
  };
  const openDeleteModal = (inv) => {
    setInvestmentToDelete(inv);
    setShowDeleteModal(true);
  };

  // Filters
  const filtered = investments.filter((inv) =>
    (!searchQuery || (inv.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || inv.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (!statusFilter || inv.status === statusFilter) &&
    (!typeFilter || inv.type === typeFilter)
  );

  return (
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
                <th style={{ textAlign: "left", padding: "1rem" }}>Utente</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Email</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Tipo</th>
                <th style={{ textAlign: "right", padding: "1rem" }}>Importo</th>
                <th style={{ textAlign: "center", padding: "1rem" }}>Stato</th>
                <th style={{ textAlign: "center", padding: "1rem" }}>Creato il</th>
                <th style={{ textAlign: "center", padding: "1rem" }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #e0e3eb" }}>
                  <td style={{ padding: "1rem" }}>{inv.userName || '-'}</td>
                  <td style={{ padding: "1rem", color: "#374151" }}>{inv.userEmail || '-'}</td>
                  <td style={{ padding: "1rem" }}>{inv.type || '-'}</td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>€{inv.amount?.toLocaleString() || '-'}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span style={{ background: inv.status === "active" ? "#bbf7d0" : inv.status === "completed" ? "#dbeafe" : "#fee2e2", color: inv.status === "active" ? "#166534" : inv.status === "completed" ? "#1e40af" : "#991b1b", padding: "0.3rem 0.7rem", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>{inv.status}</span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button onClick={() => router.push(`/admin/investments/${inv.id}`)} style={{ background: "#f59e0b", color: "white", border: "none", padding: "0.5rem", borderRadius: 6, cursor: "pointer" }} title="Dettagli"><Eye size={16} /></button>
                      <button onClick={() => openEditForm(inv)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "0.5rem", borderRadius: 6, cursor: "pointer" }} title="Modifica"><Edit size={16} /></button>
                      <button onClick={() => openDeleteModal(inv)} style={{ background: "#dc2626", color: "white", border: "none", padding: "0.5rem", borderRadius: 6, cursor: "pointer" }} title="Elimina"><Trash2 size={16} /></button>
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
            initialData={selectedInvestment}
            onSubmit={handleCreateOrEdit}
            onCancel={() => setShowForm(false)}
            loading={loading}
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
  );
}

// --- COMPONENTE FORM ---
function InvestmentForm({
  initialData,
  onSubmit,
  onCancel,
  loading
}: {
  initialData?: Partial<InvestmentFormData>;
  onSubmit: (data: InvestmentFormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    clientId: initialData?.clientId || '',
    packageId: initialData?.packageId || '',
    amount: initialData?.amount || '',
    currency: initialData?.currency || 'EUR',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    status: initialData?.status || 'active',
    totalReturns: initialData?.totalReturns || '',
    dailyReturns: initialData?.dailyReturns || '',
    paymentMethod: initialData?.paymentMethod || 'bank',
    notes: initialData?.notes || ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!form.clientId || !form.amount || !form.packageId) {
      setError('Compila tutti i campi obbligatori');
      return;
    }
    onSubmit({ ...form, id: initialData?.id });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label>
        ID Cliente*
        <input name="clientId" value={form.clientId} onChange={handleChange} style={inputStyle} required />
      </label>
      <label>
        ID Pacchetto*
        <input name="packageId" value={form.packageId} onChange={handleChange} style={inputStyle} required />
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
        <input name="startDate" type="date" value={form.startDate} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Data Fine
        <input name="endDate" type="date" value={form.endDate} onChange={handleChange} style={inputStyle} />
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
        <input name="totalReturns" type="number" value={form.totalReturns} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Rendimento Giornaliero
        <input name="dailyReturns" type="number" value={form.dailyReturns} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Metodo Pagamento
        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} style={inputStyle}>
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