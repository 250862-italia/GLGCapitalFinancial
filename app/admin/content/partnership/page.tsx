"use client";
import { useState, useEffect } from "react";

interface Partnership {
  id: string;
  name: string;
  description: string;
  contact: string;
}

export default function AdminPartnershipPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [form, setForm] = useState({ name: "", description: "", contact: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Carica partnership da localStorage all'avvio
  useEffect(() => {
    const stored = localStorage.getItem('partnerships');
    if (stored) setPartnerships(JSON.parse(stored));
  }, []);
  // Salva partnership su localStorage a ogni modifica
  useEffect(() => {
    localStorage.setItem('partnerships', JSON.stringify(partnerships));
  }, [partnerships]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) return;
    if (editingId) {
      setPartnerships(partnerships.map(p => p.id === editingId ? { ...p, ...form } : p));
      setEditingId(null);
    } else {
      setPartnerships([...partnerships, { ...form, id: Date.now().toString() }]);
    }
    setForm({ name: "", description: "", contact: "" });
  };

  const handleEdit = (id: string) => {
    const p = partnerships.find(p => p.id === id);
    if (p) {
      setForm({ name: p.name, description: p.description, contact: p.contact });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    setPartnerships(partnerships.filter(p => p.id !== id));
    if (editingId === id) {
      setForm({ name: "", description: "", contact: "" });
      setEditingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Edit Partnership Info</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        <input
          name="name"
          placeholder="Partnership Name"
          value={form.name}
          onChange={handleChange}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #e0e3eb" }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #e0e3eb", minHeight: 60 }}
        />
        <input
          name="contact"
          placeholder="Contact Info (optional)"
          value={form.contact}
          onChange={handleChange}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #e0e3eb" }}
        />
        <button type="submit" style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: 600, cursor: "pointer" }}>
          {editingId ? "Update Partnership" : "Add Partnership"}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setForm({ name: "", description: "", contact: "" }); setEditingId(null); }} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 6, padding: 12, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </form>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Partnerships</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {partnerships.map(p => (
          <li key={p.id} style={{ background: "#f9fafb", border: "1px solid #e0e3eb", borderRadius: 8, padding: 16, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: "#6b7280", fontSize: 14 }}>{p.description}</div>
              {p.contact && <div style={{ color: "#64748b", fontSize: 13 }}>{p.contact}</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleEdit(p.id)} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(p.id)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 