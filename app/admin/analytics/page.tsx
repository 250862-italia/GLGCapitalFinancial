"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Download, Eye } from 'lucide-react';

interface AnalyticsData {
  id: string;
  metric: string;
  value: number;
  change: number;
  period: string;
  category: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState<AnalyticsData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnalyticsData | null>(null);
  const [formData, setFormData] = useState({
    metric: '',
    value: 0,
    change: 0,
    period: '',
    category: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    filterAnalytics();
  }, [analytics, searchTerm, selectedCategory]);

  const loadAnalytics = () => {
    // Mock data - in real app this would come from API
    const mockData: AnalyticsData[] = [
      {
        id: '1',
        metric: 'Total Revenue',
        value: 1250000,
        change: 12.5,
        period: 'Q1 2024',
        category: 'Financial',
        status: 'active',
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        metric: 'Active Users',
        value: 15420,
        change: -2.3,
        period: 'Q1 2024',
        category: 'User',
        status: 'active',
        lastUpdated: '2024-01-14'
      },
      {
        id: '3',
        metric: 'Conversion Rate',
        value: 3.2,
        change: 0.8,
        period: 'Q1 2024',
        category: 'Performance',
        status: 'active',
        lastUpdated: '2024-01-13'
      },
      {
        id: '4',
        metric: 'Customer Satisfaction',
        value: 4.7,
        change: 0.2,
        period: 'Q1 2024',
        category: 'Quality',
        status: 'inactive',
        lastUpdated: '2024-01-12'
      }
    ];
    setAnalytics(mockData);
  };

  const filterAnalytics = () => {
    let filtered = analytics;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredAnalytics(filtered);
  };

  const handleAdd = () => {
    setFormData({
      metric: '',
      value: 0,
      change: 0,
      period: '',
      category: '',
      status: 'active'
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: AnalyticsData) => {
    setSelectedItem(item);
    setFormData({
      metric: item.metric,
      value: item.value,
      change: item.change,
      period: item.period,
      category: item.category,
      status: item.status
    });
    setShowEditModal(true);
  };

  const handleDelete = (item: AnalyticsData) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: AnalyticsData) => {
    setSelectedItem(item);
    // In a real app, this would navigate to a detailed view
    alert(`Viewing details for: ${item.metric}`);
  };

  const saveAnalytics = () => {
    if (showEditModal && selectedItem) {
      // Update existing item
      const updated = analytics.map(item =>
        item.id === selectedItem.id
          ? { ...item, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
          : item
      );
      setAnalytics(updated);
    } else {
      // Add new item
      const newItem: AnalyticsData = {
        id: Date.now().toString(),
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setAnalytics([newItem, ...analytics]);
    }
    
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setAnalytics(analytics.filter(item => item.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'Metric', 'Value', 'Change', 'Period', 'Category', 'Status', 'Last Updated'],
      ...filteredAnalytics.map(item => [
        item.id,
        item.metric,
        item.value.toString(),
        item.change.toString(),
        item.period,
        item.category,
        item.status,
        item.lastUpdated
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const categories = ['Financial', 'User', 'Performance', 'Quality'];

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
          Analytics Dashboard
        </h1>
        <button
          onClick={handleAdd}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <Plus size={16} />
          Add Analytics
        </button>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search analytics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minWidth: 150
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <button
          onClick={exportData}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Analytics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredAnalytics.map(item => (
          <div key={item.id} style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
                  {item.metric}
                </h3>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>
                  {typeof item.value === 'number' && item.value > 1000 
                    ? `$${(item.value / 1000).toFixed(1)}K`
                    : item.value}
                </p>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: item.status === 'active' ? '#dcfce7' : '#fef3c7',
                color: item.status === 'active' ? '#166534' : '#92400e'
              }}>
                {item.status}
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <span style={{
                color: item.change >= 0 ? '#10b981' : '#ef4444',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>
                {item.change >= 0 ? '+' : ''}{item.change}%
              </span>
              <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                vs {item.period}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                padding: '0.25rem 0.75rem', 
                background: '#f3f4f6', 
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#374151'
              }}>
                {item.category}
              </span>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleView(item)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
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
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: 500
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {showAddModal ? 'Add Analytics' : 'Edit Analytics'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Metric name"
                value={formData.metric}
                onChange={(e) => setFormData({...formData, metric: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="number"
                placeholder="Value"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="number"
                placeholder="Change %"
                value={formData.change}
                onChange={(e) => setFormData({...formData, change: parseFloat(e.target.value) || 0})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="text"
                placeholder="Period (e.g., Q1 2024)"
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={saveAnalytics}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {showAddModal ? 'Add' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
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
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: 400
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Confirm Delete
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
              Are you sure you want to delete "{selectedItem.metric}"? This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={confirmDelete}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 