"use client";

import { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Clock, 
  Settings,
  UserPlus,
  DollarSign,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';

interface AdminNotification {
  id: string;
  type: 'user_registration' | 'investment' | 'security_alert' | 'system_alert' | 'payment_processed';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    label: string;
    url: string;
  };
  metadata?: Record<string, any>;
}

interface AdminNotificationsProps {
  adminId: string;
}

export default function AdminNotifications({ adminId }: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');

  console.log('🔔 AdminNotifications rendered:', { adminId, showDropdown, notificationsCount: notifications.length });

  useEffect(() => {
    loadNotifications();
    
    // Add a test notification for debugging
    setTimeout(() => {
      const testNotification: AdminNotification = {
        id: 'test-' + Date.now(),
        type: 'system_alert',
        title: 'Test Notification',
        message: 'This is a test notification to verify the bell is working',
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      };
      addNotification(testNotification);
    }, 2000);
    
    // Setup real-time notifications using the realtime manager
    if (typeof window !== 'undefined') {
      const { realtimeManager } = require('@/lib/realtime-manager');
      
      // Subscribe to admin events
      const adminSubs = realtimeManager.subscribeToAdminEvents(adminId, (event) => {
        const notification = convertRealtimeEventToNotification(event);
        addNotification(notification);
      });

      // Cleanup subscriptions
      return () => {
        adminSubs.forEach(sub => sub.unsubscribe());
      };
    }
  }, [adminId]);

  const loadNotifications = async () => {
    try {
      // For now, create sample notifications for testing
      const sampleNotifications: AdminNotification[] = [
        {
          id: '1',
          type: 'investment',
          title: 'Nuova Richiesta di Investimento',
          message: 'Francesco fra (info@washtw.it) ha richiesto di investire $5,000 nel pacchetto GLG Balanced Growth',
          timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
          read: false,
          priority: 'high',
          action: {
            label: 'Revisiona Investimento',
            url: '/admin/investments'
          },
          metadata: {
            client_name: 'Francesco fra',
            client_email: 'info@washtw.it',
            package_name: 'GLG Balanced Growth',
            amount: 5000,
            investment_id: 'inv-001'
          }
        },
        {
          id: '2',
          type: 'user_registration',
          title: 'Nuovo Cliente Registrato',
          message: 'Francesco fra (info@washtw.it) si è registrato come nuovo cliente',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          read: false,
          priority: 'medium',
          action: {
            label: 'Visualizza Cliente',
            url: '/admin/clients'
          }
        },
        {
          id: '3',
          type: 'system_alert',
          title: 'Sistema Operativo',
          message: 'Tutte le funzionalità del sistema sono operative',
          timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
          read: false,
          priority: 'low'
        }
      ];

      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const convertRealtimeEventToNotification = (event: any): AdminNotification => {
    const baseNotification: AdminNotification = {
      id: event.id || Date.now().toString(),
      type: event.type as AdminNotification['type'],
      title: getNotificationTitle(event.type),
      message: getNotificationMessage(event.type),
      timestamp: event.timestamp || new Date(),
      read: false,
      priority: event.priority || 'medium',
      metadata: event.data
    };

    // Add specific details for investment notifications
    if (event.type === 'investment' && event.data) {
      baseNotification.title = 'New Investment Request';
      baseNotification.message = `${event.data.client_name || 'A client'} (${event.data.client_email || 'N/A'}) has requested to invest $${event.data.amount?.toLocaleString() || 'N/A'} in the ${event.data.package_name || 'N/A'} package.`;
      baseNotification.priority = 'high';
      baseNotification.action = {
        label: 'Review Investment',
        url: `/admin/investments`
      };
    }

    return baseNotification;
  };

  const addNotification = (notification: AdminNotification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Show browser notification for high priority events
    if (notification.priority === 'high' || notification.priority === 'critical') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`GLG Admin - ${notification.title}`, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus size={16} color="#3b82f6" />;
      case 'investment':
        return <DollarSign size={16} color="#059669" />;
      case 'security_alert':
        return <Shield size={16} color="#dc2626" />;
      case 'payment_processed':
        return <CheckCircle size={16} color="#059669" />;
      case 'system_alert':
        return <AlertCircle size={16} color="#7c3aed" />;
      default:
        return <Info size={16} color="#6b7280" />;
    }
  };

  const getPriorityColor = (priority: AdminNotification['priority']) => {
    switch (priority) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#d97706';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const getNotificationStyle = (priority: AdminNotification['priority']) => {
    switch (priority) {
      case 'critical':
        return { background: '#fef2f2', borderColor: '#fecaca' };
      case 'high':
        return { background: '#fef3c7', borderColor: '#fed7aa' };
      case 'medium':
        return { background: '#f0f9ff', borderColor: '#bfdbfe' };
      case 'low':
        return { background: '#f0fdf4', borderColor: '#bbf7d0' };
      default:
        return { background: '#f8fafc', borderColor: '#e2e8f0' };
    }
  };

  const getNotificationTitle = (type: AdminNotification['type']) => {
    switch (type) {
      case 'user_registration':
        return 'Nuovo Cliente Registrato';
      case 'investment':
        return 'Nuova Richiesta di Investimento';
      case 'security_alert':
        return 'Allerta Sicurezza';
      case 'payment_processed':
        return 'Pagamento Processato';
      case 'system_alert':
        return 'Avviso Sistema';
      default:
        return 'Notifica';
    }
  };

  const getNotificationMessage = (type: AdminNotification['type']) => {
    switch (type) {
      case 'user_registration':
        return 'Un nuovo cliente si è registrato';
      case 'investment':
        return 'Nuova richiesta di investimento ricevuta';
      case 'security_alert':
        return 'Evento di sicurezza rilevato';
      case 'payment_processed':
        return 'Pagamento completato con successo';
      case 'system_alert':
        return 'Aggiornamento del sistema';
      default:
        return 'Nuova notifica ricevuta';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high_priority') return notification.priority === 'high' || notification.priority === 'critical';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => 
    !n.read && (n.priority === 'high' || n.priority === 'critical')
  ).length;

  return (
    <div style={{ 
      position: 'relative'
    }}>
      {/* Notification Bell */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔔 Notification bell clicked!');
          setShowDropdown(!showDropdown);
        }}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          padding: '0.75rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          transition: 'all 0.2s',
          zIndex: 1003,
          pointerEvents: 'auto'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: highPriorityCount > 0 ? '#dc2626' : '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: 400,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          marginTop: '0.5rem',
          zIndex: 1001
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifiche</span>
              {unreadCount > 0 && (
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '0.125rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  color: '#6b7280',
                  fontSize: '0.75rem'
                }}
              >
                Segna tutte come lette
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            gap: '0.5rem'
          }}>
            {['all', 'unread', 'high_priority'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                style={{
                  background: filter === filterType ? '#3b82f6' : 'transparent',
                  color: filter === filterType ? 'white' : '#6b7280',
                  border: '1px solid #e2e8f0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {filterType === 'all' ? 'Tutte' : 
                 filterType === 'unread' ? 'Non lette' : 'Alta priorità'}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: 350,
            overflowY: 'auto'
          }}>
            {filteredNotifications.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Bell size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Nessuna notifica</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f1f5f9',
                    background: notification.read ? 'white' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read ? 'white' : '#f8fafc';
                  }}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.action) {
                      window.location.href = notification.action.url;
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      marginTop: 2
                    }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.25rem'
                      }}>
                        <h4 style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {notification.title}
                        </h4>
                        <span style={{
                          fontSize: 12,
                          color: '#6b7280'
                        }}>
                          {notification.timestamp.toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <p style={{
                        fontSize: 13,
                        color: '#6b7280',
                        margin: '0 0 0.5rem 0',
                        lineHeight: 1.4
                      }}>
                        {typeof notification.message === 'string' 
                          ? notification.message 
                          : JSON.stringify(notification.message)}
                      </p>
                      
                      {notification.action && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                            window.location.href = notification.action!.url;
                          }}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close - only when dropdown is open */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(false);
          }}
        />
      )}
    </div>
  );
} 