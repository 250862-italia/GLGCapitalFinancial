"use client";
import { useState } from "react";

export default function DiagnosticsPage() {
  const [table, setTable] = useState("");
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      // Ora chiama la route API Next.js locale
      const res = await fetch(`/api/diagnostics?table=${table}`);
      const json = await res.json();
      if (json.error) setError(json.error.message || JSON.stringify(json.error));
      else setInfo(json.data);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <h1>Diagnostica Tabella Database</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={table}
          onChange={e => setTable(e.target.value)}
          placeholder="Nome tabella (es: packages)"
          style={{ flex: 1, padding: 8, border: '1px solid #e5e7eb', borderRadius: 4 }}
        />
        <button
          onClick={fetchInfo}
          disabled={!table || loading}
          style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', border: 0, borderRadius: 4, fontWeight: 600 }}
        >
          Analizza
        </button>
      </div>
      {loading && <div style={{ color: '#2563eb', marginBottom: 16 }}>Caricamento...</div>}
      {error && <div style={{ color: '#b91c1c', marginBottom: 16 }}>Errore: {error}</div>}
      {info && (
        <pre style={{ background: '#f3f4f6', padding: 16, borderRadius: 8, marginTop: 16 }}>
          {JSON.stringify(info, null, 2)}
        </pre>
      )}
    </div>
  );
} 