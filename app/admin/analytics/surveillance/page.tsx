"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield,
  Filter,
  Search,
  Download,
  RefreshCw,
  Trash2,
  Mail,
  Activity,
  BarChart3,
  Calendar,
  User,
  Package,
  CreditCard,
  FileText
} from 'lucide-react';
import { emailNotificationService, NotificationData } from '../../../../lib/email-service';

interface SurveillanceStats {
  totalNotifications: number;
  notificationsByType: { [key: string]: number };
  notificationsBySeverity: { [key: string]: number };
  recentActivity: number;
  criticalAlerts: number;
  userRegistrations: number;
  kycSubmissions: number;
  packagePurchases: number;
  investmentCancellations: number;
}

export default function SurveillancePage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<SurveillanceStats>({
    totalNotifications: 0,
    notificationsByType: {},
    notificationsBySeverity: {},
    recentActivity: 0,
    criticalAlerts: 0,
    userRegistrations: 0,
    kycSubmissions: 0,
    packagePurchases: 0,
    investmentCancellations: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    dateRange: '7d',
    search: ''
  });
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load notifications and calculate stats
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const storedNotifications = emailNotificationService.getStoredNotifications();
    setNotifications(storedNotifications);
    calculateStats(storedNotifications);
    applyFilters(storedNotifications);
  };

  const calculateStats = (notifications: NotificationData[]) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats: SurveillanceStats = {
      totalNotifications: notifications.length,
      notificationsByType: {},
      notificationsBySeverity: {},
      recentActivity: 0,
      criticalAlerts: 0,
      userRegistrations: 0,
      kycSubmissions: 0,
      packagePurchases: 0,
      investmentCancellations: 0
    };

    notifications.forEach(notification => {
      // Count by type
      stats.notificationsByType[notification.type] = (stats.notificationsByType[notification.type] || 0) + 1;
      
      // Count by severity
      stats.notificationsBySeverity[notification.severity] = (stats.notificationsBySeverity[notification.severity] || 0) + 1;
      
      // Count recent activity (last 7 days)
      const notificationDate = new Date(notification.timestamp);
      if (notificationDate >= sevenDaysAgo) {
        stats.recentActivity++;
      }
      
      // Count critical alerts
      if (notification.severity === 'critical') {
        stats.criticalAlerts++;
      }
      
      // Count specific types
      switch (notification.type) {
        case 'user_registration':
          stats.userRegistrations++;
          break;
        case 'kyc_submission':
          stats.kycSubmissions++;
          break;
        case 'package_purchase':
          stats.packagePurchases++;
          break;
        case 'investment_cancellation':
          stats.investmentCancellations++;
          break;
      }
    });

    setStats(stats);
  };

  const applyFilters = (notifications: NotificationData[]) => {
    let filtered = [...notifications];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    // Filter by severity
    if (filters.severity) {
      filtered = filtered.filter(n => n.severity === filters.severity);
    }

    // Filter by date range
    const now = new Date();
    let startDate: Date;
    switch (filters.dateRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }
    filtered = filtered.filter(n => new Date(n.timestamp) >= startDate);

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower) ||
        (n.userName && n.userName.toLowerCase().includes(searchLower))
      );
    }

    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    applyFilters(notifications);
  }, [filters, notifications]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <User size={16} />;
      case 'kyc_submission': return <FileText size={16} />;
      case 'package_purchase': return <Package size={16} />;
      case 'investment_cancellation': return <XCircle size={16} />;
      case 'admin_action': return <Shield size={16} />;
      case 'payment_processed': return <CreditCard size={16} />;
      case 'client_activity': return <Activity size={16} />;
      case 'system_alert': return <AlertTriangle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const clearAllNotifications = () => {
    if (confirm('Are you sure you want to clear all surveillance notifications? This action cannot be undone.')) {
      emailNotificationService.clearNotifications();
      loadNotifications();
    }
  };

  const exportNotifications = () => {
    const dataStr = JSON.stringify(notifications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `surveillance-notifications-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
              Surveillance Analytics
            </h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Real-time monitoring and surveillance notifications for GLG Capital Group
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={loadNotifications}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={exportNotifications}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={clearAllNotifications}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Notifications</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                {stats.totalNotifications}
              </p>
            </div>
            <Bell size={24} color="#3b82f6" />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Critical Alerts</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#dc2626', margin: 0 }}>
                {stats.criticalAlerts}
              </p>
            </div>
            <AlertTriangle size={24} color="#dc2626" />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Recent Activity (7d)</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                {stats.recentActivity}
              </p>
            </div>
            <Activity size={24} color="#10b981" />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Package Purchases</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                {stats.packagePurchases}
              </p>
            </div>
            <Package size={24} color="#f59e0b" />
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', margin: '0 0 1rem 0' }}>
            Notifications by Type
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(stats.notificationsByType).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getTypeIcon(type)}
                  <span style={{ fontSize: '0.875rem', color: '#374151', textTransform: 'capitalize' }}>
                    {type.replace('_', ' ')}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', margin: '0 0 1rem 0' }}>
            Notifications by Severity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(stats.notificationsBySeverity).map(([severity, count]) => (
              <div key={severity} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getSeverityColor(severity)
                  }} />
                  <span style={{ fontSize: '0.875rem', color: '#374151', textTransform: 'capitalize' }}>
                    {severity}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', margin: '0 0 1rem 0' }}>
          Filters
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Types</option>
              <option value="user_registration">User Registration</option>
              <option value="kyc_submission">KYC Submission</option>
              <option value="package_purchase">Package Purchase</option>
              <option value="investment_cancellation">Investment Cancellation</option>
              <option value="admin_action">Admin Action</option>
              <option value="payment_processed">Payment Processed</option>
              <option value="client_activity">Client Activity</option>
              <option value="system_alert">System Alert</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Time</option>
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
            Surveillance Notifications ({filteredNotifications.length})
          </h3>
        </div>
        
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <div
                key={notification.timestamp + index}
                style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                onClick={() => {
                  setSelectedNotification(notification);
                  setShowDetailsModal(true);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {getTypeIcon(notification.type)}
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                        {notification.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#fff',
                      background: getSeverityColor(notification.severity)
                    }}>
                      {notification.severity}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatDate(notification.timestamp)}
                    </span>
                  </div>
                </div>
                {notification.userName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    <User size={12} />
                    {notification.userName}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Bell size={48} color="#9ca3af" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', margin: '0 0 0.5rem 0' }}>
                No Notifications Found
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                No surveillance notifications match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
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
          zIndex: 50
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                Notification Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                  {selectedNotification.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  {selectedNotification.message}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Type</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', margin: 0, textTransform: 'capitalize' }}>
                    {selectedNotification.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Severity</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: getSeverityColor(selectedNotification.severity), margin: 0, textTransform: 'capitalize' }}>
                    {selectedNotification.severity}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Timestamp</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    {formatDate(selectedNotification.timestamp)}
                  </p>
                </div>
                {selectedNotification.userName && (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>User</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {selectedNotification.userName}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Details</p>
                <pre style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#374151',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(selectedNotification.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 