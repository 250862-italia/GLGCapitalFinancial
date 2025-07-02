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
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface Partnership {
  id: string;
  name: string;
  type: 'strategic' | 'financial' | 'technology' | 'distribution' | 'research';
  status: 'active' | 'pending' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  value: number;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  industry: string;
  benefits: string[];
  lastUpdated: string;
}

export default function AdminPartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partnership | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'strategic' as 'strategic' | 'financial' | 'technology' | 'distribution' | 'research',
    status: 'pending' as 'active' | 'pending' | 'expired' | 'terminated',
    startDate: '',
    endDate: '',
    value: 0,
    description: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    country: '',
    industry: '',
    benefits: [] as string[]
  });

  useEffect(() => {
    loadPartnerships();
  }, []);

  useEffect(() => {
    filterPartnerships();
  }, [partnerships, searchTerm, selectedType, selectedStatus]);

  const loadPartnerships = () => {
    // Mock data - in real app this would come from API
    const mockData: Partnership[] = [
      {
        id: '1',
        name: 'European Investment Bank',
        type: 'financial',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2027-01-15',
        value: 5000000,
        description: 'Strategic financial partnership for European market expansion and investment opportunities.',
        contactPerson: 'Marco Rossi',
        contactEmail: 'marco.rossi@eib.eu',
        contactPhone: '+39 02 1234567',
        country: 'Italy',
        industry: 'Financial Services',
        benefits: ['Market Access', 'Capital Investment', 'Regulatory Support'],
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        name: 'Tech Innovation Hub',
        type: 'technology',
        status: 'active',
        startDate: '2023-11-20',
        endDate: '2026-11-20',
        value: 2500000,
        description: 'Technology partnership for digital transformation and fintech solutions development.',
        contactPerson: 'Sarah Chen',
        contactEmail: 'sarah.chen@techhub.com',
        contactPhone: '+1 415 9876543',
        country: 'United States',
        industry: 'Technology',
        benefits: ['Technology Transfer', 'R&D Collaboration', 'Innovation Support'],
        lastUpdated: '2023-11-20'
      },
      {
        id: '3',
        name: 'Global Distribution Network',
        type: 'distribution',
        status: 'pending',
        startDate: '',
        endDate: '',
        value: 1500000,
        description: 'Distribution partnership for expanding market reach across multiple regions.',
        contactPerson: 'Carlos Rodriguez',
        contactEmail: 'carlos.rodriguez@globaldist.com',
        contactPhone: '+34 91 4567890',
        country: 'Spain',
        industry: 'Distribution',
        benefits: ['Market Expansion', 'Logistics Support', 'Local Expertise'],
        lastUpdated: '2024-01-10'
      },
      {
        id: '4',
        name: 'Research Institute Partnership',
        type: 'research',
        status: 'expired',
        startDate: '2022-06-01',
        endDate: '2023-12-31',
        value: 800000,
        description: 'Research collaboration for market analysis and investment strategy development.',
        contactPerson: 'Dr. Anna Schmidt',
        contactEmail: 'anna.schmidt@research.org',
        contactPhone: '+49 30 1234567',
        country: 'Germany',
        industry: 'Research',
        benefits: ['Market Research', 'Data Analytics', 'Expert Consultation'],
        lastUpdated: '2023-12-31'
      }
    ];
    setPartnerships(mockData);
  };

  const filterPartnerships = () => {
    let filtered = partnerships;

    if (searchTerm) {
      filtered = filtered.filter(partnership =>
        partnership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partnership.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partnership.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partnership.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(partnership => partnership.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(partnership => partnership.status === selectedStatus);
    }

    setFilteredPartnerships(filtered);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      type: 'strategic',
      status: 'pending',
      startDate: '',
      endDate: '',
      value: 0,
      description: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      country: '',
      industry: '',
      benefits: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (partnership: Partnership) => {
    setSelectedItem(partnership);
    setFormData({
      name: partnership.name,
      type: partnership.type,
      status: partnership.status,
      startDate: partnership.startDate,
      endDate: partnership.endDate,
      value: partnership.value,
      description: partnership.description,
      contactPerson: partnership.contactPerson,
      contactEmail: partnership.contactEmail,
      contactPhone: partnership.contactPhone,
      country: partnership.country,
      industry: partnership.industry,
      benefits: partnership.benefits
    });
    setShowEditModal(true);
  };

  const handleDelete = (partnership: Partnership) => {
    setSelectedItem(partnership);
    setShowDeleteModal(true);
  };

  const handleView = (partnership: Partnership) => {
    setSelectedItem(partnership);
    setShowViewModal(true);
  };

  const savePartnership = () => {
    if (showEditModal && selectedItem) {
      // Update existing partnership
      const updated = partnerships.map(partnership =>
        partnership.id === selectedItem.id
          ? { 
              ...partnership, 
              ...formData, 
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : partnership
      );
      setPartnerships(updated);
    } else {
      // Add new partnership
      const newPartnership: Partnership = {
        id: Date.now().toString(),
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setPartnerships([newPartnership, ...partnerships]);
    }
    
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setPartnerships(partnerships.filter(partnership => partnership.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strategic': return { bg: '#dc2626', color: 'white' };
      case 'financial': return { bg: '#059669', color: 'white' };
      case 'technology': return { bg: '#3b82f6', color: 'white' };
      case 'distribution': return { bg: '#d97706', color: 'white' };
      case 'research': return { bg: '#7c3aed', color: 'white' };
      default: return { bg: '#6b7280', color: 'white' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', color: '#166534' };
      case 'pending': return { bg: '#fef3c7', color: '#92400e' };
      case 'expired': return { bg: '#fef2f2', color: '#dc2626' };
      case 'terminated': return { bg: '#f3f4f6', color: '#374151' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const types = ['strategic', 'financial', 'technology', 'distribution', 'research'];
  const statusOptions = ['active', 'pending', 'expired', 'terminated'];
  const benefitOptions = [
    'Market Access',
    'Capital Investment', 
    'Technology Transfer',
    'R&D Collaboration',
    'Market Expansion',
    'Logistics Support',
    'Regulatory Support',
    'Expert Consultation',
    'Data Analytics',
    'Innovation Support'
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
          Partnership Management
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
          Add Partnership
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
            placeholder="Search partnerships..."
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
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minWidth: 120
          }}
        >
          <option value="all">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minWidth: 120
          }}
        >
          <option value="all">All Status</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Partnerships Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredPartnerships.map(partnership => (
          <div key={partnership.id} style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Handshake size={20} color="#6b7280" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
                    {partnership.name}
                  </h3>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Globe size={14} style={{ marginRight: '0.25rem' }} />
                  {partnership.country} • {partnership.industry}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <DollarSign size={14} style={{ marginRight: '0.25rem' }} />
                  ${partnership.value != null ? partnership.value.toLocaleString() : '-'}
                </p>
                <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {partnership.description.substring(0, 100)}...
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  ...getTypeColor(partnership.type)
                }}>
                  {partnership.type}
                </div>
                
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  ...getStatusColor(partnership.status)
                }}>
                  {partnership.status}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                <Calendar size={12} style={{ marginRight: '0.25rem' }} />
                {partnership.startDate && partnership.endDate 
                  ? `${partnership.startDate} - ${partnership.endDate}`
                  : 'Dates TBD'
                }
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleView(partnership)}
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
                onClick={() => handleEdit(partnership)}
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
                onClick={() => handleDelete(partnership)}
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
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {showAddModal ? 'Add Partnership' : 'Edit Partnership'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Partnership name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
              
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="date"
                  placeholder="Start date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
                
                <input
                  type="date"
                  placeholder="End date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              
              <input
                type="number"
                placeholder="Partnership value ($)"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <textarea
                placeholder="Partnership description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
              
              <input
                type="text"
                placeholder="Contact person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="email"
                placeholder="Contact email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="tel"
                placeholder="Contact phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="text"
                placeholder="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Benefits:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {benefitOptions.map(benefit => (
                    <label key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.benefits.includes(benefit)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              benefits: [...formData.benefits, benefit]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              benefits: formData.benefits.filter(b => b !== benefit)
                            });
                          }
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>
                        {benefit}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={savePartnership}
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

      {/* View Modal */}
      {showViewModal && selectedItem && (
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
            maxWidth: 700,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                {selectedItem.name}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedItem(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <strong>Type:</strong>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginLeft: '0.5rem',
                    ...getTypeColor(selectedItem.type)
                  }}>
                    {selectedItem.type}
                  </span>
                </div>
                <div>
                  <strong>Status:</strong>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    marginLeft: '0.5rem',
                    ...getStatusColor(selectedItem.status)
                  }}>
                    {selectedItem.status}
                  </span>
                </div>
              </div>
              
              <div>
                <strong>Value:</strong> ${selectedItem.value != null ? selectedItem.value.toLocaleString() : '-'}
              </div>
              
              <div>
                <strong>Country:</strong> {selectedItem.country}
              </div>
              
              <div>
                <strong>Industry:</strong> {selectedItem.industry}
              </div>
              
              <div>
                <strong>Contact Person:</strong> {selectedItem.contactPerson}
              </div>
              
              <div>
                <strong>Contact Email:</strong> {selectedItem.contactEmail}
              </div>
              
              <div>
                <strong>Contact Phone:</strong> {selectedItem.contactPhone}
              </div>
              
              <div>
                <strong>Duration:</strong> {selectedItem.startDate && selectedItem.endDate 
                  ? `${selectedItem.startDate} - ${selectedItem.endDate}`
                  : 'Dates TBD'
                }
              </div>
              
              <div>
                <strong>Description:</strong>
                <p style={{ marginTop: '0.5rem', lineHeight: 1.6, color: '#374151' }}>
                  {selectedItem.description}
                </p>
              </div>
              
              <div>
                <strong>Benefits:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedItem.benefits.map(benefit => (
                    <span key={benefit} style={{
                      padding: '0.25rem 0.5rem',
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#374151'
                    }}>
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <strong>Last Updated:</strong> {selectedItem.lastUpdated}
              </div>
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
              Are you sure you want to delete the partnership with "{selectedItem.name}"? This action cannot be undone.
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