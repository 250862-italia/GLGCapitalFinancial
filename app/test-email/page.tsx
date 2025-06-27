"use client";

import { useState } from 'react';

export default function TestEmailPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testEmail = async () => {
    setStatus('loading');
    setMessage('Invio email di test...');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'push@glgcapitalgroupllc.com',
          subject: 'Test Email - GLG Dashboard',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Test Email - GLG Dashboard</h2>
              <p>Questa è una email di test per verificare che il sistema email funzioni correttamente.</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Dettagli del test:</h3>
                <ul>
                  <li><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</li>
                  <li><strong>Server:</strong> ${window.location.hostname}</li>
                  <li><strong>Status:</strong> Sistema email funzionante</li>
                </ul>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Se ricevi questa email, significa che il sistema di notifiche è configurato correttamente.
              </p>
            </div>
          `
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('✅ Email inviata con successo! Controlla la tua casella email.');
      } else {
        setStatus('error');
        setMessage(`❌ Errore: ${data.error || 'Errore sconosciuto'}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Errore di connessione: ${error}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          color: '#1e293b',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          🧪 Test Sistema Email
        </h1>

        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#475569', marginBottom: '15px' }}>
            Configurazione Richiesta:
          </h3>
          <ul style={{ color: '#64748b', lineHeight: '1.6' }}>
            <li>✅ API Route creata: <code>/api/send-email</code></li>
            <li>✅ Servizio email configurato</li>
            <li>⚠️ <strong>Chiave API mancante</strong> - Aggiungi RESEND_API_KEY in .env.local</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #f59e0b'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '10px' }}>
            📋 Istruzioni per configurare:
          </h3>
          <ol style={{ color: '#92400e', lineHeight: '1.6' }}>
            <li>Vai su <a href="https://resend.com" target="_blank" style={{ color: '#2563eb' }}>https://resend.com</a></li>
            <li>Registrati con la tua email</li>
            <li>Verifica il dominio glgcapitalgroupllc.com</li>
            <li>Copia la chiave API</li>
            <li>Aggiungi <code>RESEND_API_KEY=re_xxxxxxxxx</code> in .env.local</li>
            <li>Riavvia il server</li>
          </ol>
        </div>

        <button
          onClick={testEmail}
          disabled={status === 'loading'}
          style={{
            backgroundColor: status === 'loading' ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            width: '100%',
            marginBottom: '20px'
          }}
        >
          {status === 'loading' ? '⏳ Invio in corso...' : '📧 Invia Email di Test'}
        </button>

        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '6px',
            backgroundColor: status === 'success' ? '#dcfce7' : 
                           status === 'error' ? '#fee2e2' : '#f3f4f6',
            color: status === 'success' ? '#166534' : 
                   status === 'error' ? '#dc2626' : '#374151',
            border: `1px solid ${status === 'success' ? '#22c55e' : 
                                status === 'error' ? '#ef4444' : '#d1d5db'}`
          }}>
            {message}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#475569', marginBottom: '15px' }}>
            📧 Tipi di email configurate:
          </h3>
          <ul style={{ color: '#64748b', lineHeight: '1.6' }}>
            <li>🔔 Notifiche registrazione utenti</li>
            <li>📋 Invio documenti KYC</li>
            <li>💰 Acquisto pacchetti</li>
            <li>💳 Pagamenti processati</li>
            <li>👥 Attività clienti</li>
            <li>⚙️ Azioni amministrative</li>
            <li>🚨 Allerte di sistema</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 