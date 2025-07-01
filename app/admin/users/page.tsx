"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Shield, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  DollarSign,
  UserPlus,
  Trash2,
  Crown,
  Lock,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
  registrationDate: Date;
  lastLogin: Date;
  totalInvestments: number;
  phone: string;
  country: string;
  isVerified: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
  isVerified: boolean;
}

interface UserFormData {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'superadmin';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    password: '',
    role: 'admin'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInvestmentsModal, setShowInvestmentsModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'admin'
    });
    setIsEdit(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (user: AdminUser) => {
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role
    });
    setSelectedUser(user);
    setIsEdit(true);
    setShowForm(true);
  };

  const openPasswordForm = (user: AdminUser) => {
    setSelectedUser(user);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(true);
    setError('');
    setSuccess('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.name || (!isEdit && !formData.password)) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const url = isEdit ? '/api/admin/users/update' : '/api/admin/users/create';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: selectedUser?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(isEdit ? 'User updated successfully!' : 'User created successfully!');
        setShowForm(false);
        resetForm();
        loadUsers();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser?.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setShowPasswordForm(false);
        setSelectedUser(null);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.error || 'Password change failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User deleted successfully!');
        loadUsers();
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'superadmin' ? <Crown size={16} style={{ color: '#f59e0b' }} /> : <Shield size={16} style={{ color: '#3b82f6' }} />;
  };

  const getRoleColor = (role: string) => {
    return role === 'superadmin' ? '#f59e0b' : '#3b82f6';
  };

  const openInvestmentsModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowInvestmentsModal(true);
  };

  const openKYCModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowKYCModal(true);
  };

  const openActivityModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const openEmailModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEmailModal(true);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      
      {/* HEADER */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, margin: 0 }}>Admin Users Management</h1>
          <button
            onClick={openAddForm}
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
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={20} />
            Add New Admin
          </button>
        </div>
        <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8, margin: 0 }}>
          Manage administrative users and their permissions
        </p>
      </section>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#dc2626'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#16a34a'
        }}>
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {/* USERS TABLE */}
      <section>
        <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '1.5rem' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Administrative Users</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e3eb' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>User</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>Created</th>
                  <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e0e3eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{user.name}</div>
                        <div style={{ fontSize: 14, color: 'var(--foreground)', opacity: 0.7 }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {getRoleIcon(user.role)}
                        <span style={{ 
                          color: getRoleColor(user.role), 
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--foreground)', fontSize: 14 }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEditForm(user)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openPasswordForm(user)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Change Password"
                        >
                          <Lock size={16} />
                        </button>
                        {user.role !== 'superadmin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button title="Investimenti" onClick={() => openInvestmentsModal(user)} style={{ marginRight: 8 }}>
                          <DollarSign size={16} />
                        </button>
                        <button title="KYC" onClick={() => openKYCModal(user)} style={{ marginRight: 8 }}>
                          <Shield size={16} />
                        </button>
                        <button title="Attività" onClick={() => openActivityModal(user)} style={{ marginRight: 8 }}>
                          <Clock size={16} />
                        </button>
                        <button title="Invia Email" onClick={() => openEmailModal(user)}>
                          <Mail size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ADD/EDIT USER FORM */}
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
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, margin: 0 }}>
                {isEdit ? 'Edit Admin User' : 'Add New Admin User'}
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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter full name"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter email address"
                />
              </div>

              {!isEdit && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                    Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 16,
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Role <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'superadmin' }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'var(--accent)',
                    color: 'var(--primary)',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isEdit ? 'Update User' : 'Create User'}
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

      {/* CHANGE PASSWORD FORM */}
      {showPasswordForm && (
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
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            width: '100%',
            maxWidth: 500
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, margin: 0 }}>
                Change Password
              </h2>
              <button
                onClick={() => setShowPasswordForm(false)}
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

            <p style={{ color: 'var(--foreground)', marginBottom: '2rem' }}>
              Changing password for: <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Current Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter current password"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter new password"
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                  Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                  placeholder="Confirm new password"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
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
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
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

      {showInvestmentsModal && (
        <Modal onClose={() => setShowInvestmentsModal(false)}>
          <h2>Investimenti di {selectedUser?.name}</h2>
          <p>Funzionalità in sviluppo.</p>
        </Modal>
      )}
      {showKYCModal && (
        <Modal onClose={() => setShowKYCModal(false)}>
          <h2>KYC di {selectedUser?.name}</h2>
          <p>Funzionalità in sviluppo.</p>
        </Modal>
      )}
      {showActivityModal && (
        <Modal onClose={() => setShowActivityModal(false)}>
          <h2>Attività di {selectedUser?.name}</h2>
          <p>Funzionalità in sviluppo.</p>
        </Modal>
      )}
      {showEmailModal && (
        <Modal onClose={() => setShowEmailModal(false)}>
          <h2>Invia Email a {selectedUser?.name}</h2>
          <p>Funzionalità in sviluppo.</p>
        </Modal>
      )}
    </div>
  );
} 