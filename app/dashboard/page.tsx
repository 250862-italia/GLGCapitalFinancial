"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
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
import { Investment } from "@/types/investment";
import { Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import UserProfile from "../../components/UserProfile";
import { usePackages } from "../../lib/package-context";
import Toast from "../../components/ui/Toast";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PortfolioStats {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  averageReturn: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const { packages: availablePackages, loading: packagesLoading, error: packagesError, lastUpdated } = usePackages();
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<{iban: string, accountHolder: string, bankName: string, reason: string} | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('count')
          .limit(1);
        
        if (error) {
          console.warn('Supabase connection test failed:', error);
          setSupabaseConnected(false);
          setConnectionError(error.message);
        } else {
          setSupabaseConnected(true);
          setConnectionError(null);
        }
      } catch (err) {
        console.warn('Supabase connection test failed:', err);
        setSupabaseConnected(false);
        setConnectionError('Connection failed');
      }
    };

    testConnection();
  }, []);

  useEffect(() => {
    // Load purchased investments from database and bank data from localStorage
    const loadMyInvestments = async () => {
      if (!user) {
        setMyInvestments([]);
        setIsLoading(false);
        return;
      }

      // If Supabase is not connected, use mock data
      if (!supabaseConnected) {
        console.log('Using mock data due to Supabase connection issues');
        const mockInvestments: Investment[] = [
          {
            id: 'mock-1',
            packageName: 'Premium Investment Package',
            amount: 5000,
            dailyReturn: 1.2,
            duration: 30,
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            totalEarned: 420,
            dailyEarnings: 60,
            monthlyEarnings: 1800
          },
          {
            id: 'mock-2',
            packageName: 'Gold Investment Package',
            amount: 10000,
            dailyReturn: 1.5,
            duration: 60,
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            totalEarned: 2250,
            dailyEarnings: 150,
            monthlyEarnings: 4500
          }
        ];
        setMyInvestments(mockInvestments);
        setIsLoading(false);
        return;
      }

      try {
        // Get client ID first
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (clientError || !clientData) {
          console.error('Error fetching client data:', clientError);
          setMyInvestments([]);
          setIsLoading(false);
          return;
        }

        // Get investments from database
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select(`
            *,
            package:package_id (name, description, duration, expected_return, min_investment)
          `)
          .eq('client_id', clientData.id);

        if (investmentsError) {
          console.error('Error fetching investments:', investmentsError);
          setMyInvestments([]);
          setIsLoading(false);
          return;
        }

        // Transform database investments to match expected format
        const transformedInvestments: Investment[] = (investments || []).map(normalizeInvestment);

        setMyInvestments(transformedInvestments);
      } catch (error) {
        console.error('Error loading investments:', error);
        setMyInvestments([]);
      } finally {
        setIsLoading(false);
      }
    };

    const loadBankDetails = () => {
      const stored = localStorage.getItem('bankDetails');
      if (stored) setBankDetails(JSON.parse(stored));
    };

    loadMyInvestments();
    loadBankDetails();
  }, [user, supabaseConnected]);

  // Funzione di normalizzazione per Investment (snake_case -> camelCase)
  function normalizeInvestment(inv: any): Investment {
    return {
      id: inv.id,
      packageName: inv.packageName || inv.package_name || inv.package?.name || 'Unknown Package',
      amount: inv.amount,
      dailyReturn: inv.dailyReturn ?? inv.daily_return ?? inv.package?.expected_return ?? inv.package?.daily_return ?? 1.0,
      duration: inv.duration ?? inv.package?.duration ?? 30,
      startDate: inv.startDate ?? inv.start_date,
      endDate: inv.endDate ?? inv.end_date,
      status: inv.status,
      totalEarned: inv.totalEarned ?? inv.total_returns ?? 0,
      dailyEarnings: inv.dailyEarnings ?? inv.daily_returns ?? 0,
      monthlyEarnings: inv.monthlyEarnings ?? inv.monthly_earnings ?? ((inv.daily_returns ?? 0) * 30),
    };
  }

  // Package normalization function
  function normalizePackage(pkg: any): any {
    return {
      id: pkg.id || pkg.ID || String(Date.now()),
      name: pkg.name || pkg.package_name || '',
      minInvestment: pkg.min_investment || pkg.min_amount || pkg.amount || 1000,
      dailyReturn: pkg.expected_return || pkg.daily_return || 1.0,
      duration: pkg.duration || 30,
      isActive: pkg.status === 'active', // Use status field instead of is_active
      category: pkg.category || 'General',
      riskLevel: pkg.riskLevel || pkg.risk_level || 'medium',
      description: pkg.description || '',
      maxInvestment: pkg.max_investment || pkg.max_amount || 50000,
      price: pkg.price || pkg.min_investment || 1000,
      currency: pkg.currency || 'USD',
      // no snake_case fallback for frontend
    };
  }

  // Normalizza tutti i pacchetti caricati
  const normalizedPackages = availablePackages.map(normalizePackage);
  // Active packages for all clients
  const activeInvestments = normalizedPackages.filter(pkg => pkg.isActive);
  // Packages to show: all those present in localStorage
  const allPackages = normalizedPackages;

  // Function to purchase a package
  const handleBuy = async (pkg: any) => {
    if (!user) {
      alert('Please log in to make investments.');
      return;
    }

    try {
      // Send email to GLG support with investment request
      const supportEmailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'corefound@glgcapitalgroupllc.com',
          subject: `Investment Request - ${selectedPackage.name} Package - ${user.name || user.profile?.first_name || user.email}`,
          html: `
            <h2>New Investment Request</h2>
            <p>A new investment request has been submitted:</p>
            
            <h3>Client Information:</h3>
            <ul>
              <li><strong>Name:</strong> ${user.name || user.profile?.first_name || 'Not provided'}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Request Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>

            <h3>Package Details:</h3>
            <ul>
              <li><strong>Package:</strong> ${selectedPackage.name}</li>
              <li><strong>Investment Amount:</strong> $${selectedPackage.minInvestment || selectedPackage.minAmount || 1000}</li>
              <li><strong>Expected Return:</strong> ${selectedPackage.expectedReturn || selectedPackage.daily_return || 1.0}% daily</li>
              <li><strong>Duration:</strong> ${selectedPackage.duration || 30} days</li>
            </ul>

            <p>Please process this investment request and send banking details to the client.</p>
            
            <p>Best regards,<br>GLG Capital Group System</p>
          `
        })
      });

      // Send confirmation email to user with banking details
      const userEmailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: `Investment Request Confirmation - ${selectedPackage.name} Package`,
          html: `
            <h2>Investment Request Confirmation</h2>
            <p>Dear ${user.name || user.profile?.first_name || 'Valued Customer'},</p>
            <p>Thank you for your investment request for the <b>${selectedPackage.name}</b> package.</p>
            
            <h3>Request Details:</h3>
            <ul>
              <li><strong>Package:</strong> ${selectedPackage.name}</li>
              <li><strong>Investment Amount:</strong> $${selectedPackage.minInvestment || selectedPackage.minAmount || 1000}</li>
              <li><strong>Expected Return:</strong> ${selectedPackage.expectedReturn || selectedPackage.daily_return || 1.0}% daily</li>
              <li><strong>Duration:</strong> ${selectedPackage.duration || 30} days</li>
            </ul>

            <h3>Next Steps:</h3>
            <ol>
              <li>Our team will review your investment request</li>
              <li>You will receive banking details and payment instructions within 24-48 hours</li>
              <li>Once payment is confirmed, your investment will be activated</li>
            </ol>

            <h3>Banking Details for Wire Transfer:</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Transfer Type:</strong> US Wire Transfer (up to 3 business days)</p>
              <p><strong>Beneficiary:</strong> GLG capital group LLC</p>
              <p><strong>Accepted Currency:</strong> USD</p>
              <p><strong>Account Number:</strong> 218086576410</p>
              <p><strong>ACH Routing Number:</strong> 101019644</p>
              <p><strong>Bank Routing Number:</strong> 101019644</p>
              <p><strong>Beneficiary Address:</strong> 1309 Coffeen Ave, Ste H, Sheridan, WY, 82801-5714, United States</p>
              <p><strong>Bank:</strong> Lead Bank</p>
              <p><strong>Bank Address:</strong> 1801 Main Street, Kansas City, MO, 64108, United States</p>
            </div>

            <h3>Important Instructions:</h3>
            <ol>
              <li>Please include your account reference number in the wire transfer description</li>
              <li>Use the following reference: <strong>Investment ${selectedPackage.name} - ${user.name || user.profile?.first_name || user.email}</strong></li>
              <li>Send the wire transfer to the banking details above</li>
              <li>Once the transfer is completed, please send the wire transfer receipt to our support team</li>
              <li>Your investment will be activated within 24-48 hours after we receive the payment confirmation</li>
            </ol>

            <h3>Contact Information:</h3>
            <p>If you have any questions or need assistance, please contact our support team at corefound@glgcapitalgroupllc.com</p>
            
            <p>Best regards,<br>GLG Capital Group Team</p>
          `
        })
      });

      if (!supportEmailResponse.ok || !userEmailResponse.ok) {
        throw new Error('Failed to send emails');
      }

      // Create investment record
      const newInvestment: Investment = {
        id: selectedPackage.id || String(Date.now()),
        packageName: selectedPackage.name,
        amount: selectedPackage.minInvestment || selectedPackage.minAmount || 1000,
        dailyReturn: selectedPackage.expectedReturn || selectedPackage.daily_return || 1.0,
        duration: selectedPackage.duration || 30,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + (selectedPackage.duration || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending_payment', // Changed to pending_payment until payment is confirmed
        totalEarned: 0,
        dailyEarnings: 0,
        monthlyEarnings: 0
      };

      const updated = [...myInvestments, newInvestment];
      setMyInvestments(updated);
      
      setShowBankModal(false);
      setSelectedPackage(null);
      
      // Show success message
      alert('Investment request submitted successfully! Check your email for banking details and instructions.');
      
    } catch (error) {
      console.error('Error processing investment:', error);
      alert('Error processing your investment request. Please try again.');
    }
  };

  // Stats calculated only on purchased investments
  const stats = {
    totalInvested: myInvestments.reduce((sum, inv) => sum + (inv.amount ?? 0), 0),
    totalEarned: myInvestments.reduce((sum, inv) => sum + (inv.totalEarned ?? 0), 0),
    activeInvestments: myInvestments.length,
    averageReturn: myInvestments.length > 0 ? myInvestments.reduce((sum, inv) => sum + (inv.dailyReturn ?? 0), 0) / myInvestments.length : 0,
    todayEarnings: myInvestments.reduce((sum, inv) => sum + (inv.dailyEarnings ?? 0), 0),
    monthlyEarnings: myInvestments.reduce((sum, inv) => sum + (inv.monthlyEarnings ?? 0), 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'completed': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'pending_payment': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'pending_payment': return 'Pending Payment';
      default: return 'Unknown';
    }
  };

  // --- RISK DISTRIBUTION CHART ---
  // TEST: static data for PieChart
  const riskData = [
    { name: 'Low', value: 1 },
    { name: 'Medium', value: 2 },
    { name: 'High', value: 3 }
  ];
  const riskColors = ['#10b981', '#f59e0b', '#ef4444'];

  if (isLoading || packagesLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Connection Status Indicator */}
        {!supabaseConnected && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <WifiOff size={20} color="#f59e0b" />
            <div>
              <strong style={{ color: '#92400e' }}>Offline Mode</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#92400e', fontSize: '0.875rem' }}>
                Showing demo data. Some features may be limited.
              </p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Here's your investment portfolio overview
          </p>
        </div>

        {/* User Profile */}
        <div style={{ marginBottom: '2rem' }}>
          {user ? (
            <UserProfile />
          ) : (
            <div style={{ 
              color: '#dc2626', 
              fontWeight: 700, 
              fontSize: 18, 
              padding: 16, 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={20} />
              <div>
                <div>Utente non autenticato</div>
                <button 
                  onClick={() => router.push('/login')}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    marginTop: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Accedi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Available Packages for Purchase */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem', margin: '2.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 900, margin: '0 0 0.5rem 0' }}>Investment Packages Available</h2>
              <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>Choose from our selection of investment packages. All packages are managed by our expert team.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {lastUpdated && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></div>
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}
                title="Refresh packages"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
          
          {packagesLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <p>Loading available packages...</p>
            </div>
          ) : packagesError ? (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: 8, textAlign: 'center' }}>
              Error loading packages: {packagesError}
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {availablePackages.filter(pkg => pkg.isActive).map(pkg => (
                <div key={pkg.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                        {pkg.name}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                        {pkg.description}
                      </p>
                    </div>
                    <span style={{
                      background: pkg.riskLevel === 'low' ? '#bbf7d0' : pkg.riskLevel === 'medium' ? '#fef3c7' : '#fee2e2',
                      color: pkg.riskLevel === 'low' ? '#166534' : pkg.riskLevel === 'medium' ? '#92400e' : '#991b1b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {pkg.riskLevel}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Min Investment</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937' }}>
                        {formatCurrency(pkg.minInvestment)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Expected Return</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#059669' }}>
                        {pkg.expectedReturn}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Duration</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937' }}>
                        {pkg.duration} months
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBuy(pkg)}
                    disabled={myInvestments.some(inv => inv.packageName === pkg.name)}
                    style={{
                      width: '100%',
                      background: myInvestments.some(inv => inv.packageName === pkg.name) ? '#d1d5db' : '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: myInvestments.some(inv => inv.packageName === pkg.name) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {myInvestments.some(inv => inv.packageName === pkg.name) ? 'Already Invested' : 'Invest Now'}
                  </button>
                </div>
              ))}
              
              {availablePackages.filter(pkg => pkg.isActive).length === 0 && (
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '3rem', 
                  color: '#6b7280' 
                }}>
                  <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    No Investment Packages Available
                  </h3>
                  <p>Check back later for new investment opportunities.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Portfolio Summary - blocco attrattivo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Total Invested */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 60%, #bbf7d0 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(16,185,129,0.10)',
            border: '1px solid #bbf7d0',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <DollarSign size={38} color="#059669" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#059669', fontWeight: 700, marginBottom: 6 }}>Total Invested</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.totalInvested)}</div>
          </div>
          {/* Total Earned */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 60%, #fde68a 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(245,158,11,0.10)',
            border: '1px solid #fde68a',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <TrendingUp size={38} color="#f59e0b" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 700, marginBottom: 6 }}>Total Earned</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.totalEarned)}</div>
          </div>
          {/* Today's Earnings */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 60%, #bae6fd 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(59,130,246,0.10)',
            border: '1px solid #bae6fd',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <Target size={38} color="#3b82f6" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#3b82f6', fontWeight: 700, marginBottom: 6 }}>Today's Earnings</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.todayEarnings)}</div>
          </div>
          {/* Monthly Earnings */}
          <div style={{
            background: 'linear-gradient(135deg, #fdf2f8 60%, #fbcfe8 100%)',
            padding: '2rem 1.5rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(236,72,153,0.10)',
            border: '1px solid #fbcfe8',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <BarChart3 size={38} color="#ec4899" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, color: '#ec4899', fontWeight: 700, marginBottom: 6 }}>Monthly Earnings</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', letterSpacing: -1 }}>{formatCurrency(stats.monthlyEarnings)}</div>
          </div>
        </div>

        {/* Banking Details Modal */}
        {showBankModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 32, minWidth: 350, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Investment Confirmation</h2>
              {selectedPackage && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#166534' }}>Package Details</h3>
                    <div><b>Package:</b> {selectedPackage.name}</div>
                    <div><b>Investment Amount:</b> ${selectedPackage.minInvestment || selectedPackage.minAmount || 1000}</div>
                    <div><b>Expected Return:</b> {selectedPackage.expectedReturn || selectedPackage.daily_return || 1.0}% daily</div>
                    <div><b>Duration:</b> {selectedPackage.duration || 30} days</div>
                  </div>
                  <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: 16 }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#92400e' }}>Next Steps</h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#92400e' }}>
                      Click "Send Investment Instructions" to receive an email with:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#92400e' }}>
                      <li>Complete banking details for wire transfer</li>
                      <li>Step-by-step payment instructions</li>
                      <li>Reference number for your investment</li>
                    </ul>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowBankModal(false); setSelectedPackage(null); }} style={{ background: '#d1d5db', color: '#1f2937', padding: '0.5rem 1rem', border: 'none', borderRadius: 6, fontWeight: 500 }}>Cancel</button>
                <button onClick={handleBuy} style={{ background: '#059669', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Send Investment Instructions</button>
              </div>
            </div>
          </div>
        )}

        <Toast
          message={""}
          visible={false}
          onClose={() => {}}
          duration={5000}
        />
        </div>
      </div>
    </ProtectedRoute>
  );
}
