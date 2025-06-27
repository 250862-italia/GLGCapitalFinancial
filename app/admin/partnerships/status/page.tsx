"use client";
import { useState } from 'react';
import { Handshake, DollarSign, Calendar, Eye, Edit, Plus, Trash2, Search, TrendingUp, Users, FileText } from 'lucide-react';

interface Partnership {
  id: string;
  name: string;
  partnerType: 'Strategic' | 'Financial' | 'Technology' | 'Marketing';
  status: 'Active' | 'Pending' | 'Expired' | 'Terminated';
  startDate: string;
  endDate: string;
  value: number;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  agreementFile: string;
  notes: string;
}

export default function PartnershipsManagementPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([
    {
      id: '1',
      name: 'Magnificus Dominus Consulting',
      partnerType: 'Strategic',
      status: 'Active',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      value: 500000,
      description: 'Strategic partnership for Pentawash™ technology integration.',
      contactPerson: 'Dr. Alessandro Magnificus',
      contactEmail: 'alessandro@magnificusdomin.com',
      contactPhone: '+1 (555) 123-4567',
      agreementFile: 'partnership_agreement_001.pdf',
      notes: 'Pentawash™ technology partnership with exclusive distribution rights.'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null);
  const [viewingPartnership, setViewingPartnership] = useState<Partnership | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    partnerType: 'Strategic' as 'Strategic' | 'Financial' | 'Technology' | 'Marketing',
    status: 'Active' as 'Active' | 'Pending' | 'Expired' | 'Terminated',
    startDate: '',
    endDate: '',
    value: '',
    description: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    agreementFile: '',
    notes: ''
  });

  const filteredPartnerships = partnerships.filter(partnership => {
    const matchesSearch = partnership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partnership.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || partnership.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleAddPartnership = () => {
    const newPartnership: Partnership = {
      id: Date.now().toString(),
      name: formData.name,
      partnerType: formData.partnerType,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      value: parseFloat(formData.value),
      description: formData.description,
      contactPerson: formData.contactPerson,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      agreementFile: formData.agreementFile,
      notes: formData.notes
    };

    setPartnerships([...partnerships, newPartnership]);
    setShowAddForm(false);
    resetForm();
  };

  const handleEditPartnership = () => {
    if (!editingPartnership) return;

    const updatedPartnerships = partnerships.map(partnership =>
      partnership.id === editingPartnership.id
        ? {
            ...partnership,
            name: formData.name,
            partnerType: formData.partnerType,
            status: formData.status,
            startDate: formData.startDate,
            endDate: formData.endDate,
            value: parseFloat(formData.value),
            description: formData.description,
            contactPerson: formData.contactPerson,
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone,
            agreementFile: formData.agreementFile,
            notes: formData.notes
          }
        : partnership
    );

    setPartnerships(updatedPartnerships);
    setEditingPartnership(null);
    resetForm();
  };

  const handleDeletePartnership = (id: string) => {
    if (confirm('Are you sure you want to delete this partnership?')) {
      setPartnerships(partnerships.filter(partnership => partnership.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      partnerType: 'Strategic',
      status: 'Active',
      startDate: '',
      endDate: '',
      value: '',
      description: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      agreementFile: '',
      notes: ''
    });
  };

  const openEditForm = (partnership: Partnership) => {
    setEditingPartnership(partnership);
    setFormData({
      name: partnership.name,
      partnerType: partnership.partnerType,
      status: partnership.status,
      startDate: partnership.startDate,
      endDate: partnership.endDate,
      value: partnership.value.toString(),
      description: partnership.description,
      contactPerson: partnership.contactPerson,
      contactEmail: partnership.contactEmail,
      contactPhone: partnership.contactPhone,
      agreementFile: partnership.agreementFile,
      notes: partnership.notes
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Expired': return 'text-red-600 bg-red-100';
      case 'Terminated': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPartnerTypeColor = (type: string) => {
    switch (type) {
      case 'Strategic': return 'text-blue-600 bg-blue-100';
      case 'Financial': return 'text-green-600 bg-green-100';
      case 'Technology': return 'text-purple-600 bg-purple-100';
      case 'Marketing': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partnership Management</h1>
          <p className="text-gray-600">Manage strategic partnerships and collaborations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Partnership
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Partnerships</p>
              <p className="text-2xl font-bold text-gray-900">{partnerships.length}</p>
            </div>
            <Handshake className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Partnerships</p>
              <p className="text-2xl font-bold text-green-600">
                {partnerships.filter(p => p.status === 'Active').length}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                ${partnerships.reduce((sum, p) => sum + p.value, 0).toLocaleString('en-US')}
              </p>
            </div>
            <DollarSign className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {partnerships.filter(p => p.status === 'Pending').length}
              </p>
            </div>
            <FileText className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search partnerships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Partnerships List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partnership</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartnerships.map((partnership) => (
                <tr key={partnership.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{partnership.name}</div>
                      <div className="text-sm text-gray-500">{partnership.description.substring(0, 50)}...</div>
                      <div className="text-sm text-gray-500">Contact: {partnership.contactPerson}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPartnerTypeColor(partnership.partnerType)}`}>
                      {partnership.partnerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${partnership.value.toLocaleString('en-US')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {partnership.startDate} - {partnership.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partnership.status)}`}>
                      {partnership.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingPartnership(partnership)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditForm(partnership)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePartnership(partnership.id)}
                        className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingPartnership) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPartnership ? 'Edit Partnership' : 'Add New Partnership'}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type</label>
                  <select
                    value={formData.partnerType}
                    onChange={(e) => setFormData({...formData, partnerType: e.target.value as 'Strategic' | 'Financial' | 'Technology' | 'Marketing'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Strategic">Strategic</option>
                    <option value="Financial">Financial</option>
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Pending' | 'Expired' | 'Terminated'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Value ($)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agreement File</label>
                <input
                  type="text"
                  value={formData.agreementFile}
                  onChange={(e) => setFormData({...formData, agreementFile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="agreement_file.pdf"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={editingPartnership ? handleEditPartnership : handleAddPartnership}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPartnership ? 'Update Partnership' : 'Add Partnership'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPartnership(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Partnership Modal */}
      {viewingPartnership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Partnership Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Partner Name</label>
                <p className="text-sm text-gray-900">{viewingPartnership.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPartnerTypeColor(viewingPartnership.partnerType)}`}>
                    {viewingPartnership.partnerType}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingPartnership.status)}`}>
                    {viewingPartnership.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{viewingPartnership.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <p className="text-sm text-gray-900">${viewingPartnership.value.toLocaleString('en-US')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-sm text-gray-900">{viewingPartnership.startDate} - {viewingPartnership.endDate}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <p className="text-sm text-gray-900">{viewingPartnership.contactPerson}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <p className="text-sm text-gray-900">{viewingPartnership.contactEmail}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <p className="text-sm text-gray-900">{viewingPartnership.contactPhone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Agreement File</label>
                <p className="text-sm text-gray-900">{viewingPartnership.agreementFile}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-sm text-gray-900">{viewingPartnership.notes}</p>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setViewingPartnership(null)}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 