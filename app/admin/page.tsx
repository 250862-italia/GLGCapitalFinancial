'use client';

import { useState, useEffect } from 'react';
import AdminProtected from '@/components/AdminProtected';
import { useAdminAuth } from '@/lib/use-admin-auth';
import {
  Users2, CreditCard, TrendingUp, DollarSign, 
  BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  totalPackages: number;
  totalInvestments: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeInvestments: number;
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalPackages: 0,
    totalInvestments: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeInvestments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Carica statistiche da diverse API
      const [clientsRes, packagesRes, investmentsRes] = await Promise.all([
        fetch('/api/admin/clients'),
        fetch('/api/admin/packages'),
        fetch('/api/admin/investments')
      ]);

      let totalClients = 0;
      let totalPackages = 0;
      let totalInvestments = 0;
      let totalRevenue = 0;
      let activeInvestments = 0;

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        totalClients = clientsData.clients?.length || 0;
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        totalPackages = packagesData.packages?.length || 0;
      }

      if (investmentsRes.ok) {
        const investmentsData = await investmentsRes.json();
        totalInvestments = investmentsData.investments?.length || 0;
        
        // Calcola revenue e investimenti attivi
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
        }
      }

      setStats({
        totalClients,
        totalPackages,
        totalInvestments,
        totalRevenue,
        monthlyGrowth: 12.5, // Mock data
        activeInvestments
      });
    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }: {
    title: string;
    value: string | number;
    icon: any;
    change?: number;
    changeType?: 'positive' | 'negative';
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
            </dl>
          </div>
        </div>
      </div>
      {change !== undefined && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="flex items-center">
              {changeType === 'positive' ? (
                <ArrowUpRight className="h-4 w-4 text-green-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              )}
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

  const QuickActionCard = ({ title, description, icon: Icon, href, color }: {
    title: string;
    description: string;
    icon: any;
    href: string;
    color: string;
  }) => (
    <a
      href={href}
      className={`group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-${color}-500 rounded-lg shadow hover:shadow-md transition-shadow`}
    >
      <div>
        <span className={`rounded-lg inline-flex p-3 bg-${color}-50 text-${color}-700 ring-4 ring-white`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-medium">
          <span className="absolute inset-0" aria-hidden="true" />
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
      <span
        className={`absolute top-6 right-6 text-${color}-300 group-hover:text-${color}-400`}
        aria-hidden="true"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H2a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V4a1 1 0 00-1-1zM2 19V5h16v14H2z" />
        </svg>
      </span>
    </a>
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <AdminProtected>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Dashboard */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Benvenuto nel pannello di controllo GLG Capital Group
            </p>
          </div>

          {/* Statistiche principali */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Clienti Totali"
              value={stats.totalClients}
              icon={Users2}
              change={8.2}
              changeType="positive"
            />
            <StatCard
              title="Pacchetti Attivi"
              value={stats.totalPackages}
              icon={CreditCard}
              change={3.1}
              changeType="positive"
            />
            <StatCard
              title="Investimenti Totali"
              value={stats.totalInvestments}
              icon={TrendingUp}
              change={12.5}
              changeType="positive"
            />
            <StatCard
              title="Revenue Totale"
              value={`€${stats.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              change={15.3}
              changeType="positive"
            />
          </div>

          {/* Azioni rapide */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <QuickActionCard
                title="Nuovo Cliente"
                description="Aggiungi un nuovo cliente al sistema"
                icon={Users2}
                href="/admin/clients"
                color="blue"
              />
              <QuickActionCard
                title="Nuovo Pacchetto"
                description="Crea un nuovo pacchetto di investimento"
                icon={CreditCard}
                href="/admin/packages"
                color="green"
              />
              <QuickActionCard
                title="Nuovo Investimento"
                description="Registra un nuovo investimento"
                icon={TrendingUp}
                href="/admin/investments"
                color="purple"
              />
            </div>
          </div>

          {/* Grafico e statistiche aggiuntive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Grafico performance */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Investimenti</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Grafico performance in sviluppo</p>
                </div>
              </div>
            </div>

            {/* Statistiche aggiuntive */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiche Aggiuntive</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Investimenti Attivi</span>
                  <span className="text-sm font-medium text-gray-900">{stats.activeInvestments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Crescita Mensile</span>
                  <span className="text-sm font-medium text-green-600">+{stats.monthlyGrowth}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tasso di Conversione</span>
                  <span className="text-sm font-medium text-gray-900">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Soddisfazione Clienti</span>
                  <span className="text-sm font-medium text-gray-900">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminProtected>
  );
} 