"use client";
import { useState } from "react";
import { supabase } from '../../lib/supabase';
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h1>Register</h1>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        <button type="submit" disabled={loading} style={{ background: '#0a2540', color: '#fff', padding: '0.75rem', border: 'none', borderRadius: 4, fontWeight: 600 }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Registration successful! Check your email to confirm your account.</p>}
      </form>
      <p style={{ textAlign: 'center', marginTop: 16 }}>
        Already have an account? <Link href="/reserved" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Login</Link>
      </p>
    </main>
  );
} 