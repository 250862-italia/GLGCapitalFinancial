"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  TrendingUp, 
  User, 
  FileText, 
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { logoutUser, logoutAdmin } from '@/lib/logout-manager';

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();


  const handleLogout = async () => {
    try {
      console.log('🔄 DashboardSidebar: Starting logout...');
      
      // Check if user is admin or regular user
      const adminUser = localStorage.getItem('admin_user');
      
      if (adminUser) {
        // Admin logout
        console.log('🔄 DashboardSidebar: Admin logout detected');
        await logoutAdmin({
          redirectTo: '/',
          clearAdminData: true,
          showConfirmation: false
        });
      } else {
        // Regular user logout
        console.log('🔄 DashboardSidebar: User logout detected');
        await logoutUser({
          redirectTo: '/login',
          clearUserData: true,
          showConfirmation: false
        });
      }
    } catch (error) {
      console.error('❌ DashboardSidebar: Logout error:', error);
      // Fallback redirect
      window.location.href = '/';
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      href: '/dashboard'
    },
    {
      title: 'My Investments',
      icon: <TrendingUp size={20} />,
      href: '/dashboard/investments'
    },
    {
      title: 'Profile',
      icon: <User size={20} />,
      href: '/profile'
    },
    {
      title: 'Request Documentation',
      icon: <FileText size={20} />,
      href: '/informational-request'
    }
  ];

  const filteredMenuItems = menuItems;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: isOpen ? '280px' : '80px',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      transition: 'width 0.3s ease',
      zIndex: 1000,
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={18} />
          </div>
          {isOpen && (
            <span style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              GLG Capital
            </span>
          )}
        </div>
        
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredMenuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <li key={index}>
                <button
                  onClick={() => router.push(item.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    border: 'none',
                    color: isActive ? '#3b82f6' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {item.icon}
                  {isOpen && <span>{item.title}</span>}
                </button>
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