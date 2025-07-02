"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalInvestments: number;
    totalRevenue: number;
    userGrowth: number;
    revenueGrowth: number;
  };
  userMetrics: {
    newUsers: number;
    verifiedUsers: number;
    pendingKYC: number;
    blockedUsers: number;
  };
  investmentMetrics: {
    totalAmount: number;
    averageInvestment: number;
    successfulTransactions: number;
    failedTransactions: number;
  };
  securityMetrics: {
    securityAlerts: number;
    suspiciousActivities: number;
    blockedIPs: number;
    failedLogins: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'user_registration' | 'investment' | 'kyc_approval' | 'security_alert';
    description: string;
    timestamp: Date;
    severity?: 'low' | 'medium' | 'high';
  }>;
  chartData: {
    userGrowth: Array<{ date: string; users: number }>;
    revenue: Array<{ date: string; revenue: number }>;
    investments: Array<{ date: string; amount: number }>;
  };
}

export default function AdminAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1247,
          activeUsers: 892,
          totalInvestments: 4560000,
          totalRevenue: 456000,
          userGrowth: 12.5,
          revenueGrowth: 8.3
        },
        userMetrics: {
          newUsers: 45,
          verifiedUsers: 892,
          pendingKYC: 23,
          blockedUsers: 5
        },
        investmentMetrics: {
          totalAmount: 4560000,
          averageInvestment: 12500,
          successfulTransactions: 364,
          failedTransactions: 12
        },
        securityMetrics: {
          securityAlerts: 8,
          suspiciousActivities: 15,
          blockedIPs: 23,
          failedLogins: 156
        },
        recentActivity: [
          {
            id: '1',
            type: 'user_registration',
            description: 'New user registered: john.doe@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            severity: 'low'
          },
          {
            id: '2',
            type: 'investment',
            description: 'Large investment: $50,000 in Aggressive Growth package',
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            severity: 'medium'
          },
          {
            id: '3',
            type: 'kyc_approval',
            description: 'KYC approved for user: jane.smith@example.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            severity: 'low'
          },
          {
            id: '4',
            type: 'security_alert',
            description: 'Multiple failed login attempts detected from IP 192.168.1.100',
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
            severity: 'high'
          },
          {
            id: '5',
            type: 'investment',
            description: 'Investment completed: $25,000 in Balanced Portfolio',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            severity: 'low'
          }
        ],
        chartData: {
          userGrowth: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            users: Math.floor(Math.random() * 50) + 1200
          })),
          revenue: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 20000) + 400000
          })),
          investments: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 200000) + 4000000
          }))
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus size={16} />;
      case 'investment':
        return <DollarSign size={16} />;
      case 'kyc_approval':
        return <UserCheck size={16} />;
      case 'security_alert':
        return <AlertTriangle size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#64748b' }}>No analytics data available</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 8
          }}>
            Analytics Dashboard
          </h1>
          <p style={{
            fontSize: 16,
            color: '#6b7280',
            margin: 0
          }}>
            Monitor your platform's performance and user activity
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button style={{
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            background: 'white',
            color: '#374151',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
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
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={24} color="#3b82f6" />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: analyticsData.overview.userGrowth >= 0 ? '#059669' : '#dc2626'
            }}>
              {analyticsData.overview.userGrowth >= 0 ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {Math.abs(analyticsData.overview.userGrowth)}%
              </span>
            </div>
          </div>
          <h3 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 4
          }}>
            {analyticsData.overview.totalUsers.toLocaleString()}
          </h3>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            margin: 0
          }}>
            Total Users
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={24} color="#059669" />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: analyticsData.overview.revenueGrowth >= 0 ? '#059669' : '#dc2626'
            }}>
              {analyticsData.overview.revenueGrowth >= 0 ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {Math.abs(analyticsData.overview.revenueGrowth)}%
              </span>
            </div>
          </div>
          <h3 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 4
          }}>
            ${analyticsData.overview.totalRevenue.toLocaleString()}
          </h3>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            margin: 0
          }}>
            Total Revenue
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={24} color="#d97706" />
            </div>
          </div>
          <h3 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 4
          }}>
            ${(analyticsData.overview.totalInvestments / 1000000).toFixed(1)}M
          </h3>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            margin: 0
          }}>
            Total Investments
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={24} color="#7c3aed" />
            </div>
          </div>
          <h3 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 4
          }}>
            {analyticsData.overview.activeUsers.toLocaleString()}
          </h3>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            margin: 0
          }}>
            Active Users
          </p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* User Metrics */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Users size={20} />
            User Metrics
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#f0fdf4',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>New Users</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>
                {analyticsData.userMetrics.newUsers}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#f0fdf4',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Verified Users</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>
                {analyticsData.userMetrics.verifiedUsers}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#fef3c7',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Pending KYC</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#d97706' }}>
                {analyticsData.userMetrics.pendingKYC}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#fef2f2',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Blocked Users</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
                {analyticsData.userMetrics.blockedUsers}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Metrics */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <DollarSign size={20} />
            Investment Metrics
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#f0fdf4',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Total Amount</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>
                ${(analyticsData.investmentMetrics.totalAmount / 1000000).toFixed(1)}M
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#f0fdf4',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Average Investment</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>
                ${analyticsData.investmentMetrics.averageInvestment != null ? analyticsData.investmentMetrics.averageInvestment.toLocaleString() : '-'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#f0fdf4',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Successful Transactions</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#059669' }}>
                {analyticsData.investmentMetrics.successfulTransactions}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#fef2f2',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Failed Transactions</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
                {analyticsData.investmentMetrics.failedTransactions}
              </span>
            </div>
          </div>
        </div>

        {/* Security Metrics */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertTriangle size={20} />
            Security Metrics
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#fef2f2',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Security Alerts</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
                {analyticsData.securityMetrics.securityAlerts}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#fef3c7',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Suspicious Activities</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#d97706' }}>
                {analyticsData.securityMetrics.suspiciousActivities}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#fef2f2',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Blocked IPs</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
                {analyticsData.securityMetrics.blockedIPs}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#fef3c7',
              borderRadius: 8
            }}>
              <span style={{ fontSize: 14, color: '#374151' }}>Failed Logins</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#d97706' }}>
                {analyticsData.securityMetrics.failedLogins}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1f2937',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Activity size={20} />
          Recent Activity
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {analyticsData.recentActivity.map((activity) => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: getSeverityColor(activity.severity || 'low'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14,
                  color: '#374151',
                  margin: 0,
                  fontWeight: 500
                }}>
                  {activity.description}
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#6b7280',
                  margin: 0
                }}>
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
              
              <div style={{
                padding: '0.25rem 0.5rem',
                background: getSeverityColor(activity.severity || 'low'),
                color: 'white',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {activity.severity || 'low'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 