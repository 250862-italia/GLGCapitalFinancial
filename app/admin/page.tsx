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
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminConsole from '@/components/admin/AdminConsole';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState<any>({
    name: 'Admin User',
    role: 'admin'
  });
  const [logs, setLogs] = useState<string[]>([]);

  // Funzione per aggiungere log
  const addLog = (msg: string) => setLogs(logs => [...logs, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  const clearLogs = () => setLogs([]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_token");
    addLog("Admin logged out successfully");
    router.push('/');
  };

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

  const recentActivities = [
    { action: "New client registration", time: "2 minutes ago", type: "user" },
    { action: "Position update - GLG Equity A", time: "15 minutes ago", type: "position" },
    { action: "News article published", time: "1 hour ago", type: "content" },
    { action: "Market data updated", time: "2 hours ago", type: "data" },
    { action: "Team member profile updated", time: "3 hours ago", type: "team" },
  ];

  const quickActions = [
    { name: "Manage Packages", icon: Package, color: "#3b82f6", href: "/admin/packages" },
    { name: "Client Management", icon: Users, color: "var(--accent)", href: "/admin/clients" },
    { name: "Payment Management", icon: CreditCard, color: "#8b5cf6", href: "/admin/payments" },
    { name: "Documentation Requests", icon: FileText, color: "#f59e0b", href: "/admin/informational-requests" },
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