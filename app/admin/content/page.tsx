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
  type: 'article' | 'news' | 'market' | 'partnership';
  status: 'published' | 'draft' | 'archived';
  author: string;
  publish_date: string | null;
  last_modified: string;
  views: number;
  content: string;
  tags: string[];
  featured_image_url?: string;
  meta_description?: string;
  seo_keywords?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'article' as 'article' | 'news' | 'market' | 'partnership',
    status: 'draft' as 'published' | 'draft' | 'archived',
    author: '',
    content: '',
    tags: [] as string[],
    featured_image_url: '',
    meta_description: '',
    seo_keywords: ''
  });
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, searchTerm, selectedType, selectedStatus]);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
        setIsUsingMockData(false);
      } else {
        console.error('Failed to load content');
        setIsUsingMockData(true);
        // Fallback to mock data if API fails
        const mockData: ContentItem[] = [
          {
            id: '1',
            title: 'GLG Capital Group Q1 2024 Financial Report',
            type: 'article',
            status: 'published',
            author: 'John Smith',
            publish_date: '2024-01-15',
            last_modified: '2024-01-15T00:00:00Z',
            views: 1247,
            content: 'Comprehensive analysis of GLG Capital Group performance in Q1 2024...',
            tags: ['financial', 'report', 'Q1-2024'],
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            title: 'New Partnership with European Investment Bank',
            type: 'partnership',
            status: 'published',
            author: 'Maria Garcia',
            publish_date: '2024-01-12',
            last_modified: '2024-01-12T00:00:00Z',
            views: 892,
            content: 'GLG Capital Group announces strategic partnership with European Investment Bank...',
            tags: ['partnership', 'europe', 'investment'],
            created_at: '2024-01-12T00:00:00Z',
            updated_at: '2024-01-12T00:00:00Z'
          },
          {
            id: '3',
            title: 'Market Analysis: Tech Sector Trends',
            type: 'market',
            status: 'draft',
            author: 'David Chen',
            publish_date: null,
            last_modified: '2024-01-14T00:00:00Z',
            views: 0,
            content: 'Analysis of current trends in the technology sector and investment opportunities...',
            tags: ['market', 'tech', 'analysis'],
            created_at: '2024-01-14T00:00:00Z',
            updated_at: '2024-01-14T00:00:00Z'
          },
          {
            id: '4',
            title: 'Investment Opportunities in Renewable Energy',
            type: 'news',
            status: 'archived',
            author: 'Sarah Johnson',
            publish_date: '2023-12-20',
            last_modified: '2023-12-20T00:00:00Z',
            views: 2156,
            content: 'Exploring investment opportunities in the growing renewable energy sector...',
            tags: ['renewable', 'energy', 'investment'],
            created_at: '2023-12-20T00:00:00Z',
            updated_at: '2023-12-20T00:00:00Z'
          }
        ];
        setContent(mockData);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setIsUsingMockData(true);
      // Fallback to mock data if API fails
      const mockData: ContentItem[] = [
        {
          id: '1',
          title: 'GLG Capital Group Q1 2024 Financial Report',
          type: 'article',
          status: 'published',
          author: 'John Smith',
          publish_date: '2024-01-15',
          last_modified: '2024-01-15T00:00:00Z',
          views: 1247,
          content: 'Comprehensive analysis of GLG Capital Group performance in Q1 2024...',
          tags: ['financial', 'report', 'Q1-2024'],
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          title: 'New Partnership with European Investment Bank',
          type: 'partnership',
          status: 'published',
          author: 'Maria Garcia',
          publish_date: '2024-01-12',
          last_modified: '2024-01-12T00:00:00Z',
          views: 892,
          content: 'GLG Capital Group announces strategic partnership with European Investment Bank...',
          tags: ['partnership', 'europe', 'investment'],
          created_at: '2024-01-12T00:00:00Z',
          updated_at: '2024-01-12T00:00:00Z'
        },
        {
          id: '3',
          title: 'Market Analysis: Tech Sector Trends',
          type: 'market',
          status: 'draft',
          author: 'David Chen',
          publish_date: null,
          last_modified: '2024-01-14T00:00:00Z',
          views: 0,
          content: 'Analysis of current trends in the technology sector and investment opportunities...',
          tags: ['market', 'tech', 'analysis'],
          created_at: '2024-01-14T00:00:00Z',
          updated_at: '2024-01-14T00:00:00Z'
        },
        {
          id: '4',
          title: 'Investment Opportunities in Renewable Energy',
          type: 'news',
          status: 'archived',
          author: 'Sarah Johnson',
          publish_date: '2023-12-20',
          last_modified: '2023-12-20T00:00:00Z',
          views: 2156,
          content: 'Exploring investment opportunities in the growing renewable energy sector...',
          tags: ['renewable', 'energy', 'investment'],
          created_at: '2023-12-20T00:00:00Z',
          updated_at: '2023-12-20T00:00:00Z'
        }
      ];
      setContent(mockData);
    }
  };

  const filterContent = () => {
    let filtered = content;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredContent(filtered);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      type: 'article',
      status: 'draft',
      author: '',
      content: '',
      tags: [],
      featured_image_url: '',
      meta_description: '',
      seo_keywords: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      status: item.status,
      author: item.author,
      content: item.content,
      tags: item.tags,
      featured_image_url: item.featured_image_url || '',
      meta_description: item.meta_description || '',
      seo_keywords: item.seo_keywords || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (item: ContentItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleView = (item: ContentItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const saveContent = async () => {
    try {
      if (showEditModal && selectedItem) {
        // Update existing item
        const response = await fetch('/api/admin/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedItem.id,
            ...formData
          })
        });

        if (response.ok) {
          const updatedItem = await response.json();
          setContent(content.map(item =>
            item.id === selectedItem.id ? updatedItem : item
          ));
        } else {
          console.error('Failed to update content');
          return;
        }
      } else {
        // Add new item
        const response = await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const newItem = await response.json();
          setContent([newItem, ...content]);
        } else {
          console.error('Failed to create content');
          return;
        }
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        const response = await fetch(`/api/admin/content?id=${selectedItem.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setContent(content.filter(item => item.id !== selectedItem.id));
        } else {
          console.error('Failed to delete content');
        }
      } catch (error) {
        console.error('Error deleting content:', error);
      }
      
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText size={16} />;
      case 'news': return <Globe size={16} />;
      case 'market': return <Image size={16} />;
      case 'partnership': return <Video size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return { bg: '#dcfce7', color: '#166534' };
      case 'draft': return { bg: '#fef3c7', color: '#92400e' };
      case 'archived': return { bg: '#f3f4f6', color: '#374151' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const contentTypes = ['article', 'news', 'market', 'partnership'];
  const statusOptions = ['published', 'draft', 'archived'];

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {isUsingMockData && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong style={{ color: '#92400e' }}>Development Mode</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#92400e', fontSize: '0.9rem' }}>
                Showing mock data due to database connection issues. CRUD operations are simulated.
              </p>
            </div>
          </div>
        )}
        
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
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
            {contentTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
            {statusOptions.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
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
                  {item.views != null ? item.views.toLocaleString() : '-'} views
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
                  background: `${getStatusColor(item.status).bg}20`,
                  color: getStatusColor(item.status).color
                }}>
                  {item.status}
                </span>
              </div>
              
              <div style={{ color: '#64748b' }}>
                {item.author}
              </div>
              
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {new Date(item.last_modified).toLocaleDateString()}
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
              {content.length}
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
              {content.filter(item => item.status === 'published').length}
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
              {content.filter(item => item.status === 'draft').length}
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
              {content.reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
            </div>
            <div style={{ color: '#64748b' }}>Total Views</div>
          </div>
        </div>

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
              {showAddModal ? 'Add Content' : 'Edit Content'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Content title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                {contentTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Author name"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
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
              
              <textarea
                placeholder="Content..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                style={{ 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  minHeight: '150px',
                  resize: 'vertical'
                }}
              />
              
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={saveContent}
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
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                {selectedItem.title}
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
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                By {selectedItem.author} • {selectedItem.publish_date || 'Not published'} • {selectedItem.views} views
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedItem.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '0.25rem 0.5rem',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#374151'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              background: '#f9fafb', 
              borderRadius: '8px',
              lineHeight: 1.6,
              color: '#374151'
            }}>
              {selectedItem.content}
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
              Are you sure you want to delete "{selectedItem.title}"? This action cannot be undone.
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