"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Credenziali hardcoded per il superadmin
    const validEmail = "admin@glgcapital.com";
    const validPassword = "Admin123!@#";

    // Verifica credenziali
    if (email === validEmail && password === validPassword) {
      const adminUser = {
        id: "superadmin-1",
        email: email,
        name: "Super Admin",
        role: "super_admin"
      };
      
      // Salva nel localStorage
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      localStorage.setItem("admin_token", "admin-token");
      
      // Reindirizza alla dashboard admin
      router.push("/admin");
      return;
    }

    // Se le credenziali non sono valide
    setError("Credenziali non valide. Usa admin@glgcapital.com / Admin123!@#");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <form onSubmit={handleLogin} style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 4px 24px rgba(10,37,64,0.10)", minWidth: 320 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>Admin Console Login</h1>
        {error && <div style={{ color: "#dc2626", marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} 
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            width: "100%", 
            background: "#2563eb", 
            color: "#fff", 
            padding: "10px 0", 
            border: 0, 
            borderRadius: 6, 
            fontWeight: 700, 
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Accesso..." : "Accedi"}
        </button>
        
        <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          <p><strong>Credenziali di accesso:</strong></p>
          <p>Email: admin@glgcapital.com</p>
          <p>Password: Admin123!@#</p>
        </div>
      </form>
    </div>
  );
} 