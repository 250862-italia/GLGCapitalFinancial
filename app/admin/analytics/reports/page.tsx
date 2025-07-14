"use client";
import { useEffect, useState } from "react";
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'performance' | 'client' | 'operational';
  description: string;
  lastGenerated: string;
  status: 'available' | 'generating' | 'error';
  downloadUrl?: string;
  size?: string;
}

interface ReportData {
  totalRevenue: number;
  totalInvestments: number;
  activeClients: number;
  averageReturn: number;
  monthlyGrowth: number;
  topPerformers: Array<{
    name: string;
    return: number;
    investment: number;
  }>;
  recentTransactions: Array<{
    id: string;
    client: string;
    amount: number;
    type: string;
    date: string;
  }>;
}

export default function AdminAnalyticsReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('all');

  useEffect(() => {
    loadReports();
    loadReportData();
  }, []);

  const loadReports = async () => {
    // Simulate loading reports
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Report Finanziario Mensile',
        type: 'financial',
        description: 'Analisi completa delle performance finanziarie del mese',
        lastGenerated: '2024-01-15T10:30:00Z',
        status: 'available',
        downloadUrl: '/reports/financial-jan-2024.pdf',
        size: '2.3 MB'
      },
      {
        id: '2',
        name: 'Performance Portfolio',
        type: 'performance',
        description: 'Analisi delle performance dei portfolio di investimento',
        lastGenerated: '2024-01-14T15:45:00Z',
        status: 'available',
        downloadUrl: '/reports/portfolio-performance.pdf',
        size: '1.8 MB'
      },
      {
        id: '3',
        name: 'Analisi Clienti',
        type: 'client',
        description: 'Report dettagliato sui clienti e loro comportamenti',
        lastGenerated: '2024-01-13T09:20:00Z',
        status: 'available',
        downloadUrl: '/reports/client-analysis.pdf',
        size: '3.1 MB'
      },
      {
        id: '4',
        name: 'Report Operativo',
        type: 'operational',
        description: 'Metriche operative e KPI del sistema',
        lastGenerated: '2024-01-12T14:15:00Z',
        status: 'available',
        downloadUrl: '/reports/operational-metrics.pdf',
        size: '1.5 MB'
      }
    ];
    setReports(mockReports);
  };

  const loadReportData = async () => {
    // Simulate loading report data
    const mockData: ReportData = {
      totalRevenue: 2450000,
      totalInvestments: 45600000,
      activeClients: 1247,
      averageReturn: 12.5,
      monthlyGrowth: 8.3,
      topPerformers: [
        { name: 'GLG Equity A', return: 18.5, investment: 8500000 },
        { name: 'GLG Balanced B', return: 15.2, investment: 6200000 },
        { name: 'GLG Growth C', return: 22.1, investment: 4100000 }
      ],
      recentTransactions: [
        { id: 'TXN-001', client: 'John Smith', amount: 50000, type: 'Investment', date: '2024-01-15' },
        { id: 'TXN-002', client: 'Maria Garcia', amount: 75000, type: 'Withdrawal', date: '2024-01-14' },
        { id: 'TXN-003', client: 'David Chen', amount: 120000, type: 'Investment', date: '2024-01-13' }
      ]
    };
    setReportData(mockData);
    setLoading(false);
  };

  const generateReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport: Report = {
        id: Date.now().toString(),
        name: `Report ${reportType} - ${new Date().toLocaleDateString('it-IT')}`,
        type: reportType as any,
        description: `Report ${reportType} generato automaticamente`,
        lastGenerated: new Date().toISOString(),
        status: 'available',
        downloadUrl: `/reports/${reportType}-${Date.now()}.pdf`,
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`
      };
      
      setReports(prev => [newReport, ...prev]);
      setGeneratingReport(null);
    }, 3000);
  };

  const downloadReport = (report: Report) => {
    if (report.downloadUrl) {
      // Simulate download
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = report.name + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredReports = reports.filter(report => 
    selectedReportType === 'all' || report.type === selectedReportType
  );

  const getReportTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'financial': return '#10b981';
      case 'performance': return '#3b82f6';
      case 'client': return '#8b5cf6';
      case 'operational': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getReportTypeText = (type: Report['type']) => {
    switch (type) {
      case 'financial': return 'Finanziario';
      case 'performance': return 'Performance';
      case 'client': return 'Clienti';
      case 'operational': return 'Operativo';
      default: return type;
    }
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <span style={{ marginLeft: '1rem' }}>Caricamento report...</span>
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
              Report Performance
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Generazione e gestione dei report finanziari e operativi
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        {reportData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Revenue Totale</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                €{(reportData.totalRevenue / 1000000).toFixed(1)}M
              </div>
            </div>
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Investimenti Totali</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                €{(reportData.totalInvestments / 1000000).toFixed(1)}M
              </div>
            </div>
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Clienti Attivi</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>
                {reportData.activeClients.toLocaleString()}
              </div>
            </div>
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e0e3eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Rendimento Medio</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                {reportData.averageReturn}%
              </div>
            </div>
          </div>
        )}

        {/* Report Generation */}
        <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '1rem' }}>Genera Nuovo Report</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {['financial', 'performance', 'client', 'operational'].map(type => (
              <button
                key={type}
                onClick={() => generateReport(type)}
                disabled={generatingReport === type}
                style={{
                  background: getReportTypeColor(type as any),
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: generatingReport === type ? 'not-allowed' : 'pointer',
                  opacity: generatingReport === type ? 0.7 : 1,
                  fontWeight: 600
                }}
              >
                {generatingReport === type ? 'Generazione...' : `Genera ${getReportTypeText(type as any)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Report Filter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Report Disponibili</h2>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white'
            }}
          >
            <option value="all">Tutti i tipi</option>
            <option value="financial">Finanziari</option>
            <option value="performance">Performance</option>
            <option value="client">Clienti</option>
            <option value="operational">Operativi</option>
          </select>
        </div>

        {/* Reports List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredReports.map((report) => (
            <div key={report.id} style={{ 
              background: '#f9fafb', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '2px solid #e0e3eb' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ 
                      background: getReportTypeColor(report.type), 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 600 
                    }}>
                      {getReportTypeText(report.type)}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{report.name}</h3>
                  </div>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{report.description}</p>
                  <div style={{ display: 'flex', gap: '2rem', fontSize: '14px', color: '#6b7280' }}>
                    <span>Generato: {new Date(report.lastGenerated).toLocaleString('it-IT')}</span>
                    {report.size && <span>Dimensione: {report.size}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {report.status === 'available' && (
                    <button
                      onClick={() => downloadReport(report)}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Scarica
                    </button>
                  )}
                  {report.status === 'generating' && (
                    <span style={{ color: '#f59e0b', fontSize: '14px' }}>Generazione in corso...</span>
                  )}
                  {report.status === 'error' && (
                    <span style={{ color: '#ef4444', fontSize: '14px' }}>Errore</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Nessun report trovato
          </div>
        )}

        {/* Top Performers */}
        {reportData && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '1.5rem' }}>Top Performers</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {reportData.topPerformers.map((performer, index) => (
                <div key={index} style={{ 
                  background: '#f9fafb', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid #e0e3eb' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{performer.name}</h3>
                    <span style={{ 
                      background: '#10b981', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '14px', 
                      fontWeight: 600 
                    }}>
                      {performer.return}%
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
                    €{(performer.investment / 1000000).toFixed(1)}M
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Investimento totale</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  );
} 