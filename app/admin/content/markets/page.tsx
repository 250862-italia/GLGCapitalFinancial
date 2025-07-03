"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Euro, Plus, Edit, Eye, Trash2, Search, Filter, Download, Calendar, BarChart3, Globe, Activity } from 'lucide-react';

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  category: 'Forex' | 'Crypto' | 'Stocks' | 'Commodities';
  status: 'active' | 'inactive' | 'pending';
  lastUpdated: string;
  description: string;
}

const initialMarketData: MarketData[] = [
  {
    id: '1',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    currentPrice: 1.0856,
    change: 0.0023,
    changePercent: 0.21,
    volume: 1250000000,
    marketCap: 0,
    high24h: 1.0872,
    low24h: 1.0834,
    category: 'Forex',
    status: 'active',
    lastUpdated: '2024-01-15T10:30:00Z',
    description: 'Major currency pair representing Euro to US Dollar exchange rate'
  },
  {
    id: '2',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    currentPrice: 43250.75,
    change: -1250.25,
    changePercent: -2.81,
    volume: 28500000000,
    marketCap: 845000000000,
    high24h: 44500.00,
    low24h: 42800.00,
    category: 'Crypto',
    status: 'active',
    lastUpdated: '2024-01-15T10:30:00Z',
    description: 'Leading cryptocurrency by market capitalization'
  },
  {
    id: '3',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 185.92,
    change: 2.45,
    changePercent: 1.33,
    volume: 45000000,
    marketCap: 2900000000000,
    high24h: 186.50,
    low24h: 183.20,
    category: 'Stocks',
    status: 'active',
    lastUpdated: '2024-01-15T10:30:00Z',
    description: 'Technology company focused on consumer electronics and software'
  },
  {
    id: '4',
    symbol: 'XAU/USD',
    name: 'Gold',
    currentPrice: 2050.75,
    change: 15.25,
    changePercent: 0.75,
    volume: 0,
    marketCap: 0,
    high24h: 2055.00,
    low24h: 2035.50,
    category: 'Commodities',
    status: 'active',
    lastUpdated: '2024-01-15T10:30:00Z',
    description: 'Precious metal commodity trading against US Dollar'
  }
];

