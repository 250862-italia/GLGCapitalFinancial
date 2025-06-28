"use client";
import { useState } from "react";

export default function IscrivitiPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    document: null as File | null,
    package: "",
    amount: "",
    payment: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setError("");
  };

  const validateStep = () => {
    if (step === 1 && (!form.name || !form.email || !form.phone)) return false;
    if (step === 2 && !form.document) return false;
    if (step === 3 && (!form.package || !form.amount)) return false;
    if (step === 4 && !form.payment) return false;
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      setError("Compila tutti i campi obbligatori");
      return;
    }
    setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) {
      setError("Compila tutti i campi obbligatori");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  // Calcolo rendimenti fittizio
  const getReturns = () => {
    const amt = parseFloat(form.amount || "0");
    if (form.package === "basic") return amt * 1.05;
    if (form.package === "plus") return amt * 1.12;
    if (form.package === "premium") return amt * 1.20;
    return 0;
  };

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}>
      <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Registrazione Cliente</h1>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{
            width: 32, height: 32, borderRadius: "50%", background: step === n ? "#f59e0b" : "#e5e7eb",
            color: step === n ? "#fff" : "#374151", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 18, marginRight: n < 4 ? 12 : 0, border: step === n ? "2px solid #f59e0b" : "2px solid #e5e7eb"
          }}>{n}</div>
        ))}
      </div>
      {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: 8, padding: 12, marginBottom: 16 }}>{error}</div>}
      {success ? (
        <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 700, fontSize: 20 }}>
          Registrazione completata!<br />Riceverai una mail di conferma.
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); step === 4 ? handleSubmit() : handleNext(); }}>
          {step === 1 && (
            <div>
              <label>Nome e Cognome*</label>
              <input name="name" value={form.name} onChange={handleChange} style={inputStyle} required />
              <label>Email*</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} required />
              <label>Telefono*</label>
              <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} required />
            </div>
          )}
          {step === 2 && (
            <div>
              <label>Documento Identità (PDF/JPG)*</label>
              <input name="document" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} style={inputStyle} required />
            </div>
          )}
          {step === 3 && (
            <div>
              <label>Pacchetto Investimento*</label>
              <select name="package" value={form.package} onChange={handleChange} style={inputStyle} required>
                <option value="">Seleziona...</option>
                <option value="basic">Basic (5% annuo)</option>
                <option value="plus">Plus (12% annuo)</option>
                <option value="premium">Premium (20% annuo)</option>
              </select>
              <label>Importo (€)*</label>
              <input name="amount" type="number" min="1000" step="100" value={form.amount} onChange={handleChange} style={inputStyle} required />
              {form.package && form.amount && (
                <div style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: 8, padding: 12, marginTop: 12 }}>
                  Rendimento stimato dopo 1 anno: <b>{getReturns().toLocaleString("it-IT", { style: "currency", currency: "EUR" })}</b>
                </div>
              )}
            </div>
          )}
          {step === 4 && (
            <div>
              <label>Metodo di Pagamento*</label>
              <select name="payment" value={form.payment} onChange={handleChange} style={inputStyle} required>
                <option value="">Seleziona...</option>
                <option value="bonifico">Bonifico Bancario</option>
                <option value="carta">Carta di Credito</option>
                <option value="crypto">Criptovalute</option>
              </select>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            {step > 1 && <button type="button" onClick={handlePrev} style={buttonStyle}>Indietro</button>}
            <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Attendi..." : step === 4 ? "Conferma" : "Avanti"}</button>
          </div>
        </form>
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginBottom: 16,
  fontSize: 16,
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  background: "#1a2238",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "0.75rem 2rem",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  marginLeft: 8,
}; 