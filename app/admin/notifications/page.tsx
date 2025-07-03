"use client";
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://dobjulfwktzltpvqtxbql.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY"
);

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('sent_at', { ascending: false });
      if (!error && data) setNotifications(data);
      else setError(error?.message || "Errore caricamento notifiche");
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)", padding: "2rem" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Storico Notifiche/Email Inviate</h1>
      {error && <div style={{ color: '#dc2626', marginBottom: 16 }}>{error}</div>}
      {loading ? (
        <div>Caricamento...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e3eb" }}>
                <th style={{ textAlign: "left", padding: "1rem" }}>Destinatario</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Tipo</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Titolo</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Stato</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Data invio</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} style={{ borderBottom: "1px solid #e0e3eb" }}>
                  <td style={{ padding: "1rem" }}>{n.email}</td>
                  <td style={{ padding: "1rem" }}>{n.type}</td>
                  <td style={{ padding: "1rem" }}>{n.title}</td>
                  <td style={{ padding: "1rem" }}>{n.status}</td>
                  <td style={{ padding: "1rem" }}>{new Date(n.sent_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 