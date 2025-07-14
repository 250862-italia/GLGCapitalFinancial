"use client";
import { useEffect, useState } from "react";
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface VisitorData {
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
  topSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  topCountries: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    device: string;
    visitors: number;
    percentage: number;
  }>;
  hourlyData: Array<{
    hour: number;
    visitors: number;
  }>;
  dailyData: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
}

interface RealTimeVisitor {
  id: string;
  page: string;
  country: string;
  device: string;
  timeOnPage: number;
  timestamp: string;
}

export default function AdminAnalyticsVisitorsPage() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [realTimeVisitors, setRealTimeVisitors] = useState<RealTimeVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadVisitorData();
    loadRealTimeData();
    
    // Update real-time data every 30 seconds
    const interval = setInterval(loadRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadVisitorData = async () => {
    setLoading(true);
    try {
      // Simulate visitor data
      const mockData: VisitorData = {
        totalVisitors: 12470,
        uniqueVisitors: 8920,
        returningVisitors: 3550,
        pageViews: 45680,
        averageSessionDuration: 245, // seconds
        bounceRate: 32.5,
        topPages: [
          { path: '/', views: 12500, uniqueViews: 8900 },
          { path: '/investments', views: 8900, uniqueViews: 6700 },
          { path: '/about', views: 5600, uniqueViews: 4200 },
          { path: '/contact', views: 3400, uniqueViews: 2800 },
          { path: '/equity-pledge', views: 2800, uniqueViews: 2100 }
        ],
        topSources: [
          { source: 'Direct', visitors: 4560, percentage: 36.5 },
          { source: 'Google', visitors: 3980, percentage: 31.9 },
          { source: 'Social Media', visitors: 2240, percentage: 18.0 },
          { source: 'Referral', visitors: 1240, percentage: 9.9 },
          { source: 'Email', visitors: 450, percentage: 3.6 }
        ],
        topCountries: [
          { country: 'Italy', visitors: 6235, percentage: 50.0 },
          { country: 'United States', visitors: 2494, percentage: 20.0 },
          { country: 'Germany', visitors: 1247, percentage: 10.0 },
          { country: 'France', visitors: 998, percentage: 8.0 },
          { country: 'United Kingdom', visitors: 748, percentage: 6.0 }
        ],
        deviceTypes: [
          { device: 'Desktop', visitors: 7470, percentage: 60.0 },
          { device: 'Mobile', visitors: 3735, percentage: 30.0 },
          { device: 'Tablet', visitors: 1245, percentage: 10.0 }
        ],
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          visitors: Math.floor(Math.random() * 200 + 50)
        })),
        dailyData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 500 + 200),
          pageViews: Math.floor(Math.random() * 2000 + 800)
        }))
      };
      
      setVisitorData(mockData);
    } catch (error) {
      console.error('Failed to load visitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    // Simulate real-time visitor data
    const mockRealTimeVisitors: RealTimeVisitor[] = [
      {
        id: '1',
        page: '/investments',
        country: 'Italy',
        device: 'Desktop',
        timeOnPage: 145,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        page: '/',
        country: 'United States',
        device: 'Mobile',
        timeOnPage: 89,
        timestamp: new Date(Date.now() - 30000).toISOString()
      },
      {
        id: '3',
        page: '/equity-pledge',
        country: 'Germany',
        device: 'Desktop',
        timeOnPage: 234,
        timestamp: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: '4',
        page: '/about',
        country: 'France',
        device: 'Tablet',
        timeOnPage: 67,
        timestamp: new Date(Date.now() - 90000).toISOString()
      }
    ];
    
    setRealTimeVisitors(mockRealTimeVisitors);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Italy': '🇮🇹',
      'United States': '🇺🇸',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'United Kingdom': '🇬🇧'
    };
    return flags[country] || '🌍';
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <span style={{ marginLeft: '1rem' }}>Caricamento analytics visitatori...</span>
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
              Analytics Visitatori
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Analisi dettagliata del traffico e comportamento dei visitatori
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white'
            }}
          >
            <option value="24h">Ultime 24 ore</option>
            <option value="7d">Ultimi 7 giorni</option>
            <option value="30d">Ultimi 30 giorni</option>
            <option value="90d">Ultimi 90 giorni</option>
          </select>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e0e3eb' }}>
          {[
            { id: 'overview', name: 'Panoramica' },
            { id: 'realtime', name: 'Tempo Reale' },
            { id: 'pages', name: 'Pagine' },
            { id: 'sources', name: 'Fonti' },
            { id: 'geography', name: 'Geografia' },
            { id: 'devices', name: 'Dispositivi' }
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
        {activeTab === 'overview' && visitorData && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Panoramica Generale</h2>
            
            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Visitatori Totali</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                  {visitorData.totalVisitors.toLocaleString()}
                </div>
              </div>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Visitatori Unici</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                  {visitorData.uniqueVisitors.toLocaleString()}
                </div>
              </div>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Visualizzazioni Pagine</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                  {visitorData.pageViews.toLocaleString()}
                </div>
              </div>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Durata Media Sessione</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                  {formatDuration(visitorData.averageSessionDuration)}
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem' }}>Tasso di Rimbalzo</h3>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444' }}>
                  {visitorData.bounceRate}%
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                  Visitatori che lasciano dopo una sola pagina
                </p>
              </div>
              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '1rem' }}>Visitatori di Ritorno</h3>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>
                  {visitorData.returningVisitors.toLocaleString()}
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                  {((visitorData.returningVisitors / visitorData.totalVisitors) * 100).toFixed(1)}% del traffico totale
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Tab */}
        {activeTab === 'realtime' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Visitatori in Tempo Reale</h2>
            
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ fontWeight: 600 }}>Attualmente online: {realTimeVisitors.length} visitatori</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {realTimeVisitors.map((visitor) => (
                <div key={visitor.id} style={{ 
                  background: '#f9fafb', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: '1px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{visitor.page}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {getCountryFlag(visitor.country)} {visitor.country} • {visitor.device}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {formatDuration(visitor.timeOnPage)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(visitor.timestamp).toLocaleTimeString('it-IT')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && visitorData && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Pagine Più Visitate</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {visitorData.topPages.map((page, index) => (
                <div key={index} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>{page.path}</h3>
                      <div style={{ display: 'flex', gap: '2rem', fontSize: '14px', color: '#6b7280' }}>
                        <span>{page.views.toLocaleString()} visualizzazioni totali</span>
                        <span>{page.uniqueViews.toLocaleString()} visualizzazioni uniche</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                        {((page.views / visitorData.pageViews) * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>del traffico totale</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && visitorData && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Fonti di Traffico</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {visitorData.topSources.map((source, index) => (
                <div key={index} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>{source.source}</h3>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {source.visitors.toLocaleString()} visitatori
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                        {source.percentage}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>del traffico</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Geography Tab */}
        {activeTab === 'geography' && visitorData && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Distribuzione Geografica</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {visitorData.topCountries.map((country, index) => (
                <div key={index} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '24px' }}>{getCountryFlag(country.country)}</span>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>{country.country}</h3>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {country.visitors.toLocaleString()} visitatori
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                        {country.percentage}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>del traffico</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devices Tab */}
        {activeTab === 'devices' && visitorData && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Dispositivi Utilizzati</h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {visitorData.deviceTypes.map((device, index) => (
                <div key={index} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>{device.device}</h3>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {device.visitors.toLocaleString()} visitatori
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                        {device.percentage}%
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>del traffico</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </AdminProtectedRoute>
  );
} 