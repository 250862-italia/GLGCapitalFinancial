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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
            <p className="text-gray-600 mt-2">Manage your investment packages and offerings</p>
          </div>
          <button
            onClick={openAddForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Package
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            successMessage.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {successMessage.includes('Error') ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(pkg)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit package"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete package"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Investment Range:</span>
                  <span className="text-sm font-medium">
                    ${pkg.minInvestment.toLocaleString()} - ${pkg.maxInvestment.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Expected Return:</span>
                  <span className="text-sm font-medium text-green-600">
                    {pkg.expectedReturn}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm font-medium">
                    {pkg.duration} months
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Risk Level:</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(pkg.riskLevel)}`}>
                    {pkg.riskLevel}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(pkg.status)}`}>
                    {pkg.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Created: {pkg.createdAt}</span>
                  <span>ID: {pkg.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
            <p className="text-gray-600 mb-6">Create your first investment package to get started</p>
            <button
              onClick={openAddForm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus size={20} />
              Add Your First Package
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Package' : 'Add New Package'}
              </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
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

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      {isEdit ? 'Update Package' : 'Create Package'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 