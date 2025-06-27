"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Chatbot from '../../components/ui/Chatbot';

const mockInvestments = [
  {
    name: 'US Growth Fund',
    startDate: '2023-01-15',
    amount: 10000,
    yield: 0.08, // 8% annual
    status: 'Active',
  },
  {
    name: 'Global Equity',
    startDate: '2022-09-01',
    amount: 5000,
    yield: 0.045, // 4.5% annual
    status: 'Active',
  },
  {
    name: 'Emerging Markets',
    startDate: '2021-06-10',
    amount: 7000,
    yield: 0.12, // 12% annual
    status: 'Closed',
  },
];

function calculateDays(startDate: string) {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateEarnings(amount: number, yieldRate: number, startDate: string) {
  // Calcolo semplice: rendimento giornaliero composto
  const days = calculateDays(startDate);
  const dailyRate = Math.pow(1 + yieldRate, 1 / 365) - 1;
  return amount * (Math.pow(1 + dailyRate, days) - 1);
}

export default function ReservedAreaPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('');
  const [kycCompleted, setKycCompleted] = useState(false);

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
      // Calcolo totale guadagnato
      const totalEarnings = mockInvestments.reduce((sum, inv) => sum + calculateEarnings(inv.amount, inv.yield, inv.startDate), 0);
      return (
        <main style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h1>Investor Dashboard</h1>
          <p>Welcome! Here you can view and manage your investments.</p>
          <div style={{ margin: '2rem 0', background: '#f5f8fa', padding: '1.5rem', borderRadius: 8, fontSize: 20, color: '#0a2540', fontWeight: 600 }}>
            Total Earnings: ${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#0a2540', color: '#fff' }}>
                <th style={{ padding: 10 }}>Investment</th>
                <th style={{ padding: 10 }}>Start Date</th>
                <th style={{ padding: 10 }}>Amount</th>
                <th style={{ padding: 10 }}>Yield (Annual)</th>
                <th style={{ padding: 10 }}>Earnings (to date)</th>
                <th style={{ padding: 10 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockInvestments.map((inv, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <td style={{ padding: 10 }}>{inv.name}</td>
                  <td style={{ padding: 10 }}>{inv.startDate}</td>
                  <td style={{ padding: 10 }}>${inv.amount.toLocaleString()}</td>
                  <td style={{ padding: 10 }}>{(inv.yield * 100).toFixed(2)}%</td>
                  <td style={{ padding: 10 }}>${calculateEarnings(inv.amount, inv.yield, inv.startDate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: 10 }}>{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <p style={{ textAlign: 'center', marginTop: 16 }}>
        Don't have an account? <a href="/reserved/register" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Register</a>
      </p>
      <Chatbot />
    </main>
  );
}