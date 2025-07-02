"use client";
import { useState, useEffect } from 'react';
import { User, DollarSign, TrendingUp, Calendar, Mail, Phone, MapPin, Eye, Edit, MessageSquare, Shield, Plus, Trash2, Search, Filter, Download, Copy, CheckCircle, Camera } from 'lucide-react';
import { emailNotificationService } from '../../../lib/email-service';
import { createClient } from '@supabase/supabase-js';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  joinDate: string;
  lastActivity: string;
  totalPositions: number;
  activePositions: number;
  performance: string;
  notes: string;
  profilePhoto?: string;
  bankDetails: {
    iban: string;
    bic: string;
    accountHolder: string;
    bankName: string;
  };
  usdtWallet?: string;
  preferredPaymentMethod?: 'bank' | 'usdt' | 'both';
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [copiedField, setCopiedField] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
    kycStatus: 'Pending' as 'Verified' | 'Pending' | 'Rejected',
    totalPositions: '',
    activePositions: '',
    performance: '',
    notes: '',
    profilePhoto: '',
    bankDetails: { iban: '', bic: '', accountHolder: '', bankName: '' },
    usdtWallet: '',
    preferredPaymentMethod: 'bank' as 'bank' | 'usdt' | 'both',
  });

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      if (!error && data) {
        // Per ogni cliente, recupera lo stato KYC reale
        const clientsWithKyc = await Promise.all(data.map(async (c: any) => {
          let kycStatus: 'Verified' | 'Pending' | 'Rejected' = 'Pending';
          // Cerca la KYC più recente per questo utente
          const { data: kycData } = await supabase
            .from('kyc_applications')
            .select('verification_status')
            .eq('user_id', c.user_id)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .single();
          if (kycData && kycData.verification_status) {
            if (kycData.verification_status === 'approved') kycStatus = 'Verified';
            else if (kycData.verification_status === 'rejected') kycStatus = 'Rejected';
            else kycStatus = 'Pending';
          }
          return {
            id: c.id,
            name: c.first_name + ' ' + c.last_name,
            email: c.email,
            phone: c.phone,
            location: c.nationality || '',
            status: normalizeStatus(c.status),
            kycStatus,
            joinDate: c.created_at ? c.created_at.slice(0, 10) : '',
            lastActivity: c.updated_at ? c.updated_at.slice(0, 10) : '',
            totalPositions: 0,
            activePositions: 0,
            performance: '',
            notes: '',
            profilePhoto: '',
            bankDetails: { iban: '', bic: '', accountHolder: '', bankName: '' },
            usdtWallet: '',
            preferredPaymentMethod: 'bank',
          };
        }));
        setClients(clientsWithKyc);
      }
      setLoading(false);
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status.toLowerCase() === statusFilter;
    const matchesKyc = kycFilter === 'all' || client.kycStatus.toLowerCase() === kycFilter;
    return matchesSearch && matchesStatus && matchesKyc;
  });

  const handleAddClient = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      status: formData.status,
      kycStatus: formData.kycStatus,
      joinDate: new Date().toISOString().slice(0, 10),
      lastActivity: new Date().toISOString().slice(0, 10),
      totalPositions: parseFloat(formData.totalPositions) || 0,
      activePositions: parseInt(formData.activePositions) || 0,
      performance: formData.performance,
      notes: formData.notes,
      profilePhoto: formData.profilePhoto,
      bankDetails: formData.bankDetails,
      usdtWallet: formData.usdtWallet,
      preferredPaymentMethod: formData.preferredPaymentMethod,
    };

    setClients([...clients, newClient]);
    
    // Send surveillance notification for client creation
    emailNotificationService.notifyAdminAction(
      { id: 'admin', name: 'Admin User' },
      'Client Created',
      { client: newClient, action: 'create' }
    );
    
    setShowAddForm(false);
    resetForm();
  };

  const handleEditClient = async () => {
    if (!editingClient) return;
    setLoading(true);
    const { error } = await supabase
      .from('clients')
      .update({
        first_name: formData.name.split(' ')[0],
        last_name: formData.name.split(' ').slice(1).join(' '),
        email: formData.email,
        phone: formData.phone,
        nationality: formData.location,
        status: formData.status.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', editingClient.id);
    setEditingClient(null);
    resetForm();
    await refreshClients();
    setLoading(false);
  };

  const handleDeleteClient = async (id: string) => {
    const clientToDelete = clients.find(client => client.id === id);
    if (!clientToDelete) {
      alert('Client not found!');
      return;
    }
    const confirmMessage = `Are you sure you want to delete client "${clientToDelete.name}"?\n\nThis action cannot be undone and will permanently remove all client data.`;
    if (confirm(confirmMessage)) {
      setLoading(true);
      await supabase.from('clients').delete().eq('id', id);
      await refreshClients();
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      status: 'Active',
      kycStatus: 'Pending',
      totalPositions: '',
      activePositions: '',
      performance: '',
      notes: '',
      profilePhoto: '',
      bankDetails: { iban: '', bic: '', accountHolder: '', bankName: '' },
      usdtWallet: '',
      preferredPaymentMethod: 'bank',
    });
  };

  const openEditForm = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      location: client.location,
      status: client.status,
      kycStatus: client.kycStatus,
      totalPositions: client.totalPositions.toString(),
      activePositions: client.activePositions.toString(),
      performance: client.performance,
      notes: client.notes,
      profilePhoto: client.profilePhoto || '',
      bankDetails: client.bankDetails || { iban: '', bic: '', accountHolder: '', bankName: '' },
      usdtWallet: client.usdtWallet || '',
      preferredPaymentMethod: client.preferredPaymentMethod || 'bank',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return { color: '#059669', background: '#d1fae5' };
      case 'Inactive': return { color: '#6b7280', background: '#f3f4f6' };
      case 'Suspended': return { color: '#dc2626', background: '#fee2e2' };
      default: return { color: '#6b7280', background: '#f3f4f6' };
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return { color: '#059669', background: '#d1fae5' };
      case 'Pending': return { color: '#d97706', background: '#fef3c7' };
      case 'Rejected': return { color: '#dc2626', background: '#fee2e2' };
      default: return { color: '#6b7280', background: '#f3f4f6' };
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, profilePhoto: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const refreshClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    if (!error && data) {
      const clientsWithKyc = await Promise.all(data.map(async (c: any) => {
        let kycStatus: 'Verified' | 'Pending' | 'Rejected' = 'Pending';
        const { data: kycData } = await supabase
          .from('kyc_applications')
          .select('verification_status')
          .eq('user_id', c.user_id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();
        if (kycData && kycData.verification_status) {
          if (kycData.verification_status === 'approved') kycStatus = 'Verified';
          else if (kycData.verification_status === 'rejected') kycStatus = 'Rejected';
          else kycStatus = 'Pending';
        }
        return {
          id: c.id,
          name: c.first_name + ' ' + c.last_name,
          email: c.email,
          phone: c.phone,
          location: c.nationality || '',
          status: normalizeStatus(c.status),
          kycStatus,
          joinDate: c.created_at ? c.created_at.slice(0, 10) : '',
          lastActivity: c.updated_at ? c.updated_at.slice(0, 10) : '',
          totalPositions: 0,
          activePositions: 0,
          performance: '',
          notes: '',
          profilePhoto: '',
          bankDetails: { iban: '', bic: '', accountHolder: '', bankName: '' },
          usdtWallet: '',
          preferredPaymentMethod: 'bank',
        };
      }));
      setClients(clientsWithKyc);
    }
    setLoading(false);
  };

  // Funzione per normalizzare lo status
  const normalizeStatus = (status: string): 'Active' | 'Inactive' | 'Suspended' => {
    if (status.toLowerCase() === 'active') return 'Active';
    if (status.toLowerCase() === 'inactive') return 'Inactive';
    if (status.toLowerCase() === 'suspended') return 'Suspended';
    return 'Active';
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Client Management</h1>
          <p style={{ color: 'var(--foreground)', margin: 0 }}>Manage client relationships and data</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: 'var(--primary)',
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>Total Clients</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{clients.length}</p>
            </div>
            <User style={{ color: 'var(--primary)' }} size={24} />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>Active Clients</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
                {clients.filter(c => c.status === 'Active').length}
              </p>
            </div>
            <User style={{ color: '#10b981' }} size={24} />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>KYC Verified</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                {clients.filter(c => c.kycStatus === 'Verified').length}
              </p>
            </div>
            <Shield style={{ color: 'var(--primary)' }} size={24} />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>Total Positions</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
                ${clients.reduce((sum, c) => sum + c.totalPositions, 0).toLocaleString('en-US')}
              </p>
            </div>
            <DollarSign style={{ color: '#f59e0b' }} size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={16} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                background: '#fff'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                background: '#fff'
              }}
            >
              <option value="all">All KYC Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e3eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Positions</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: '#fff' }}>
              {filteredClients.map((client) => (
                <tr key={client.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {client.profilePhoto ? (
                        <img src={client.profilePhoto} alt="Profile" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                      ) : (
                        <User style={{ width: 36, height: 36, color: '#d1d5db', borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f3f4f6' }} />
                      )}
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>{client.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Joined: {client.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem' }}>{client.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{client.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{client.location}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '9999px',
                        ...getStatusColor(client.status)
                      }}>
                        {client.status}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '9999px',
                        ...getKycStatusColor(client.kycStatus)
                      }}>
                        {client.kycStatus}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        ${client.totalPositions.toLocaleString('en-US')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {client.activePositions} active
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: client.performance.startsWith('+') ? '#10b981' : '#dc2626' }}>
                      {client.performance}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6366f1' }}>
                      {client.preferredPaymentMethod === 'usdt' ? 'USDT' : client.preferredPaymentMethod === 'bank' ? 'Bank' : client.preferredPaymentMethod === 'both' ? 'Both' : '-'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setViewingClient(client)}
                        style={{
                          padding: '0.25rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditForm(client)}
                        style={{
                          padding: '0.25rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                        title="Edit Client"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        style={{
                          padding: '0.5rem',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#dc2626',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#fecaca';
                          e.currentTarget.style.borderColor = '#fca5a5';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }}
                        title="Delete Client"
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

      {/* Add/Edit Client Modal */}
      {(showAddForm || editingClient) && (
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
          zIndex: 50
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: '1.5rem',
            width: '100%',
            maxWidth: '32rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); editingClient ? handleEditClient() : handleAddClient(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>KYC Status</label>
                  <select
                    value={formData.kycStatus}
                    onChange={(e) => setFormData({...formData, kycStatus: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Total Positions</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalPositions}
                    onChange={(e) => setFormData({...formData, totalPositions: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Active Positions</label>
                  <input
                    type="number"
                    value={formData.activePositions}
                    onChange={(e) => setFormData({...formData, activePositions: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Performance</label>
                <input
                  type="text"
                  value={formData.performance}
                  onChange={(e) => setFormData({...formData, performance: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: '0.875rem'
                  }}
                  placeholder="e.g., +12.5%"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    minHeight: '4rem',
                    resize: 'vertical'
                  }}
                  placeholder="Additional notes about the client..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Profile Photo</label>
                  <div style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: '1rem', textAlign: 'center', background: '#f9fafb', cursor: 'pointer', position: 'relative' }}>
                    {formData.profilePhoto || photoPreview ? (
                      <div>
                        <img src={formData.profilePhoto || photoPreview} alt="Profile preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button type="button" onClick={() => document.getElementById('photo-upload')?.click()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.25rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Change</button>
                          <button type="button" onClick={removePhoto} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Camera style={{ width: 32, height: 32, color: '#9ca3af', marginBottom: '0.5rem' }} />
                        <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Click to upload</p>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>JPG, PNG up to 5MB</p>
                      </div>
                    )}
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Bank Details</label>
                  <input type="text" placeholder="IBAN" value={formData.bankDetails.iban} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, iban: e.target.value } })} style={{ width: '100%', marginBottom: 4, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8 }} />
                  <input type="text" placeholder="BIC/SWIFT" value={formData.bankDetails.bic} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bic: e.target.value } })} style={{ width: '100%', marginBottom: 4, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8 }} />
                  <input type="text" placeholder="Account Holder" value={formData.bankDetails.accountHolder} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolder: e.target.value } })} style={{ width: '100%', marginBottom: 4, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8 }} />
                  <input type="text" placeholder="Bank Name" value={formData.bankDetails.bankName} onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })} style={{ width: '100%', marginBottom: 4, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>USDT Wallet Address</label>
                  <input type="text" placeholder="USDT Wallet Address" value={formData.usdtWallet} onChange={e => setFormData({ ...formData, usdtWallet: e.target.value })} style={{ width: '100%', marginBottom: 4, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8, fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Preferred Payment Method</label>
                  <select value={formData.preferredPaymentMethod} onChange={e => setFormData({ ...formData, preferredPaymentMethod: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 8 }}>
                    <option value="bank">Bank Transfer</option>
                    <option value="usdt">USDT</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={editingClient ? handleEditClient : handleAddClient}
                  style={{
                    flex: 1,
                    background: 'var(--primary)',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    background: '#d1d5db',
                    color: '#374151',
                    padding: '0.5rem 1rem',
                    borderRadius: 8,
                    border: 'none',
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

      {/* View Client Modal */}
      {viewingClient && (
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
          zIndex: 50
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: '1.5rem',
            width: '100%',
            maxWidth: '28rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Client Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                {viewingClient.profilePhoto ? (
                  <img src={viewingClient.profilePhoto} alt="Profile" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb', marginBottom: 8 }} />
                ) : (
                  <User style={{ width: 96, height: 96, color: '#d1d5db', borderRadius: '50%', border: '2px solid #e5e7eb', background: '#f3f4f6', marginBottom: 8 }} />
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Name</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.name}</p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Email</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.email}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Phone</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.phone}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Location</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.location}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Status</label>
                  <span style={{
                    display: 'inline-flex',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    ...getStatusColor(viewingClient.status)
                  }}>
                    {viewingClient.status}
                  </span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>KYC Status</label>
                  <span style={{
                    display: 'inline-flex',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    ...getKycStatusColor(viewingClient.kycStatus)
                  }}>
                    {viewingClient.kycStatus}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Total Positions</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                    ${viewingClient.totalPositions.toLocaleString('en-US')}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Active Positions</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.activePositions}</p>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Performance</label>
                <p style={{ fontSize: '0.875rem', color: viewingClient.performance.startsWith('+') ? '#10b981' : '#dc2626' }}>
                  {viewingClient.performance}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Join Date</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.joinDate}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Last Activity</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.lastActivity}</p>
                </div>
              </div>

              {viewingClient.notes && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Notes</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingClient.notes}</p>
                </div>
              )}

              {viewingClient.bankDetails && (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500, color: '#374151', fontSize: 14 }}>Bank Details</label>
                  <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>
                    <span>IBAN: {viewingClient.bankDetails?.iban} <button onClick={() => copyToClipboard(viewingClient.bankDetails?.iban || '', 'iban')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'iban' ? '#10b981' : '#6366f1' }}>{copiedField === 'iban' ? <CheckCircle size={16} /> : <Copy size={16} />}</button></span><br />
                    <span>BIC: {viewingClient.bankDetails?.bic} <button onClick={() => copyToClipboard(viewingClient.bankDetails?.bic || '', 'bic')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'bic' ? '#10b981' : '#6366f1' }}>{copiedField === 'bic' ? <CheckCircle size={16} /> : <Copy size={16} />}</button></span><br />
                    <span>Holder: {viewingClient.bankDetails?.accountHolder}</span><br />
                    {viewingClient.bankDetails?.bankName && <span>Bank: {viewingClient.bankDetails?.bankName}</span>}
                  </div>
                </div>
              )}

              {viewingClient.usdtWallet && (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500, color: '#374151', fontSize: 14 }}>USDT Wallet</label>
                  <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>
                    <span>{viewingClient.usdtWallet} <button onClick={() => copyToClipboard(viewingClient.usdtWallet || '', 'usdt')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === 'usdt' ? '#10b981' : '#6366f1' }}>{copiedField === 'usdt' ? <CheckCircle size={16} /> : <Copy size={16} />}</button></span>
                  </div>
                </div>
              )}

              {viewingClient.preferredPaymentMethod && (
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 500, color: '#374151', fontSize: 14 }}>Preferred Payment</label>
                  <div style={{ fontSize: 13, color: '#6366f1', marginTop: 2 }}>{viewingClient.preferredPaymentMethod === 'usdt' ? 'USDT' : viewingClient.preferredPaymentMethod === 'bank' ? 'Bank' : viewingClient.preferredPaymentMethod === 'both' ? 'Both' : '-'}</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setViewingClient(null)}
                style={{
                  width: '100%',
                  background: '#d1d5db',
                  color: '#374151',
                  padding: '0.5rem 1rem',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
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