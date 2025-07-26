"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Users, 
  User,
  FileText, 
  BarChart3, 
  Globe, 
  Shield, 
  Edit, 
  Plus, 
  Trash2, 
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  Building,
  Package,
  CreditCard,
  CheckCircle,
  LogOut,
  Loader2,
  Activity
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminConsole from '@/components/admin/AdminConsole';
import AdminNotifications from '@/components/admin/AdminNotifications';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';
import { logoutAdmin } from '@/lib/logout-manager';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin authentication on mount
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminUserData = localStorage.getItem('admin_user');
      const adminToken = localStorage.getItem('admin_token');
      
      if (!adminUserData || !adminToken) {
        router.push('/admin/login');
        return;
      }

      try {
        const userData = JSON.parse(adminUserData);
        if (userData.role !== 'super_admin' && userData.role !== 'superadmin') {
          router.push('/admin/login');
          return;
        }
        
        setAdminUser(userData);
      } catch (e) {
        router.push('/admin/login');
        return;
      }
      
      setIsLoading(false);
    };

    checkAdminAuth();
  }, [router]);

  // Funzione per aggiungere log
  const addLog = (msg: string) => setLogs(logs => [...logs, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  const clearLogs = () => setLogs([]);

  // Logout function
  const handleLogout = async () => {
    try {
      console.log('🔄 Admin page: Starting admin logout...');
      
      await logoutAdmin({
        redirectTo: '/',
        clearAdminData: true,
        showConfirmation: false
      });
      
      addLog("Admin logged out successfully");
    } catch (error) {
      console.error('❌ Admin page: Logout error:', error);
      addLog("Logout error: " + error);
      // Fallback redirect
      window.location.href = '/';
    }
  };

  // Load recent activities
  const loadRecentActivities = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) return;

      const response = await fetchJSONWithCSRF('/api/admin/activities?limit=10', {
        headers: {
          'x-admin-token': adminToken
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRecentActivities(data.data);
        }
      } else {
        // If the activities table doesn't exist yet, show a helpful message
        console.log('Activities table not ready yet - this is normal during initial setup');
        setRecentActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      // Don't show error to user, just set empty activities
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Load activities on mount
  useEffect(() => {
    if (adminUser) {
      loadRecentActivities();
    }
  }, [adminUser]);

  // Listener globale per log (window.dispatchEvent(new CustomEvent('admin-log', { detail: 'messaggio' })))
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) addLog(e.detail);
    };
    window.addEventListener('admin-log', handler);
    return () => window.removeEventListener('admin-log', handler);
  }, []);

  const stats = [
    { 
      label: "Total Visitors", 
      value: "12,847", 
      icon: Users,
      color: '#3b82f6',
      change: '+12.5%'
    },
    { 
      label: "Active Clients", 
      value: "2,156", 
      icon: Shield,
      color: '#10b981',
      change: '+8.3%'
    },
    { 
      label: "Total Positions", 
      value: "$45.2M", 
      icon: DollarSign,
      color: 'var(--accent)',
      change: '+15.7%'
    },
    { 
      label: "News Articles", 
      value: "24", 
      icon: FileText,
      color: '#8b5cf6',
      change: '+2'
    },
  ];

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const quickActions = [
    { name: "Manage Packages", icon: Package, color: "#3b82f6", href: "/admin/packages" },
    { name: "Client Management", icon: Users, color: "var(--accent)", href: "/admin/clients" },
    { name: "KYC Documents", icon: Shield, color: "#10b981", href: "/admin/kyc" },
    { name: "Payment Management", icon: CreditCard, color: "#8b5cf6", href: "/admin/payments" },
    { name: "Documentation Requests", icon: FileText, color: "#f59e0b", href: "/admin/informational-requests" },
  ];

  const barData = [
    { name: 'Yield', value: 100 },
    { name: 'Fee', value: 6 },
    { name: 'Net', value: 94 },
  ];

  // Helper function to format time
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  function BarChartComponent() {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

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
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading admin dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Image
            src="/glg capital group llcnero .png"
            alt="GLG Capital"
            width={120}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <div style={{ borderLeft: '2px solid #e5e7eb', height: 40, marginLeft: '1rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
            Admin Dashboard
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Real-time notifications for admin */}
          <AdminNotifications adminId={adminUser?.id || 'admin'} />
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Welcome, {adminUser.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <div style={{
          width: 280,
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '2rem 0'
        }}>
          <nav style={{ padding: '0 1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Main
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: activeTab === 'overview' ? '#f3f4f6' : 'transparent',
                    color: activeTab === 'overview' ? '#1f2937' : '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeTab === 'overview' ? 500 : 400
                  }}
                >
                  <BarChart3 size={18} />
                  Overview
                </button>
                <Link href="/admin/clients" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <Users size={18} />
                    Clients
                  </button>
                </Link>
                <Link href="/admin/investments" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <TrendingUp size={18} />
                    Investments
                  </button>
                </Link>
                <Link href="/admin/packages" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <Package size={18} />
                    Packages
                  </button>
                </Link>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Analytics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/admin/analytics/dashboard" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <BarChart3 size={18} />
                    Dashboard
                  </button>
                </Link>
                <Link href="/admin/analytics/visitors" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <Globe size={18} />
                    Visitors
                  </button>
                </Link>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Management
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/admin/kyc" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <Shield size={18} />
                    KYC
                  </button>
                </Link>
                <Link href="/admin/payments" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <CreditCard size={18} />
                    Payments
                  </button>
                </Link>
                <Link href="/admin/informational-requests" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <FileText size={18} />
                    Requests
                  </button>
                </Link>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem' }}>
                System
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/admin/diagnostics" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    <Settings size={18} />
                    Diagnostics
                  </button>
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem' }}>
          {activeTab === 'overview' && (
            <div>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            {stat.label}
                          </p>
                          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.25rem' }}>
                            {stat.value}
                          </p>
                          <p style={{ color: stat.change.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>
                            {stat.change}
                          </p>
                        </div>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent size={24} color="white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
                  Quick Actions
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Link key={index} href={action.href} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'white',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          ':hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            background: action.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                          }}>
                            <IconComponent size={24} color="white" />
                          </div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                            {action.name}
                          </h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activities */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
                  Recent Activities
                </h2>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  {loadingActivities ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading activities...</p>
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <Activity size={24} className="mx-auto mb-2 text-gray-400" />
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No recent activities</p>
                    </div>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <div key={activity.id || index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: index < recentActivities.length - 1 ? '1px solid #f3f4f6' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: activity.type === 'user' ? '#3b82f6' : 
                                       activity.type === 'investment' ? '#10b981' :
                                       activity.type === 'content' ? '#8b5cf6' :
                                       activity.type === 'kyc' ? '#f59e0b' :
                                       activity.type === 'payment' ? '#8b5cf6' :
                                       activity.type === 'system' ? '#6b7280' : '#6b7280'
                          }} />
                          <span style={{ color: '#374151', fontSize: '0.875rem' }}>
                            {activity.action}
                          </span>
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Performance Chart */}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>
                  Performance Overview
                </h2>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <BarChartComponent />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 