"use client";
import { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, Calendar, Eye, Edit, Plus, Trash2, Search, Filter, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePackages } from '../../../lib/package-context';
import { emailNotificationService } from '../../../lib/email-service';

interface Package {
  id: string;
  name: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  expectedROI: number;
  duration: number;
  riskLevel: 'Low' | 'Medium' | 'High';
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
    expectedROI: 8.5,
    duration: 12,
    riskLevel: 'Low',
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
    expectedROI: 18.2,
    duration: 24,
    riskLevel: 'High',
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
    expectedROI: 12.8,
    duration: 18,
    riskLevel: 'Medium',
    category: 'ESG',
    status: 'Active',
    createdAt: '2024-02-01'
  }
];

export default function PackagesManagementPage() {
  const { packages, setPackages } = usePackages();
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<Package>>({
    id: undefined,
    name: '',
    description: '',
    minInvestment: 0,
    maxInvestment: 0,
    expectedROI: 0,
    duration: 0,
    riskLevel: 'Low',
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
      expectedROI: 0,
      duration: 0,
      riskLevel: 'Low',
      category: '',
      status: 'Active',
      createdAt: ''
    });
    setIsEdit(false);
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

  const handleDelete = (id: string) => {
    const packageToDelete = packages.find(p => p.id === id);
    setPackages(packages.filter(p => p.id !== id));
    
    // Send surveillance notification for package deletion
    if (packageToDelete) {
      emailNotificationService.notifyAdminAction(
        { id: 'admin', name: 'Admin User' },
        'Package Deleted',
        { package: packageToDelete, action: 'delete' }
      );
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = name === 'minInvestment' || name === 'maxInvestment' || name === 'expectedROI' || name === 'duration' ? Number(value) : value;
    console.log('Form field changed:', { name, value, newValue });
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { isEdit, formData });
    
    if (isEdit && formData.id) {
      const updatedPackages = packages.map(p => 
        p.id === formData.id ? { ...p, ...formData } : p
      );
      console.log('Updating packages:', updatedPackages);
      setPackages(updatedPackages);
      
      // Send surveillance notification for package edit
      emailNotificationService.notifyAdminAction(
        { id: 'admin', name: 'Admin User' },
        'Package Edited',
        { package: formData, action: 'edit' }
      );
    } else {
      const newPackage: Package = {
        ...formData as Package,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().slice(0, 10)
      };
      console.log('Adding new package:', newPackage);
      setPackages([...packages, newPackage]);
      
      // Send surveillance notification for package creation
      emailNotificationService.notifyAdminAction(
        { id: 'admin', name: 'Admin User' },
        'Package Created',
        { package: newPackage, action: 'create' }
      );
    }
    setShowForm(false);
    resetForm();
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

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Package Management</h1>
          <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8 }}>Manage investment packages and positions</p>
        </div>
        <Link href="/reserved" style={{ textDecoration: 'none' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            background: 'var(--primary)', 
            color: '#fff', 
            padding: '0.75rem 1.5rem', 
            borderRadius: 8, 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <Eye size={18} /> View Portfolio Dashboard
          </button>
        </Link>
      </div>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={openAddForm} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          background: 'var(--accent)', 
          color: 'var(--primary)', 
          padding: '0.75rem 1.5rem', 
          borderRadius: 8, 
          border: 'none', 
          fontWeight: 600, 
          cursor: 'pointer' 
        }}>
          <Plus size={18} /> Add Package
        </button>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '0.75rem 1rem', 
          borderRadius: 8, 
          border: '1px solid #e0e3eb',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Package size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>
            {packages.filter(p => p.status === 'Active').length} Active Packages
          </span>
        </div>
      </div>

      {/* Packages Table */}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: 'var(--secondary)' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Description</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Min Investment</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Max Investment</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Expected ROI (%)</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Duration</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Risk</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Created</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} style={{ borderBottom: '1px solid #e0e3eb' }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{pkg.name}</td>
                <td style={{ padding: 12, maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.description}</td>
                <td style={{ padding: 12 }}>${pkg.minInvestment.toLocaleString('en-US')}</td>
                <td style={{ padding: 12 }}>${pkg.maxInvestment.toLocaleString('en-US')}</td>
                <td style={{ padding: 12 }}>{pkg.expectedROI}%</td>
                <td style={{ padding: 12 }}>{pkg.duration} months</td>
                <td style={{ padding: 12 }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: 12, 
                    fontSize: 12, 
                    fontWeight: 600,
                    ...(pkg.riskLevel === 'Low' ? { background: '#dcfce7', color: '#166534' } :
                        pkg.riskLevel === 'Medium' ? { background: '#fef3c7', color: '#92400e' } :
                        { background: '#fee2e2', color: '#991b1b' })
                  }}>
                    {pkg.riskLevel}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: 12, 
                    fontSize: 12, 
                    fontWeight: 600,
                    background: pkg.status === 'Active' ? '#dcfce7' : '#fee2e2',
                    color: pkg.status === 'Active' ? '#166534' : '#991b1b'
                  }}>
                    {pkg.status}
                  </span>
                </td>
                <td style={{ padding: 12 }}>{pkg.createdAt}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEditForm(pkg)} style={{ 
                      background: 'var(--accent)', 
                      color: 'var(--primary)', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: 6, 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} style={{ 
                      background: '#ef4444', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: 6, 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Portfolio Link Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #2a3f5f 100%)', 
        borderRadius: 12, 
        padding: '1.5rem', 
        color: '#fff',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>
              Portfolio Dashboard Connection
            </h3>
            <p style={{ fontSize: 14, opacity: 0.9 }}>
              View how these packages are performing in the live portfolio dashboard
            </p>
          </div>
          <Link href="/reserved" style={{ textDecoration: 'none' }}>
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              background: 'var(--accent)', 
              color: 'var(--primary)', 
              padding: '0.75rem 1.5rem', 
              borderRadius: 8, 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <ExternalLink size={18} /> Open Portfolio
            </button>
          </Link>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleFormSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
            <h2 style={{ marginBottom: 16 }}>{isEdit ? 'Edit Package' : 'Add Package'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input name="name" value={formData.name || ''} onChange={handleFormChange} placeholder="Name" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
              <input name="description" value={formData.description || ''} onChange={handleFormChange} placeholder="Description" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
              <input name="minInvestment" value={formData.minInvestment || 0} onChange={handleFormChange} placeholder="Min Investment" type="number" min={0} required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
              <input name="maxInvestment" value={formData.maxInvestment || 0} onChange={handleFormChange} placeholder="Max Investment" type="number" min={0} required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
              <input name="expectedROI" value={formData.expectedROI || 0} onChange={handleFormChange} placeholder="Expected ROI (%)" type="number" min={0} required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
              <input name="duration" value={formData.duration || 0} onChange={handleFormChange} placeholder="Duration" type="number" min={0} required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
              <select name="riskLevel" value={formData.riskLevel || 'Low'} onChange={handleFormChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select name="status" value={formData.status || 'Active'} onChange={handleFormChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }}>
                <option value="Active">Active</option>
                <option value="Fundraising">Fundraising</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>{isEdit ? 'Save Changes' : 'Add'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: '#e0e3eb', color: 'var(--primary)', border: 'none', borderRadius: 6, padding: '0.5rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 