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

interface Investment {
  id: string;
  packageName: string;
  amount: number;
  dailyReturn: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  totalEarned: number;
  dailyEarnings: number;
  monthlyEarnings: number;
}

interface PortfolioStats {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  averageReturn: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

export default function ClientDashboard() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalEarned: 0,
    activeInvestments: 0,
    averageReturn: 0,
    todayEarnings: 0,
    monthlyEarnings: 0
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockInvestments: Investment[] = [
      {
        id: '1',
        packageName: 'Premium Package',
        amount: 10000,
        dailyReturn: 1.2,
        duration: 60,
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        status: 'active',
        totalEarned: 2400,
        dailyEarnings: 120,
        monthlyEarnings: 3600
      },
      {
        id: '2',
        packageName: 'Starter Package',
        amount: 3000,
        dailyReturn: 0.8,
        duration: 30,
        startDate: '2024-02-01',
        endDate: '2024-03-02',
        status: 'active',
        totalEarned: 480,
        dailyEarnings: 24,
        monthlyEarnings: 720
      },
      {
        id: '3',
        packageName: 'VIP Package',
        amount: 25000,
        dailyReturn: 1.8,
        duration: 90,
        startDate: '2024-01-01',
        endDate: '2024-04-01',
        status: 'active',
        totalEarned: 8100,
        dailyEarnings: 450,
        monthlyEarnings: 13500
      }
    ];

    setInvestments(mockInvestments);

    // Calculate stats
    const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarned = mockInvestments.reduce((sum, inv) => sum + inv.totalEarned, 0);
    const activeInvestments = mockInvestments.filter(inv => inv.status === 'active').length;
    const averageReturn = mockInvestments.length > 0 
      ? mockInvestments.reduce((sum, inv) => sum + inv.dailyReturn, 0) / mockInvestments.length 
      : 0;
    const todayEarnings = mockInvestments.reduce((sum, inv) => sum + inv.dailyEarnings, 0);
    const monthlyEarnings = mockInvestments.reduce((sum, inv) => sum + inv.monthlyEarnings, 0);

    setStats({
      totalInvested,
      totalEarned,
      activeInvestments,
      averageReturn,
      todayEarnings,
      monthlyEarnings
    });

    setIsLoading(false);
  }, []);

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

  if (isLoading) {
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

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                background: '#f0fdf4', 
                padding: '0.75rem', 
                borderRadius: '8px',
                color: '#059669'
              }}>
                <DollarSign size={24} />
              </div>
              <ArrowUpRight size={20} color="#059669" />
            </div>
            <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Total Invested
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {formatCurrency(stats.totalInvested)}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                background: '#fef3c7', 
                padding: '0.75rem', 
                borderRadius: '8px',
                color: '#f59e0b'
              }}>
                <TrendingUp size={24} />
              </div>
              <ArrowUpRight size={20} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Total Earned
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {formatCurrency(stats.totalEarned)}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                background: '#eff6ff', 
                padding: '0.75rem', 
                borderRadius: '8px',
                color: '#3b82f6'
              }}>
                <Target size={24} />
              </div>
              <ArrowUpRight size={20} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Today's Earnings
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {formatCurrency(stats.todayEarnings)}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ 
                background: '#fdf2f8', 
                padding: '0.75rem', 
                borderRadius: '8px',
                color: '#ec4899'
              }}>
                <BarChart3 size={24} />
              </div>
              <ArrowUpRight size={20} color="#ec4899" />
            </div>
            <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Monthly Earnings
            </h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {formatCurrency(stats.monthlyEarnings)}
            </p>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          
          {/* Investments List */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                Active Investments
              </h2>
              <button style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {investments.map(investment => (
                <div key={investment.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                        {investment.packageName}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatCurrency(investment.amount)} • {formatPercentage(investment.dailyReturn)} daily return
                      </p>
                    </div>
                    <div style={{
                      background: getStatusColor(investment.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {getStatusText(investment.status)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Daily Earnings</p>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>
                        {formatCurrency(investment.dailyEarnings)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Total Earned</p>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                        {formatCurrency(investment.totalEarned)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>End Date</p>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                        {new Date(investment.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            height: 'fit-content'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '1.5rem' }}>
              Portfolio Summary
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Investments</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                  {stats.activeInvestments}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Average Return</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>
                  {formatPercentage(stats.averageReturn)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Portfolio Value</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                  {formatCurrency(stats.totalInvested + stats.totalEarned)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>ROI</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>
                  {formatPercentage((stats.totalEarned / stats.totalInvested) * 100)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <button style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: 600
              }}>
                Invest More
              </button>
            </div>
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
      </div>
    </div>
  );
}
