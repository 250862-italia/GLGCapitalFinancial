"use client";
import { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, Calendar, Eye, Edit, Plus, Trash2, Search, Filter, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { usePackages } from '../../../lib/package-context';
import { emailNotificationService } from '../../../lib/email-service';

interface Package {
  id: string;
  name: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  expectedReturn: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  status: 'Active' | 'Fundraising' | 'Closed';
  createdAt: string;
}

const initialPackages: Package[] = [
  {
    id: '1',
    name: 'Conservative Growth',
    description: 'Balanced portfolio focused on capital preservation with moderate growth potential',
    minInvestment: 10000,
    maxInvestment: 100000,
    expectedReturn: 8.5,
    duration: 12,
    riskLevel: 'low',
    category: 'Conservative',
    status: 'Active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Aggressive Growth',
    description: 'High-growth portfolio focused on emerging markets and innovative technologies',
    minInvestment: 25000,
    maxInvestment: 500000,
    expectedReturn: 18.2,
    duration: 24,
    riskLevel: 'high',
    category: 'Growth',
    status: 'Active',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'ESG Sustainable',
    description: 'Sustainable investments with ESG criteria and positive environmental impact',
    minInvestment: 15000,
    maxInvestment: 200000,
    expectedReturn: 12.8,
    duration: 18,
    riskLevel: 'medium',
    category: 'ESG',
    status: 'Active',
    createdAt: '2024-02-01'
  }
];

export default function PackagesManagementPage() {
  const { packages, loading, error, createPackage, updatePackage, deletePackage } = usePackages();
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<Partial<Package>>({
    id: undefined,
    name: '',
    description: '',
    minInvestment: 0,
    maxInvestment: 0,
    expectedReturn: 0,
    duration: 0,
    riskLevel: 'low',
    category: '',
    status: 'Active',
    createdAt: ''
  });

  // Debug: monitor packages changes
  useEffect(() => {
    console.log('Packages updated:', packages);
  }, [packages]);

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: '',
      description: '',
      minInvestment: 0,
      maxInvestment: 0,
      expectedReturn: 0,
      duration: 0,
      riskLevel: 'low',
      category: '',
      status: 'Active',
      createdAt: ''
    });
    setIsEdit(false);
    setSuccessMessage('');
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (pkg: Package) => {
    console.log('Opening edit form for package:', pkg);
    setFormData(pkg);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackage(id);
        setSuccessMessage('Package deleted successfully!');
        
        // Send surveillance notification for package deletion
        const packageToDelete = packages.find(p => p.id === id);
        if (packageToDelete) {
          emailNotificationService.notifyAdminAction(
            { id: 'admin', name: 'Admin User' },
            'Package Deleted',
            { package: packageToDelete, action: 'delete' }
          );
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting package:', err);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue: any = value;
    if (name === 'minInvestment' || name === 'maxInvestment' || name === 'expectedReturn' || name === 'duration') {
      newValue = Number(value);
    }
    if (name === 'riskLevel') {
      newValue = value.toLowerCase();
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      console.log('Form submitted:', { isEdit, formData });
      
      if (isEdit && formData.id) {
        await updatePackage(formData.id, {
          ...formData,
          expectedReturn: formData.expectedReturn ?? 0,
          isActive: true,
          features: [],
          terms: ''
        });
        setSuccessMessage('Package updated successfully!');
        
        // Send surveillance notification for package edit
        emailNotificationService.notifyAdminAction(
          { id: 'admin', name: 'Admin User' },
          'Package Edited',
          { package: formData, action: 'edit' }
        );
      } else {
        await createPackage({
          ...formData,
          expectedReturn: formData.expectedReturn ?? 0,
          isActive: true,
          features: [],
          terms: ''
        } as any);
        setSuccessMessage('Package created successfully!');
        
        // Send surveillance notification for package creation
        emailNotificationService.notifyAdminAction(
          { id: 'admin', name: 'Admin User' },
          'Package Created',
          { package: formData, action: 'create' }
        );
      }
      
      setShowForm(false);
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving package:', err);
      setSuccessMessage('Error saving package. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2.5rem 2rem', maxWidth: 1200, margin: '2rem auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, margin: 0 }}>Investment Packages</h1>
        <button
          style={{
            background: 'var(--accent)',
            color: 'var(--primary)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 8px rgba(34,40,49,0.07)'
          }}
          onClick={openAddForm}
        >
          <Plus size={20} />
          Add New Package
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#16a34a',
          fontWeight: 600,
          textAlign: 'center',
          fontSize: 16
        }}>
          {successMessage}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontWeight: 700, color: '#374151' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Min</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Max</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Return</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Duration</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Risk</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff', transition: 'background 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseOut={e => (e.currentTarget.style.background = '#fff')}
              >
                <td style={{ padding: '1rem', fontWeight: 600 }}>{pkg.name}</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{pkg.description}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{pkg.minInvestment.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{pkg.maxInvestment.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>{pkg.expectedReturn}%</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{pkg.duration} mo</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{
                    background: pkg.riskLevel === 'high' ? '#fee2e2' : pkg.riskLevel === 'medium' ? '#fef9c3' : '#dcfce7',
                    color: pkg.riskLevel === 'high' ? '#dc2626' : pkg.riskLevel === 'medium' ? '#b45309' : '#166534',
                    borderRadius: 6,
                    padding: '0.25rem 0.75rem',
                    fontWeight: 600,
                    fontSize: 14
                  }}>{pkg.riskLevel.charAt(0).toUpperCase() + pkg.riskLevel.slice(1)}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{
                    background: pkg.status === 'Active' ? '#dcfce7' : pkg.status === 'Fundraising' ? '#fef9c3' : '#fee2e2',
                    color: pkg.status === 'Active' ? '#166534' : pkg.status === 'Fundraising' ? '#b45309' : '#dc2626',
                    borderRadius: 6,
                    padding: '0.25rem 0.75rem',
                    fontWeight: 600,
                    fontSize: 14
                  }}>{pkg.status}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => openEditForm(pkg)}><Edit size={16} /></button>
                  <button style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => handleDelete(pkg.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
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
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(10,37,64,0.18)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, margin: 0 }}>
                {isEdit ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter package name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Conservative, Growth, ESG"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Investment *
                  </label>
                  <input
                    type="number"
                    name="minInvestment"
                    value={formData.minInvestment || ''}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Investment *
                  </label>
                  <input
                    type="number"
                    name="maxInvestment"
                    value={formData.maxInvestment || ''}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Return (%) *
                  </label>
                  <input
                    type="number"
                    name="expectedReturn"
                    value={formData.expectedReturn || ''}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (months) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || ''}
                    onChange={handleFormChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level *
                  </label>
                  <select
                    name="riskLevel"
                    value={formData.riskLevel || 'low'}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status || 'Active'}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Fundraising">Fundraising</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the investment package..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isEdit ? 'Update Package' : 'Create Package'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 