"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IscrivitiPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  // Controlla se già registrato
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      setIsRegistered(!!user || !!token);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
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
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.name.split(" ")[0] || form.name,
          lastName: form.name.split(" ").slice(1).join(" ") || form.name,
          email: form.email,
          phone: form.phone,
          password: "TempPassword!2024", // oppure chiedi la password all'utente
          acceptTerms: true,
          acceptPrivacy: true,
          acceptMarketing: false
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setError(data.error || data.message || "Errore durante la registrazione");
      }
    } catch (err) {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setError("Inserisci email e password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setError(data.error || "Login fallito");
      }
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}>
      <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Registrazione Cliente</h1>
      {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: 8, padding: 12, marginBottom: 16 }}>{error}</div>}
      {success ? (
        <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 700, fontSize: 20 }}>
          {isRegistered ? "Login effettuato!" : "Registrazione completata!"}<br />Riceverai una mail di conferma.
        </div>
      ) : isRegistered ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>Email*</label>
            <input name="email" type="email" value={loginForm.email} onChange={handleLoginChange} style={inputStyle} required />
            <label>Password*</label>
            <input name="password" type="password" value={loginForm.password} onChange={handleLoginChange} style={inputStyle} required />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Attendi..." : "Accedi"}</button>
          </div>
        </form>
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