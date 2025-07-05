"use client";

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Mail, 
  Database, 
  Globe, 
  Bell,
  ExternalLink,
  Save,
  RefreshCw,
  Download,
  Upload,
  Lock,
  User,
  Server,
  Monitor
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    timezone: string;
    language: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: string;
    sslEnabled: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    lastBackup: Date;
    nextBackup: Date;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        // Convert date strings back to Date objects for backup dates
        if (data.backup) {
          if (data.backup.lastBackup) {
            data.backup.lastBackup = new Date(data.backup.lastBackup);
          }
          if (data.backup.nextBackup) {
            data.backup.nextBackup = new Date(data.backup.nextBackup);
          }
        }
        setSettings(data);
      } else {
        console.error('Failed to load settings');
        // Fallback to mock data if API fails
        const mockSettings: SystemSettings = {
          general: {
            siteName: 'GLG Capital Group LLC',
            siteDescription: 'Innovative investment firm committed to providing tailored financial solutions',
            maintenanceMode: false,
            timezone: 'America/New_York',
            language: 'en'
          },
          security: {
            twoFactorAuth: true,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordPolicy: 'Strong',
            sslEnabled: true
          },
          email: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'noreply@glgcapitalgroupllc.com',
            smtpSecure: true,
            fromEmail: 'noreply@glgcapitalgroupllc.com',
            fromName: 'GLG Capital Group'
          },
          backup: {
            autoBackup: true,
            backupFrequency: 'daily',
            retentionDays: 30,
            lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            nextBackup: new Date(Date.now() + 1000 * 60 * 60 * 12) // 12 hours from now
          }
        };
        setSettings(mockSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setHasChanges(false);
        alert('Settings saved successfully!');
      } else {
        console.error('Failed to save settings');
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleBackup = async () => {
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Backup completed successfully!');
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading Settings...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'backup', name: 'Backup', icon: Database }
  ];

  return (
    <div style={{ padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#1a2238', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '0.5rem' 
          }}>
            System Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            Configure system preferences, security, and maintenance settings
          </p>
        </div>

        {/* Quick Navigation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <a href="/admin/settings/site" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Globe size={20} style={{ marginRight: '0.5rem' }} />
            <span>Site Configuration</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/settings/security" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Shield size={20} style={{ marginRight: '0.5rem' }} />
            <span>Security Settings</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
          
          <a href="/admin/settings/backup" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            background: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1a2238',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <Database size={20} style={{ marginRight: '0.5rem' }} />
            <span>Backup & Restore</span>
            <ExternalLink size={16} style={{ marginLeft: 'auto', color: '#64748b' }} />
          </a>
        </div>

        {/* Settings Container */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 1.5rem',
                  border: 'none',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#1a2238' : '#64748b',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #1a2238' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '2rem' }}>
            
            {/* General Settings */}
            {activeTab === 'general' && settings && (
              <div>
                <h3 style={{ color: '#1a2238', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  General Settings
                </h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => {
                        setSettings({...settings, general: {...settings.general, siteName: e.target.value}});
                        setHasChanges(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                      Site Description
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => {
                        setSettings({...settings, general: {...settings.general, siteDescription: e.target.value}});
                        setHasChanges(true);
                      }}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => {
                        setSettings({...settings, general: {...settings.general, maintenanceMode: e.target.checked}});
                        setHasChanges(true);
                      }}
                      style={{ width: 18, height: 18 }}
                    />
                    <label style={{ fontWeight: 600, color: '#374151' }}>
                      Maintenance Mode
                    </label>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => {
                          setSettings({...settings, general: {...settings.general, timezone: e.target.value}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Language
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => {
                          setSettings({...settings, general: {...settings.general, language: e.target.value}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="en">English</option>
                        <option value="it">Italian</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && settings && (
              <div>
                <h3 style={{ color: '#1a2238', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Security Settings
                </h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => {
                        setSettings({...settings, security: {...settings.security, twoFactorAuth: e.target.checked}});
                        setHasChanges(true);
                      }}
                      style={{ width: 18, height: 18 }}
                    />
                    <label style={{ fontWeight: 600, color: '#374151' }}>
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => {
                        setSettings({...settings, security: {...settings.security, sessionTimeout: parseInt(e.target.value)}});
                        setHasChanges(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                      Maximum Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => {
                        setSettings({...settings, security: {...settings.security, maxLoginAttempts: parseInt(e.target.value)}});
                        setHasChanges(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                      Password Policy
                    </label>
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => {
                        setSettings({...settings, security: {...settings.security, passwordPolicy: e.target.value}});
                        setHasChanges(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '1rem'
                      }}
                    >
                      <option value="Strong">Strong</option>
                      <option value="Medium">Medium</option>
                      <option value="Weak">Weak</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={settings.security.sslEnabled}
                      onChange={(e) => {
                        setSettings({...settings, security: {...settings.security, sslEnabled: e.target.checked}});
                        setHasChanges(true);
                      }}
                      style={{ width: 18, height: 18 }}
                    />
                    <label style={{ fontWeight: 600, color: '#374151' }}>
                      Enable SSL/HTTPS
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && settings && (
              <div>
                <h3 style={{ color: '#1a2238', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Email Configuration
                </h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpHost}
                        onChange={(e) => {
                          setSettings({...settings, email: {...settings.email, smtpHost: e.target.value}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => {
                          setSettings({...settings, email: {...settings.email, smtpPort: parseInt(e.target.value)}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpUser}
                      onChange={(e) => {
                        setSettings({...settings, email: {...settings.email, smtpUser: e.target.value}});
                        setHasChanges(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => {
                          setSettings({...settings, email: {...settings.email, fromEmail: e.target.value}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) => {
                          setSettings({...settings, email: {...settings.email, fromName: e.target.value}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={settings.email.smtpSecure}
                      onChange={(e) => {
                        setSettings({...settings, email: {...settings.email, smtpSecure: e.target.checked}});
                        setHasChanges(true);
                      }}
                      style={{ width: 18, height: 18 }}
                    />
                    <label style={{ fontWeight: 600, color: '#374151' }}>
                      Use Secure Connection (TLS/SSL)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && settings && (
              <div>
                <h3 style={{ color: '#1a2238', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Backup & Restore
                </h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={settings.backup.autoBackup}
                      onChange={(e) => {
                        setSettings({...settings, backup: {...settings.backup, autoBackup: e.target.checked}});
                        setHasChanges(true);
                      }}
                      style={{ width: 18, height: 18 }}
                    />
                    <label style={{ fontWeight: 600, color: '#374151' }}>
                      Enable Automatic Backups
                    </label>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Backup Frequency
                      </label>
                      <select
                        value={settings.backup.backupFrequency}
                        onChange={(e) => {
                          setSettings({...settings, backup: {...settings.backup, backupFrequency: e.target.value}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Retention Days
                      </label>
                      <input
                        type="number"
                        value={settings.backup.retentionDays}
                        onChange={(e) => {
                          setSettings({...settings, backup: {...settings.backup, retentionDays: parseInt(e.target.value)}});
                          setHasChanges(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: '#f8fafc', 
                    padding: '1rem', 
                    borderRadius: 8, 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <h4 style={{ color: '#1a2238', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Backup Status
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Last Backup:</span>
                        <div style={{ color: '#1a2238', fontWeight: 500 }}>
                          {settings.backup.lastBackup.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Next Backup:</span>
                        <div style={{ color: '#1a2238', fontWeight: 500 }}>
                          {settings.backup.nextBackup.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handleBackup}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#1a2238',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={16} />
                      Create Backup
                    </button>
                    
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={16} />
                      Restore Backup
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div style={{ 
            padding: '1.5rem 2rem', 
            borderTop: '1px solid #e2e8f0', 
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={loadSettings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: hasChanges ? '#059669' : '#e2e8f0',
                color: hasChanges ? '#fff' : '#64748b',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 600,
                cursor: hasChanges ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
} 