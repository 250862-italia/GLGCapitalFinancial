"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Download,
  Plus,
  Settings,
  LogOut,
  PieChart,
  LineChart,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import NotificationSystem from '../../components/ui/NotificationSystem';

interface PortfolioItem {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'crypto' | 'real-estate';
  amount: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  lastUpdate: string;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'dividend';
  asset: string;
  amount: number;
  price: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function ReservedArea() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadPortfolioData();
  }, [router]);

  const loadPortfolioData = () => {
    // Mock data - in real app this would come from API
    const mockPortfolio: PortfolioItem[] = [
      {
        id: '1',
        name: 'Apple Inc. (AAPL)',
        type: 'stock',
        amount: 100,
        currentValue: 18500,
        profit: 2500,
        profitPercentage: 15.6,
        lastUpdate: '2024-01-15'
      },
      {
        id: '2',
        name: 'Tesla Inc. (TSLA)',
        type: 'stock',
        amount: 50,
        currentValue: 12500,
        profit: -1500,
        profitPercentage: -10.7,
        lastUpdate: '2024-01-15'
      },
      {
        id: '3',
        name: 'US Treasury Bond',
        type: 'bond',
        amount: 10000,
        currentValue: 10200,
        profit: 200,
        profitPercentage: 2.0,
        lastUpdate: '2024-01-15'
      },
      {
        id: '4',
        name: 'Bitcoin (BTC)',
        type: 'crypto',
        amount: 0.5,
        currentValue: 22000,
        profit: 5000,
        profitPercentage: 29.4,
        lastUpdate: '2024-01-15'
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'buy',
        asset: 'Apple Inc. (AAPL)',
        amount: 50,
        price: 160,
        date: '2024-01-10',
        status: 'completed'
      },
      {
        id: '2',
        type: 'sell',
        asset: 'Tesla Inc. (TSLA)',
        amount: 25,
        price: 250,
        date: '2024-01-08',
        status: 'completed'
      },
      {
        id: '3',
        type: 'dividend',
        asset: 'Apple Inc. (AAPL)',
        amount: 100,
        price: 0.24,
        date: '2024-01-05',
        status: 'completed'
      }
    ];

    setPortfolio(mockPortfolio);
    setTransactions(mockTransactions);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const totalInvestment = portfolio.reduce((sum, item) => sum + item.amount, 0);
  const totalValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalProfit = portfolio.reduce((sum, item) => sum + item.profit, 0);
  const totalProfitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

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
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1f2937',
                margin: 0
              }}>
                {user?.firstName} {user?.lastName}
              </h3>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                margin: 0
              }}>
                {user?.email}
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
                { id: 'portfolio', label: 'My Portfolio', icon: PieChart },
                { id: 'transactions', label: 'Transactions', icon: Activity },
                { id: 'analytics', label: 'Analytics', icon: LineChart }
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

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              Account
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: '#374151',
                    fontWeight: 500,
                    textAlign: 'left'
                  }}
                >
                  <Settings size={20} />
                  Settings
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: '#dc2626',
                    fontWeight: 500,
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </li>
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
              {activeTab === 'overview' && 'Portfolio Overview'}
              {activeTab === 'portfolio' && 'My Portfolio'}
              {activeTab === 'transactions' && 'Transactions'}
              {activeTab === 'analytics' && 'Analytics'}
            </h1>
            <p style={{
              fontSize: 16,
              color: '#6b7280',
              margin: '0.5rem 0 0 0'
            }}>
              Manage your investments and track your performance
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Notification System */}
            <NotificationSystem userId={user?.id || 'default'} />
            
            <button
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
              <Plus size={20} />
              Add Investment
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
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
                  ${totalInvestment.toLocaleString()}
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
                  ${totalValue.toLocaleString()}
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
                    Total Profit/Loss
                  </h3>
                  {totalProfit >= 0 ? (
                    <ArrowUpRight size={20} color="#16a34a" />
                  ) : (
                    <ArrowDownRight size={20} color="#dc2626" />
                  )}
                </div>
                <p style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: totalProfit >= 0 ? '#16a34a' : '#dc2626',
                  margin: 0
                }}>
                  ${totalProfit.toLocaleString()} ({totalProfitPercentage.toFixed(1)}%)
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
                  {portfolio.length}
                </p>
              </div>
            </div>

            {/* Portfolio Chart Placeholder */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <LineChart size={48} color="#059669" style={{ marginBottom: '1rem' }} />
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Portfolio Performance
              </h3>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                margin: 0
              }}>
                Interactive chart showing your portfolio performance over time
              </p>
            </div>

            {/* Recent Transactions */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Recent Transactions
                </h3>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#059669',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  View All
                </button>
              </div>

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
                        Type
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Asset
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Amount
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Price
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Date
                      </th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((transaction) => (
                      <tr key={transaction.id} style={{
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <td style={{
                          padding: '0.75rem 0',
                          color: '#374151'
                        }}>
                          <span style={{
                            background: transaction.type === 'buy' ? '#f0fdf4' : transaction.type === 'sell' ? '#fef2f2' : '#f0f9ff',
                            color: transaction.type === 'buy' ? '#16a34a' : transaction.type === 'sell' ? '#dc2626' : '#0284c7',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {transaction.type}
                          </span>
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          {transaction.asset}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          color: '#374151'
                        }}>
                          {transaction.amount}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          color: '#374151'
                        }}>
                          ${transaction.price}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          color: '#6b7280'
                        }}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td style={{
                          padding: '0.75rem 0'
                        }}>
                          <span style={{
                            background: transaction.status === 'completed' ? '#f0fdf4' : transaction.status === 'pending' ? '#fef3c7' : '#fef2f2',
                            color: transaction.status === 'completed' ? '#16a34a' : transaction.status === 'pending' ? '#d97706' : '#dc2626',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Your Investments
                </h3>
                <button
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  <Plus size={16} style={{ marginRight: '0.5rem' }} />
                  Add New
                </button>
              </div>

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
                        Asset
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
                            background: item.type === 'stock' ? '#f0fdf4' : item.type === 'bond' ? '#f0f9ff' : item.type === 'crypto' ? '#fef3c7' : '#f3e8ff',
                            color: item.type === 'stock' ? '#16a34a' : item.type === 'bond' ? '#0284c7' : item.type === 'crypto' ? '#d97706' : '#9333ea',
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
                          {item.amount}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          textAlign: 'right',
                          color: '#374151',
                          fontWeight: 600
                        }}>
                          ${item.currentValue.toLocaleString()}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          textAlign: 'right',
                          color: item.profit >= 0 ? '#16a34a' : '#dc2626',
                          fontWeight: 600
                        }}>
                          ${item.profit.toLocaleString()} ({item.profitPercentage.toFixed(1)}%)
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
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0
                }}>
                  Transaction History
                </h3>
                <button
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  <Download size={16} style={{ marginRight: '0.5rem' }} />
                  Export
                </button>
              </div>

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
                        Date
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
                        textAlign: 'left',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Asset
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
                        Price
                      </th>
                      <th style={{
                        textAlign: 'right',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Total
                      </th>
                      <th style={{
                        textAlign: 'center',
                        padding: '0.75rem 0',
                        fontWeight: 600,
                        color: '#374151'
                      }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} style={{
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <td style={{
                          padding: '0.75rem 0',
                          color: '#6b7280'
                        }}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td style={{
                          padding: '0.75rem 0'
                        }}>
                          <span style={{
                            background: transaction.type === 'buy' ? '#f0fdf4' : transaction.type === 'sell' ? '#fef2f2' : '#f0f9ff',
                            color: transaction.type === 'buy' ? '#16a34a' : transaction.type === 'sell' ? '#dc2626' : '#0284c7',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {transaction.type}
                          </span>
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          color: '#374151',
                          fontWeight: 500
                        }}>
                          {transaction.asset}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          textAlign: 'right',
                          color: '#374151'
                        }}>
                          {transaction.amount}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          textAlign: 'right',
                          color: '#374151'
                        }}>
                          ${transaction.price}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          textAlign: 'right',
                          color: '#374151',
                          fontWeight: 600
                        }}>
                          ${(transaction.amount * transaction.price).toLocaleString()}
                        </td>
                        <td style={{
                          padding: '0.75rem 0',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            background: transaction.status === 'completed' ? '#f0fdf4' : transaction.status === 'pending' ? '#fef3c7' : '#fef2f2',
                            color: transaction.status === 'completed' ? '#16a34a' : transaction.status === 'pending' ? '#d97706' : '#dc2626',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <LineChart size={64} color="#059669" style={{ marginBottom: '1rem' }} />
              <h3 style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Advanced Analytics
              </h3>
              <p style={{
                fontSize: 16,
                color: '#6b7280',
                marginBottom: '2rem'
              }}>
                Detailed performance analysis, risk metrics, and portfolio optimization insights
              </p>
              <button
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}