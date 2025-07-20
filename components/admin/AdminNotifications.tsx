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

  useEffect(() => {
    loadNotifications();
    
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

  const loadNotifications = () => {
    // Mock notifications - in real app this would come from API
    const mockNotifications: AdminNotification[] = [
      {
        id: '1',
        type: 'user_registration',
        title: 'New User Registration',
        message: 'John Doe (john.doe@example.com) has registered for an account.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        priority: 'medium',
        action: {
          label: 'Review User',
          url: '/admin/users'
        },
        metadata: {
          userId: '123',
          email: 'john.doe@example.com',
          name: 'John Doe'
        }
      },
      {
        id: '2',
        type: 'investment',
        title: 'Large Investment Completed',
        message: 'User Sarah Wilson has invested $50,000 in the Aggressive Growth package.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: false,
        priority: 'high',
        action: {
          label: 'View Transaction',
          url: '/admin/transactions'
        },
        metadata: {
          userId: '456',
          amount: 50000,
          package: 'Aggressive Growth'
        }
      },
      {
        id: '3',
        type: 'security_alert',
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        read: false,
        priority: 'critical',
        action: {
          label: 'View Security',
          url: '/admin/security'
        },
        metadata: {
          ipAddress: '192.168.1.100',
          failedAttempts: 8
        }
      },
      {
        id: '4',
        type: 'payment_processed',
        title: 'Payment Processed',
        message: 'Payment of $25,000 has been successfully processed for user Mike Johnson.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
        priority: 'low',
        action: {
          label: 'View Details',
          url: '/admin/payments'
        },
        metadata: {
          userId: '789',
          amount: 25000,
          status: 'completed'
        }
      }
    ];

    setNotifications(mockNotifications);
  };



  const getNotificationTitle = (type: AdminNotification['type']): string => {
    switch (type) {
      case 'user_registration':
        return 'New User Registration';
      case 'investment':
        return 'Investment Completed';
      case 'security_alert':
        return 'Security Alert';
      case 'payment_processed':
        return 'Payment Processed';
      case 'system_alert':
        return 'System Alert';
      default:
        return 'New Notification';
    }
  };

  const getNotificationMessage = (type: AdminNotification['type']): string => {
    switch (type) {
      case 'user_registration':
        return 'A new user has registered for an account.';
      case 'investment':
        return 'A user has completed an investment transaction.';
      case 'security_alert':
        return 'Suspicious activity has been detected.';
      case 'payment_processed':
        return 'A payment has been successfully processed.';
      case 'system_alert':
        return 'System maintenance or update notification.';
      default:
        return 'You have a new notification.';
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
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#374151'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: highPriorityCount > 0 ? '#dc2626' : '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: 10,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          zIndex: 1000,
          maxHeight: 500,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1f2937',
              margin: 0
            }}>
              Notifications
            </h3>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  padding: '0.25rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  padding: '0.25rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.25rem 0.5rem',
                border: 'none',
                borderRadius: 4,
                background: filter === 'all' ? '#3b82f6' : '#f3f4f6',
                color: filter === 'all' ? 'white' : '#374151',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                padding: '0.25rem 0.5rem',
                border: 'none',
                borderRadius: 4,
                background: filter === 'unread' ? '#3b82f6' : '#f3f4f6',
                color: filter === 'unread' ? 'white' : '#374151',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('high_priority')}
              style={{
                padding: '0.25rem 0.5rem',
                border: 'none',
                borderRadius: 4,
                background: filter === 'high_priority' ? '#dc2626' : '#f3f4f6',
                color: filter === 'high_priority' ? 'white' : '#374151',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              High Priority ({highPriorityCount})
            </button>
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
                <p style={{ margin: 0, fontSize: 14 }}>No notifications</p>
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
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: getPriorityColor(notification.priority)
                          }} />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            style={{
                              padding: '0.25rem',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#9ca3af'
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
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
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: 11,
                          color: '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <Clock size={10} />
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        
                        {notification.action && (
                          <span style={{
                            fontSize: 11,
                            color: '#3b82f6',
                            fontWeight: 600
                          }}>
                            {notification.action.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  background: 'white',
                  color: '#374151',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Mark all as read
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/notifications'}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: 6,
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                View all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
} 