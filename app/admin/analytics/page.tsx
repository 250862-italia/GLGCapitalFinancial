'use client';

import { useState, useEffect } from 'react';
import AdminProtected from '@/components/AdminProtected';
import { useAdminAuth } from '@/lib/use-admin-auth';
import {
  BarChart3, TrendingUp, DollarSign, Users2, 
  CreditCard, Calendar, Download, RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  monthlyGrowth: number;
  totalClients: number;
  activeInvestments: number;
  averageReturn: number;
  topPackages: Array<{
    name: string;
    revenue: number;
    investors: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    clients: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAdminAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    totalClients: 0,
    activeInvestments: 0,
    averageReturn: 0,
    topPackages: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Carica dati da diverse API
      const [clientsRes, packagesRes, investmentsRes] = await Promise.all([
        fetch('/api/admin/clients'),
        fetch('/api/admin/packages'),
        fetch('/api/admin/investments')
      ]);

      let totalRevenue = 0;
      let totalClients = 0;
      let activeInvestments = 0;
      let totalReturn = 0;
      let investmentCount = 0;

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        totalClients = clientsData.clients?.length || 0;
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        // Mock data per i pacchetti top
        const topPackages = packagesData.packages?.slice(0, 5).map((pkg: any) => ({
          name: pkg.name,
          revenue: Math.floor(Math.random() * 1000000) + 100000,
          investors: Math.floor(Math.random() * 50) + 10
        })) || [];
        setAnalyticsData(prev => ({ ...prev, topPackages }));
      }

      if (investmentsRes.ok) {
        const investmentsData = await investmentsRes.json();
        if (investmentsData.investments) {
          totalRevenue = investmentsData.investments.reduce((sum: number, inv: any) => {
            if (inv.status === 'active' || inv.status === 'completed') {
              return sum + (inv.amount || 0);
            }
            return sum;
          }, 0);
          
          activeInvestments = investmentsData.investments.filter((inv: any) => 
            inv.status === 'active'
          ).length;

          // Calcola return medio
          const activeInvs = investmentsData.investments.filter((inv: any) => 
            inv.status === 'active' && inv.actual_return
          );
          if (activeInvs.length > 0) {
            totalReturn = activeInvs.reduce((sum: number, inv: any) => 
              sum + (inv.actual_return || 0), 0
            );
            investmentCount = activeInvs.length;
          }
        }
      }

      // Mock data per i grafici mensili
      const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'];
      const monthlyData = months.map((month, index) => ({
        month,
        revenue: Math.floor(Math.random() * 500000) + 100000,
        clients: Math.floor(Math.random() * 50) + 10
      }));

      setAnalyticsData({
        totalRevenue,
        monthlyGrowth: 12.5,
        totalClients,
        activeInvestments,
        averageReturn: investmentCount > 0 ? totalReturn / investmentCount : 0,
        topPackages: analyticsData.topPackages,
        monthlyData
      });
    } catch (error) {
      console.error('Errore nel caricamento analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, subtitle }: {
    title: string;
    value: string | number;
    icon: any;
    change?: number;
    changeType?: 'positive' | 'negative';
    subtitle?: string;
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
            </dl>
          </div>
        </div>
      </div>
      {change !== undefined && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="flex items-center">
              <TrendingUp className={`h-4 w-4 ${
                changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`} />
              <span className={`ml-2 text-sm font-medium ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}%
              </span>
              <span className="ml-2 text-sm text-gray-500">rispetto al mese scorso</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminProtected>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Analisi e report del sistema GLG Capital Group</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Ultimi 7 giorni</option>
                  <option value="30d">Ultimi 30 giorni</option>
                  <option value="90d">Ultimi 90 giorni</option>
                  <option value="1y">Ultimo anno</option>
                </select>
                <button
                  onClick={fetchAnalyticsData}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Aggiorna</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Esporta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistiche principali */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Revenue Totale"
              value={`€${analyticsData.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              change={analyticsData.monthlyGrowth}
              changeType="positive"
            />
            <StatCard
              title="Clienti Totali"
              value={analyticsData.totalClients}
              icon={Users2}
              change={8.2}
              changeType="positive"
            />
            <StatCard
              title="Investimenti Attivi"
              value={analyticsData.activeInvestments}
              icon={CreditCard}
              change={15.3}
              changeType="positive"
            />
            <StatCard
              title="Return Medio"
              value={`${analyticsData.averageReturn.toFixed(2)}%`}
              icon={TrendingUp}
              change={5.7}
              changeType="positive"
            />
          </div>

          {/* Grafici e report */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Grafico Revenue Mensile */}
            <ChartCard title="Revenue Mensile">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Grafico revenue in sviluppo</p>
                  <div className="mt-4 space-y-2">
                    {analyticsData.monthlyData.map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{data.month}</span>
                        <span>€{data.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Grafico Crescita Clienti */}
            <ChartCard title="Crescita Clienti">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Grafico clienti in sviluppo</p>
                  <div className="mt-4 space-y-2">
                    {analyticsData.monthlyData.map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{data.month}</span>
                        <span>{data.clients} clienti</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Top Pacchetti e Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Pacchetti per Revenue */}
            <ChartCard title="Top Pacchetti per Revenue">
              <div className="space-y-4">
                {analyticsData.topPackages.map((pkg, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <div className="font-medium text-gray-900">{pkg.name}</div>
                        <div className="text-sm text-gray-500">{pkg.investors} investitori</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">€{pkg.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Metriche Performance */}
            <ChartCard title="Metriche Performance">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Tasso di Conversione</span>
                  <span className="text-lg font-bold text-blue-900">68%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Soddisfazione Clienti</span>
                  <span className="text-lg font-bold text-green-900">4.8/5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-900">Retention Rate</span>
                  <span className="text-lg font-bold text-purple-900">92%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-900">Tempo Medio Investimento</span>
                  <span className="text-lg font-bold text-orange-900">18 mesi</span>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Report Dettagliati */}
          <div className="mt-8">
            <ChartCard title="Report Dettagliati">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Report Mensile</h4>
                  <p className="text-sm text-gray-500">Genera report mensile completo</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Analisi Clienti</h4>
                  <p className="text-sm text-gray-500">Analisi comportamento clienti</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Performance Investimenti</h4>
                  <p className="text-sm text-gray-500">Analisi performance dettagliata</p>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </AdminProtected>
  );
}
