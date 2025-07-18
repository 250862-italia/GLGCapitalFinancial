"use client";

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, Settings, UserPlus, DollarSign, Shield, UserCheck, UserX, RefreshCw } from 'lucide-react';
import realtimeManager, { RealtimeEvent } from '@/lib/realtime-manager';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'investment' | 'user_registration' | 'payment' | 'security_alert';
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

interface NotificationSystemProps {
  userId: string;
  userRole?: 'admin' | 'user' | 'superadmin';
}

export default function NotificationSystem({ userId, userRole = 'user' }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, subscriptions: 0, events: 0 });

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscriptions();
    
    // Update connection status every 5 seconds
    const statusInterval = setInterval(() => {
      setConnectionStatus(realtimeManager.getConnectionStatus());
    }, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [userId, userRole]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to user-specific notifications
    const notificationSub = realtimeManager.subscribeToNotifications(userId, (event) => {
      const notification = convertRealtimeEventToNotification(event);
      addNotification(notification);
    });

    // Subscribe to investment updates
    const investmentSub = realtimeManager.subscribeToInvestments(userId, (event) => {
      const notification = convertRealtimeEventToNotification(event);
      addNotification(notification);
    });

    // Admin-specific subscriptions
    if (userRole === 'admin' || userRole === 'superadmin') {
      const adminSubs = realtimeManager.subscribeToAdminEvents(userId, (event) => {
        const notification = convertRealtimeEventToNotification(event);
        addNotification(notification);
      });

      // Cleanup admin subscriptions
      return () => {
        notificationSub.unsubscribe();
        investmentSub.unsubscribe();
        adminSubs.forEach(sub => sub.unsubscribe());
      };
    }

    // Cleanup user subscriptions
    return () => {
      notificationSub.unsubscribe();
      investmentSub.unsubscribe();
    };
  };

  const convertRealtimeEventToNotification = (event: RealtimeEvent): Notification => {
    const baseNotification: Notification = {
      id: event.id,
      type: event.type as any,
      title: getNotificationTitle(event.type, event.data),
      message: getNotificationMessage(event.type, event.data),
      timestamp: event.timestamp,
      read: false,
      priority: event.priority,
      metadata: event.data
    };

    // Add action based on event type
    switch (event.type) {
      case 'investment':
        baseNotification.action = {
          label: 'View Investment',
          url: `/dashboard/investments`
        };
        break;
      case 'user_registration':
        if (userRole === 'admin' || userRole === 'superadmin') {
          baseNotification.action = {
            label: 'View User',
            url: `/admin/users`
          };
        }
        break;
      case 'payment':
        baseNotification.action = {
          label: 'View Payment',
          url: `/admin/payments`
        };
        break;
    }

    return baseNotification;
  };

  const getNotificationTitle = (type: RealtimeEvent['type'], data: any): string => {
    switch (type) {
      case 'investment':
        return 'New Investment';
      case 'user_registration':
        return 'New User Registration';
      case 'payment':
        return 'Payment Update';
      case 'notification':
        return 'New Notification';
      case 'system_alert':
        return 'System Alert';
      default:
        return 'New Event';
    }
  };

  const getNotificationMessage = (type: RealtimeEvent['type'], data: any): string => {
    switch (type) {
      case 'investment':
        const amount = data.new?.amount || data.data?.amount;
        return `Investment of $${amount?.toLocaleString()} has been processed.`;
      case 'user_registration':
        const userName = data.new?.first_name || data.data?.first_name;
        return `${userName} has registered for an account.`;
      case 'payment':
        const status = data.new?.status || data.data?.status;
        return `Payment status updated to ${status}.`;
      case 'notification':
        return data.new?.message || data.data?.message || 'You have a new notification.';
      case 'system_alert':
        return data.new?.message || data.data?.message || 'System alert received.';
      default:
        return 'New event occurred.';
    }
  };

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Load from database
      const response = await fetchJSONWithCSRF(`/api/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const dbNotifications = data.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.created_at),
          read: n.status === 'read',
          priority: n.priority || 'medium',
          action: n.metadata?.action,
          metadata: n.metadata
        }));
        setNotifications(dbNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    // Update in database
    try {
      await fetchJSONWithCSRF(`/api/notifications/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ notificationId, status: 'read' 
      })
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Update in database
    try {
      await fetchJSONWithCSRF(`/api/notifications/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ markAllRead: true 
      })
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );

    // Delete from database
    try {
      await fetchJSONWithCSRF(`/api/notifications/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify({ notificationId 
      })
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} color="#16a34a" />;
      case 'error':
        return <AlertCircle size={16} color="#dc2626" />;
      case 'warning':
        return <AlertCircle size={16} color="#d97706" />;
      case 'info':
        return <Info size={16} color="#0284c7" />;
      case 'investment':
        return <DollarSign size={16} color="#059669" />;
      case 'user_registration':
        return <UserPlus size={16} color="#3b82f6" />;
      case 'payment':
        return <CheckCircle size={16} color="#059669" />;
      case 'security_alert':
        return <Shield size={16} color="#dc2626" />;
      default:
        return <Info size={16} color="#6b7280" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
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

  const getNotificationStyle = (priority: Notification['priority']) => {
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
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6b7280',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.color = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        <Bell size={20} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}

        {/* Connection Status Indicator */}
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: connectionStatus.connected ? '#10b981' : '#ef4444',
          marginLeft: '4px'
        }} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: '400px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 1000,
          marginTop: '8px'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                Notifications
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {connectionStatus.connected ? 'Live updates' : 'Polling mode'} • {connectionStatus.subscriptions} active
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={loadNotifications}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Refresh"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Settings"
              >
                <Settings size={14} />
              </button>
              
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? '#3b82f6' : '#f3f4f6',
                color: filter === 'all' ? 'white' : '#374151',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                background: filter === 'unread' ? '#3b82f6' : '#f3f4f6',
                color: filter === 'unread' ? 'white' : '#374151',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('high_priority')}
              style={{
                background: filter === 'high_priority' ? '#dc2626' : '#f3f4f6',
                color: filter === 'high_priority' ? 'white' : '#374151',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              High Priority ({highPriorityCount})
            </button>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: '400px',
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
                    padding: '16px',
                    borderBottom: '1px solid #f1f5f9',
                    background: notification.read ? 'white' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderLeft: `4px solid ${getPriorityColor(notification.priority)}`
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {getNotificationIcon(notification.type)}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                          {notification.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: 'white',
                        background: getPriorityColor(notification.priority)
                      }}>
                        {notification.priority}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {notification.action && (
                    <div style={{ marginTop: '8px' }}>
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
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        {notification.action.label}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Mark all as read
            </button>
            
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: 500
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1f2937',
                margin: 0
              }}>
                Notification Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: '1rem'
              }}>
                Notification Types
              </h4>
              
              {[
                { key: 'market_alerts', label: 'Market Alerts', description: 'Get notified about significant market movements' },
                { key: 'transaction_updates', label: 'Transaction Updates', description: 'Receive updates about your buy/sell orders' },
                { key: 'dividend_notifications', label: 'Dividend Notifications', description: 'Get notified about dividend payments' },
                { key: 'portfolio_alerts', label: 'Portfolio Alerts', description: 'Receive alerts about your portfolio performance' }
              ].map((setting) => (
                <label key={setting.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    style={{ margin: 0 }}
                  />
                  <div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      {setting.label}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#6b7280'
                    }}>
                      {setting.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  padding: '0.5rem 1rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: '#059669',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 