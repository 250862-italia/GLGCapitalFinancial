"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJSONWithCSRF, fetchWithCSRF } from '@/lib/csrf-client';
import { useRealtime } from '@/hooks/use-realtime';
import RealtimeEvents from '@/components/ui/RealtimeEvents';
import ConnectionStatus from '@/components/ui/ConnectionStatus';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { getInvestmentsWithFallback, getClientsWithFallback } from '@/lib/supabase-fallback';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  RefreshCw,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  WifiOff,
  Target,
  PieChart,
  AlertCircle
} from 'lucide-react';
import PaymentMethodModal, { PaymentMethod } from '@/components/investment-packages/PaymentMethodModal';
import { Investment } from "@/types/investment";
import { Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import UserProfile from "../../components/UserProfile";
import ClientLogoutButton from "../../components/ClientLogoutButton";
import { usePackages } from "../../lib/package-context";
import Toast from "../../components/ui/Toast";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface PortfolioStats {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  pendingInvestments: number;
}

interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  status: string;
  client_code: string;
  risk_profile: string;
  total_invested: number;
  created_at: string;
  updated_at: string;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalInvested: 0,
    totalEarned: 0,
    activeInvestments: 0,
    pendingInvestments: 0
  });
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const router = useRouter();

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get CSRF token first
        const csrfResponse = await fetch('/api/csrf', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!csrfResponse.ok) {
          setUserLoading(false);
          return;
        }

        const csrfData = await csrfResponse.json();

        // Check auth with CSRF token
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfData.token
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  // Real-time functionality
  const { isConnected: realtimeConnected, events: realtimeEvents } = useRealtime({
    userId: user?.id,
    userRole: 'user',
    enableNotifications: true,
    enableInvestments: true
  });

  useEffect(() => {
    if (!user) return;

    // Load purchased investments from database and bank data from localStorage
    const loadMyInvestments = async () => {
      if (!user) {
        setMyInvestments([]);
        setIsLoading(false);
        return;
      }

      try {
        // Usa il sistema di fallback per gli investimenti
        const investments = await getInvestmentsWithFallback();
        
        // Filtra investimenti per questo utente
        const userInvestments = investments.filter(inv => inv.client_id === user.id);
        
        // Trasforma in formato Investment
        const transformedInvestments: Investment[] = userInvestments.map(inv => ({
          id: inv.id,
          packageId: inv.client_id,
          packageName: 'Investment Package',
          amount: inv.amount,
          status: inv.status,
          startDate: new Date(inv.created_at),
          endDate: new Date(inv.created_at),
          expectedReturn: 0.08,
          currentValue: inv.amount * 1.08,
          profit: inv.amount * 0.08
        }));

        setMyInvestments(transformedInvestments);
      } catch (error) {
        console.error('Error loading investments:', error);
        setMyInvestments([]);
      } finally {
        setIsLoading(false);
      }
    };

    const loadClientProfile = async () => {
      if (!user) return;

      try {
        // Usa il sistema di fallback per il profilo cliente
        const clients = await getClientsWithFallback();
        const userClient = clients.find(c => c.user_id === user.id);
        
        if (userClient) {
          setClientProfile(userClient);
        }
      } catch (error) {
        console.error('Error loading client profile:', error);
      }
    };

    loadMyInvestments();
    loadClientProfile();
  }, [user]);

  // Calculate portfolio stats
  useEffect(() => {
    const activeInvestments = myInvestments.filter(inv => inv.status === 'active');
    const pendingInvestments = myInvestments.filter(inv => inv.status === 'pending');
    
    const totalInvested = myInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarned = myInvestments.reduce((sum, inv) => sum + inv.profit, 0);
    
    setPortfolioStats({
      totalInvested,
      totalEarned,
      activeInvestments: activeInvestments.length,
      pendingInvestments: pendingInvestments.length
    });
  }, [myInvestments]);

  const handleInvestmentPurchase = (packageData: any) => {
    setSelectedPackage(packageData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setShowPaymentModal(false);
    setToastMessage('Investment purchased successfully!');
    setToastType('success');
    setShowToast(true);
    
    // Reload investments
    if (user) {
      // Trigger reload of investments
      const loadMyInvestments = async () => {
        try {
          const investments = await getInvestmentsWithFallback();
          const userInvestments = investments.filter(inv => inv.client_id === user.id);
          
          const transformedInvestments: Investment[] = userInvestments.map(inv => ({
            id: inv.id,
            packageId: inv.client_id,
            packageName: 'Investment Package',
            amount: inv.amount,
            status: inv.status,
            startDate: new Date(inv.created_at),
            endDate: new Date(inv.created_at),
            expectedReturn: 0.08,
            currentValue: inv.amount * 1.08,
            profit: inv.amount * 0.08
          }));

          setMyInvestments(transformedInvestments);
        } catch (error) {
          console.error('Error reloading investments:', error);
        }
      };
      
      loadMyInvestments();
    }
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false);
    setToastMessage(`Payment failed: ${error}`);
    setToastType('error');
    setShowToast(true);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <ConnectionStatus />
              </div>
              <div className="flex items-center space-x-4">
                <UserProfile user={user} />
                <ClientLogoutButton />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${portfolioStats.totalInvested.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${portfolioStats.totalEarned.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Investments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioStats.activeInvestments}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {portfolioStats.pendingInvestments}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Investments Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Investments</h2>
              <button
                onClick={() => router.push('/investments')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>View All</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading investments...</p>
              </div>
            ) : myInvestments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myInvestments.slice(0, 6).map((investment) => (
                  <div key={investment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{investment.packageName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        investment.status === 'active' ? 'bg-green-100 text-green-800' :
                        investment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {investment.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-medium">${investment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profit:</span>
                        <span className="font-medium text-green-600">${investment.profit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Return:</span>
                        <span className="font-medium">{(investment.expectedReturn * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
                <p className="text-gray-600 mb-4">Start building your portfolio by investing in our packages</p>
                <button
                  onClick={() => router.push('/investments')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Investments
                </button>
              </div>
            )}
          </div>

          {/* Real-time Events */}
          {realtimeEvents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <RealtimeEvents events={realtimeEvents} />
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPackage && (
          <PaymentMethodModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            package={selectedPackage}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}

        {/* Toast */}
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
