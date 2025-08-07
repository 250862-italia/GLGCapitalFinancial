"use client";
import { useState, useEffect } from 'react';
import { 
  Users, Package, TrendingUp, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, Eye, Plus
} from 'lucide-react';
import { Client, Package as PackageType, Investment } from '@/lib/data-manager';

interface DashboardStats {
  totalClients: number;
  totalPackages: number;
  totalInvestments: number;
  totalValue: number;
  activeInvestments: number;
  pendingInvestments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalPackages: 0,
    totalInvestments: 0,
    totalValue: 0,
    activeInvestments: 0,
    pendingInvestments: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Calculate stats
      const totalValue = packages.reduce((sum, pkg) => sum + pkg.max_investment, 0);
      const activeInvestments = packages.filter(pkg => pkg.status === 'active').length;
      const pendingInvestments = packages.filter(pkg => pkg.status === 'draft').length;

      setStats({
        totalClients: clients.length,
        totalPackages: packages.length,
        totalInvestments: packages.length,
        totalValue,
        activeInvestments,
        pendingInvestments
      });

      // Generate recent activity
      const activity = [
        ...clients.slice(0, 3).map(client => ({
          type: 'client',
          action: 'Registrato',
          name: `${client.first_name} ${client.last_name}`,
          time: new Date(client.created_at).toLocaleDateString('it-IT')
        })),
        ...packages.slice(0, 3).map(pkg => ({
          type: 'package',
          action: 'Creato',
          name: pkg.name,
          time: new Date(pkg.created_at).toLocaleDateString('it-IT')
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setRecentActivity(activity.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Panoramica del sistema di gestione investimenti</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clienti Totali</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-green-600 ml-1">+12%</span>
            <span className="text-gray-500 ml-2">rispetto al mese scorso</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacchetti Attivi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeInvestments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-green-600 ml-1">+8%</span>
            <span className="text-gray-500 ml-2">rispetto al mese scorso</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valore Totale</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-green-600 ml-1">+15%</span>
            <span className="text-gray-500 ml-2">rispetto al mese scorso</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Attesa</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvestments}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            <span className="text-red-600 ml-1">-3%</span>
            <span className="text-gray-500 ml-2">rispetto al mese scorso</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-gray-700">Nuovo Cliente</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-gray-700">Nuovo Pacchetto</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-gray-700">Visualizza Report</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Attività Recenti</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${
                  activity.type === 'client' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {activity.type === 'client' ? (
                    <Users className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Package className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.action} - {activity.time}
                  </p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        
        {recentActivity.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nessuna attività recente
          </div>
        )}
      </div>
    </div>
  );
} 