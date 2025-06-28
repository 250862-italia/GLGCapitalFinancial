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
  RefreshCw,
  Plus,
  Filter,
  Search,
  MoreVertical
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
  remainingDays: number;
}

interface InvestmentPackage {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyReturn: number;
  duration: number;
  features: string[];
  popular?: boolean;
  available: boolean;
}

export default function InvestmentManager() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewInvestment, setShowNewInvestment] = useState(false);
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
        monthlyEarnings: 3600,
        remainingDays: 45
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
        monthlyEarnings: 720,
        remainingDays: 12
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
        monthlyEarnings: 13500,
        remainingDays: 75
      },
      {
        id: '4',
        packageName: 'Starter Package',
        amount: 2000,
        dailyReturn: 0.8,
        duration: 30,
        startDate: '2023-12-01',
        endDate: '2023-12-31',
        status: 'completed',
        totalEarned: 480,
        dailyEarnings: 0,
        monthlyEarnings: 0,
        remainingDays: 0
      }
    ];

    const mockPackages: InvestmentPackage[] = [
      {
        id: 'starter',
        name: 'Starter Package',
        minAmount: 1000,
        maxAmount: 5000,
        dailyReturn: 0.8,
        duration: 30,
        features: ['Daily returns', '24/7 support', 'Risk management', 'Mobile app access'],
        available: true
      },
      {
        id: 'premium',
        name: 'Premium Package',
        minAmount: 5000,
        maxAmount: 25000,
        dailyReturn: 1.2,
        duration: 60,
        features: ['Higher daily returns', 'Priority support', 'Advanced analytics', 'Portfolio management'],
        popular: true,
        available: true
      },
      {
        id: 'vip',
        name: 'VIP Package',
        minAmount: 25000,
        maxAmount: 100000,
        dailyReturn: 1.8,
        duration: 90,
        features: ['Maximum returns', 'Dedicated manager', 'Exclusive events', 'Custom strategies'],
        available: true
      }
    ];

    setInvestments(mockInvestments);
    setPackages(mockPackages);
    setIsLoading(false);
  }, []);

  const filteredInvestments = investments.filter(investment => {
    const matchesFilter = selectedFilter === 'all' || investment.status === selectedFilter;
    const matchesSearch = investment.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  const calculateProgress = (investment: Investment) => {
    const totalDays = investment.duration;
    const elapsedDays = totalDays - investment.remainingDays;
    return Math.min((elapsedDays / totalDays) * 100, 100);
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
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937' }}>
              Investment Management
            </h1>
            <button
              onClick={() => setShowNewInvestment(true)}
              style={{
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}
            >
              <Plus size={20} />
              New Investment
            </button>
          </div>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Manage your investment portfolio and track performance
          </p>
        </div>

        {/* Stats Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Target size={16} color="#3b82f6" />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Investments</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {investments.filter(inv => inv.status === 'active').length}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <DollarSign size={16} color="#059669" />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Invested</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {formatCurrency(investments.reduce((sum, inv) => sum + inv.amount, 0))}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Earned</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {formatCurrency(investments.reduce((sum, inv) => sum + inv.totalEarned, 0))}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <BarChart3 size={16} color="#ec4899" />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Today's Earnings</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {formatCurrency(investments.reduce((sum, inv) => sum + inv.dailyEarnings, 0))}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#6b7280' 
              }} />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingLeft: '2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['all', 'active', 'completed', 'pending'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: selectedFilter === filter ? '1px solid #3b82f6' : '1px solid #d1d5db',
                    background: selectedFilter === filter ? '#3b82f6' : 'white',
                    color: selectedFilter === filter ? 'white' : '#374151',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
              Your Investments ({filteredInvestments.length})
            </h2>
          </div>

          {filteredInvestments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <BarChart3 size={48} color="#6b7280" />
              <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '1.125rem' }}>
                No investments found
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Start your first investment to see it here'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredInvestments.map(investment => (
                <div key={investment.id} style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
                          {investment.packageName}
                        </h3>
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
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Investment Amount</p>
                          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                            {formatCurrency(investment.amount)}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Daily Return</p>
                          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>
                            {formatPercentage(investment.dailyReturn)}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Total Earned</p>
                          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                            {formatCurrency(investment.totalEarned)}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Today's Earnings</p>
                          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>
                            {formatCurrency(investment.dailyEarnings)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      color: '#6b7280'
                    }}>
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {investment.status === 'active' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Progress</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                          {investment.remainingDays} days remaining
                        </span>
                      </div>
                      <div style={{ 
                        background: '#e5e7eb', 
                        height: '8px', 
                        borderRadius: '4px', 
                        overflow: 'hidden' 
                      }}>
                        <div style={{
                          background: '#059669',
                          height: '100%',
                          width: `${calculateProgress(investment)}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Eye size={14} />
                      View Details
                    </button>
                    <button style={{
                      background: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Download size={14} />
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Packages */}
        {showNewInvestment && (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            marginTop: '2rem',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                Available Investment Packages
              </h2>
              <button
                onClick={() => setShowNewInvestment(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {packages.map(pkg => (
                <div key={pkg.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#fafafa'
                }}>
                  {pkg.popular && (
                    <div style={{
                      background: '#f59e0b',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {pkg.name}
                  </h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <TrendingUp size={20} color="#059669" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
                      {pkg.dailyReturn}%
                    </span>
                    <span style={{ color: '#6b7280' }}>daily return</span>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                      Investment Range: {formatCurrency(pkg.minAmount)} - {formatCurrency(pkg.maxAmount)}
                    </p>
                    <p style={{ color: '#6b7280' }}>
                      Duration: {pkg.duration} days
                    </p>
                  </div>
                  
                  <ul style={{ marginBottom: '1.5rem' }}>
                    {pkg.features.map((feature, index) => (
                      <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <CheckCircle size={14} color="#059669" />
                        <span style={{ fontSize: '0.875rem' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button style={{
                    background: pkg.available ? '#059669' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    cursor: pkg.available ? 'pointer' : 'not-allowed',
                    width: '100%',
                    fontWeight: 600
                  }}>
                    {pkg.available ? 'Invest Now' : 'Coming Soon'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 