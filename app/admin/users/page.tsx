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
  DollarSign
} from 'lucide-react';

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, kycFilter, roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          name: 'John Doe',
          role: 'user',
          status: 'active',
          kycStatus: 'approved',
          registrationDate: new Date('2024-01-15'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          totalInvestments: 50000,
          phone: '+1 (555) 123-4567',
          country: 'United States',
          isVerified: true
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          role: 'user',
          status: 'active',
          kycStatus: 'pending',
          registrationDate: new Date('2024-01-20'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          totalInvestments: 25000,
          phone: '+1 (555) 987-6543',
          country: 'Canada',
          isVerified: false
        },
        {
          id: '3',
          email: 'mike.johnson@example.com',
          name: 'Mike Johnson',
          role: 'user',
          status: 'suspended',
          kycStatus: 'rejected',
          registrationDate: new Date('2024-01-10'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
          totalInvestments: 0,
          phone: '+1 (555) 456-7890',
          country: 'United Kingdom',
          isVerified: false
        },
        {
          id: '4',
          email: 'sarah.wilson@example.com',
          name: 'Sarah Wilson',
          role: 'admin',
          status: 'active',
          kycStatus: 'approved',
          registrationDate: new Date('2024-01-05'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          totalInvestments: 100000,
          phone: '+1 (555) 321-6540',
          country: 'Australia',
          isVerified: true
        },
        {
          id: '5',
          email: 'david.brown@example.com',
          name: 'David Brown',
          role: 'user',
          status: 'pending',
          kycStatus: 'not_started',
          registrationDate: new Date('2024-01-25'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          totalInvestments: 0,
          phone: '+1 (555) 789-0123',
          country: 'Germany',
          isVerified: false
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // KYC filter
    if (kycFilter !== 'all') {
      filtered = filtered.filter(user => user.kycStatus === kycFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = (action: string, user: User) => {
    switch (action) {
      case 'view':
        setSelectedUser(user);
        setShowUserModal(true);
        break;
      case 'edit':
        // Handle edit user
        console.log('Edit user:', user.id);
        break;
      case 'suspend':
        // Handle suspend user
        console.log('Suspend user:', user.id);
        break;
      case 'activate':
        // Handle activate user
        console.log('Activate user:', user.id);
        break;
      case 'delete':
        // Handle delete user
        console.log('Delete user:', user.id);
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#059669';
      case 'inactive':
        return '#6b7280';
      case 'suspended':
        return '#dc2626';
      case 'pending':
        return '#d97706';
      default:
        return '#6b7280';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'rejected':
        return '#dc2626';
      case 'not_started':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return '#dc2626';
      case 'admin':
        return '#7c3aed';
      case 'user':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1f2937',
            marginBottom: 8
          }}>
            User Management
          </h1>
          <p style={{
            fontSize: 16,
            color: '#6b7280',
            margin: 0
          }}>
            Manage user accounts, permissions, and verification status
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            background: 'white',
            color: '#374151',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Download size={16} />
            Export
          </button>
          
          <button style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            background: '#059669',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          {/* KYC Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            <option value="all">All KYC Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="not_started">Not Started</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14
            }}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1f2937',
            margin: 0
          }}>
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <tr>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  User
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Role
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  KYC Status
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Investments
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Last Login
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontWeight: 600
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {user.name}
                          </p>
                          <p style={{
                            fontSize: 12,
                            color: '#6b7280',
                            margin: 0
                          }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: getRoleColor(user.role),
                      color: 'white',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: getStatusColor(user.status),
                      color: 'white',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: getKYCStatusColor(user.kycStatus),
                      color: 'white',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {user.kycStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: 14,
                      color: '#1f2937',
                      fontWeight: 600
                    }}>
                      ${user.totalInvestments.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: 12,
                      color: '#6b7280'
                    }}>
                      {formatTimeAgo(user.lastLogin)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => handleUserAction('view', user)}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          background: 'white',
                          color: '#374151',
                          cursor: 'pointer'
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction('edit', user)}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          background: 'white',
                          color: '#374151',
                          cursor: 'pointer'
                        }}
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction('suspend', user)}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          background: 'white',
                          color: '#374151',
                          cursor: 'pointer'
                        }}
                        title="Suspend User"
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 600,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#1f2937',
                margin: 0
              }}>
                User Details
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <XCircle size={24} color="#6b7280" />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {/* User Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 8
              }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontWeight: 600,
                  fontSize: 20
                }}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {selectedUser.name}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Phone size={16} color="#6b7280" />
                  <span style={{ fontSize: 14, color: '#374151' }}>
                    {selectedUser.phone}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <MapPin size={16} color="#6b7280" />
                  <span style={{ fontSize: 14, color: '#374151' }}>
                    {selectedUser.country}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Calendar size={16} color="#6b7280" />
                  <span style={{ fontSize: 14, color: '#374151' }}>
                    Joined {formatDate(selectedUser.registrationDate)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <DollarSign size={16} color="#6b7280" />
                  <span style={{ fontSize: 14, color: '#374151' }}>
                    ${selectedUser.totalInvestments.toLocaleString()} invested
                  </span>
                </div>
              </div>

              {/* Status Badges */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: getRoleColor(selectedUser.role),
                  color: 'white',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {selectedUser.role}
                </span>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: getStatusColor(selectedUser.status),
                  color: 'white',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {selectedUser.status}
                </span>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: getKYCStatusColor(selectedUser.kycStatus),
                  color: 'white',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  KYC {selectedUser.kycStatus.replace('_', ' ')}
                </span>
                {selectedUser.isVerified && (
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: '#059669',
                    color: 'white',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <CheckCircle size={12} />
                    Verified
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Edit User
                </button>
                <button style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: 8,
                  background: '#dc2626',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Suspend User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 