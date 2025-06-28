"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Globe, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  Calendar,
  User,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'news' | 'market' | 'partnership';
  status: 'published' | 'draft' | 'archived';
  author: string;
  lastModified: Date;
  views: number;
  url: string;
}

export default function AdminContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData: ContentItem[] = [
        {
          id: '1',
          title: 'Homepage',
          type: 'page',
          status: 'published',
          author: 'Admin',
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          views: 15420,
          url: '/'
        },
        {
          id: '2',
          title: 'About Us',
          type: 'page',
          status: 'published',
          author: 'Admin',
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          views: 3240,
          url: '/about'
        },
        {
          id: '3',
          title: 'Contact Information',
          type: 'page',
          status: 'published',
          author: 'Admin',
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          views: 1890,
          url: '/contact'
        },
        {
          id: '4',
          title: 'Market Analysis Q4 2024',
          type: 'market',
          status: 'published',
          author: 'Analyst Team',
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
          views: 5670,
          url: '/live-markets'
        },
        {
          id: '5',
          title: 'New Partnership Announcement',
          type: 'partnership',
          status: 'draft',
          author: 'Marketing Team',
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          views: 0,
          url: '/admin/content/partnership'
        },
        {
          id: '6',
          title: 'Investment Opportunities Update',
          type: 'news',
          status: 'published',
          author: 'Investment Team',
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          views: 2890,
          url: '/investments'
        }
      ];

      setContentItems(mockData);
    } catch (error) {
      console.error('Error loading content data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <FileText size={16} />;
      case 'news':
        return <Globe size={16} />;
      case 'market':
        return <Image size={16} />;
      case 'partnership':
        return <Video size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#059669';
      case 'draft':
        return '#d97706';
      case 'archived':
        return '#6b7280';
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

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
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
          <p style={{ color: '#64748b' }}>Loading Content...</p>
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
            Content Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Manage all website content, pages, and media
          </p>
        </div>

        {/* Quick Navigation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <a href="/admin/content/news" style={{
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
            <Globe size={20} style={{ marginRight: '0.5rem' }} />
            <span>News Management</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/content/markets" style={{
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
            <Image size={20} style={{ marginRight: '0.5rem' }} />
            <span>Markets Content</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/content/partnership" style={{
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
            <Video size={20} style={{ marginRight: '0.5rem' }} />
            <span>Partnership Content</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
        </div>

        {/* Search and Filter */}
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
                placeholder="Search content..."
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: '1rem',
              background: '#fff',
              minWidth: 150
            }}
          >
            <option value="all">All Types</option>
            <option value="page">Pages</option>
            <option value="news">News</option>
            <option value="market">Markets</option>
            <option value="partnership">Partnerships</option>
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
            New Content
          </button>
        </div>

        {/* Content List */}
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
            <div>Title</div>
            <div>Type</div>
            <div>Status</div>
            <div>Author</div>
            <div>Last Modified</div>
            <div>Actions</div>
          </div>

          {/* Table Rows */}
          {filteredContent.map((item) => (
            <div key={item.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: '1rem',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1a2238', marginBottom: '0.25rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {item.views.toLocaleString()} views
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getTypeIcon(item.type)}
                <span style={{ marginLeft: '0.5rem', textTransform: 'capitalize' }}>
                  {item.type}
                </span>
              </div>
              
              <div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: `${getStatusColor(item.status)}20`,
                  color: getStatusColor(item.status)
                }}>
                  {item.status}
                </span>
              </div>
              
              <div style={{ color: '#64748b' }}>
                {item.author}
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {formatTimeAgo(item.lastModified)}
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
                  <Eye size={16} />
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
              {contentItems.length}
            </div>
            <div style={{ color: '#64748b' }}>Total Items</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>
              {contentItems.filter(item => item.status === 'published').length}
            </div>
            <div style={{ color: '#64748b' }}>Published</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d97706' }}>
              {contentItems.filter(item => item.status === 'draft').length}
            </div>
            <div style={{ color: '#64748b' }}>Drafts</div>
          </div>
          
          <div style={{ 
            background: '#fff', 
            padding: '1rem', 
            borderRadius: 8, 
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a2238' }}>
              {contentItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
            </div>
            <div style={{ color: '#64748b' }}>Total Views</div>
          </div>
        </div>

      </div>
    </div>
  );
} 