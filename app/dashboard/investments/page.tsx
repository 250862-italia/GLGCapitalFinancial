"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowLeft,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Investment {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  package?: {
    name: string;
    description: string;
    duration: number;
    expectedReturn: number;
    minInvestment: number;
    maxInvestment: number;
  };
}

interface PortfolioStats {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  averageReturn: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

export default function MyInvestmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalEarned: 0,
    activeInvestments: 0,
    averageReturn: 0,
    todayEarnings: 0,
    monthlyEarnings: 0
  });

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('investments')
        .select(`
          *,
          package:packages(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setInvestments(data || []);
      calculateStats(data || []);
    } catch (err: any) {
      console.error('Error fetching investments:', err);
      setError('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (investments: Investment[]) => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    
    // Calculate earnings based on active investments
    const totalEarned = investments
      .filter(inv => inv.status === 'active' && inv.package)
      .reduce((sum, inv) => {
        const daysActive = Math.floor((Date.now() - new Date(inv.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const dailyEarnings = (inv.amount * (inv.package?.expectedReturn || 0)) / 100;
        return sum + (dailyEarnings * Math.min(daysActive, inv.package?.duration || 30));
      }, 0);

    const averageReturn = activeInvestments > 0 
      ? investments
          .filter(inv => inv.status === 'active' && inv.package)
          .reduce((sum, inv) => sum + (inv.package?.expectedReturn || 0), 0) / activeInvestments
      : 0;

    // Mock daily and monthly earnings for demo
    const todayEarnings = totalEarned * 0.01; // 1% of total earned
    const monthlyEarnings = totalEarned * 0.3; // 30% of total earned

    setStats({
      totalInvested,
      totalEarned,
      activeInvestments,
      averageReturn,
      todayEarnings,
      monthlyEarnings
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} color="#059669" />;
      case 'pending':
        return <Clock size={20} color="#f59e0b" />;
      case 'completed':
        return <CheckCircle size={20} color="#3b82f6" />;
      case 'cancelled':
        return <XCircle size={20} color="#dc2626" />;
      default:
        return <Clock size={20} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { background: '#dcfce7', color: '#166534' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      case 'completed':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateExpectedReturn = (amount: number, expectedReturn: number) => {
    return (amount * expectedReturn) / 100;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b', fontSize: 18 }}>Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#6b7280" />
          </button>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              My Investments
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Track your investment portfolio and performance
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#dbeafe', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <TrendingUp size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Total Investments
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {investments.length}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#dcfce7', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <DollarSign size={24} color="#059669" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Total Invested
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  €{investments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#fef3c7', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <Clock size={24} color="#f59e0b" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Active
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {investments.filter(inv => inv.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#f3e8ff', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <Calendar size={24} color="#8b5cf6" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Pending
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {investments.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem 2rem',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
              Investment History
            </h2>
          </div>

          <div style={{ padding: '2rem' }}>
            {investments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <TrendingUp size={64} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>
                  No investments yet
                </h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                  Start your investment journey by exploring our available packages
                </p>
                <button
                  onClick={() => router.push('/investments')}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Browse Investment Packages
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {investments.map((investment) => {
                  const statusStyle = getStatusColor(investment.status);
                  return (
                    <div key={investment.id} style={{
                      background: '#f8fafc',
                      borderRadius: 12,
                      padding: '1.5rem',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '1rem',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                            {investment.package?.name || 'Investment Package'}
                          </h3>
                          <span style={{
                            background: statusStyle.background,
                            color: statusStyle.color,
                            padding: '0.25rem 0.75rem',
                            borderRadius: 12,
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {getStatusIcon(investment.status)}
                            {investment.status}
                          </span>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0.5rem 0' }}>
                          {investment.package?.description || 'Investment package'}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Amount</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                              €{investment.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Expected Return</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#059669', margin: 0 }}>
                              €{calculateExpectedReturn(investment.amount, investment.package?.expectedReturn || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Duration</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                              {investment.package?.duration || 0} months
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Created</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                              {formatDate(investment.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* PnL Overview Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem',
          marginBottom: '2rem'
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
            <div style={{ fontSize: 16, color: '#3b82f6', fontWeight: 700, marginBottom: 6 }}>Today's P&L</div>
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
            <div style={{ fontSize: 16, color: '#ec4899', fontWeight: 700, marginBottom: 6 }}>Monthly P&L</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.monthlyEarnings)}</div>
          </div>
        </div>

        {/* Earnings Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
              P&L Overview
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

          {/* P&L Chart */}
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
                P&L chart for {selectedTimeframe} period
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Profit & Loss visualization will be implemented here
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
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '1.5rem' }}>
            Recent P&L Activity
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { type: 'profit', message: 'Daily profit credited', amount: 594, time: '2 hours ago', percentage: '+2.5%' },
              { type: 'investment', message: 'New investment started', amount: 10000, time: '1 day ago', percentage: '+0%' },
              { type: 'profit', message: 'Daily profit credited', amount: 594, time: '1 day ago', percentage: '+2.5%' },
              { type: 'loss', message: 'Market adjustment', amount: 250, time: '3 days ago', percentage: '-1.2%' },
              { type: 'profit', message: 'Weekly profit credited', amount: 1200, time: '1 week ago', percentage: '+5.1%' }
            ].map((activity, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '6px', background: '#f9fafb' }}>
                <div style={{
                  background: activity.type === 'profit' ? '#f0fdf4' : activity.type === 'investment' ? '#eff6ff' : '#fef2f2',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  color: activity.type === 'profit' ? '#059669' : activity.type === 'investment' ? '#3b82f6' : '#dc2626'
                }}>
                  {activity.type === 'profit' && <TrendingUp size={16} />}
                  {activity.type === 'investment' && <DollarSign size={16} />}
                  {activity.type === 'loss' && <ArrowDownRight size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>
                    {activity.message}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {activity.time}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: activity.type === 'loss' ? '#dc2626' : '#059669',
                    display: 'block'
                  }}>
                    {activity.type === 'loss' ? '-' : '+'}{formatCurrency(activity.amount)}
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: activity.type === 'loss' ? '#dc2626' : '#059669',
                    fontWeight: 500
                  }}>
                    {activity.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 