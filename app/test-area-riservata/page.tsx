"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageProvider, usePackages } from '../../lib/package-context';
import { 
  User, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Download
} from 'lucide-react';

function DashboardContent() {
  const { packages } = usePackages();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    totalInvestment: 25000,
    currentValue: 26750,
    profit: 1750,
    profitPercentage: 7.0,
    activePackages: 2
  };

  // Mock portfolio data
  const portfolio = [
    {
      id: '1',
      name: 'Conservative Growth',
      type: 'stock',
      amount: 15000,
      currentValue: 16200,
      profit: 1200,
      profitPercentage: 8.0,
      lastUpdate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Aggressive Growth',
      type: 'crypto',
      amount: 10000,
      currentValue: 10550,
      profit: 550,
      profitPercentage: 5.5,
      lastUpdate: '2024-01-15'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: 280,
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        padding: '2rem 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* User Info */}
        <div style={{
          padding: '0 2rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: '#059669',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1f2937',
                margin: 0
              }}>
                {user.name}
              </h3>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                margin: 0
              }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0 2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              Portfolio
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'portfolio', label: 'My Portfolio', icon: Shield },
                { id: 'transactions', label: 'Transactions', icon: Clock },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((item) => (
                <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: activeTab === item.id ? '#f0fdf4' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      color: activeTab === item.id ? '#059669' : '#374151',
                      fontWeight: activeTab === item.id ? 600 : 500,
                      textAlign: 'left'
                    }}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: 280,
        padding: '2rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#1f2937',
              margin: 0
            }}>
              Portfolio Dashboard
            </h1>
            <p style={{
              fontSize: 16,
              color: '#6b7280',
              margin: '0.5rem 0 0 0'
            }}>
              Welcome back, {user.name}! Here's your investment overview.
            </p>
          </div>
          <button
            onClick={() => router.push('/reserved')}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}
          >
            <Eye size={20} />
            View Full Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#6b7280',
                margin: 0
              }}>
                Total Investment
              </h3>
              <DollarSign size={20} color="#059669" />
            </div>
            <p style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              margin: 0
            }}>
              ${user.totalInvestment != null ? user.totalInvestment.toLocaleString() : '-'}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#6b7280',
                margin: 0
              }}>
                Current Value
              </h3>
              <TrendingUp size={20} color="#059669" />
            </div>
            <p style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              margin: 0
            }}>
              ${user.currentValue != null ? user.currentValue.toLocaleString() : '-'}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#6b7280',
                margin: 0
              }}>
                Total Profit
              </h3>
              <CheckCircle size={20} color="#16a34a" />
            </div>
            <p style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#16a34a',
              margin: 0
            }}>
              +${user.profit != null ? user.profit.toLocaleString() : '-'} (+{user.profitPercentage}%)
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#6b7280',
                margin: 0
              }}>
                Active Positions
              </h3>
              <Shield size={20} color="#059669" />
            </div>
            <p style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              margin: 0
            }}>
              {user.activePackages}
            </p>
          </div>
        </div>

        {/* Portfolio Table */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: 12,
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '1.5rem'
          }}>
            Your Investments
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '0.75rem 0',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Investment
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '0.75rem 0',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Type
                  </th>
                  <th style={{
                    textAlign: 'right',
                    padding: '0.75rem 0',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Amount
                  </th>
                  <th style={{
                    textAlign: 'right',
                    padding: '0.75rem 0',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Current Value
                  </th>
                  <th style={{
                    textAlign: 'right',
                    padding: '0.75rem 0',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Profit/Loss
                  </th>
                  <th style={{
                    textAlign: 'center',
                    padding: '0.75rem 0',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => (
                  <tr key={item.id} style={{
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <td style={{
                      padding: '0.75rem 0',
                      color: '#374151',
                      fontWeight: 500
                    }}>
                      {item.name}
                    </td>
                    <td style={{
                      padding: '0.75rem 0'
                    }}>
                      <span style={{
                        background: item.type === 'stock' ? '#f0fdf4' : '#fef3c7',
                        color: item.type === 'stock' ? '#16a34a' : '#d97706',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.75rem 0',
                      textAlign: 'right',
                      color: '#374151'
                    }}>
                      ${item.amount != null ? item.amount.toLocaleString() : '-'}
                    </td>
                    <td style={{
                      padding: '0.75rem 0',
                      textAlign: 'right',
                      color: '#374151',
                      fontWeight: 600
                    }}>
                      ${item.currentValue != null ? item.currentValue.toLocaleString() : '-'}
                    </td>
                    <td style={{
                      padding: '0.75rem 0',
                      textAlign: 'right',
                      color: item.profit >= 0 ? '#16a34a' : '#dc2626',
                      fontWeight: 600
                    }}>
                      ${item.profit != null ? item.profit.toLocaleString() : '-'} ({item.profitPercentage}%)
                    </td>
                    <td style={{
                      padding: '0.75rem 0',
                      textAlign: 'center'
                    }}>
                      <button
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#059669',
                          cursor: 'pointer',
                          marginRight: '0.5rem'
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer'
                        }}
                        title="Download Report"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}
          >
            <User size={20} />
            Get Started
          </button>
          
          <button
            onClick={() => router.push('/login')}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}
          >
            <CheckCircle size={20} />
            Login
          </button>
          
          <button
            onClick={() => router.push('/admin')}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 600
            }}
          >
            <Shield size={20} />
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestAreaRiservata() {
  return (
    <PackageProvider>
      <DashboardContent />
    </PackageProvider>
  );
} 