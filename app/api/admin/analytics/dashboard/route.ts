import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Get user metrics
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role, created_at, last_login');

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // Get investment metrics
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('id, amount, status, created_at');

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
    }

    // Get payment metrics
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, amount, status, created_at');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    // Calculate metrics
    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter(u => u.last_login && new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;
    const verifiedUsers = users?.filter(u => u.role === 'user').length || 0;
    const pendingKYC = 0; // KYC system removed
    const blockedUsers = 5; // Mock for now

    const totalInvestments = investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
    const successfulInvestments = investments?.filter(inv => inv.status === 'active').length || 0;
    const averageInvestment = totalInvestments / (successfulInvestments || 1);

    const totalRevenue = payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const successfulTransactions = payments?.filter(p => p.status === 'completed').length || 0;
    const failedTransactions = payments?.filter(p => p.status === 'failed').length || 0;

    // Calculate growth percentages (mock for now)
    const userGrowth = 12.5;
    const revenueGrowth = 8.3;

    // Mock security metrics
    const securityMetrics = {
      securityAlerts: 8,
      suspiciousActivities: 15,
      blockedIPs: 23,
      failedLogins: 156
    };

    // Mock recent activity
    const recentActivity = [
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
    ];

    const analyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        totalInvestments,
        totalRevenue,
        userGrowth,
        revenueGrowth
      },
      userMetrics: {
        newUsers: 45, // Mock for now
        verifiedUsers,
        pendingKYC,
        blockedUsers
      },
      investmentMetrics: {
        totalAmount: totalInvestments,
        averageInvestment,
        successfulTransactions,
        failedTransactions
      },
      securityMetrics,
      recentActivity
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error in GET /api/admin/analytics/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 