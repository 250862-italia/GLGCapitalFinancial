"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState({
    url: '',
    anonKey: '',
    serviceKey: ''
  });

  useEffect(() => {
    // Imposta le informazioni delle variabili d'ambiente solo lato client
    setEnvInfo({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Non configurato',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
        'Non configurato',
      serviceKey: 'Configurato (non visibile lato client)' // Service role key non è accessibile lato client
    });

    async function testConnection() {
      try {
        setStatus('Testing connection...');
        
        // Test 1: Verifica connessione di base
        console.log('Testing Supabase connection...');
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
        
        // Test 2: Prova a fare una query semplice
        const { data: testData, error } = await supabase
          .from('notes')
          .select('*')
          .limit(1);

        console.log('Supabase response:', { data: testData, error });

        if (error) {
          console.error('Supabase error:', error);
          setError(`Supabase Error: ${error.message} (Code: ${error.code})`);
          setStatus('❌ Errore Supabase');
        } else {
          setStatus('✅ Connessione a Supabase riuscita!');
          setError(null);
          setData(testData);
        }
      } catch (err: any) {
        console.error('Connection error:', err);
        setError(`Network Error: ${err.message}`);
        setStatus('❌ Errore di rete');
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>Test Connessione Supabase</h1>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h3>Status: {status}</h3>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h4>Errore dettagliato:</h4>
          <p>{error}</p>
        </div>
      )}

      <div style={{
        backgroundColor: '#e8f4fd',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h4>Configurazione:</h4>
        <p><strong>URL Supabase:</strong> {envInfo.url}</p>
        <p><strong>Chiave Anon:</strong> {envInfo.anonKey}</p>
        <p><strong>Service Role Key:</strong> {envInfo.serviceKey}</p>
        <p><strong>Tabella testata:</strong> notes</p>
        <p><strong>Policy RLS:</strong> Dovrebbe essere configurata per accesso anonimo</p>
      </div>

      {data && (
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '1rem',
          borderRadius: '8px'
        }}>
          <h4>Dati ricevuti dalla tabella notes:</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <h4>🔧 Passi per risolvere:</h4>
        <ol>
          <li><strong>Verifica il progetto Supabase:</strong> Vai su <a href="https://supabase.com/dashboard" target="_blank">Supabase Dashboard</a> e controlla che il progetto sia attivo</li>
          <li><strong>Verifica la tabella:</strong> Nel SQL Editor di Supabase, esegui: <code>SELECT * FROM notes LIMIT 1;</code></li>
          <li><strong>Verifica la policy:</strong> Esegui: <code>SELECT * FROM pg_policies WHERE tablename = 'notes';</code></li>
          <li><strong>Se la policy non esiste:</strong> Esegui: <code>CREATE POLICY "public can read countries" ON notes FOR SELECT TO anon USING (true);</code></li>
          <li><strong>Controlla la console del browser</strong> (F12 → Console) per errori dettagliati</li>
        </ol>
      </div>
    </div>
  );
} 