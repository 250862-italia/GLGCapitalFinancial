"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // Login con Supabase Auth
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (loginError || !data.user) {
      setError("Invalid credentials. Please contact system administrator.");
      setLoading(false);
      return;
    }

    // Recupera ruolo dal metadata o dalla tabella users
    let userRole = data.user.user_metadata?.role || data.user.app_metadata?.role;
    // Fallback: fetch dalla tabella users
    if (!userRole) {
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
      userRole = userData?.role;
    }

    if (userRole !== 'admin' && userRole !== 'superadmin') {
      setError("Access denied: only admin/superadmin can access this area.");
      setLoading(false);
      return;
    }

    // Salva nel localStorage
    const adminUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.first_name || data.user.user_metadata?.name || '',
      role: userRole
    };
    localStorage.setItem("admin_user", JSON.stringify(adminUser));
    localStorage.setItem("admin_token", data.session?.access_token || "");
    router.push("/admin");
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
          {loading ? "Accessing..." : "Login"}
        </button>
        <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          <p>Contact system administrator for access credentials</p>
        </div>
      </form>
    </div>
  );
} 