"use client";
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

const HARDCODED_SUPABASE_URL = "https://dobjulfwktzltpvqtxbql.supabase.co";
const HARDCODED_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY";
const supabase = createClient(HARDCODED_SUPABASE_URL, HARDCODED_SUPABASE_ANON_KEY);

export default function PackagesDebugPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    supabase.from('packages').select('*').then(({ data, error }) => {
      if (error) setError(error.message);
      else setData(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>DEBUG PACCHETTI SUPABASE</h1>
      {loading && <div style={{ background: '#e0e7ff', color: '#3730a3', padding: 12, fontWeight: 600, marginBottom: 16 }}>Caricamento pacchetti da Supabase...</div>}
      {error && <div style={{ background: '#fee', color: '#900', padding: 16, fontWeight: 700, marginBottom: 16 }}>ERRORE FETCH SUPABASE: {error}</div>}
      {data.length > 0 && <pre style={{ background: '#f0fdf4', color: '#166534', padding: 12, fontWeight: 600, marginBottom: 16 }}>{JSON.stringify(data, null, 2)}</pre>}
      {data.length === 0 && !loading && !error && <div>Nessun pacchetto trovato.</div>}
    </div>
  );
} 