export default function AdminMarketsPage() {
  const [marketData, setMarketData] = useState<MarketData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('marketData');
      return saved ? JSON.parse(saved) : initialMarketData;
    }
    return initialMarketData;
  });

  const [filteredData, setFilteredData] = useState<MarketData[]>(marketData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<MarketData | null>(null);
  const [formData, setFormData] = useState<Partial<MarketData>>({});

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketData', JSON.stringify(marketData));
    }
  }, [marketData]);

  // Filter data
  useEffect(() => {
    let filtered = marketData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredData(filtered);
  }, [marketData, searchTerm, selectedCategory, selectedStatus]);

  // Stats
  const totalItems = marketData.length;
  const activeItems = marketData.filter(item => item.status === 'active').length;
  const totalVolume = marketData.reduce((sum, item) => sum + item.volume, 0);
  const avgChangePercent = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;

  const handleAdd = () => {
    setModalType('add');
    setSelectedItem(null);
    setFormData({
      symbol: '',
      name: '',
      currentPrice: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: 0,
      high24h: 0,
      low24h: 0,
      category: 'Forex',
      status: 'active',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item: MarketData) => {
    setModalType('edit');
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleView = (item: MarketData) => {
    setModalType('view');
    setSelectedItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this market data?')) {
      setMarketData(marketData.filter(item => item.id !== id));
    }
  };

  const handleSubmit = () => {
    if (modalType === 'add') {
      const newItem: MarketData = {
        ...formData as MarketData,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString()
      };
      setMarketData([...marketData, newItem]);
    } else if (modalType === 'edit' && selectedItem) {
      setMarketData(marketData.map(item =>
        item.id === selectedItem.id
          ? { ...formData as MarketData, id: item.id, lastUpdated: new Date().toISOString() }
          : item
      ));
    }
    setShowModal(false);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? '#10b981' : '#ef4444';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Market Data Management</h1>
          <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8 }}>Manage real-time market data and financial instruments</p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            background: 'var(--accent)',
            color: 'var(--primary)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 8px rgba(34,40,49,0.07)'
          }}
        >
          <Plus size={20} />
          Add Market Data
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Globe size={24} color="#3b82f6" />
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Total Instruments</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{totalItems}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Activity size={24} color="#10b981" />
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Active</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{activeItems}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <BarChart3 size={24} color="#f59e0b" />
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Total Volume</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>${formatNumber(totalVolume)}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <TrendingUp size={24} color="#10b981" />
            <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Avg Change</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: getChangeColor(avgChangePercent) }}>
            {avgChangePercent >= 0 ? '+' : ''}{avgChangePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
          <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 16,
              background: '#fff'
            }}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 16,
            background: '#fff',
            minWidth: 150
          }}
        >
          <option value="All">All Categories</option>
          <option value="Forex">Forex</option>
          <option value="Crypto">Crypto</option>
          <option value="Stocks">Stocks</option>
          <option value="Commodities">Commodities</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 16,
            background: '#fff',
            minWidth: 150
          }}
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Symbol</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Price</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Change</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Volume</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#1f2937' }}>{item.symbol}</td>
                <td style={{ padding: '1rem', color: '#374151' }}>{item.name}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1f2937' }}>
                  ${item.currentPrice != null ? item.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '-'}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    {getChangeIcon(item.change)}
                    <span style={{ color: getChangeColor(item.change), fontWeight: 600 }}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(4)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#374151' }}>
                  {item.volume > 0 ? `$${formatNumber(item.volume)}` : 'N/A'}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    background: item.category === 'Forex' ? '#dbeafe' : 
                               item.category === 'Crypto' ? '#fef3c7' :
                               item.category === 'Stocks' ? '#dcfce7' : '#f3e8ff',
                    color: item.category === 'Forex' ? '#1e40af' :
                           item.category === 'Crypto' ? '#d97706' :
                           item.category === 'Stocks' ? '#166534' : '#7c3aed'
                  }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    background: item.status === 'active' ? '#dcfce7' : 
                               item.status === 'inactive' ? '#fef2f2' : '#fef3c7',
                    color: item.status === 'active' ? '#166534' : 
                           item.status === 'inactive' ? '#dc2626' : '#d97706'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      onClick={() => handleView(item)}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem',
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
              {modalType === 'add' ? 'Add Market Data' : modalType === 'edit' ? 'Edit Market Data' : 'View Market Data'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Symbol</label>
                <input
                  type="text"
                  value={formData.symbol || ''}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Current Price</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.currentPrice || ''}
                  onChange={(e) => setFormData({...formData, currentPrice: parseFloat(e.target.value)})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Change</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.change || ''}
                  onChange={(e) => setFormData({...formData, change: parseFloat(e.target.value)})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Change %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.changePercent || ''}
                  onChange={(e) => setFormData({...formData, changePercent: parseFloat(e.target.value)})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Volume</label>
                <input
                  type="number"
                  value={formData.volume || ''}
                  onChange={(e) => setFormData({...formData, volume: parseFloat(e.target.value)})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Category</label>
                <select
                  value={formData.category || 'Forex'}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                >
                  <option value="Forex">Forex</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Commodities">Commodities</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  disabled={modalType === 'view'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 16,
                    background: modalType === 'view' ? '#f9fafb' : '#fff'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                disabled={modalType === 'view'}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 16,
                  background: modalType === 'view' ? '#f9fafb' : '#fff',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: '#fff',
                  color: '#374151',
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              {modalType !== 'view' && (
                <button
                  onClick={handleSubmit}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: 8,
                    background: 'var(--accent)',
                    color: 'var(--primary)',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {modalType === 'add' ? 'Add Market Data' : 'Update Market Data'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 