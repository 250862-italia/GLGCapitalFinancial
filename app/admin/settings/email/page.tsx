"use client";

import { useState, useEffect } from 'react';
import { Mail, Save, TestTube, CheckCircle, AlertCircle, Settings, Key, Globe, Users } from 'lucide-react';

interface EmailConfig {
  service: 'resend' | 'sendgrid' | 'aws-ses';
  apiKey: string;
  fromEmail: string;
  surveillanceEmail: string;
  supportEmail: string;
  adminEmail: string;
}

export default function EmailSettingsPage() {
  const [config, setConfig] = useState<EmailConfig>({
    service: 'resend',
    apiKey: '',
    fromEmail: 'noreply@glgcapitalgroupllc.com',
    surveillanceEmail: 'push@glgcapitalgroupllc.com',
    supportEmail: 'support@glgcapitalgroupllc.com',
    adminEmail: 'admin@glgcapitalgroupllc.com'
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Carica configurazione esistente
  useEffect(() => {
    const savedConfig = localStorage.getItem('emailConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = async () => {
    setStatus('loading');
    setMessage('Salvataggio configurazione...');

    try {
      // Salva in localStorage (in produzione andrebbe nel database)
      localStorage.setItem('emailConfig', JSON.stringify(config));
      
      // Aggiorna le variabili d'ambiente (simulato)
      await fetch('/api/update-email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      setStatus('success');
      setMessage('✅ Configurazione salvata con successo!');
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Errore: ${error}`);
    }
  };

  const handleTest = async () => {
    setTestStatus('loading');
    setMessage('Invio email di test...');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: config.surveillanceEmail,
          subject: 'Test Configurazione Email - GLG Dashboard',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">✅ Test Configurazione Email</h2>
              <p>La configurazione email è stata testata con successo!</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Dettagli configurazione:</h3>
                <ul>
                  <li><strong>Servizio:</strong> ${config.service.toUpperCase()}</li>
                  <li><strong>Email mittente:</strong> ${config.fromEmail}</li>
                  <li><strong>Email sorveglianza:</strong> ${config.surveillanceEmail}</li>
                  <li><strong>Data test:</strong> ${new Date().toLocaleString('it-IT')}</li>
                </ul>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Se ricevi questa email, significa che il sistema è configurato correttamente.
              </p>
            </div>
          `
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTestStatus('success');
        setMessage('✅ Email di test inviata con successo! Controlla la tua casella email.');
      } else {
        setTestStatus('error');
        setMessage(`❌ Errore: ${data.error || 'Errore sconosciuto'}`);
      }
    } catch (error) {
      setTestStatus('error');
      setMessage(`❌ Errore di connessione: ${error}`);
    }
  };

  return (
    <div style={{
      padding: '30px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '15px'
        }}>
          <Mail style={{ color: '#2563eb', width: '32px', height: '32px' }} />
          <h1 style={{ color: '#1e293b', margin: 0 }}>Configurazione Email</h1>
        </div>

        {/* Servizio Email */}
        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#475569', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings style={{ width: '20px', height: '20px' }} />
            Servizio Email
          </h3>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { value: 'resend', label: 'Resend', desc: 'Gratuito (100 email/mese)', color: '#10b981' },
              { value: 'sendgrid', label: 'SendGrid', desc: 'Gratuito (100 email/giorno)', color: '#f59e0b' },
              { value: 'aws-ses', label: 'AWS SES', desc: 'A pagamento', color: '#ef4444' }
            ].map(service => (
              <label key={service.value} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px',
                border: `2px solid ${config.service === service.value ? service.color : '#e2e8f0'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: config.service === service.value ? `${service.color}10` : 'white'
              }}>
                <input
                  type="radio"
                  name="service"
                  value={service.value}
                  checked={config.service === service.value}
                  onChange={(e) => setConfig(prev => ({ ...prev, service: e.target.value as any }))}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{service.label}</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>{service.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Configurazione API */}
        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#475569', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key style={{ width: '20px', height: '20px' }} />
            Configurazione API
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                Chiave API
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder={config.service === 'resend' ? 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : 
                           config.service === 'sendgrid' ? 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : 
                           'AKIA...'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                {config.service === 'resend' && 'Vai su https://resend.com per ottenere la chiave API'}
                {config.service === 'sendgrid' && 'Vai su https://sendgrid.com per ottenere la chiave API'}
                {config.service === 'aws-ses' && 'Configura AWS SES e ottieni le credenziali'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                Email Mittente
              </label>
              <input
                type="email"
                value={config.fromEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                placeholder="noreply@glgcapitalgroupllc.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Email di Destinazione */}
        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '25px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#475569', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '20px', height: '20px' }} />
            Email di Destinazione
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                Email Sorveglianza (riceve tutte le notifiche)
              </label>
              <input
                type="email"
                value={config.surveillanceEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, surveillanceEmail: e.target.value }))}
                placeholder="push@glgcapitalgroupllc.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Email Supporto
                </label>
                <input
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) => setConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                  placeholder="support@glgcapitalgroupllc.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Email Admin
                </label>
                <input
                  type="email"
                  value={config.adminEmail}
                  onChange={(e) => setConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
                  placeholder="admin@glgcapitalgroupllc.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleSave}
            disabled={status === 'loading'}
            style={{
              backgroundColor: status === 'loading' ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save style={{ width: '18px', height: '18px' }} />
            {status === 'loading' ? 'Salvando...' : 'Salva Configurazione'}
          </button>

          <button
            onClick={handleTest}
            disabled={testStatus === 'loading' || !config.apiKey}
            style={{
              backgroundColor: testStatus === 'loading' || !config.apiKey ? '#9ca3af' : '#10b981',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: testStatus === 'loading' || !config.apiKey ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TestTube style={{ width: '18px', height: '18px' }} />
            {testStatus === 'loading' ? 'Invio Test...' : 'Invia Email di Test'}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '6px',
            backgroundColor: status === 'success' || testStatus === 'success' ? '#dcfce7' : 
                           status === 'error' || testStatus === 'error' ? '#fee2e2' : '#f3f4f6',
            color: status === 'success' || testStatus === 'success' ? '#166534' : 
                   status === 'error' || testStatus === 'error' ? '#dc2626' : '#374151',
            border: `1px solid ${status === 'success' || testStatus === 'success' ? '#22c55e' : 
                                status === 'error' || testStatus === 'error' ? '#ef4444' : '#d1d5db'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {status === 'success' || testStatus === 'success' ? 
              <CheckCircle style={{ width: '20px', height: '20px' }} /> : 
              status === 'error' || testStatus === 'error' ? 
              <AlertCircle style={{ width: '20px', height: '20px' }} /> : null}
            {message}
          </div>
        )}

        {/* Informazioni */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b'
        }}>
          <h4 style={{ color: '#92400e', marginBottom: '15px' }}>📋 Tipi di email configurate:</h4>
          <ul style={{ color: '#92400e', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
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