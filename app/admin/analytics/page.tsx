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
  Clock,
  ExternalLink
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
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

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
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading Analytics...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#1a2238', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '0.5rem' 
          }}>
            Analytics Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Comprehensive insights into platform performance and user activity
          </p>
        </div>

        {/* Quick Navigation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <a href="/admin/analytics/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <BarChart3 size={20} style={{ marginRight: '0.5rem' }} />
            <span>Detailed Dashboard</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/analytics/reports" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <PieChart size={20} style={{ marginRight: '0.5rem' }} />
            <span>Reports</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/analytics/surveillance" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Eye size={20} style={{ marginRight: '0.5rem' }} />
            <span>Surveillance</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/analytics/visitors" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Users size={20} style={{ marginRight: '0.5rem' }} />
            <span>Visitor Analytics</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
        </div>

        {/* Overview Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          
          {/* Total Users */}
          <div style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 12, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                background: '#dbeafe',
                padding: '0.5rem',
                borderRadius: 8,
                marginRight: '0.75rem'
              }}>
                <Users size={20} color="#1d4ed8" />
              </div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Users</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
                {analyticsData?.overview.totalUsers.toLocaleString()}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  +{analyticsData?.overview.userGrowth}%
                </span>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 12, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                background: '#dcfce7',
                padding: '0.5rem',
                borderRadius: 8,
                marginRight: '0.75rem'
              }}>
                <UserCheck size={20} color="#059669" />
              </div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Active Users</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
                {analyticsData?.overview.activeUsers.toLocaleString()}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {Math.round((analyticsData?.overview.activeUsers || 0) / (analyticsData?.overview.totalUsers || 1) * 100)}% of total
              </span>
            </div>
          </div>

          {/* Total Investments */}
          <div style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 12, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                background: '#fef3c7',
                padding: '0.5rem',
                borderRadius: 8,
                marginRight: '0.75rem'
              }}>
                <DollarSign size={20} color="#d97706" />
              </div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Investments</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
                ${(analyticsData?.overview.totalInvestments || 0).toLocaleString()}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  +{analyticsData?.overview.revenueGrowth}%
                </span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 12, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                background: '#fce7f3',
                padding: '0.5rem',
                borderRadius: 8,
                marginRight: '0.75rem'
              }}>
                <TrendingUp size={20} color="#be185d" />
              </div>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
                ${(analyticsData?.overview.totalRevenue || 0).toLocaleString()}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
                <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  +{analyticsData?.overview.revenueGrowth}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          
          {/* User Metrics */}
          <div style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 12, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#1a2238', 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              User Metrics
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>New Users (30d)</span>
                <span style={{ fontWeight: 600, color: '#1a2238' }}>{analyticsData?.userMetrics.newUsers}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Verified Users</span>
                <span style={{ fontWeight: 600, color: '#1a2238' }}>{analyticsData?.userMetrics.verifiedUsers}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Pending KYC</span>
                <span style={{ fontWeight: 600, color: '#d97706' }}>{analyticsData?.userMetrics.pendingKYC}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Blocked Users</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{analyticsData?.userMetrics.blockedUsers}</span>
              </div>
            </div>
          </div>

          {/* Investment Metrics */}
          <div style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 12, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#1a2238', 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Investment Metrics
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Total Amount</span>
                <span style={{ fontWeight: 600, color: '#1a2238' }}>
                  ${(analyticsData?.investmentMetrics.totalAmount || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Average Investment</span>
                <span style={{ fontWeight: 600, color: '#1a2238' }}>
                  ${(analyticsData?.investmentMetrics.averageInvestment || 0).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Successful Transactions</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{analyticsData?.investmentMetrics.successfulTransactions}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Failed Transactions</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{analyticsData?.investmentMetrics.failedTransactions}</span>
              </div>
            </div>
          </div>

          {/* Security Metrics */}
          <div style={{ 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 12, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#1a2238', 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Security Metrics
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Security Alerts</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{analyticsData?.securityMetrics.securityAlerts}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Suspicious Activities</span>
                <span style={{ fontWeight: 600, color: '#d97706' }}>{analyticsData?.securityMetrics.suspiciousActivities}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Blocked IPs</span>
                <span style={{ fontWeight: 600, color: '#1a2238' }}>{analyticsData?.securityMetrics.blockedIPs}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Failed Logins</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{analyticsData?.securityMetrics.failedLogins}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
} 