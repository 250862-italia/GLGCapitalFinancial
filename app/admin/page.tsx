"use client";
import { useState, useEffect } from 'react';
import { 
  Users, Package, TrendingUp, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, Eye, Plus, Settings,
  Bell, Search, Filter, Download, Calendar, Clock,
  BarChart3, PieChart, LineChart, Target, Award,
  Shield, Zap, Star, Globe, Building, UserCheck
} from 'lucide-react';
import { Client, Package as PackageType, Investment } from '@/lib/data-manager';

interface DashboardStats {
  totalClients: number;
  totalPackages: number;
  totalInvestments: number;
  totalValue: number;
  activeInvestments: number;
  pendingInvestments: number;
  monthlyGrowth: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'client' | 'package' | 'investment' | 'payment';
  action: string;
  name: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
  amount?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalPackages: 0,
    totalInvestments: 0,
    totalValue: 0,
    activeInvestments: 0,
    pendingInvestments: 0,
    monthlyGrowth: 0,
    conversionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found');
        setLoading(false);
        return;
      }

      // Fetch clients
      const clientsResponse = await fetch('/api/admin/clients', {
        headers: { 'x-admin-token': adminToken }
      });
      const clientsData = await clientsResponse.json();
      const clients: Client[] = clientsData.success ? clientsData.data : [];

      // Fetch packages
      const packagesResponse = await fetch('/api/admin/packages', {
        headers: { 'x-admin-token': adminToken }
      });
      const packagesData = await packagesResponse.json();
      const packages: PackageType[] = packagesData.success ? packagesData.data : [];

      // Calculate advanced stats
      const totalValue = packages.reduce((sum, pkg) => sum + pkg.max_investment, 0);
      const activeInvestments = packages.filter(pkg => pkg.status === 'active').length;
      const pendingInvestments = packages.filter(pkg => pkg.status === 'draft').length;
      const monthlyGrowth = 12.5; // Mock data
      const conversionRate = 68.2; // Mock data

      setStats({
        totalClients: clients.length,
        totalPackages: packages.length,
        totalInvestments: packages.length,
        totalValue,
        activeInvestments,
        pendingInvestments,
        monthlyGrowth,
        conversionRate
      });

      // Generate professional recent activity
      const activity: RecentActivity[] = [
        ...clients.slice(0, 3).map(client => ({
          id: client.id,
          type: 'client',
          action: 'Registrazione Completata',
          name: `${client.first_name} ${client.last_name}`,
          time: new Date(client.created_at).toLocaleDateString('it-IT'),
          status: 'success',
          amount: undefined
        })),
        ...packages.slice(0, 3).map(pkg => ({
          id: pkg.id,
          type: 'package',
          action: 'Pacchetto Creato',
          name: pkg.name,
          time: new Date(pkg.created_at).toLocaleDateString('it-IT'),
          status: 'info',
          amount: pkg.max_investment
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setRecentActivity(activity.slice(0, 6));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Caricamento Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-20 h-20 flex items-center justify-center">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Errore di Accesso</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Period Selector */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600">Monitora le performance e l'attività del sistema</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Ultimi 7 giorni</option>
              <option value="30d">Ultimi 30 giorni</option>
              <option value="90d">Ultimi 90 giorni</option>
              <option value="1y">Ultimo anno</option>
            </select>
            
            <button className="bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clienti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{stats.monthlyGrowth}% questo mese
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Packages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacchetti</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPackages}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Package className="h-4 w-4 mr-1" />
                  {stats.activeInvestments} attivi
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valore Totale</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.totalValue.toLocaleString()}</p>
                <p className="text-sm text-purple-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Crescita costante
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasso Conversione</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <Target className="h-4 w-4 mr-1" />
                  Obiettivo: 75%
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Placeholder */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Investimenti</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <LineChart className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <PieChart className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-500">Grafico Performance</p>
                <p className="text-sm text-gray-400">Integrazione con Recharts</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attività Recenti</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Vedi tutte
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{activity.time}</span>
                      {activity.amount && (
                        <span className="text-xs font-medium text-green-600">
                          €{activity.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Nuovo Cliente</p>
                <p className="text-sm text-gray-500">Registra cliente</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Nuovo Pacchetto</p>
                <p className="text-sm text-gray-500">Crea investimento</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-500">Report dettagliati</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group">
              <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Impostazioni</p>
                <p className="text-sm text-gray-500">Configura sistema</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 