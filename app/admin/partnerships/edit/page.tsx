"use client";
import { useState, useEffect } from "react";

interface Partnership {
  id: string;
  name: string;
  type: 'strategic' | 'financial' | 'technology' | 'distribution' | 'research';
  status: 'active' | 'pending' | 'expired' | 'terminated';
  startDate: string;
  endDate: string;
  value: number;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  industry: string;
  benefits: string[];
  lastUpdated: string;
}

const types = ['strategic', 'financial', 'technology', 'distribution', 'research'];
const statusOptions = ['active', 'pending', 'expired', 'terminated'];
const benefitOptions = [
  'Market Access',
  'Capital Investment', 
  'Technology Transfer',
  'R&D Collaboration',
  'Market Expansion',
  'Logistics Support',
  'Regulatory Support',
  'Expert Consultation',
  'Data Analytics',
  'Innovation Support'
];

export default function AdminPartnershipEditPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'strategic' as Partnership['type'],
    status: 'pending' as Partnership['status'],
    startDate: '',
    endDate: '',
    value: 0,
    description: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    country: '',
    industry: '',
    benefits: [] as string[]
  });

  useEffect(() => {
    const stored = localStorage.getItem('partnerships');
    if (stored) setPartnerships(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem('partnerships', JSON.stringify(partnerships));
  }, [partnerships]);

  const handleEdit = (id: string) => {
    const p = partnerships.find(x => x.id === id);
    if (p) {
      setForm({
        name: p.name,
        type: p.type,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        value: p.value,
        description: p.description,
        contactPerson: p.contactPerson,
        contactEmail: p.contactEmail,
        contactPhone: p.contactPhone,
        country: p.country,
        industry: p.industry,
        benefits: p.benefits || []
      });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    setPartnerships(partnerships.filter(x => x.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({
        name: '', type: 'strategic', status: 'pending', startDate: '', endDate: '', value: 0, description: '', contactPerson: '', contactEmail: '', contactPhone: '', country: '', industry: '', benefits: []
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? parseFloat(value) || 0 : value });
  };

  const handleBenefitChange = (benefit: string) => {
    setForm(form => ({
      ...form,
      benefits: form.benefits.includes(benefit)
        ? form.benefits.filter(b => b !== benefit)
        : [...form.benefits, benefit]
    }));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setPartnerships(partnerships.map(p => p.id === editingId ? { ...p, ...form, lastUpdated: new Date().toISOString().split('T')[0] } : p));
    setEditingId(null);
    setForm({ name: '', type: 'strategic', status: 'pending', startDate: '', endDate: '', value: 0, description: '', contactPerson: '', contactEmail: '', contactPhone: '', country: '', industry: '', benefits: [] });
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Edit Partnership Details</h1>
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
        {partnerships.map(p => (
          <li key={p.id} style={{ background: '#f9fafb', border: '1px solid #e0e3eb', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>{p.type} • {p.status}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{p.country} • {p.industry}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleEdit(p.id)} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              <button onClick={() => handleDelete(p.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {editingId && (
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, background: '#fff', border: '1px solid #e0e3eb', borderRadius: 8, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Edit Partnership</h2>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          <select name="type" value={form.type} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }}>
            {types.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
          </select>
          <select name="status" value={form.status} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }}>
            {statusOptions.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <input name="startDate" type="date" placeholder="Start date" value={form.startDate} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
            <input name="endDate" type="date" placeholder="End date" value={form.endDate} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          </div>
          <input name="value" type="number" placeholder="Value ($)" value={form.value} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb', minHeight: 60 }} />
          <input name="contactPerson" placeholder="Contact person" value={form.contactPerson} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          <input name="contactEmail" type="email" placeholder="Contact email" value={form.contactEmail} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          <input name="contactPhone" placeholder="Contact phone" value={form.contactPhone} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          <input name="country" placeholder="Country" value={form.country} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          <input name="industry" placeholder="Industry" value={form.industry} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e0e3eb' }} />
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Benefits:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {benefitOptions.map(benefit => (
                <label key={benefit} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={form.benefits.includes(benefit)} onChange={() => handleBenefitChange(benefit)} />
                  <span style={{ fontSize: 13 }}>{benefit}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontWeight: 600, cursor: 'pointer' }}>
            Update Partnership
          </button>
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', type: 'strategic', status: 'pending', startDate: '', endDate: '', value: 0, description: '', contactPerson: '', contactEmail: '', contactPhone: '', country: '', industry: '', benefits: [] }); }} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, padding: 12, fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
} 