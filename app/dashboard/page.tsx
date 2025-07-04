"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target, 
  BarChart3, 
  PieChart,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Investment } from "@/types/investment";
import { Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import KYCProcess from "../../components/kyc/kyc-process";
import UserProfile from "../../components/UserProfile";
import { useAuth } from "../../hooks/use-auth";
import { usePackages } from "../../lib/package-context";
import Toast from "../../components/ui/Toast";
import { supabase } from "../../lib/supabase";
import { useRouter } from 'next/navigation';

interface PortfolioStats {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  averageReturn: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { packages: availablePackages, loading: packagesLoading, error: packagesError } = usePackages();
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<{iban: string, accountHolder: string, bankName: string, reason: string} | null>(null);
  const [showKycToast, setShowKycToast] = useState(false);
  const [kycToastMsg, setKycToastMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Load purchased investments and bank data
    const loadMyInvestments = () => {
      const stored = localStorage.getItem('myInvestments');
      setMyInvestments(stored ? JSON.parse(stored) : []);
    };
    const loadBankDetails = () => {
      const stored = localStorage.getItem('bankDetails');
      if (stored) setBankDetails(JSON.parse(stored));
    };
    loadMyInvestments();
    loadBankDetails();
    // Real-time synchronization between tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'myInvestments') loadMyInvestments();
      if (e.key === 'bankDetails') loadBankDetails();
    };
    window.addEventListener('storage', onStorage);
    setIsLoading(false);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Package normalization function
  function normalizePackage(pkg: any): any {
    return {
      id: pkg.id || pkg.ID || String(Date.now()),
      name: pkg.name || pkg.packageName || '',
      minAmount: pkg.minAmount || pkg.amount || 1000,
      dailyReturn: pkg.dailyReturn || pkg.expectedReturn || 1.0,
      duration: pkg.duration || 30,
      isActive: pkg.isActive !== undefined ? pkg.isActive : (pkg.status === 'Active'),
      // altri campi se servono
    };
  }

  // Active packages for all clients
  const activeInvestments = availablePackages.filter(pkg => pkg.isActive);

  // Packages to show: all those present in localStorage
  const allPackages = availablePackages;

  // Function to purchase a package
  const handleBuy = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowBankModal(true);
  };

  // Purchase confirmation function
  const confirmBuy = () => {
    if (!selectedPackage) return;
    if (myInvestments.some(inv => inv.packageName === selectedPackage.name)) return;
    const newInvestment: Investment = {
      id: selectedPackage.id || String(Date.now()),
      packageName: selectedPackage.name,
      amount: selectedPackage.minAmount || 1000,
      dailyReturn: selectedPackage.dailyReturn || 1.0,
      duration: selectedPackage.duration || 30,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + (selectedPackage.duration || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      totalEarned: 0,
      dailyEarnings: 0,
      monthlyEarnings: 0
    };
    const updated = [...myInvestments, newInvestment];
    setMyInvestments(updated);
    localStorage.setItem('myInvestments', JSON.stringify(updated));
    setShowBankModal(false);
    setSelectedPackage(null);
  };

  // Stats calculated only on purchased investments
  const stats = {
    totalInvested: myInvestments.reduce((sum, inv) => sum + inv.amount, 0),
    totalEarned: myInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0),
    activeInvestments: myInvestments.length,
    averageReturn: myInvestments.length > 0 ? myInvestments.reduce((sum, inv) => sum + inv.dailyReturn, 0) / myInvestments.length : 0,
    todayEarnings: myInvestments.reduce((sum, inv) => sum + inv.dailyEarnings, 0),
    monthlyEarnings: myInvestments.reduce((sum, inv) => sum + inv.monthlyEarnings, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'completed': return '#3b82f6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  // --- RISK DISTRIBUTION CHART ---
  // TEST: static data for PieChart
  const riskData = [
    { name: 'Low', value: 1 },
    { name: 'Medium', value: 2 },
    { name: 'High', value: 3 }
  ];
  const riskColors = ['#10b981', '#f59e0b', '#ef4444'];

  // Check KYC status and show toast if necessary
  useEffect(() => {
    if (!user) return;
    const checkKycStatus = async () => {
      const { data, error } = await supabase
        .from('kyc_records')
        .select('status')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) return;
      const status = data.status;
      const lastNotified = localStorage.getItem('kyc-last-notified');
      if ((status === 'approved' || status === 'rejected') && lastNotified !== status) {
        setKycToastMsg(
          status === 'approved'
            ? 'Your KYC has been APPROVED! You can now operate freely.'
            : 'Your KYC has been REJECTED. Contact support for details.'
        );
        setShowKycToast(true);
        localStorage.setItem('kyc-last-notified', status);
      }
    };
    checkKycStatus();
  }, [user]);

  if (isLoading || packagesLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>
            Welcome back, John!
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Here's your investment portfolio overview
          </p>
        </div>

        {/* User Profile & KYC Status */}
        <div style={{ marginBottom: '2rem' }}>
          {user ? (
            <UserProfile onKycComplete={() => {
              // Ricarica la pagina per aggiornare lo stato
              window.location.reload();
            }} />
          ) : (
            <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 18, padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
              Utente non autenticato
            </div>
          )}
        </div>

        {/* Pacchetti & Analisi Rischio - SPOSTATO IN ALTO */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem', margin: '2.5rem 0' }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 320 }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 900, margin: 0 }}>Pacchetti di Investimento</h2>
              <p style={{ color: '#64748b', fontSize: 16, margin: '8px 0 1.5rem 0' }}>Tutti i pacchetti disponibili e le loro caratteristiche principali.</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e3eb' }}>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Nome</th>
                      <th style={{ textAlign: 'left', padding: '1rem' }}>Categoria</th>
                      <th style={{ textAlign: 'center', padding: '1rem' }}>Rischio</th>
                      <th style={{ textAlign: 'right', padding: '1rem' }}>Min</th>
                      <th style={{ textAlign: 'right', padding: '1rem' }}>Max</th>
                      <th style={{ textAlign: 'right', padding: '1rem' }}>Rendimento (%)</th>
                      <th style={{ textAlign: 'center', padding: '1rem' }}>Durata (mesi)</th>
                      <th style={{ textAlign: 'center', padding: '1rem' }}>Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availablePackages.map(pkg => (
                      <tr key={pkg.id} style={{ borderBottom: '1px solid #e0e3eb' }}>
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#0a2540' }}>{pkg.name}</td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{pkg.category}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{ background: pkg.riskLevel === 'low' ? '#bbf7d0' : pkg.riskLevel === 'medium' ? '#fef3c7' : '#fee2e2', color: pkg.riskLevel === 'low' ? '#166534' : pkg.riskLevel === 'medium' ? '#92400e' : '#991b1b', padding: '0.3rem 0.7rem', borderRadius: 8, fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{pkg.riskLevel}</span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>€{pkg.minInvestment != null ? pkg.minInvestment.toLocaleString() : '-'}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>€{pkg.maxInvestment != null ? pkg.maxInvestment.toLocaleString() : '-'}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{pkg.expectedReturn ?? '-'}%</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>{pkg.duration}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{ background: pkg.status === 'Active' ? '#bbf7d0' : pkg.status === 'Fundraising' ? '#fef3c7' : '#e0e7ff', color: pkg.status === 'Active' ? '#166534' : pkg.status === 'Fundraising' ? '#92400e' : '#3730a3', padding: '0.3rem 0.7rem', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>{pkg.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 260, background: 'var(--secondary)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
              <h3 style={{ color: '#0a2540', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Distribuzione Rischio</h3>
              {riskData && riskData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                      {riskData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={riskColors[idx % riskColors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: '#64748b', fontSize: 16, marginTop: 32, textAlign: 'center' }}>Nessun dato rischio disponibile</div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Summary - blocco attrattivo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Total Invested */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 60%, #bbf7d0 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(16,185,129,0.10)',
            border: '1px solid #bbf7d0',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <DollarSign size={38} color="#059669" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#059669', fontWeight: 700, marginBottom: 6 }}>Total Invested</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.totalInvested)}</div>
          </div>
          {/* Total Earned */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 60%, #fde68a 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(245,158,11,0.10)',
            border: '1px solid #fde68a',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <TrendingUp size={38} color="#f59e0b" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 700, marginBottom: 6 }}>Total Earned</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.totalEarned)}</div>
          </div>
          {/* Today's Earnings */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 60%, #bae6fd 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(59,130,246,0.10)',
            border: '1px solid #bae6fd',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <Target size={38} color="#3b82f6" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#3b82f6', fontWeight: 700, marginBottom: 6 }}>Today's Earnings</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.todayEarnings)}</div>
          </div>
          {/* Monthly Earnings */}
          <div style={{
            background: 'linear-gradient(135deg, #fdf2f8 60%, #fbcfe8 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(236,72,153,0.10)',
            border: '1px solid #fbcfe8',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <BarChart3 size={38} color="#ec4899" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#ec4899', fontWeight: 700, marginBottom: 6 }}>Monthly Earnings</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.monthlyEarnings)}</div>
          </div>
        </div>

        {/* Earnings Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
              Earnings Overview
            </h2>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['1d', '7d', '30d', '90d'] as const).map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: selectedTimeframe === timeframe ? '1px solid #3b82f6' : '1px solid #d1d5db',
                    background: selectedTimeframe === timeframe ? '#3b82f6' : 'white',
                    color: selectedTimeframe === timeframe ? 'white' : '#374151',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {timeframe === '1d' && '1D'}
                  {timeframe === '7d' && '7D'}
                  {timeframe === '30d' && '30D'}
                  {timeframe === '90d' && '90D'}
                </button>
              ))}
            </div>
          </div>

          {/* Mock Chart */}
          <div style={{ 
            height: '300px', 
            background: '#f8fafc', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #d1d5db'
          }}>
            <div style={{ textAlign: 'center' }}>
              <BarChart3 size={48} color="#6b7280" />
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                Earnings chart for {selectedTimeframe} period
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Chart visualization will be implemented here
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginTop: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '1.5rem' }}>
            Recent Activity
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { type: 'earnings', message: 'Daily earnings credited', amount: 594, time: '2 hours ago' },
              { type: 'investment', message: 'New investment started', amount: 10000, time: '1 day ago' },
              { type: 'earnings', message: 'Daily earnings credited', amount: 594, time: '1 day ago' },
              { type: 'withdrawal', message: 'Withdrawal processed', amount: 5000, time: '3 days ago' }
            ].map((activity, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '6px', background: '#f9fafb' }}>
                <div style={{
                  background: activity.type === 'earnings' ? '#f0fdf4' : activity.type === 'investment' ? '#eff6ff' : '#fef2f2',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  color: activity.type === 'earnings' ? '#059669' : activity.type === 'investment' ? '#3b82f6' : '#dc2626'
                }}>
                  {activity.type === 'earnings' && <TrendingUp size={16} />}
                  {activity.type === 'investment' && <DollarSign size={16} />}
                  {activity.type === 'withdrawal' && <ArrowDownRight size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                    {activity.message}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {activity.time}
                  </p>
                </div>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: activity.type === 'withdrawal' ? '#dc2626' : '#059669'
                }}>
                  {activity.type === 'withdrawal' ? '-' : '+'}{formatCurrency(activity.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modale per i dati bancari */}
        {showBankModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 350, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Dati Bancari per Bonifico</h2>
              {bankDetails ? (
                <div style={{ marginBottom: 24 }}>
                  <div><b>IBAN:</b> {bankDetails.iban}</div>
                  <div><b>Intestatario:</b> {bankDetails.accountHolder}</div>
                  <div><b>Banca:</b> {bankDetails.bankName}</div>
                  <div><b>Causale:</b> {bankDetails.reason}</div>
                </div>
              ) : (
                <div style={{ color: 'red', marginBottom: 24 }}>Dati bancari non configurati. Contattare l'amministratore.</div>
              )}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowBankModal(false); setSelectedPackage(null); }} style={{ background: '#d1d5db', color: '#1f2937', padding: '0.5rem 1rem', border: 'none', borderRadius: 6, fontWeight: 500 }}>Annulla</button>
                <button onClick={confirmBuy} disabled={!bankDetails} style={{ background: '#059669', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: 6, fontWeight: 500, cursor: bankDetails ? 'pointer' : 'not-allowed' }}>Conferma Acquisto</button>
              </div>
            </div>
          </div>
        )}

        <Toast
          message={kycToastMsg}
          visible={showKycToast}
          onClose={() => setShowKycToast(false)}
          duration={5000}
        />
      </div>
    </div>
  );
}
