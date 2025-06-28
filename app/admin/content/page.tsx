"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Globe, 
  Building,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User
} from 'lucide-react';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('news');

  const contentSections = [
    {
      id: 'news',
      name: 'News Management',
      icon: FileText,
      description: 'Manage financial news and market updates',
      href: '/admin/content/news'
    },
    {
      id: 'markets',
      name: 'Markets Content',
      icon: Globe,
      description: 'Manage market data and financial content',
      href: '/admin/content/markets'
    },
    {
      id: 'partnership',
      name: 'Partnership Content',
      icon: Building,
      description: 'Manage partnership announcements and content',
      href: '/admin/content/partnership'
    }
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      
      {/* HEADER */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Content Management</h1>
        <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8 }}>
          Manage all website content, news, and market information
        </p>
      </section>

      {/* NAVIGATION TABS */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {contentSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                border: 'none',
                background: activeTab === section.id ? 'var(--primary)' : 'var(--secondary)',
                color: activeTab === section.id ? '#fff' : 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <section.icon size={16} />
              {section.name}
            </button>
          ))}
        </div>
      </section>

      {/* CONTENT SECTIONS */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {contentSections.map((section) => (
            <div key={section.id} style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              border: '2px solid #e0e3eb',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <section.icon size={32} style={{ color: 'var(--primary)' }} />
                <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                  {section.name}
                </h3>
              </div>
              
              <p style={{ color: 'var(--foreground)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {section.description}
              </p>
              
              <Link href={section.href} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--primary)',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}>
                <Eye size={16} />
                Manage Content
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section style={{ marginTop: '3rem', padding: '2rem', background: '#f8fafc', borderRadius: 12 }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#10b981',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <Plus size={16} />
            Add News Article
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#3b82f6',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <Globe size={16} />
            Update Market Data
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#8b5cf6',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <Building size={16} />
            Add Partnership
          </button>
        </div>
      </section>

    </div>
  );
} 