'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GLGLogo from '@/components/GLGLogo';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Shield,
  ArrowRight,
  Settings
} from 'lucide-react';

interface ClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function ClientDashboardPage() {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('clientToken');
    const userData = localStorage.getItem('clientUser');

    if (!token || !userData) {
      router.push('/client/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/client/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    router.push('/client/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GLGLogo size="sm" showText={false} />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">GLG Capital Group</h1>
                <p className="text-sm text-gray-600">Client Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Benvenuto, {user.firstName} {user.lastName}!
              </h2>
              <p className="text-gray-600">
                Accedi alla tua dashboard investimenti e gestisci il tuo portafoglio
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Portafoglio Totale</p>
                <p className="text-2xl font-bold text-gray-900">€0.00</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rendimento</p>
                <p className="text-2xl font-bold text-gray-900">0.00%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Investimenti Attivi</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/client/investments" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nuovo Investimento</h3>
                <p className="text-gray-600">Inizia un nuovo investimento con il nostro sistema Equity Pledge</p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
          </Link>

          <Link href="/client/profile" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Profilo</h3>
                <p className="text-gray-600">Gestisci le tue informazioni personali e preferenze</p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
          </Link>

          <Link href="/client/investments" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">I Miei Investimenti</h3>
                <p className="text-gray-600">Visualizza e gestisci tutti i tuoi investimenti attivi</p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
          </Link>

          <Link href="/client/transactions" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transazioni</h3>
                <p className="text-gray-600">Storico completo di tutte le tue transazioni</p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
          </Link>

          <Link href="/client/documents" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Documenti</h3>
                <p className="text-gray-600">Accedi ai tuoi documenti e certificati</p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
          </Link>

          <Link href="/client/support" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Supporto</h3>
                <p className="text-gray-600">Contatta il nostro team di supporto</p>
              </div>
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
