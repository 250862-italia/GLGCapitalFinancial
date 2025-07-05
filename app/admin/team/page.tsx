"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Eye, User, Mail, Phone, Shield, Calendar } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'analyst' | 'support';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  permissions: string[];
  avatar?: string;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [filteredTeam, setFilteredTeam] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'analyst' as 'admin' | 'manager' | 'analyst' | 'support',
    department: '',
    status: 'pending' as 'active' | 'inactive' | 'pending',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/team');
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      } else {
        console.error('Failed to fetch team members');
        // Fallback to mock data if API fails
        const mockData: TeamMember[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@glgcapitalgroupllc.com',
            phone: '+1 786 798 8311',
            role: 'admin',
            department: 'Management',
            status: 'active',
            joinDate: '2023-01-15',
            lastActive: '2024-01-15',
            permissions: ['full_access', 'user_management', 'analytics', 'content']
          },
          {
            id: '2',
            name: 'Maria Garcia',
            email: 'maria.garcia@glgcapitalgroupllc.com',
            phone: '+1 786 798 8312',
            role: 'manager',
            department: 'Operations',
            status: 'active',
            joinDate: '2023-03-20',
            lastActive: '2024-01-14',
            permissions: ['analytics', 'content', 'team_view']
          },
          {
            id: '3',
            name: 'David Chen',
            email: 'david.chen@glgcapitalgroupllc.com',
            phone: '+1 786 798 8313',
            role: 'analyst',
            department: 'Analytics',
            status: 'active',
            joinDate: '2023-06-10',
            lastActive: '2024-01-13',
            permissions: ['analytics', 'reports']
          },
          {
            id: '4',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@glgcapitalgroupllc.com',
            phone: '+1 786 798 8314',
            role: 'support',
            department: 'Customer Service',
            status: 'inactive',
            joinDate: '2023-02-28',
            lastActive: '2023-12-15',
            permissions: ['support', 'user_view']
          }
        ];
        setTeam(mockData);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Remove localStorage save since we're using database now

  useEffect(() => {
    filterTeam();
  }, [team, searchTerm, selectedRole, selectedStatus]);

  const filterTeam = () => {
    let filtered = team;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(member => member.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(member => member.status === selectedStatus);
    }

    setFilteredTeam(filtered);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'analyst',
      department: '',
      status: 'pending',
      permissions: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedItem(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      status: member.status,
      permissions: member.permissions
    });
    setShowEditModal(true);
  };

  const handleDelete = (member: TeamMember) => {
    setSelectedItem(member);
    setShowDeleteModal(true);
  };

  const handleView = (member: TeamMember) => {
    setSelectedItem(member);
    setShowViewModal(true);
  };

  const saveTeamMember = async () => {
    try {
      if (showEditModal && selectedItem) {
        // Update existing member
        const response = await fetch('/api/admin/team', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedItem.id, ...formData })
        });
        
        if (response.ok) {
          await fetchTeamMembers(); // Refresh data
        } else {
          console.error('Failed to update team member');
        }
      } else {
        // Add new member
        const response = await fetch('/api/admin/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          await fetchTeamMembers(); // Refresh data
        } else {
          console.error('Failed to create team member');
        }
      }
    } catch (error) {
      console.error('Error saving team member:', error);
    }
    
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        const response = await fetch(`/api/admin/team?id=${selectedItem.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchTeamMembers(); // Refresh data
        } else {
          console.error('Failed to delete team member');
        }
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
    }
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return { bg: '#dc2626', color: 'white' };
      case 'manager': return { bg: '#d97706', color: 'white' };
      case 'analyst': return { bg: '#059669', color: 'white' };
      case 'support': return { bg: '#3b82f6', color: 'white' };
      default: return { bg: '#6b7280', color: 'white' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', color: '#166534' };
      case 'inactive': return { bg: '#fef2f2', color: '#dc2626' };
      case 'pending': return { bg: '#fef3c7', color: '#92400e' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const roles = ['admin', 'manager', 'analyst', 'support'];
  const statusOptions = ['active', 'inactive', 'pending'];
  const permissionOptions = [
    'full_access',
    'user_management', 
    'analytics',
    'content',
    'team_view',
    'reports',
    'support',
    'user_view'
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
          Team Management
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
          Add Team Member
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
            placeholder="Search team members..."
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
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            minWidth: 120
          }}
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
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

      {/* Team Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredTeam.map(member => (
          <div key={member.id} style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={20} color="#6b7280" />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
                    {member.name}
                  </h3>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Mail size={14} style={{ marginRight: '0.25rem' }} />
                  {member.email}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <Phone size={14} style={{ marginRight: '0.25rem' }} />
                  {member.phone}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  <Shield size={14} style={{ marginRight: '0.25rem' }} />
                  {member.department}
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  ...getRoleColor(member.role)
                }}>
                  {member.role}
                </div>
                
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  ...getStatusColor(member.status)
                }}>
                  {member.status}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                <Calendar size={12} style={{ marginRight: '0.25rem' }} />
                Joined: {member.joinDate} • Last active: {member.lastActive}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleView(member)}
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
                onClick={() => handleEdit(member)}
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
                onClick={() => handleDelete(member)}
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
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {showAddModal ? 'Add Team Member' : 'Edit Team Member'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Permissions:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {permissionOptions.map(permission => (
                    <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              permissions: [...formData.permissions, permission]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              permissions: formData.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>
                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={saveTeamMember}
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
            maxWidth: 600,
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
              <div>
                <strong>Email:</strong> {selectedItem.email}
              </div>
              <div>
                <strong>Phone:</strong> {selectedItem.phone}
              </div>
              <div>
                <strong>Role:</strong> 
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  marginLeft: '0.5rem',
                  ...getRoleColor(selectedItem.role)
                }}>
                  {selectedItem.role}
                </span>
              </div>
              <div>
                <strong>Department:</strong> {selectedItem.department}
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
              <div>
                <strong>Join Date:</strong> {selectedItem.joinDate}
              </div>
              <div>
                <strong>Last Active:</strong> {selectedItem.lastActive}
              </div>
              <div>
                <strong>Permissions:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {selectedItem.permissions.map(permission => (
                    <span key={permission} style={{
                      padding: '0.25rem 0.5rem',
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#374151'
                    }}>
                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
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
              Are you sure you want to remove "{selectedItem.name}" from the team? This action cannot be undone.
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
                Remove
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