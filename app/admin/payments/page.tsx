"use client";
import { useState } from 'react';
import { DollarSign, CreditCard, Building2, CheckCircle, XCircle, Clock, TrendingUp, Download, Eye, AlertCircle, Calendar, Edit, Plus, Trash2, Search, Users } from 'lucide-react';
import { usePackages } from '@/lib/package-context';
import { emailNotificationService } from '@/lib/email-service';

interface Payment {
  id: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'Wire Transfer' | 'Crypto';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  transactionId: string;
  date: string;
  description: string;
  packageId: string;
  packageName: string;
  fees: number;
  netAmount: number;
}

export default function PaymentsManagementPage() {
  const { packages } = usePackages();
  
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      clientName: 'John Smith',
      amount: 5000,
      currency: 'USD',
      paymentMethod: 'Credit Card',
      status: 'Completed',
      transactionId: 'TXN-2024-001',
      date: '2024-01-15',
      description: 'Payment for Conservative Growth Package',
      packageId: '1',
      packageName: 'Conservative Growth',
      fees: 125,
      netAmount: 4875
    },
    {
      id: '2',
      clientName: 'Maria Garcia',
      amount: 10000,
      currency: 'USD',
      paymentMethod: 'Bank Transfer',
      status: 'Completed',
      transactionId: 'TXN-2024-002',
      date: '2024-01-20',
      description: 'Payment for Balanced Portfolio Package',
      packageId: '2',
      packageName: 'Balanced Portfolio',
      fees: 250,
      netAmount: 9750
    },
    {
      id: '3',
      clientName: 'David Chen',
      amount: 25000,
      currency: 'USD',
      paymentMethod: 'Wire Transfer',
      status: 'Pending',
      transactionId: 'TXN-2024-003',
      date: '2024-02-01',
      description: 'Payment for Aggressive Growth Package',
      packageId: '3',
      packageName: 'Aggressive Growth',
      fees: 625,
      netAmount: 24375
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    currency: 'USD',
    paymentMethod: 'Credit Card' as 'Credit Card' | 'Bank Transfer' | 'Wire Transfer' | 'Crypto',
    status: 'Pending' as 'Completed' | 'Pending' | 'Failed' | 'Refunded',
    transactionId: '',
    date: '',
    description: '',
    packageId: '',
    packageName: '',
    fees: ''
  });

  const paymentMethods = ['Credit Card', 'Bank Transfer', 'Wire Transfer', 'Crypto'];
  const statuses = ['Completed', 'Pending', 'Failed', 'Refunded'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

  const handlePackageChange = (packageId: string) => {
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      const fees = selectedPackage.minInvestment * 0.025;
      setFormData({
        ...formData,
        packageId: packageId,
        packageName: selectedPackage.name,
        amount: selectedPackage.minInvestment.toString(),
        fees: fees.toString(),
        description: `Payment for ${selectedPackage.name} Package`
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || payment.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleAddPayment = () => {
    const amount = parseFloat(formData.amount);
    const fees = parseFloat(formData.fees);
    const newPayment: Payment = {
      id: Date.now().toString(),
      clientName: formData.clientName,
      amount: amount,
      currency: formData.currency,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      transactionId: formData.transactionId,
      date: formData.date,
      description: formData.description,
      packageId: formData.packageId,
      packageName: formData.packageName,
      fees: fees,
      netAmount: amount - fees
    };

    setPayments([...payments, newPayment]);
    
    // Send surveillance notification for payment creation
    emailNotificationService.notifyAdminAction(
      { id: 'admin', name: 'Admin User' },
      'Payment Created',
      { payment: newPayment, action: 'create' }
    );
    
    setShowAddForm(false);
    resetForm();
  };

  const handleEditPayment = () => {
    if (!editingPayment) return;

    const amount = parseFloat(formData.amount);
    const fees = parseFloat(formData.fees);
    const updatedPayments = payments.map(payment =>
      payment.id === editingPayment.id
        ? {
            ...payment,
            clientName: formData.clientName,
            amount: amount,
            currency: formData.currency,
            paymentMethod: formData.paymentMethod,
            status: formData.status,
            transactionId: formData.transactionId,
            date: formData.date,
            description: formData.description,
            packageId: formData.packageId,
            packageName: formData.packageName,
            fees: fees,
            netAmount: amount - fees
          }
        : payment
    );

    setPayments(updatedPayments);
    
    // Send surveillance notification for payment edit
    const updatedPayment = updatedPayments.find(payment => payment.id === editingPayment.id);
    if (updatedPayment) {
      emailNotificationService.notifyAdminAction(
        { id: 'admin', name: 'Admin User' },
        'Payment Edited',
        { payment: updatedPayment, action: 'edit', originalPayment: editingPayment }
      );
    }
    
    setEditingPayment(null);
    resetForm();
  };

  const handleDeletePayment = (id: string) => {
    const paymentToDelete = payments.find(payment => payment.id === id);
    if (confirm('Are you sure you want to delete this payment?')) {
      setPayments(payments.filter(payment => payment.id !== id));
      
      // Send surveillance notification for payment deletion
      if (paymentToDelete) {
        emailNotificationService.notifyAdminAction(
          { id: 'admin', name: 'Admin User' },
          'Payment Deleted',
          { payment: paymentToDelete, action: 'delete' }
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      amount: '',
      currency: 'USD',
      paymentMethod: 'Credit Card',
      status: 'Pending',
      transactionId: '',
      date: '',
      description: '',
      packageId: '',
      packageName: '',
      fees: ''
    });
  };

  const openEditForm = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      clientName: payment.clientName,
      amount: payment.amount.toString(),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      date: payment.date,
      description: payment.description,
      packageId: payment.packageId,
      packageName: payment.packageName,
      fees: payment.fees.toString()
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={16} style={{ color: '#059669' }} />;
      case 'Failed': return <XCircle size={16} style={{ color: '#dc2626' }} />;
      default: return <Calendar size={16} style={{ color: '#d97706' }} />;
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Payment Management</h1>
          <p style={{ color: 'var(--foreground)', margin: 0 }}>Manage client payments and transactions</p>
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
          Add Payment
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>Total Payments</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{payments.length}</p>
            </div>
            <CreditCard style={{ color: 'var(--primary)' }} size={24} />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>Total Revenue</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
                ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-US')}
              </p>
            </div>
            <DollarSign style={{ color: '#10b981' }} size={24} />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>Completed</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                {payments.filter(p => p.status === 'Completed').length}
              </p>
            </div>
            <CheckCircle style={{ color: 'var(--primary)' }} size={24} />
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', margin: 0 }}>Pending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
                {payments.filter(p => p.status === 'Pending').length}
              </p>
            </div>
            <Calendar style={{ color: '#f59e0b' }} size={24} />
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
                placeholder="Search payments..."
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
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'all' ? 'var(--primary)' : '#f3f4f6',
                color: activeTab === 'all' ? '#fff' : 'var(--foreground)'
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'completed' ? 'var(--primary)' : '#f3f4f6',
                color: activeTab === 'completed' ? '#fff' : 'var(--foreground)'
              }}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'pending' ? 'var(--primary)' : '#f3f4f6',
                color: activeTab === 'pending' ? '#fff' : 'var(--foreground)'
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('failed')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'failed' ? 'var(--primary)' : '#f3f4f6',
                color: activeTab === 'failed' ? '#fff' : 'var(--foreground)'
              }}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e3eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Method</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: '#fff' }}>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>{payment.transactionId}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{payment.description}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{payment.clientName}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {payment.currency} {payment.amount.toLocaleString('en-US')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Net: {payment.currency} {payment.netAmount.toLocaleString('en-US')}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '9999px',
                      ...(payment.paymentMethod === 'Credit Card' ? { color: '#2563eb', background: '#dbeafe' } :
                          payment.paymentMethod === 'Bank Transfer' ? { color: '#059669', background: '#d1fae5' } :
                          payment.paymentMethod === 'Wire Transfer' ? { color: '#7c3aed', background: '#e9d5ff' } :
                          { color: '#ea580c', background: '#fed7aa' })
                    }}>
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(payment.status)}
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        ...(payment.status === 'Completed' ? { color: '#059669' } :
                            payment.status === 'Pending' ? { color: '#d97706' } :
                            payment.status === 'Failed' ? { color: '#dc2626' } :
                            { color: '#2563eb' })
                      }}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.875rem' }}>{payment.date}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setViewingPayment(payment)}
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
                        onClick={() => openEditForm(payment)}
                        style={{
                          padding: '0.25rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                        title="Edit Payment"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        style={{
                          padding: '0.25rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626'
                        }}
                        title="Delete Payment"
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

      {/* Add/Edit Payment Modal */}
      {(showAddForm || editingPayment) && (
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
              {editingPayment ? 'Edit Payment' : 'Add New Payment'}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); editingPayment ? handleEditPayment() : handleAddPayment(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
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
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Transaction ID</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
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
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Package</label>
                  <select
                    value={formData.packageId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  >
                    <option value="">Select Package</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - ${pkg.minInvestment.toLocaleString('en-US')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: '0.875rem'
                    }}
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
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
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
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
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Fees</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fees}
                    onChange={(e) => setFormData({...formData, fees: e.target.value})}
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    minHeight: '4rem',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={editingPayment ? handleEditPayment : handleAddPayment}
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
                  {editingPayment ? 'Update Payment' : 'Add Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPayment(null);
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

      {/* View Payment Modal */}
      {viewingPayment && (
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Payment Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Transaction ID</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingPayment.transactionId}</p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Client Name</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingPayment.clientName}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Amount</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                    {viewingPayment.currency} {viewingPayment.amount.toLocaleString('en-US')}
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Net Amount</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                    {viewingPayment.currency} {viewingPayment.netAmount.toLocaleString('en-US')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Payment Method</label>
                  <span style={{
                    display: 'inline-flex',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    ...(viewingPayment.paymentMethod === 'Credit Card' ? { color: '#2563eb', background: '#dbeafe' } :
                        viewingPayment.paymentMethod === 'Bank Transfer' ? { color: '#059669', background: '#d1fae5' } :
                        viewingPayment.paymentMethod === 'Wire Transfer' ? { color: '#7c3aed', background: '#e9d5ff' } :
                        { color: '#ea580c', background: '#fed7aa' })
                  }}>
                    {viewingPayment.paymentMethod}
                  </span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Status</label>
                  <span style={{
                    display: 'inline-flex',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '9999px',
                    ...(viewingPayment.status === 'Completed' ? { color: '#059669', background: '#d1fae5' } :
                        viewingPayment.status === 'Pending' ? { color: '#d97706', background: '#fef3c7' } :
                        viewingPayment.status === 'Failed' ? { color: '#dc2626', background: '#fee2e2' } :
                        { color: '#2563eb', background: '#dbeafe' })
                  }}>
                    {viewingPayment.status}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Description</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingPayment.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Package ID</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingPayment.packageId}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Package Name</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingPayment.packageName}</p>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Fees</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                  {viewingPayment.currency} {viewingPayment.fees.toLocaleString('en-US')}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Date</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>{viewingPayment.date}</p>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setViewingPayment(null)}
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