"use client";
import { useEffect, useState } from "react";
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface SystemStatus {
  database: 'online' | 'offline' | 'degraded';
  api: 'online' | 'offline' | 'degraded';
  email: 'online' | 'offline' | 'degraded';
  storage: 'online' | 'offline' | 'degraded';
  lastCheck: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  details?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export default function AdminDiagnosticsPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    api: 'online',
    email: 'online',
    storage: 'online',
    lastCheck: new Date().toISOString()
  });
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [logFilter, setLogFilter] = useState('all');

  useEffect(() => {
    loadDiagnosticsData();
    const interval = setInterval(loadDiagnosticsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDiagnosticsData = async () => {
    setLoading(true);
    try {
      // Simulate system status check
      const mockSystemStatus: SystemStatus = {
        database: Math.random() > 0.1 ? 'online' : 'degraded',
        api: Math.random() > 0.05 ? 'online' : 'degraded',
        email: Math.random() > 0.15 ? 'online' : 'offline',
        storage: 'online',
        lastCheck: new Date().toISOString()
      };
      setSystemStatus(mockSystemStatus);

      // Simulate performance metrics
      const mockMetrics: PerformanceMetric[] = [
        {
          name: 'Response Time',
          value: Math.random() * 200 + 50,
          unit: 'ms',
          status: Math.random() > 0.7 ? 'good' : Math.random() > 0.4 ? 'warning' : 'critical',
          trend: Math.random() > 0.5 ? 'down' : 'up'
        },
        {
          name: 'CPU Usage',
          value: Math.random() * 40 + 20,
          unit: '%',
          status: Math.random() > 0.6 ? 'good' : 'warning',
          trend: Math.random() > 0.5 ? 'stable' : 'up'
        },
        {
          name: 'Memory Usage',
          value: Math.random() * 30 + 40,
          unit: '%',
          status: Math.random() > 0.7 ? 'good' : 'warning',
          trend: Math.random() > 0.5 ? 'stable' : 'up'
        },
        {
          name: 'Database Connections',
          value: Math.random() * 20 + 5,
          unit: 'active',
          status: 'good',
          trend: 'stable'
        }
      ];
      setPerformanceMetrics(mockMetrics);

      // Simulate log entries
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5000).toISOString(),
          level: 'info',
          message: 'System health check completed',
          source: 'health-monitor'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 15000).toISOString(),
          level: 'warning',
          message: 'High memory usage detected',
          source: 'performance-monitor',
          details: 'Memory usage exceeded 80% threshold'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          level: 'error',
          message: 'Database connection timeout',
          source: 'database-service',
          details: 'Connection attempt failed after 30 seconds'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'info',
          message: 'Backup completed successfully',
          source: 'backup-service'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'critical',
          message: 'Email service unavailable',
          source: 'email-service',
          details: 'SMTP server not responding'
        }
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Failed to load diagnostics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'degraded': return 'Degradato';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getMetricStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredLogs = logs.filter(log => 
    logFilter === 'all' || log.level === logFilter
  );

  const runSystemTest = async () => {
    setLoading(true);
    // Simulate running system tests
    setTimeout(() => {
      loadDiagnosticsData();
    }, 2000);
  };

  if (loading && logs.length === 0) {
    return (
      <AdminProtectedRoute>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <span style={{ marginLeft: '1rem' }}>Caricamento diagnostiche...</span>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--primary)' }}>
              Diagnostiche Sistema
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Monitoraggio e diagnostica del sistema GLG Capital Group
            </p>
          </div>
          <button
            onClick={runSystemTest}
            disabled={loading}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Test in corso...' : 'Esegui Test Sistema'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e0e3eb' }}>
          {[
            { id: 'overview', name: 'Panoramica' },
            { id: 'performance', name: 'Performance' },
            { id: 'logs', name: 'Log Sistema' },
            { id: 'status', name: 'Stato Servizi' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Stato Generale Sistema</h2>
            
            {/* System Status Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {Object.entries(systemStatus).filter(([key]) => key !== 'lastCheck').map(([service, status]) => (
                <div key={service} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {service === 'database' ? 'Database' :
                       service === 'api' ? 'API' :
                       service === 'email' ? 'Email' : 'Storage'}
                    </h3>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getStatusColor(status)
                    }} />
                  </div>
                  <div style={{ 
                    color: getStatusColor(status), 
                    fontSize: '24px', 
                    fontWeight: 700 
                  }}>
                    {getStatusText(status)}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Errori Oggi</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>
                  {logs.filter(log => log.level === 'error' || log.level === 'critical').length}
                </div>
              </div>
              <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Ultimo Controllo</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                  {new Date(systemStatus.lastCheck).toLocaleTimeString('it-IT')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Metriche Performance</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {performanceMetrics.map((metric, index) => (
                <div key={index} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{metric.name}</h3>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getMetricStatusColor(metric.status)
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: 700, 
                    color: getMetricStatusColor(metric.status),
                    marginBottom: '0.5rem'
                  }}>
                    {metric.value.toFixed(1)} {metric.unit}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Trend: {metric.trend === 'up' ? '↗️ In aumento' : 
                           metric.trend === 'down' ? '↘️ In diminuzione' : '→ Stabile'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Log Sistema</h2>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white'
                }}
              >
                <option value="all">Tutti i livelli</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div style={{ maxHeight: '500px', overflow: 'auto' }}>
              {filteredLogs.map((log) => (
                <div key={log.id} style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #e0e3eb',
                  background: log.level === 'critical' ? '#fef2f2' : 
                             log.level === 'error' ? '#fef3c7' : 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      background: getLogLevelColor(log.level), 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 600 
                    }}>
                      {log.level.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {new Date(log.timestamp).toLocaleString('it-IT')}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {log.source}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    {log.message}
                  </div>
                  {log.details && (
                    <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                      {log.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Stato Dettagliato Servizi</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {Object.entries(systemStatus).filter(([key]) => key !== 'lastCheck').map(([service, status]) => (
                <div key={service} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                        {service === 'database' ? 'Database PostgreSQL' :
                         service === 'api' ? 'API REST' :
                         service === 'email' ? 'Servizio Email' : 'Storage Files'}
                      </h3>
                      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                        {service === 'database' ? 'Database principale per dati utenti e transazioni' :
                         service === 'api' ? 'API per comunicazione frontend-backend' :
                         service === 'email' ? 'Servizio per invio email e notifiche' : 'Storage per documenti e file'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: getStatusColor(status),
                        margin: '0 auto 0.5rem'
                      }} />
                      <div style={{ 
                        color: getStatusColor(status), 
                        fontSize: '18px', 
                        fontWeight: 700 
                      }}>
                        {getStatusText(status)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'white', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginTop: '1rem',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Endpoint:</span>
                      <span style={{ fontFamily: 'monospace' }}>
                        {service === 'database' ? 'postgresql://localhost:5432/glgcapital' :
                         service === 'api' ? 'https://api.glgcapital.com' :
                         service === 'email' ? 'smtp.glgcapital.com:587' : '/storage'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ultimo controllo:</span>
                      <span>{new Date(systemStatus.lastCheck).toLocaleString('it-IT')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  );
} 