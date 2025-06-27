"use client";
import { useState } from 'react';
import { TrendingUp, DollarSign, Users, BarChart3, Shield, Globe, Calendar, Target, Award, Activity } from 'lucide-react';
import Image from 'next/image';

const mockInvestments = [
  {
    name: 'GLG Equity Position A',
    startDate: '2024-01-15',
    amount: 25000,
    yield: 0.085, // 8.5% annual
    status: 'Active',
    type: 'Equity Position',
    maturity: '2025-01-15'
  },
  {
    name: 'GLG Equity Position B',
    startDate: '2024-03-01',
    amount: 15000,
    yield: 0.092, // 9.2% annual
    status: 'Active',
    type: 'Equity Position',
    maturity: '2025-03-01'
  },
  {
    name: 'GLG Equity Position C',
    startDate: '2024-06-10',
    amount: 35000,
    yield: 0.078, // 7.8% annual
    status: 'Active',
    type: 'Equity Position',
    maturity: '2025-06-10'
  },
];

const marketData = [
  { name: 'S&P 500', value: '4,567.89', change: '+1.2%', trend: 'up' },
  { name: 'NASDAQ', value: '14,234.56', change: '+0.8%', trend: 'up' },
  { name: 'DOW JONES', value: '35,678.90', change: '-0.3%', trend: 'down' },
  { name: 'GLG INDEX', value: '1,234.56', change: '+2.1%', trend: 'up' },
];

function calculateDays(startDate: string) {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateEarnings(amount: number, yieldRate: number, startDate: string) {
  const days = calculateDays(startDate);
  const dailyRate = Math.pow(1 + yieldRate, 1 / 365) - 1;
  return amount * (Math.pow(1 + dailyRate, days) - 1);
}

export default function ReservedAreaPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Calcoli
  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalEarnings = mockInvestments.reduce((sum, inv) => sum + calculateEarnings(inv.amount, inv.yield, inv.startDate), 0);
  const totalValue = totalInvested + totalEarnings;
  const averageYield = mockInvestments.reduce((sum, inv) => sum + inv.yield, 0) / mockInvestments.length;

  const stats = [
    { 
      label: "Total Portfolio Value", 
      value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      icon: DollarSign,
      color: 'var(--accent)'
    },
    { 
      label: "Total Earnings", 
      value: `$${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 
      icon: TrendingUp,
      color: '#10b981'
    },
    { 
      label: "Active Positions", 
      value: mockInvestments.length.toString(), 
      icon: Target,
      color: 'var(--primary)'
    },
    { 
      label: "Average Yield", 
      value: `${(averageYield * 100).toFixed(2)}%`, 
      icon: BarChart3,
      color: '#3b82f6'
    },
  ];

  return (
    <main style={{ maxWidth: 1200, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
      
      {/* HEADER */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={80} height={80} style={{ margin: '0 auto 1rem auto', borderRadius: 12, background: '#fff', boxShadow: '0 2px 12px rgba(34,40,49,0.10)' }} />
        <h1 style={{ color: 'var(--primary)', fontSize: 36, fontWeight: 900, marginBottom: 8 }}>GLG Reserved Area</h1>
        <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8 }}>Your exclusive access to GLG Capital Group investment platform</p>
      </section>

      {/* STATS CARDS */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              textAlign: 'center',
              border: '2px solid #e0e3eb'
            }}>
              <stat.icon size={32} style={{ color: stat.color, margin: '0 auto 1rem auto', display: 'block' }} />
              <div style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{stat.value}</div>
              <div style={{ color: 'var(--foreground)', fontSize: 14, opacity: 0.8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARKET DATA */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Market Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {marketData.map((market, index) => (
            <div key={index} style={{ 
              background: '#f8f9fa', 
              padding: '1.5rem', 
              borderRadius: 8, 
              textAlign: 'center',
              border: '1px solid #e0e3eb'
            }}>
              <div style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{market.name}</div>
              <div style={{ color: 'var(--foreground)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{market.value}</div>
              <div style={{ 
                color: market.trend === 'up' ? '#10b981' : '#ef4444', 
                fontSize: 14, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}>
                {market.trend === 'up' ? <TrendingUp size={14} /> : <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} />}
                {market.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INVESTMENTS TABLE */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Your GLG Equity Positions</h2>
        <div style={{ background: 'var(--secondary)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(10,37,64,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Position</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Start Date</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Yield (Annual)</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Earnings</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Maturity</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockInvestments.map((inv, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e0e3eb' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{inv.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--foreground)' }}>{inv.startDate}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--foreground)' }}>${inv.amount.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{(inv.yield * 100).toFixed(2)}%</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>${calculateEarnings(inv.amount, inv.yield, inv.startDate).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--foreground)' }}>{inv.maturity}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ 
                      background: '#10b981', 
                      color: '#fff', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: 20, 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* INFO SECTION */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #2a3f5f 100%)', borderRadius: 12, padding: '2rem', color: '#fff' }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--accent)' }}>Important Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 8 }}>
              <Shield size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>Security</span>
            </div>
            <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>All transactions are secured with bank-level encryption and multi-factor authentication.</p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 8 }}>
              <Globe size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>Global Access</span>
            </div>
            <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>Access your portfolio from anywhere in the world with our secure platform.</p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 8 }}>
              <Activity size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>Real-time Updates</span>
            </div>
            <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>Portfolio values and earnings are updated in real-time throughout the trading day.</p>
          </div>
        </div>
      </section>

    </main>
  );
}