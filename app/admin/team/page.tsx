"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Shield,
  Crown
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin' | 'moderator' | 'analyst' | 'support';
  status: 'active' | 'inactive' | 'pending';
  joinDate: Date;
  lastLogin: Date;
  permissions: string[];
  avatar?: string;
}

export default function AdminTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData: TeamMember[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'admin@glgcapitalgroupllc.com',
          role: 'superadmin',
          status: 'active',
          joinDate: new Date('2024-01-15'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          permissions: ['all']
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@glgcapitalgroupllc.com',
          role: 'admin',
          status: 'active',
          joinDate: new Date('2024-02-01'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          permissions: ['users', 'content', 'analytics']
        },
        {
          id: '3',
          name: 'Michael Chen',
          email: 'michael.chen@glgcapitalgroupllc.com',
          role: 'analyst',
          status: 'active',
          joinDate: new Date('2024-02-15'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          permissions: ['analytics', 'reports']
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@glgcapitalgroupllc.com',
          role: 'moderator',
          status: 'active',
          joinDate: new Date('2024-03-01'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          permissions: ['users', 'content']
        },
        {
          id: '5',
          name: 'David Wilson',
          email: 'david.wilson@glgcapitalgroupllc.com',
          role: 'support',
          status: 'pending',
          joinDate: new Date('2024-03-15'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
          permissions: ['support']
        },
        {
          id: '6',
          name: 'Lisa Brown',
          email: 'lisa.brown@glgcapitalgroupllc.com',
          role: 'analyst',
          status: 'inactive',
          joinDate: new Date('2024-01-20'),
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
          permissions: ['analytics']
        }
      ];

      setTeamMembers(mockData);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown size={16} />;
      case 'admin':
        return <Shield size={16} />;
      case 'moderator':
        return <UserCheck size={16} />;
      case 'analyst':
        return <Users size={16} />;
      case 'support':
        return <Phone size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return '#dc2626';
      case 'admin':
        return '#1d4ed8';
      case 'moderator':
        return '#059669';
      case 'analyst':
        return '#d97706';
      case 'support':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#059669';
      case 'inactive':
        return '#6b7280';
      case 'pending':
        return '#d97706';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading Team Data...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#1a2238', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '0.5rem' 
          }}>
            Team Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Manage team members, roles, and permissions
          </p>
        </div>

        {/* Quick Navigation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <a href="/admin/team/overview" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Users size={20} style={{ marginRight: '0.5rem' }} />
            <span>Team Overview</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/team/add" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <UserPlus size={20} style={{ marginRight: '0.5rem' }} />
            <span>Add Team Member</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/team/edit" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Edit size={20} style={{ marginRight: '0.5rem' }} />
            <span>Edit Permissions</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
        </div>

        {/* Search and Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#64748b' 
              }} />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: '1rem',
                  background: '#fff'
                }}
              />
            </div>
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: '1rem',
              background: '#fff',
              minWidth: 150
            }}
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="analyst">Analyst</option>
            <option value="support">Support</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: '1rem',
              background: '#fff',
              minWidth: 150
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          
          <button style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            background: '#1a2238',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Add Member
          </button>
        </div>

        {/* Team Members List */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
            gap: '1rem',
            padding: '1rem 1.5rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 600,
            color: '#374151'
          }}>
            <div>Member</div>
            <div>Role</div>
            <div>Status</div>
            <div>Join Date</div>
            <div>Last Login</div>
            <div>Actions</div>
          </div>

          {/* Table Rows */}
          {filteredMembers.map((member) => (
            <div key={member.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '1rem',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1a2238', marginBottom: '0.25rem' }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {member.email}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getRoleIcon(member.role)}
                <span style={{ 
                  marginLeft: '0.5rem', 
                  textTransform: 'capitalize',
                  color: getRoleColor(member.role),
                  fontWeight: 600
                }}>
                  {member.role}
                </span>
              </div>
              
              <div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: `${getStatusColor(member.status)}20`,
                  color: getStatusColor(member.status)
                }}>
                  {member.status}
                </span>
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {member.joinDate.toLocaleDateString()}
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {formatTimeAgo(member.lastLogin)}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  padding: '0.5rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#64748b'
                }}>
                  <Mail size={16} />
                </button>
                <button style={{
                  padding: '0.5rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#64748b'
                }}>
                  <Edit size={16} />
                </button>
                <button style={{
                  padding: '0.5rem',
                  background: '#fef2f2',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#dc2626'
                }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
              {teamMembers.length}
            </div>
            <div style={{ color: '#64748b' }}>Total Members</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>
              {teamMembers.filter(member => member.status === 'active').length}
            </div>
            <div style={{ color: '#64748b' }}>Active Members</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d97706' }}>
              {teamMembers.filter(member => member.status === 'pending').length}
            </div>
            <div style={{ color: '#64748b' }}>Pending</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1d4ed8' }}>
              {teamMembers.filter(member => member.role === 'admin' || member.role === 'superadmin').length}
            </div>
            <div style={{ color: '#64748b' }}>Administrators</div>
          </div>
        </div>

      </div>
    </div>
  );
} 