"use client";

import { useState, useEffect } from 'react';
import { Bell, X, DollarSign, User, Calendar, Package } from 'lucide-react';
import { useRealtime } from '@/hooks/use-realtime';

interface InvestmentNotification {
  id: string;
  client_name: string;
  client_email: string;
  package_name: string;
  amount: number;
  expected_return: number;
  duration: number;
  timestamp: Date;
  status: 'new' | 'reviewed' | 'approved' | 'rejected';
}

interface InvestmentNotificationsProps {
  adminId: string;
  maxNotifications?: number;
}

export default function InvestmentNotifications({ 
  adminId, 
  maxNotifications = 5 
}: InvestmentNotificationsProps) {
  const [notifications, setNotifications] = useState<InvestmentNotification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { events } = useRealtime({
    userId: adminId,
    userRole: 'admin',
    enableAdminEvents: true
  });

  // Filter investment events
  useEffect(() => {
    const investmentEvents = events
      .filter(event => event.type === 'investment')
      .map(event => ({
        id: event.id,
        client_name: event.data?.client_name || 'Unknown Client',
        client_email: event.data?.client_email || 'N/A',
        package_name: event.data?.package_name || 'Unknown Package',
        amount: event.data?.amount || 0,
        expected_return: event.data?.expected_return || 0,
        duration: event.data?.duration || 30,
        timestamp: event.timestamp,
        status: 'new' as const
      }));

    setNotifications(investmentEvents);
  }, [events]);

  const displayNotifications = showAll ? notifications : notifications.slice(0, maxNotifications);
  const hasMore = notifications.length > maxNotifications;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: InvestmentNotification['status']) => {
    switch (status) {
      case 'new': return '#dc2626';
      case 'reviewed': return '#f59e0b';
      case 'approved': return '#059669';
      case 'rejected': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const markAsReviewed = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: 'reviewed' }
          : notification
      )
    );
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '400px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: '#1a2238',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} />
          <span style={{ fontWeight: 600 }}>Investment Requests</span>
          {notifications.filter(n => n.status === 'new').length > 0 && (
            <span style={{
              background: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {notifications.filter(n => n.status === 'new').length}
            </span>
          )}
        </div>
        <X 
          size={20} 
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setNotifications([]);
          }}
        />
      </div>

      {/* Notifications List */}
      {isExpanded && (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {displayNotifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #f3f4f6',
                background: notification.status === 'new' ? '#fef2f2' : 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = notification.status === 'new' ? '#fee2e2' : '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.status === 'new' ? '#fef2f2' : 'white';
              }}
              onClick={() => markAsReviewed(notification.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <DollarSign size={16} color={getStatusColor(notification.status)} />
                <span style={{ fontWeight: 600, color: '#1f2937' }}>
                  {formatCurrency(notification.amount)}
                </span>
                <span style={{
                  background: getStatusColor(notification.status),
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {notification.status.toUpperCase()}
                </span>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <User size={14} color="#6b7280" />
                  <span style={{ fontSize: '14px', color: '#374151' }}>
                    {notification.client_name}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '20px' }}>
                  {notification.client_email}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Package size={14} color="#6b7280" />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  {notification.package_name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Calendar size={14} color="#6b7280" />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {notification.expected_return}% daily • {notification.duration} days
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {formatTime(notification.timestamp)}
              </div>
            </div>
          ))}

          {hasMore && (
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              borderTop: '1px solid #f3f4f6'
            }}>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {showAll ? 'Show Less' : `Show ${notifications.length - maxNotifications} More`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 