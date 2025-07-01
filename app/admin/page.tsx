"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Users, 
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
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check if admin is authenticated
    const adminUserData = localStorage.getItem('admin_user');
    const adminToken = localStorage.getItem('admin_token');
    
    if (!adminUserData || !adminToken) {
      router.push('/admin/login');
      return;
    }

    const user = JSON.parse(adminUserData);
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/admin/login');
      return;
    }

    setAdminUser(user);
  }, [router]);

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

  const recentActivities = [
    { action: "New client registration", time: "2 minutes ago", type: "user" },
    { action: "Position update - GLG Equity A", time: "15 minutes ago", type: "position" },
    { action: "News article published", time: "1 hour ago", type: "content" },
    { action: "Market data updated", time: "2 hours ago", type: "data" },
    { action: "Team member profile updated", time: "3 hours ago", type: "team" },
  ];

  const quickActions = [
    { name: "Manage Packages", icon: Package, color: "#3b82f6", href: "/admin/packages" },
    { name: "KYC Management", icon: CheckCircle, color: "#10b981", href: "/admin/kyc" },
    { name: "Client Management", icon: Users, color: "var(--accent)", href: "/admin/clients" },
    { name: "Payment Management", icon: CreditCard, color: "#8b5cf6", href: "/admin/payments" },
  ];

  const barData = [
    { name: 'Yield', value: 100 },
    { name: 'Fee', value: 6 },
    { name: 'Net', value: 94 },
  ];

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

  if (!adminUser) {
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

  return (
    <>
      {/* STICKY BANNER */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 2000,
        background: '#f0fdf4',
        borderBottom: '1px solid #bbf7d0',
        padding: '1rem 0',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
      }}>
        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 16 }}>
          Welcome, {adminUser.name} ({adminUser.role})
        </span>
      </div>
      {/* SPACER to avoid content hidden under sticky banner */}
      <div style={{ height: 68 }} />
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      
        {/* HEADER */}
        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: 36, fontWeight: 900, marginBottom: 8 }}>GLG Management Console</h1>
          <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8 }}>
            Administrative dashboard for GLG Capital Group website management
          </p>
        </section>

        {/* NAVIGATION TABS */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'content', name: 'Content Management', icon: FileText },
              { id: 'team', name: 'Team Management', icon: Users },
              { id: 'partnerships', name: 'Partnerships', icon: Building },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp },
              { id: 'settings', name: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--primary)' : 'var(--secondary)',
                  color: activeTab === tab.id ? '#fff' : 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            ))}
          </div>
        </section>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* STATS CARDS + GRAFICO */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Site Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {/* Card 1 */}
                <div style={{ background: 'var(--secondary)', padding: '2rem', borderRadius: 12, border: '2px solid #e0e3eb' }}>
                  <BarChartComponent />
                  <div style={{ color: 'var(--foreground)', fontSize: 14, opacity: 0.8, marginTop: 16, textAlign: 'center' }}>
                    Fixed, Attractive Yield
                  </div>
                </div>
                {/* Altre card come prima, tranne quella del 12% */}
                {stats.filter((_, i) => i !== 2).map((stat, index) => (
                  <div key={index} style={{ background: 'var(--secondary)', padding: '2rem', borderRadius: 12, border: '2px solid #e0e3eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <stat.icon size={32} style={{ color: stat.color }} />
                      <span style={{ color: '#10b981', fontSize: 14, fontWeight: 600 }}>%</span>
                    </div>
                    <div style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{stat.value}</div>
                    <div style={{ color: 'var(--foreground)', fontSize: 14, opacity: 0.8 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Business Management</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1.5rem',
                      borderRadius: 12,
                      border: '2px solid #e0e3eb',
                      background: '#fff',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      textDecoration: 'none'
                    }}
                  >
                    <action.icon size={24} style={{ color: action.color }} />
                    {action.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* RECENT ACTIVITIES */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Recent Activities</h2>
              <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '1.5rem' }}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '1rem 0',
                    borderBottom: index < recentActivities.length - 1 ? '1px solid #e0e3eb' : 'none'
                  }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: activity.type === 'user' ? '#3b82f6' : 
                                 activity.type === 'position' ? '#10b981' : 
                                 activity.type === 'content' ? '#8b5cf6' : '#f59e0b'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{activity.action}</div>
                      <div style={{ color: 'var(--foreground)', fontSize: 14, opacity: 0.7 }}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* CONTENT MANAGEMENT TAB */}
        {activeTab === 'content' && (
          <section>
            <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Content Management</h2>
            <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Plus size={20} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Manage Site Content</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>News Articles</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Manage financial news and updates</p>
                  <Link href="/admin/content/news" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Manage News</Link>
                </div>
                
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Partnership Info</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Update partnership details and agreements</p>
                  <Link href="/admin/content/partnership" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Edit Partnership</Link>
                </div>
                
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Market Data</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Update stock ticker and market information</p>
                  <Link href="/admin/content/markets" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Update Markets</Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TEAM MANAGEMENT TAB */}
        {activeTab === 'team' && (
          <section>
            <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Team Management</h2>
            <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Users size={20} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Manage Professional Team</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Add Team Member</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Add new professional team member</p>
                  <Link href="/admin/team/add" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Add Member</Link>
                </div>
                
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Edit Profiles</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Update team member information and photos</p>
                  <Link href="/admin/team/edit" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Edit Team</Link>
                </div>
                
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Team Overview</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>View and manage all team members</p>
                  <Link href="/admin/team/overview" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>View All</Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PARTNERSHIPS TAB */}
        {activeTab === 'partnerships' && (
          <section>
            <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Partnership Management</h2>
            <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Building size={20} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Manage Strategic Partnerships</span>
              </div>
              
              <div style={{ background: '#fff', padding: '2rem', borderRadius: 8, border: '1px solid #e0e3eb', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: '1rem' }}>GLG & Magnificus Dominus Partnership</h3>
                <p style={{ color: 'var(--foreground)', fontSize: 16, lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Strategic partnership for exclusive management and distribution of equity positions in global markets.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href="/admin/partnerships/edit" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Edit Details</Link>
                  <Link href="/admin/partnerships/agreement" style={{ background: '#3b82f6', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>View Agreement</Link>
                  <Link href="/admin/partnerships/status" style={{ background: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Update Status</Link>
                </div>
              </div>
              
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Add New Partnership</h3>
                <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Create new strategic partnership announcement</p>
                <Link href="/admin/partnerships/add" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Add Partnership</Link>
              </div>
            </div>
          </section>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <section>
            <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Site Analytics</h2>
            <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Website Performance Metrics</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Visitor Analytics</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Track website visitors and engagement</p>
                  <Link href="/admin/analytics/visitors" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>View Analytics</Link>
                </div>
                
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Performance Reports</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Generate detailed performance reports</p>
                  <Link href="/admin/analytics/reports" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Generate Report</Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <section>
            <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>System Settings</h2>
            <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Settings size={20} style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Website Configuration</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Site Configuration</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Update site settings and preferences</p>
                  <Link href="/admin/settings/site" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Configure</Link>
                </div>
                
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Security Settings</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Manage security and access controls</p>
                  <Link href="/admin/settings/security" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Security</Link>
                </div>
                
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Backup & Restore</h3>
                  <p style={{ color: 'var(--foreground)', fontSize: 14, marginBottom: '1rem' }}>Manage system backups and restoration</p>
                  <Link href="/admin/settings/backup" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Backup</Link>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </>
  );
} 