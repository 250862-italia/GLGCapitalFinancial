"use client";

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface NotificationSystemProps {
  userId: string;
}

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Simulate real-time notifications
    const interval = setInterval(() => {
      checkNewNotifications();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = () => {
    // Mock notifications - in real app this would come from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Investment Successful',
        message: 'Your purchase of 50 AAPL shares has been completed successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        action: {
          label: 'View Details',
          url: '/reserved/portfolio'
        }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Market Alert',
        message: 'TSLA stock has dropped 5% in the last hour. Consider reviewing your position.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: false,
        action: {
          label: 'Review Portfolio',
          url: '/reserved/portfolio'
        }
      },
      {
        id: '3',
        type: 'info',
        title: 'Dividend Payment',
        message: 'You received a dividend payment of $24.50 from Apple Inc.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'Transaction Failed',
        message: 'Your sell order for 25 TSLA shares could not be processed. Please try again.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        read: false,
        action: {
          label: 'Retry Transaction',
          url: '/reserved/transactions'
        }
      }
    ];

    setNotifications(mockNotifications);
  };

  const checkNewNotifications = () => {
    // Simulate new notifications
    const shouldAddNotification = Math.random() > 0.8; // 20% chance
    
    if (shouldAddNotification) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'info',
        title: 'Market Update',
        message: 'New market data is available for your portfolio.',
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
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
      default:
        return <Info size={16} color="#6b7280" />;
    }
  };

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return { background: '#f0fdf4', borderColor: '#bbf7d0' };
      case 'error':
        return { background: '#fef2f2', borderColor: '#fecaca' };
      case 'warning':
        return { background: '#fef3c7', borderColor: '#fed7aa' };
      case 'info':
        return { background: '#f0f9ff', borderColor: '#bfdbfe' };
      default:
        return { background: '#f8fafc', borderColor: '#e2e8f0' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
            background: '#dc2626',
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

      {/* Notification Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: 400,
          maxHeight: 500,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#059669',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                Mark all read
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: 400,
            overflowY: 'auto'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Bell size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    ...getNotificationStyle(notification.type)
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {getNotificationIcon(notification.type)}
                      <h4 style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {notification.title}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <p style={{
                    fontSize: 13,
                    color: '#6b7280',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.4
                  }}>
                    {notification.message}
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
                      gap: '0.25rem'
                    }}>
                      <Clock size={12} />
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                    
                    {notification.action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = notification.action!.url;
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#059669',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#059669',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              View All Notifications
            </button>
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

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
} 