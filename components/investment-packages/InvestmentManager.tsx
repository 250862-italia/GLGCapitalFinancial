"use client";

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Target, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Eye
} from 'lucide-react';

interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  type: 'conservative' | 'balanced' | 'aggressive';
  minInvestment: number;
  maxInvestment: number;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  duration: number; // in months
  features: string[];
  currentValue?: number;
  profit?: number;
  profitPercentage?: number;
}

interface InvestmentManagerProps {
  userId: string;
}

export default function InvestmentManager({ userId }: InvestmentManagerProps) {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInvestmentPackages();
  }, []);

  const loadInvestmentPackages = () => {
    const mockPackages: InvestmentPackage[] = [
      {
        id: '1',
        name: 'Conservative Growth',
        description: 'Low-risk portfolio focused on stable growth and dividend income',
        type: 'conservative',
        minInvestment: 1000,
        maxInvestment: 100000,
        expectedReturn: 5.5,
        riskLevel: 'low',
        duration: 12,
        features: [
          'Government bonds',
          'Blue-chip stocks',
          'Dividend-paying securities',
          'Regular income distribution',
          'Capital preservation focus'
        ],
        currentValue: 10550,
        profit: 550,
        profitPercentage: 5.5
      },
      {
        id: '2',
        name: 'Balanced Portfolio',
        description: 'Moderate risk portfolio with growth and income balance',
        type: 'balanced',
        minInvestment: 2500,
        maxInvestment: 250000,
        expectedReturn: 8.2,
        riskLevel: 'medium',
        duration: 18,
        features: [
          'Mix of stocks and bonds',
          'International diversification',
          'Growth and value stocks',
          'Regular rebalancing',
          'Moderate volatility'
        ],
        currentValue: 27050,
        profit: 2050,
        profitPercentage: 8.2
      },
      {
        id: '3',
        name: 'Aggressive Growth',
        description: 'High-growth portfolio focused on capital appreciation',
        type: 'aggressive',
        minInvestment: 5000,
        maxInvestment: 500000,
        expectedReturn: 12.5,
        riskLevel: 'high',
        duration: 24,
        features: [
          'Growth stocks',
          'Technology sector focus',
          'Emerging markets',
          'Higher volatility',
          'Long-term growth potential'
        ],
        currentValue: 56250,
        profit: 6250,
        profitPercentage: 12.5
      }
    ];

    setPackages(mockPackages);
  };

  const handleInvest = async () => {
    if (!selectedPackage || investmentAmount < selectedPackage.minInvestment) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update package with new investment
      setPackages(prev => prev.map(pkg => 
        pkg.id === selectedPackage.id 
          ? { 
              ...pkg, 
              currentValue: (pkg.currentValue || 0) + investmentAmount,
              profit: (pkg.profit || 0) + (investmentAmount * pkg.expectedReturn / 100)
            }
          : pkg
      ));
      
      setSelectedPackage(null);
      setInvestmentAmount(0);
    } catch (error) {
      console.error('Investment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#16a34a';
      case 'medium': return '#d97706';
      case 'high': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conservative': return '#059669';
      case 'balanced': return '#d97706';
      case 'aggressive': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          color: '#1f2937',
          marginBottom: 8 
        }}>
          Investment Packages
        </h1>
        <p style={{ 
          fontSize: 16, 
          color: '#6b7280',
          margin: 0 
        }}>
          Choose from our carefully curated investment packages
        </p>
      </div>

      {/* Investment Packages Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {packages.map((pkg) => (
          <div key={pkg.id} style={{
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Package Type Badge */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: getTypeColor(pkg.type),
              color: 'white',
              padding: '0.5rem 1rem',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              borderBottomLeftRadius: 8
            }}>
              {pkg.type}
            </div>

            {/* Package Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: 8
              }}>
                {pkg.name}
              </h3>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 16
              }}>
                {pkg.description}
              </p>
              
              {/* Risk Level */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: getRiskColor(pkg.riskLevel)
                }} />
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151',
                  textTransform: 'capitalize'
                }}>
                  {pkg.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Investment Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  Expected Return
                </p>
                <p style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: '#059669',
                  margin: 0 
                }}>
                  {pkg.expectedReturn}%
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  Duration
                </p>
                <p style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: '#1f2937',
                  margin: 0 
                }}>
                  {pkg.duration} months
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  Min Investment
                </p>
                <p style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: '#1f2937',
                  margin: 0 
                }}>
                  ${pkg.minInvestment.toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  Max Investment
                </p>
                <p style={{ 
                  fontSize: 20, 
                  fontWeight: 700, 
                  color: '#1f2937',
                  margin: 0 
                }}>
                  ${pkg.maxInvestment.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Features */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 12
              }}>
                Features
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {pkg.features.map((feature, index) => (
                  <li key={index} style={{
                    fontSize: 14,
                    color: '#6b7280',
                    marginBottom: 4
                  }}>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowDetails(showDetails === pkg.id ? null : pkg.id)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Eye size={16} />
                Details
              </button>
              <button
                onClick={() => setSelectedPackage(pkg)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: 8,
                  background: '#059669',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Plus size={16} />
                Invest
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Investment Modal */}
      {selectedPackage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 500,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Invest in {selectedPackage.name}
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#374151'
              }}>
                Investment Amount (USD)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min={selectedPackage.minInvestment}
                max={selectedPackage.maxInvestment}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16
                }}
                placeholder={`Min: $${selectedPackage.minInvestment.toLocaleString()}`}
              />
              <p style={{
                fontSize: 12,
                color: '#6b7280',
                marginTop: 4
              }}>
                Expected return: ${(investmentAmount * selectedPackage.expectedReturn / 100).toFixed(2)} per year
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => {
                  setSelectedPackage(null);
                  setInvestmentAmount(0);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={isLoading || investmentAmount < selectedPackage.minInvestment}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: 8,
                  background: isLoading ? '#9ca3af' : '#059669',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Processing...' : 'Confirm Investment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 