"use client";
import { useState, useEffect } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export default function AddTeamMemberPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({ name: "", role: "", email: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Carica membri da localStorage all'avvio
  useEffect(() => {
    const stored = localStorage.getItem('teamMembers');
    if (stored) setMembers(JSON.parse(stored));
  }, []);

  // Salva membri su localStorage a ogni modifica
  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(members));
  }, [members]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.email) return;
    if (editingId) {
      setMembers(members.map(m => m.id === editingId ? { ...m, ...form } : m));
      setEditingId(null);
    } else {
      setMembers([...members, { ...form, id: Date.now().toString() }]);
    }
    setForm({ name: "", role: "", email: "" });
  };

  const handleEdit = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      setForm({ name: member.name, role: member.role, email: member.email });
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    if (editingId === id) {
      setForm({ name: "", role: "", email: "" });
      setEditingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Add Team Member</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #e0e3eb" }}
        />
        <input
          name="role"
          placeholder="Role"
          value={form.role}
          onChange={handleChange}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #e0e3eb" }}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #e0e3eb" }}
        />
        <button type="submit" style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: 600, cursor: "pointer" }}>
          {editingId ? "Update Member" : "Add Member"}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setForm({ name: "", role: "", email: "" }); setEditingId(null); }} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 6, padding: 12, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </form>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Team Members</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {members.map(member => (
          <li key={member.id} style={{ background: "#f9fafb", border: "1px solid #e0e3eb", borderRadius: 8, padding: 16, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{member.name}</div>
              <div style={{ color: "#6b7280", fontSize: 14 }}>{member.role}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{member.email}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleEdit(member.id)} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(member.id)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 