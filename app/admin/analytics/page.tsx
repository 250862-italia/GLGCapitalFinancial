'use client';

import { useState, useEffect } from 'react';
import AdminProtected from '@/components/AdminProtected';
import { useAdminAuth } from '@/lib/use-admin-auth';
import {
  TrendingUp, Users, DollarSign, BarChart3, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, Target
} from 'lucide-react';

interface AnalyticsData {
  id: string;
  date: string;
  total_investments: number;
  total_amount: number;
  total_returns: number;
  active_clients: number;
  new_clients: number;
  top_performing_package: string;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

export default function AnalyticsPage() {
  const { user, logout } = useAdminAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('Token di autenticazione mancante');
        setError('Token di autenticazione mancante');
        return;
      }

      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data || []);
          setError(null);
        } else {
          setError(data.message || 'Errore nel caricamento delle analytics');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Errore nel caricamento delle analytics');
      }
    } catch (error) {
      console.error('Errore di connessione:', error);
      setError('Errore di connessione al database');
    } finally {
      setLoading(false);
    }
  };

  // Calcola le metriche aggregate
  const getAggregateMetrics = () => {
    if (analytics.length === 0) return null;

    const latest = analytics[0];
    const previous = analytics[1];

    return {
      totalInvestments: latest.total_investments,
      totalAmount: latest.total_amount,
      totalReturns: latest.total_returns,
      activeClients: latest.active_clients,
      newClients: latest.new_clients,
      conversionRate: latest.conversion_rate,
      topPackage: latest.top_performing_package,
      // Calcola le variazioni percentuali
      investmentsChange: previous ? 
        ((latest.total_investments - previous.total_investments) / previous.total_investments * 100).toFixed(1) : 0,
      amountChange: previous ? 
        ((latest.total_amount - previous.total_amount) / previous.total_amount * 100).toFixed(1) : 0,
      returnsChange: previous ? 
        ((latest.total_returns - previous.total_returns) / previous.total_returns * 100).toFixed(1) : 0,
      clientsChange: previous ? 
        ((latest.active_clients - previous.active_clients) / previous.active_clients * 100).toFixed(1) : 0
    };
  };

  const metrics = getAggregateMetrics();

  if (loading) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento analytics...</p>
          </div>
        </div>
      </AdminProtected>
    );
  }

  if (error) {
    return (
      <AdminProtected>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Errore nel caricamento</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Riprova
            </button>
          </div>
        </div>
      </AdminProtected>
    );
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Analytics</h1>
            <p className="text-gray-600">Monitora le performance e le metriche del business</p>
          </div>

          {analytics.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessuna analytics disponibile</h3>
              <p className="text-gray-600">Le analytics verranno generate automaticamente dal database</p>
            </div>
          ) : (
            <>
              {/* Metriche Principali */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Investimenti Totali</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics?.totalInvestments}</p>
                    </div>
                  </div>
                  {metrics?.investmentsChange !== 0 && (
                    <div className="mt-2 flex items-center text-sm">
                      {parseFloat(metrics?.investmentsChange || '0') > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={parseFloat(metrics?.investmentsChange || '0') > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(parseFloat(metrics?.investmentsChange || '0'))}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Volume Totale</p>
                      <p className="text-2xl font-bold text-gray-900">€{metrics?.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                  {metrics?.amountChange !== 0 && (
                    <div className="mt-2 flex items-center text-sm">
                      {parseFloat(metrics?.amountChange || '0') > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={parseFloat(metrics?.amountChange || '0') > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(parseFloat(metrics?.amountChange || '0'))}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rendimenti Totali</p>
                      <p className="text-2xl font-bold text-gray-900">€{metrics?.totalReturns?.toLocaleString()}</p>
                    </div>
                  </div>
                  {metrics?.returnsChange !== 0 && (
                    <div className="mt-2 flex items-center text-sm">
                      {parseFloat(metrics?.returnsChange || '0') > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={parseFloat(metrics?.returnsChange || '0') > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(parseFloat(metrics?.returnsChange || '0'))}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Clienti Attivi</p>
                      <p className="text-2xl font-bold text-gray-900">{metrics?.activeClients}</p>
                    </div>
                  </div>
                  {metrics?.clientsChange !== 0 && (
                    <div className="mt-2 flex items-center text-sm">
                      {parseFloat(metrics?.clientsChange || '0') > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={parseFloat(metrics?.clientsChange || '0') > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(parseFloat(metrics?.clientsChange || '0'))}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metriche Secondarie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Pacchetti</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pacchetto Top</span>
                      <span className="font-medium text-gray-900">{metrics?.topPackage || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tasso Conversione</span>
                      <span className="font-medium text-gray-900">{metrics?.conversionRate?.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Nuovi Clienti</span>
                      <span className="font-medium text-gray-900">{metrics?.newClients}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ultimo Aggiornamento</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data</span>
                      <span className="font-medium text-gray-900">
                        {new Date(analytics[0]?.updated_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ora</span>
                      <span className="font-medium text-gray-900">
                        {new Date(analytics[0]?.updated_at).toLocaleTimeString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabella Analytics */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Storico Analytics</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investimenti</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendimenti</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clienti</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversione</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString('it-IT')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.total_investments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{item.total_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{item.total_returns.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.active_clients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.conversion_rate.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminProtected>
  );
}
