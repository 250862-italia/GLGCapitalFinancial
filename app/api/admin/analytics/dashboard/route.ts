import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { offlineDataManager } from '@/lib/offline-data';
import { getDashboardOverviewWithFallback } from '@/lib/supabase-fallback';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

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
    type: string;
    description: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  chartData: {
    userGrowth: Array<{ date: string; users: number }>;
    revenue: Array<{ date: string; revenue: number }>;
    investments: Array<{ date: string; amount: number }>;
  };
}

export async function GET() {
  try {
    console.log('🔍 Admin analytics dashboard API called');
    
    // Usa il nuovo sistema di fallback
    const dashboardData = await getDashboardOverviewWithFallback();
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching analytics dashboard data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 