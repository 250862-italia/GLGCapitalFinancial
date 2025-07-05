"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { TrendingUp, Calendar, DollarSign, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Investment {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  package?: {
    name: string;
    description: string;
    duration: number;
    expectedReturn: number;
    minInvestment: number;
    maxInvestment: number;
  };
}

export default function MyInvestmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('investments')
        .select(`
          *,
          package:packages(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setInvestments(data || []);
    } catch (err: any) {
      console.error('Error fetching investments:', err);
      setError('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} color="#059669" />;
      case 'pending':
        return <Clock size={20} color="#f59e0b" />;
      case 'completed':
        return <CheckCircle size={20} color="#3b82f6" />;
      case 'cancelled':
        return <XCircle size={20} color="#dc2626" />;
      default:
        return <Clock size={20} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { background: '#dcfce7', color: '#166534' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      case 'completed':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateExpectedReturn = (amount: number, expectedReturn: number) => {
    return (amount * expectedReturn) / 100;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b', fontSize: 18 }}>Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#6b7280" />
          </button>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              My Investments
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Track your investment portfolio and performance
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#dbeafe', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <TrendingUp size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Total Investments
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {investments.length}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#dcfce7', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <DollarSign size={24} color="#059669" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Total Invested
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  €{investments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#fef3c7', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <Clock size={24} color="#f59e0b" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Active
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {investments.filter(inv => inv.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                background: '#f3e8ff', 
                borderRadius: 8, 
                padding: '0.75rem',
                marginRight: '1rem'
              }}>
                <Calendar size={24} color="#8b5cf6" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>
                  Pending
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  {investments.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem 2rem',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
              Investment History
            </h2>
          </div>

          <div style={{ padding: '2rem' }}>
            {investments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <TrendingUp size={64} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem' }}>
                  No investments yet
                </h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                  Start your investment journey by exploring our available packages
                </p>
                <button
                  onClick={() => router.push('/investments')}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.75rem 1.5rem',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Browse Investment Packages
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {investments.map((investment) => {
                  const statusStyle = getStatusColor(investment.status);
                  return (
                    <div key={investment.id} style={{
                      background: '#f8fafc',
                      borderRadius: 12,
                      padding: '1.5rem',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '1rem',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                            {investment.package?.name || 'Investment Package'}
                          </h3>
                          <span style={{
                            background: statusStyle.background,
                            color: statusStyle.color,
                            padding: '0.25rem 0.75rem',
                            borderRadius: 12,
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {getStatusIcon(investment.status)}
                            {investment.status}
                          </span>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0.5rem 0' }}>
                          {investment.package?.description || 'Investment package'}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Amount</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                              €{investment.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Expected Return</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#059669', margin: 0 }}>
                              €{calculateExpectedReturn(investment.amount, investment.package?.expectedReturn || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Duration</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                              {investment.package?.duration || 0} months
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Created</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                              {formatDate(investment.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 