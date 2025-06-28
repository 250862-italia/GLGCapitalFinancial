"use client";

import { useState, useEffect } from 'react';
import { 
  Handshake, 
  Building, 
  Globe, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

interface Partnership {
  id: string;
  name: string;
  type: 'exclusive' | 'strategic' | 'technology' | 'financial';
  status: 'active' | 'pending' | 'expired' | 'terminated';
  partnerCompany: string;
  startDate: Date;
  endDate?: Date;
  value: number;
  description: string;
  contactPerson: string;
  contactEmail: string;
}

export default function AdminPartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadPartnershipsData();
  }, []);

  const loadPartnershipsData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData: Partnership[] = [
        {
          id: '1',
          name: 'Magnificus Dominus Consulting Europe Srl',
          type: 'exclusive',
          status: 'active',
          partnerCompany: 'Magnificus Dominus Consulting Europe Srl',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2026-12-31'),
          value: 500000,
          description: 'Exclusive partner for Italy - Strategic development and consultancy services',
          contactPerson: 'Marco Rossi',
          contactEmail: 'marco.rossi@magnificusdominusconsulting.com'
        },
        {
          id: '2',
          name: 'Wash The World Initiative',
          type: 'strategic',
          status: 'active',
          partnerCompany: 'Wash The World Association',
          startDate: new Date('2024-02-15'),
          endDate: new Date('2025-12-31'),
          value: 250000,
          description: 'Environmental sustainability partnership for plastic waste reduction',
          contactPerson: 'Elena Green',
          contactEmail: 'elena.green@washtheworld.it'
        },
        {
          id: '3',
          name: 'Pentawash Product Launch',
          type: 'technology',
          status: 'active',
          partnerCompany: 'Pentawash Solutions',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2025-06-30'),
          value: 150000,
          description: 'First Wash The World approved product - Eco-friendly laundry care',
          contactPerson: 'Giuseppe Bianchi',
          contactEmail: 'giuseppe.bianchi@pentawash.com'
        },
        {
          id: '4',
          name: 'Financial Technology Integration',
          type: 'technology',
          status: 'pending',
          partnerCompany: 'FinTech Solutions Inc.',
          startDate: new Date('2024-04-01'),
          endDate: new Date('2025-03-31'),
          value: 750000,
          description: 'Advanced financial technology platform integration',
          contactPerson: 'Sarah Johnson',
          contactEmail: 'sarah.johnson@fintechsolutions.com'
        },
        {
          id: '5',
          name: 'Market Data Partnership',
          type: 'strategic',
          status: 'expired',
          partnerCompany: 'MarketData Pro',
          startDate: new Date('2023-06-01'),
          endDate: new Date('2024-05-31'),
          value: 300000,
          description: 'Real-time market data and analytics services',
          contactPerson: 'Michael Chen',
          contactEmail: 'michael.chen@marketdatapro.com'
        },
        {
          id: '6',
          name: 'Investment Platform Integration',
          type: 'financial',
          status: 'active',
          partnerCompany: 'InvestTech Global',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2026-01-14'),
          value: 1000000,
          description: 'Comprehensive investment platform and portfolio management',
          contactPerson: 'David Wilson',
          contactEmail: 'david.wilson@investtechglobal.com'
        }
      ];

      setPartnerships(mockData);
    } catch (error) {
      console.error('Error loading partnerships data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exclusive':
        return <Handshake size={16} />;
      case 'strategic':
        return <Building size={16} />;
      case 'technology':
        return <Globe size={16} />;
      case 'financial':
        return <DollarSign size={16} />;
      default:
        return <Handshake size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exclusive':
        return '#dc2626';
      case 'strategic':
        return '#1d4ed8';
      case 'technology':
        return '#059669';
      case 'financial':
        return '#d97706';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'expired':
        return '#6b7280';
      case 'terminated':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'expired':
        return <AlertTriangle size={16} />;
      case 'terminated':
        return <Trash2 size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredPartnerships = partnerships.filter(partnership => {
    const matchesSearch = partnership.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         partnership.partnerCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || partnership.type === filterType;
    const matchesStatus = filterStatus === 'all' || partnership.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading Partnerships...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#1a2238', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '0.5rem' 
          }}>
            Partnerships Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Manage strategic partnerships and business relationships
          </p>
        </div>

        {/* Quick Navigation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <a href="/admin/partnerships/add" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            <span>Add Partnership</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/partnerships/agreement" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Handshake size={20} style={{ marginRight: '0.5rem' }} />
            <span>Agreement Templates</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/partnerships/status" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
            <span>Status Overview</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
        </div>

        {/* Search and Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#64748b' 
              }} />
              <input
                type="text"
                placeholder="Search partnerships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: '1rem',
                  background: '#fff'
                }}
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: '1rem',
              background: '#fff',
              minWidth: 150
            }}
          >
            <option value="all">All Types</option>
            <option value="exclusive">Exclusive</option>
            <option value="strategic">Strategic</option>
            <option value="technology">Technology</option>
            <option value="financial">Financial</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: '1rem',
              background: '#fff',
              minWidth: 150
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
          
          <button style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            background: '#1a2238',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            New Partnership
          </button>
        </div>

        {/* Partnerships List */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
            gap: '1rem',
            padding: '1rem 1.5rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 600,
            color: '#374151'
          }}>
            <div>Partnership</div>
            <div>Type</div>
            <div>Status</div>
            <div>Value</div>
            <div>Duration</div>
            <div>Actions</div>
          </div>

          {/* Table Rows */}
          {filteredPartnerships.map((partnership) => (
            <div key={partnership.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '1rem',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1a2238', marginBottom: '0.25rem' }}>
                  {partnership.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {partnership.partnerCompany}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getTypeIcon(partnership.type)}
                <span style={{ 
                  marginLeft: '0.5rem', 
                  textTransform: 'capitalize',
                  color: getTypeColor(partnership.type),
                  fontWeight: 600
                }}>
                  {partnership.type}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getStatusIcon(partnership.status)}
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: `${getStatusColor(partnership.status)}20`,
                  color: getStatusColor(partnership.status)
                }}>
                  {partnership.status}
                </span>
              </div>
              
              <div style={{ fontWeight: 600, color: '#1a2238' }}>
                {formatCurrency(partnership.value)}
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {partnership.startDate.toLocaleDateString()} - {partnership.endDate?.toLocaleDateString() || 'Ongoing'}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  padding: '0.5rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#64748b'
                }}>
                  <Eye size={16} />
                </button>
                <button style={{
                  padding: '0.5rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#64748b'
                }}>
                  <Edit size={16} />
                </button>
                <button style={{
                  padding: '0.5rem',
                  background: '#fef2f2',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#dc2626'
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
              {partnerships.length}
            </div>
            <div style={{ color: '#64748b' }}>Total Partnerships</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>
              {partnerships.filter(p => p.status === 'active').length}
            </div>
            <div style={{ color: '#64748b' }}>Active</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d97706' }}>
              {partnerships.filter(p => p.status === 'pending').length}
            </div>
            <div style={{ color: '#64748b' }}>Pending</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
              {formatCurrency(partnerships.reduce((sum, p) => sum + p.value, 0))}
            </div>
            <div style={{ color: '#64748b' }}>Total Value</div>
          </div>
        </div>

      </div>
    </div>
  );
} 