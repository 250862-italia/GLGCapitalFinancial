"use client";
import { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, Calendar, Eye, Edit, Plus, Trash2, Search, Filter, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { usePackages, InvestmentPackage } from '../../../lib/package-context';
import { emailNotificationService } from '../../../lib/email-service';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);

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

  const openEditForm = (pkg: InvestmentPackage) => {
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

  // --- GRAFICO DISTRIBUZIONE RISCHIO ---
  const riskData = ['low', 'medium', 'high'].map(risk => ({
    name: risk.charAt(0).toUpperCase() + risk.slice(1),
    value: packages.filter(p => p.riskLevel === risk).length
  })).filter(d => d.value > 0);
  const riskColors = ['#10b981', '#f59e0b', '#ef4444'];

  const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16, marginTop: 4 };

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
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <section style={{ marginBottom: '2.5rem', display: 'flex', gap: 32 }}>
        <div style={{ flex: 2 }}>
          <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, margin: 0 }}>Gestione Pacchetti</h1>
          <p style={{ color: '#64748b', fontSize: 18, margin: '8px 0 0 0' }}>Crea, modifica e analizza i pacchetti di investimento disponibili.</p>
        </div>
        <div style={{ flex: 1, minWidth: 260, background: '#f8fafc', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ color: '#0a2540', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Distribuzione Rischio</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {riskData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={riskColors[idx % riskColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Cerca per nome o categoria..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 2, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
        />
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
          <option value="">Tutti i rischi</option>
          <option value="low">Basso</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
          <option value="">Tutti gli stati</option>
          <option value="Active">Attivo</option>
          <option value="Fundraising">Raccolta</option>
          <option value="Closed">Chiuso</option>
        </select>
        <button
          onClick={openAddForm}
          style={{ background: 'var(--accent)', color: 'var(--primary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} /> Nuovo Pacchetto
        </button>
      </section>

      {/* Success/Error/Loading feedback qui, tabella CRUD moderna, modale conferma eliminazione, form elegante come per investimenti... */}
      {successMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '1rem', marginBottom: '2rem', color: '#16a34a', fontWeight: 600 }}>{successMessage}</div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', marginBottom: '2rem', color: '#dc2626', fontWeight: 600 }}>{error}</div>
      )}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e3eb' }}>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Nome</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>Categoria</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Rischio</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>Min</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>Max</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>Rendimento (%)</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Durata (mesi)</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Stato</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {packages
              .filter(pkg =>
                (!searchQuery || pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || pkg.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
                (!riskFilter || pkg.riskLevel === riskFilter) &&
                (!statusFilter || pkg.status === statusFilter)
              )
              .map(pkg => (
                <tr key={pkg.id} style={{ borderBottom: '1px solid #e0e3eb' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#0a2540' }}>{pkg.name}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{pkg.category}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ background: pkg.riskLevel === 'low' ? '#bbf7d0' : pkg.riskLevel === 'medium' ? '#fef3c7' : '#fee2e2', color: pkg.riskLevel === 'low' ? '#166534' : pkg.riskLevel === 'medium' ? '#92400e' : '#991b1b', padding: '0.3rem 0.7rem', borderRadius: 8, fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{pkg.riskLevel}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>€{pkg.minInvestment.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>€{pkg.maxInvestment.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{pkg.expectedReturn}%</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{pkg.duration}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ background: pkg.status === 'Active' ? '#bbf7d0' : pkg.status === 'Fundraising' ? '#fef3c7' : '#e0e7ff', color: pkg.status === 'Active' ? '#166534' : pkg.status === 'Fundraising' ? '#92400e' : '#3730a3', padding: '0.3rem 0.7rem', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>{pkg.status}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => openEditForm(pkg)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem', borderRadius: 6, cursor: 'pointer' }} title="Modifica"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(pkg.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem', borderRadius: 6, cursor: 'pointer' }} title="Elimina"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Form elegante per aggiunta/modifica pacchetto */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{isEdit ? 'Modifica Pacchetto' : 'Nuovo Pacchetto'}</h2>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label>Nome*
                <input name="name" value={formData.name} onChange={handleFormChange} style={inputStyle} required />
              </label>
              <label>Descrizione
                <textarea name="description" value={formData.description} onChange={handleFormChange} style={{ ...inputStyle, minHeight: 60 }} />
              </label>
              <label>Categoria*
                <input name="category" value={formData.category} onChange={handleFormChange} style={inputStyle} required />
              </label>
              <label>Min Investimento (€)*
                <input name="minInvestment" type="number" value={formData.minInvestment} onChange={handleFormChange} style={inputStyle} required />
              </label>
              <label>Max Investimento (€)*
                <input name="maxInvestment" type="number" value={formData.maxInvestment} onChange={handleFormChange} style={inputStyle} required />
              </label>
              <label>Rendimento Atteso (%)
                <input name="expectedReturn" type="number" value={formData.expectedReturn} onChange={handleFormChange} style={inputStyle} />
              </label>
              <label>Durata (mesi)
                <input name="duration" type="number" value={formData.duration} onChange={handleFormChange} style={inputStyle} />
              </label>
              <label>Rischio
                <select name="riskLevel" value={formData.riskLevel} onChange={handleFormChange} style={inputStyle}>
                  <option value="low">Basso</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                </select>
              </label>
              <label>Stato
                <select name="status" value={formData.status} onChange={handleFormChange} style={inputStyle}>
                  <option value="Active">Attivo</option>
                  <option value="Fundraising">Raccolta</option>
                  <option value="Closed">Chiuso</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" disabled={isSubmitting} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 1 }}>{isEdit ? 'Salva Modifiche' : 'Crea Pacchetto'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer', flex: 1 }}>Annulla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 