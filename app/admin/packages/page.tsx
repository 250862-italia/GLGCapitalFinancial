"use client";
import { useState, useEffect } from 'react';
import { 
  Package, DollarSign, TrendingUp, Calendar, Edit, Trash2, Plus, Search, 
  Shield, Target, RefreshCw, Eye
} from 'lucide-react';
import { Package as PackageType } from '@/lib/data-manager';

interface PackageFormData {
  name: string;
  description: string;
  min_investment: number;
  max_investment: number;
  expected_return: number;
  duration_months: number;
  risk_level: 'low' | 'moderate' | 'high';
  status: 'active' | 'inactive' | 'draft';
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'database' | 'mock'>('database');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    min_investment: 0,
    max_investment: 0,
    expected_return: 0,
    duration_months: 12,
    risk_level: 'moderate',
    status: 'active'
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/packages', {
        headers: {
          'x-admin-token': adminToken
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPackages(data.data);
        setDataSource('database');
      } else {
        setError(data.error || 'Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to fetch packages');
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found');
        return;
      }

      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setPackages([data.data, ...packages]);
        setShowCreateModal(false);
        resetForm();
      } else {
        setError(data.error || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      setError('Failed to create package');
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found');
        return;
      }

      const response = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          id: editingPackage.id,
          ...formData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPackages(packages.map(pkg => 
          pkg.id === editingPackage.id ? data.data : pkg
        ));
        setShowEditModal(false);
        setEditingPackage(null);
        resetForm();
      } else {
        setError(data.error || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      setError('Failed to update package');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        setError('Admin token not found');
        return;
      }

      const response = await fetch('/api/admin/packages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ id: packageId })
      });

      const data = await response.json();
      
      if (data.success) {
        setPackages(packages.filter(pkg => pkg.id !== packageId));
      } else {
        setError(data.error || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      setError('Failed to delete package');
    }
  };

  const handleEditPackage = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      min_investment: pkg.min_investment,
      max_investment: pkg.max_investment,
      expected_return: pkg.expected_return,
      duration_months: pkg.duration_months,
      risk_level: pkg.risk_level,
      status: pkg.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      min_investment: 0,
      max_investment: 0,
      expected_return: 0,
      duration_months: 12,
      risk_level: 'moderate',
      status: 'active'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || pkg.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Pacchetti</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              dataSource === 'database' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {dataSource === 'database' ? '🟢 Database Reale' : '🟡 Dati Mock'}
            </span>
            {dataSource === 'mock' && (
              <span className="text-xs text-gray-500">
                (Database non disponibile - usando dati di test)
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuovo Pacchetto
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca pacchetti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
            <option value="draft">Bozza</option>
          </select>
          <button
            onClick={fetchPackages}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Aggiorna
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPackage(pkg)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Investimento Min:</span>
                  <span className="font-medium">€{pkg.min_investment.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Investimento Max:</span>
                  <span className="font-medium">€{pkg.max_investment.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rendimento Atteso:</span>
                  <span className="font-medium text-green-600">{pkg.expected_return}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Durata:</span>
                  <span className="font-medium">{pkg.duration_months} mesi</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                  {pkg.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(pkg.risk_level)}`}>
                  {pkg.risk_level}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nessun pacchetto trovato
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <PackageForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreatePackage}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          submitText="Crea Pacchetto"
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <PackageForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdatePackage}
          onCancel={() => {
            setShowEditModal(false);
            setEditingPackage(null);
            resetForm();
          }}
          submitText="Aggiorna Pacchetto"
        />
      )}
    </div>
  );
}

function PackageForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  submitText 
}: {
  formData: PackageFormData;
  setFormData: (data: PackageFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitText: string;
}) {
  const handleChange = (field: keyof PackageFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{submitText}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Pacchetto</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investimento Min (€)</label>
              <input
                type="number"
                value={formData.min_investment}
                onChange={(e) => handleChange('min_investment', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Investimento Max (€)</label>
              <input
                type="number"
                value={formData.max_investment}
                onChange={(e) => handleChange('max_investment', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rendimento Atteso (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.expected_return}
                onChange={(e) => handleChange('expected_return', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durata (mesi)</label>
              <input
                type="number"
                value={formData.duration_months}
                onChange={(e) => handleChange('duration_months', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livello di Rischio</label>
              <select
                value={formData.risk_level}
                onChange={(e) => handleChange('risk_level', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Basso</option>
                <option value="moderate">Moderato</option>
                <option value="high">Alto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Attivo</option>
                <option value="inactive">Inattivo</option>
                <option value="draft">Bozza</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
} 