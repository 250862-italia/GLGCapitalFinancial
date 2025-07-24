"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchJSONWithCSRF, fetchWithCSRF } from '@/lib/csrf-client';
import { useRealtime } from '@/hooks/use-realtime';
import RealtimeEvents from '@/components/ui/RealtimeEvents';
import ConnectionStatus from '@/components/ui/ConnectionStatus';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
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

interface PortfolioStats {
  totalInvested: number;
  totalEarned: number;
  activeInvestments: number;
  averageReturn: number;
  todayEarnings: number;
  monthlyEarnings: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  client?: {
    client_code: string;
    status: string;
    risk_profile: string;
    total_invested: number;
  };
}

export default function ClientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const { packages: availablePackages, loading: packagesLoading, error: packagesError, lastUpdated } = usePackages();
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [bankDetails, setBankDetails] = useState<{iban: string, accountHolder: string, bankName: string, reason: string} | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
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
    // Load purchased investments from database and bank data from localStorage
    const loadMyInvestments = async () => {
      if (!user) {
        setMyInvestments([]);
        setIsLoading(false);
        return;
      }

      // If real-time is not connected, use empty investments array to allow new purchases
      if (!realtimeConnected) {
        console.log('Using empty investments array due to Supabase connection issues');
        setMyInvestments([]);
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

    const loadClientProfile = async () => {
      if (!user) {
        setClientProfile(null);
        return;
      }

      try {
        const response = await fetchWithCSRF(`/api/profile/${user.id}`);
        if (response.ok) {
          const profileData = await response.json();
          setClientProfile(profileData);
        } else {
          console.error('Error loading client profile');
          setClientProfile(null);
        }
      } catch (error) {
        console.error('Error loading client profile:', error);
        setClientProfile(null);
      }
    };

    const loadBankDetails = () => {
      const stored = localStorage.getItem('bankDetails');
      if (stored) setBankDetails(JSON.parse(stored));
    };

    loadMyInvestments();
    loadClientProfile();
    loadBankDetails();
  }, [user, realtimeConnected]);

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

    // Set the selected package for the payment modal
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  // Function to handle payment method selection
  const handlePaymentMethodSelected = async (paymentMethod: PaymentMethod) => {
    if (!selectedPackage || !user) {
      alert('Please select a package to invest in.');
      return;
    }

    try {
      const amount = selectedPackage.minInvestment || selectedPackage.minAmount || 1000;
      
      // Calculate total amount including fees
      let totalAmount = amount;
      if (paymentMethod.id === 'credit_card') {
        totalAmount = amount * 1.025 + 0.30;
      } else if (paymentMethod.id === 'crypto') {
        totalAmount = amount * 1.01;
      }

      // Send email to GLG support with investment request
      const supportEmailResponse = await fetchJSONWithCSRF('/api/send-email', {
        method: 'POST',
        body: JSON.stringify({
          to: 'corefound@glgcapitalgroupllc.com',
          subject: `Investment Request - ${paymentMethod.name} - ${selectedPackage.name} Package - ${user.name || user.profile?.first_name || user.email}`,
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
              <li><strong>Investment Amount:</strong> $${amount}</li>
              <li><strong>Payment Method:</strong> ${paymentMethod.name}</li>
              <li><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</li>
              <li><strong>Expected Return:</strong> ${selectedPackage.expectedReturn || selectedPackage.daily_return || 1.0}% daily</li>
              <li><strong>Duration:</strong> ${selectedPackage.duration || 30} days</li>
            </ul>

            <p>Please process this investment request and send payment instructions to the client.</p>
            
            <p>Best regards,<br>GLG Capital Group System</p>
          `
        })
      });

      // Send confirmation email to user based on payment method
      let userEmailSubject = '';
      let userEmailHtml = '';
      
      switch (paymentMethod.id) {
        case 'bank_transfer':
          userEmailSubject = `Investment Request Confirmation - ${selectedPackage.name} Package`;
          userEmailHtml = `
            <h2>Investment Request Confirmation</h2>
            <p>Dear ${user.name || user.profile?.first_name || 'Valued Customer'},</p>
            <p>Thank you for your investment request for the <b>${selectedPackage.name}</b> package.</p>
            
            <h3>Request Details:</h3>
            <ul>
              <li><strong>Package:</strong> ${selectedPackage.name}</li>
              <li><strong>Investment Amount:</strong> $${amount}</li>
              <li><strong>Payment Method:</strong> ${paymentMethod.name}</li>
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
          `;
          break;
          
        case 'credit_card':
          userEmailSubject = `Payment Confirmation - ${selectedPackage.name} Package`;
          userEmailHtml = `
            <h2>Payment Confirmation</h2>
            <p>Dear ${user.name || user.profile?.first_name || 'Valued Customer'},</p>
            <p>Thank you for your payment for the <b>${selectedPackage.name}</b> package.</p>
            
            <h3>Payment Details:</h3>
            <ul>
              <li><strong>Package:</strong> ${selectedPackage.name}</li>
              <li><strong>Investment Amount:</strong> $${amount}</li>
              <li><strong>Payment Method:</strong> ${paymentMethod.name}</li>
              <li><strong>Processing Fee:</strong> $${(totalAmount - amount).toFixed(2)}</li>
              <li><strong>Total Paid:</strong> $${totalAmount.toFixed(2)}</li>
            </ul>

            <p>Your investment will be activated within 24 hours.</p>
            
            <p>Best regards,<br>GLG Capital Group Team</p>
          `;
          break;
          
        case 'crypto':
          userEmailSubject = `Crypto Payment Instructions - ${selectedPackage.name} Package`;
          userEmailHtml = `
            <h2>Crypto Payment Instructions</h2>
            <p>Dear ${user.name || user.profile?.first_name || 'Valued Customer'},</p>
            <p>Thank you for your investment request for the <b>${selectedPackage.name}</b> package.</p>
            
            <h3>Payment Details:</h3>
            <ul>
              <li><strong>Package:</strong> ${selectedPackage.name}</li>
              <li><strong>Investment Amount:</strong> $${amount}</li>
              <li><strong>Payment Method:</strong> ${paymentMethod.name}</li>
              <li><strong>Processing Fee:</strong> $${(totalAmount - amount).toFixed(2)}</li>
              <li><strong>Total to Pay:</strong> $${totalAmount.toFixed(2)}</li>
            </ul>

            <h3>Crypto Wallet Addresses:</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Bitcoin (BTC):</strong> bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
              <p><strong>Ethereum (ETH):</strong> 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6</p>
              <p><strong>USDT (TRC20):</strong> TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</p>
            </div>

            <h3>Important Instructions:</h3>
            <ol>
              <li>Send exactly $${totalAmount.toFixed(2)} worth of cryptocurrency to any of the addresses above</li>
              <li>Include your email address in the transaction memo/reference</li>
              <li>Once the payment is confirmed, send the transaction hash to our support team</li>
              <li>Your investment will be activated within 2-4 hours after confirmation</li>
            </ol>

            <h3>Contact Information:</h3>
            <p>If you have any questions or need assistance, please contact our support team at corefound@glgcapitalgroupllc.com</p>
            
            <p>Best regards,<br>GLG Capital Group Team</p>
          `;
          break;
      }

      const userEmailResponse = await fetchJSONWithCSRF('/api/send-email', {
        method: 'POST',
        body: JSON.stringify({
          to: user.email,
          subject: userEmailSubject,
          html: userEmailHtml
        })
      });

      if (!supportEmailResponse.ok || !userEmailResponse.ok) {
        throw new Error('Failed to send emails');
      }

      // Create investment record
      const newInvestment: Investment = {
        id: selectedPackage.id || String(Date.now()),
        packageName: selectedPackage.name,
        amount: amount,
        dailyReturn: selectedPackage.expectedReturn || selectedPackage.daily_return || 1.0,
        duration: selectedPackage.duration || 30,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + (selectedPackage.duration || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending_payment',
        totalEarned: 0,
        dailyEarnings: 0,
        monthlyEarnings: 0
      };

      // Send real-time notification to admin (via investment API)
      try {
        const adminNotificationResponse = await fetchJSONWithCSRF('/api/investments', {
          method: 'POST',
          body: JSON.stringify({
            userId: user.id,
            packageId: selectedPackage.id,
            amount: amount,
            packageName: selectedPackage.name,
            paymentMethod: paymentMethod.id,
            notifyAdmin: true
          })
        });

        if (adminNotificationResponse.ok) {
          console.log('✅ Investment created and admin notified');
        } else {
          console.warn('⚠️ Failed to create investment or notify admin');
        }
      } catch (notificationError) {
        console.warn('⚠️ Error creating investment:', notificationError);
      }

      const updated = [...myInvestments, newInvestment];
      setMyInvestments(updated);
      
      setShowPaymentModal(false);
      setSelectedPackage(null);
      setSelectedPaymentMethod(null);
      
      // Show success message
      alert(`Investment request submitted successfully! Check your email for ${paymentMethod.name} instructions.`);
      
    } catch (error) {
      console.error('Error processing investment:', error);
      alert('Error processing your investment request. Please try again.');
    }
  };

  const handleRequestDocumentation = (pkg: any) => {
    // Redirect to informational request page
    router.push('/informational-request');
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

  if (userLoading || isLoading || packagesLoading) {
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
        <div style={{ marginBottom: '1rem' }}>
          <ConnectionStatus 
            userId={user?.id} 
            userRole="user" 
            showDetails={true} 
          />
        </div>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>
            Welcome back, {clientProfile?.first_name || user?.name || 'User'}!
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Here's your investment portfolio overview
          </p>
        </div>

        {/* User Profile */}
        <div style={{ marginBottom: '2rem' }}>
          {user ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <UserProfile />
              <ClientLogoutButton />
            </div>
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
                    onClick={() => handleRequestDocumentation(pkg)}
                    style={{
                      width: '100%',
                      background: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#047857';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#059669';
                    }}
                  >
                    Request Documentation
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
        {/* Modale selezione metodo di pagamento */}
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPackage(null);
            setSelectedPaymentMethod(null);
          }}
          onConfirm={handlePaymentMethodSelected}
          packageName={selectedPackage?.name || ''}
          amount={selectedPackage?.minInvestment || selectedPackage?.minAmount || 1000}
          loading={false}
        />

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
