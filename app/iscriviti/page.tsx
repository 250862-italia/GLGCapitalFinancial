"use client";
import { useState } from "react";

export default function IscrivitiPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validate = () => {
    return form.name && form.email && form.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
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

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}>
      <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Registrazione Cliente</h1>
      {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: 8, padding: 12, marginBottom: 16 }}>{error}</div>}
      {success ? (
        <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 700, fontSize: 20 }}>
          Registrazione completata!<br />Riceverai una mail di conferma.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nome e Cognome*</label>
            <input name="name" value={form.name} onChange={handleChange} style={inputStyle} required />
            <label>Email*</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} required />
            <label>Telefono*</label>
            <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} required />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Attendi..." : "Registrati"}</button>
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