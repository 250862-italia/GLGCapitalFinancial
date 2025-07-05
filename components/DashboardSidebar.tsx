"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  TrendingUp, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Package,
  FileText,
  CreditCard,
  Shield,
  BarChart3,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check if user is superadmin
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      try {
        const adminData = JSON.parse(adminUser);
        setIsSuperAdmin(adminData.role === 'super_admin');
      } catch (e) {
        setIsSuperAdmin(false);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      href: '/dashboard',
      adminOnly: false
    },
    {
      title: 'My Investments',
      icon: <TrendingUp size={20} />,
      href: '/dashboard/investments',
      adminOnly: false
    },
    {
      title: 'Profile',
      icon: <User size={20} />,
      href: '/profile',
      adminOnly: false
    },
    {
      title: 'KYC Process',
      icon: <Shield size={20} />,
      href: '/kyc',
      adminOnly: false
    },
    {
      title: 'Admin Panel',
      icon: <Shield size={20} />,
      href: '/admin',
      adminOnly: true
    }
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isSuperAdmin);

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: isOpen ? '280px' : '80px',
      background: 'var(--primary)',
      color: 'var(--secondary)',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={18} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {isSuperAdmin ? 'Admin Panel' : 'Dashboard'}
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* User Info */}
      {isOpen && user && (
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            {user.name || user.first_name || user.email}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            {isSuperAdmin ? 'Super Administrator' : 'Client'}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav style={{ padding: '1rem 0', flex: 1 }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {filteredMenuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    color: isActive ? 'var(--accent)' : 'var(--secondary)',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    gap: '0.75rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {item.icon}
                  {isOpen && <span style={{ fontWeight: 500 }}>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
          }}
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
} 