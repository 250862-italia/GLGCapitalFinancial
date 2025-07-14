"use client";
import { useEffect, useState } from "react";
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportPhone: string;
  officeAddress: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    googleAnalyticsId: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
  features: {
    registrationEnabled: boolean;
    emailNotifications: boolean;
    twoFactorAuth: boolean;
    apiAccess: boolean;
  };
  limits: {
    maxFileSize: number;
    maxUploadsPerDay: number;
    sessionTimeout: number;
    passwordMinLength: number;
  };
}

export default function AdminSettingsSitePage() {
  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'GLG Capital Group',
    siteDescription: 'Leading investment management and financial services company',
    siteUrl: 'https://glgcapital.com',
    contactEmail: 'info@glgcapital.com',
    supportPhone: '+39 02 1234 5678',
    officeAddress: 'Via Roma 123, 20100 Milano, Italy',
    socialMedia: {
      facebook: 'https://facebook.com/glgcapital',
      twitter: 'https://twitter.com/glgcapital',
      linkedin: 'https://linkedin.com/company/glgcapital',
      instagram: 'https://instagram.com/glgcapital'
    },
    seoSettings: {
      metaTitle: 'GLG Capital Group - Investment Management & Financial Services',
      metaDescription: 'Professional investment management and financial services for individuals and institutions',
      keywords: 'investment, management, financial services, portfolio, wealth management',
      googleAnalyticsId: 'GA-123456789'
    },
    maintenance: {
      enabled: false,
      message: 'Site is under maintenance. Please check back later.',
      allowedIPs: ['127.0.0.1', '192.168.1.1']
    },
    features: {
      registrationEnabled: true,
      emailNotifications: true,
      twoFactorAuth: true,
      apiAccess: false
    },
    limits: {
      maxFileSize: 10, // MB
      maxUploadsPerDay: 100,
      sessionTimeout: 3600, // seconds
      passwordMinLength: 8
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSiteConfig();
  }, []);

  const loadSiteConfig = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would load from API
      // For now, we use the default config
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load site configuration' });
      setLoading(false);
    }
  };

  const saveSiteConfig = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage({ type: 'success', text: 'Site configuration saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save site configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (section: keyof SiteConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSEOSettingsChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      seoSettings: {
        ...prev.seoSettings,
        [field]: value
      }
    }));
  };

  const handleFeaturesChange = (feature: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  const handleLimitsChange = (limit: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [limit]: value
      }
    }));
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <span style={{ marginLeft: '1rem' }}>Caricamento configurazione sito...</span>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--primary)' }}>
              Configurazione Sito
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Gestione delle impostazioni generali del sito web
            </p>
          </div>
          <button
            onClick={saveSiteConfig}
            disabled={saving}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              fontWeight: 600
            }}
          >
            {saving ? 'Salvataggio...' : 'Salva Configurazione'}
          </button>
        </div>

        {message && (
          <div style={{
            background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#b91c1c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}>
            {message.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e0e3eb' }}>
          {[
            { id: 'general', name: 'Generale' },
            { id: 'contact', name: 'Contatti' },
            { id: 'social', name: 'Social Media' },
            { id: 'seo', name: 'SEO' },
            { id: 'maintenance', name: 'Manutenzione' },
            { id: 'features', name: 'Funzionalità' },
            { id: 'limits', name: 'Limiti' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Impostazioni Generali</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nome Sito</label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => handleConfigChange('siteName', 'siteName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Descrizione Sito</label>
                <textarea
                  value={config.siteDescription}
                  onChange={(e) => handleConfigChange('siteDescription', 'siteDescription', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>URL Sito</label>
                <input
                  type="url"
                  value={config.siteUrl}
                  onChange={(e) => handleConfigChange('siteUrl', 'siteUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Informazioni di Contatto</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email di Contatto</label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => handleConfigChange('contactEmail', 'contactEmail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Telefono Supporto</label>
                <input
                  type="tel"
                  value={config.supportPhone}
                  onChange={(e) => handleConfigChange('supportPhone', 'supportPhone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Indirizzo Ufficio</label>
                <textarea
                  value={config.officeAddress}
                  onChange={(e) => handleConfigChange('officeAddress', 'officeAddress', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Social Media</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {Object.entries(config.socialMedia).map(([platform, url]) => (
                <div key={platform}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {platform} URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                    placeholder={`https://${platform}.com/username`}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Impostazioni SEO</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Meta Title</label>
                <input
                  type="text"
                  value={config.seoSettings.metaTitle}
                  onChange={(e) => handleSEOSettingsChange('metaTitle', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Meta Description</label>
                <textarea
                  value={config.seoSettings.metaDescription}
                  onChange={(e) => handleSEOSettingsChange('metaDescription', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Keywords</label>
                <input
                  type="text"
                  value={config.seoSettings.keywords}
                  onChange={(e) => handleSEOSettingsChange('keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Google Analytics ID</label>
                <input
                  type="text"
                  value={config.seoSettings.googleAnalyticsId}
                  onChange={(e) => handleSEOSettingsChange('googleAnalyticsId', e.target.value)}
                  placeholder="GA-XXXXXXXXX"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Modalità Manutenzione</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="checkbox"
                  id="maintenance-mode"
                  checked={config.maintenance.enabled}
                  onChange={(e) => handleConfigChange('maintenance', 'enabled', e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <label htmlFor="maintenance-mode" style={{ fontWeight: 600 }}>
                  Abilita Modalità Manutenzione
                </label>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Messaggio di Manutenzione</label>
                <textarea
                  value={config.maintenance.message}
                  onChange={(e) => handleConfigChange('maintenance', 'message', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>IP Consentiti (uno per riga)</label>
                <textarea
                  value={config.maintenance.allowedIPs.join('\n')}
                  onChange={(e) => handleConfigChange('maintenance', 'allowedIPs', e.target.value.split('\n').filter(ip => ip.trim()))}
                  rows={5}
                  placeholder="127.0.0.1&#10;192.168.1.1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Funzionalità del Sito</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {Object.entries(config.features).map(([feature, enabled]) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {feature === 'registrationEnabled' ? 'Registrazione Utenti' :
                       feature === 'emailNotifications' ? 'Notifiche Email' :
                       feature === 'twoFactorAuth' ? 'Autenticazione a Due Fattori' :
                       feature === 'apiAccess' ? 'Accesso API' : feature}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.25rem' }}>
                      {feature === 'registrationEnabled' ? 'Permetti ai nuovi utenti di registrarsi' :
                       feature === 'emailNotifications' ? 'Invia notifiche email agli utenti' :
                       feature === 'twoFactorAuth' ? 'Richiedi autenticazione a due fattori' :
                       feature === 'apiAccess' ? 'Abilita accesso alle API pubbliche' : ''}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleFeaturesChange(feature, e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limits Tab */}
        {activeTab === 'limits' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Limiti e Restrizioni</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Dimensione Massima File (MB)</label>
                <input
                  type="number"
                  value={config.limits.maxFileSize}
                  onChange={(e) => handleLimitsChange('maxFileSize', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Upload Massimi per Giorno</label>
                <input
                  type="number"
                  value={config.limits.maxUploadsPerDay}
                  onChange={(e) => handleLimitsChange('maxUploadsPerDay', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Timeout Sessione (secondi)</label>
                <input
                  type="number"
                  value={config.limits.sessionTimeout}
                  onChange={(e) => handleLimitsChange('sessionTimeout', parseInt(e.target.value))}
                  min="300"
                  max="86400"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Lunghezza Minima Password</label>
                <input
                  type="number"
                  value={config.limits.passwordMinLength}
                  onChange={(e) => handleLimitsChange('passwordMinLength', parseInt(e.target.value))}
                  min="6"
                  max="50"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtectedRoute>
  );
} 