import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ReservedAreaPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [kycCompleted, setKycCompleted] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Recupera i dati utente e ruolo
    const { user } = data.session;
    setUser(user);
    // Simulazione: recupero ruolo e stato KYC da user.metadata
    const userRole = user.user_metadata?.role || 'investor';
    const userKyc = user.user_metadata?.kycCompleted || false;
    setRole(userRole);
    setKycCompleted(userKyc);
    setLoading(false);
  };

  if (user) {
    if (role === 'admin') {
      return (
        <main style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h1>Admin Dashboard</h1>
          <p>Welcome, superadmin! Here you can manage all investments and users.</p>
          {/* Qui puoi aggiungere la gestione investimenti/utenti */}
        </main>
      );
    } else if (role === 'investor' && kycCompleted) {
      return (
        <main style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h1>Investor Dashboard</h1>
          <p>Welcome! Here you can view and manage your investments.</p>
          {/* Qui puoi aggiungere la tabella investimenti personale */}
        </main>
      );
    } else {
      return (
        <main style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h1>Access Restricted</h1>
          <p>Your KYC process is not completed. Please complete KYC to access the reserved area.</p>
        </main>
      );
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h1>Reserved Area Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        <button type="submit" disabled={loading} style={{ background: '#0a2540', color: '#fff', padding: '0.75rem', border: 'none', borderRadius: 4, fontWeight: 600 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  );
} 