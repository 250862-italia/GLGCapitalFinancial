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

    // Esempio: credenziali hardcoded per demo
    if (email === "superadmin@glgcapital.com" && password === "superpassword") {
      const user = {
        id: "1",
        name: "Super Admin",
        email,
        role: "superadmin"
      };
      localStorage.setItem("admin_user", JSON.stringify(user));
      localStorage.setItem("admin_token", "demo-token");
      router.push("/admin");
      return;
    }
    setError("Credenziali non valide. Riprova.");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <form onSubmit={handleLogin} style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 4px 24px rgba(10,37,64,0.10)", minWidth: 320 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>Admin Console Login</h1>
        {error && <div style={{ color: "#dc2626", marginBottom: 16 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e5e7eb" }} />
        </div>
        <button type="submit" disabled={loading} style={{ width: "100%", background: "#2563eb", color: "#fff", padding: "10px 0", border: 0, borderRadius: 6, fontWeight: 700, fontSize: 16 }}>
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
} 