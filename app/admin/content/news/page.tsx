"use client";
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

const initialNews: NewsArticle[] = [
  {
    id: "1",
    title: "GLG Capital Group launches new equity pledge program",
    content: "GLG Capital Group has announced a new equity pledge program to empower investors and partners.",
    author: "Admin",
    date: "2024-06-01"
  },
  {
    id: "2",
    title: "Quarterly returns exceed expectations",
    content: "The latest quarterly report shows returns above market average for all managed positions.",
    author: "Finance Team",
    date: "2024-05-15"
  }
];

export default function NewsManagementPage() {
  const [news, setNews] = useState<NewsArticle[]>(initialNews);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    id: undefined,
    title: "",
    content: "",
    author: "",
    date: ""
  });

  const openAddForm = () => {
    setFormData({ id: undefined, title: "", content: "", author: "", date: "" });
    setIsEdit(false);
    setShowForm(true);
  };

  const openEditForm = (article: NewsArticle) => {
    setFormData(article);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setNews(news.filter(n => n.id !== id));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && formData.id) {
      setNews(news.map(n => n.id === formData.id ? (formData as NewsArticle) : n));
    } else {
      const newArticle: NewsArticle = {
        ...formData as NewsArticle,
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10)
      };
      setNews([...news, newArticle]);
    }
    setShowForm(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>News Management</h1>
      <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8, marginBottom: '2rem' }}>Manage news articles and press releases</p>
      <button onClick={openAddForm} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', fontWeight: 600, marginBottom: 24, cursor: 'pointer' }}>
        <Plus size={18} /> Add News
      </button>
      {/* News Table */}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr style={{ background: 'var(--secondary)' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Title</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Content</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Author</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map(article => (
              <tr key={article.id} style={{ borderBottom: '1px solid #e0e3eb' }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{article.title}</td>
                <td style={{ padding: 12, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.content}</td>
                <td style={{ padding: 12 }}>{article.author}</td>
                <td style={{ padding: 12 }}>{article.date}</td>
                <td style={{ padding: 12 }}>
                  <button onClick={() => openEditForm(article)} style={{ marginRight: 8, background: 'var(--accent)', color: 'var(--primary)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(article.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleFormSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 350, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
            <h2 style={{ marginBottom: 16 }}>{isEdit ? 'Edit News' : 'Add News'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input name="title" value={formData.title || ''} onChange={handleFormChange} placeholder="Title" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
              <textarea name="content" value={formData.content || ''} onChange={handleFormChange} placeholder="Content" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb', minHeight: 80 }} />
              <input name="author" value={formData.author || ''} onChange={handleFormChange} placeholder="Author" required style={{ padding: 8, borderRadius: 6, border: '1px solid #e0e3eb' }} />
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