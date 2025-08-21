'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Shield, Bell, CreditCard, Globe, Save, Eye, EyeOff } from 'lucide-react';

interface ClientSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactorEnabled: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    investmentUpdates: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
  };
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    riskProfile: string;
  };
}

export default function ClientSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [settings, setSettings] = useState<ClientSettings>({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: ''
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      investmentUpdates: true,
      securityAlerts: true,
      marketingEmails: false
    },
    preferences: {
      language: 'it',
      currency: 'EUR',
      timezone: 'Europe/Rome',
      riskProfile: 'moderate'
    }
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      // Recupera i dati del cliente dal localStorage
      const clientUser = localStorage.getItem('clientUser');
      if (!clientUser) return;

      const user = JSON.parse(clientUser);
      
      // Popola i dati del profilo
      setSettings(prev => ({
        ...prev,
        profile: {
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          nationality: user.nationality || 'Italiana'
        }
      }));
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni:', error);
    }
  };

  const handleInputChange = (section: keyof ClientSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async (section: keyof ClientSettings) => {
    setLoading(true);
    setError(null);

    try {
      // Simula il salvataggio delle impostazioni
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // In un sistema reale, qui invieresti i dati al server
      console.log(`Impostazioni ${section} salvate:`, settings[section]);
      
    } catch (error) {
      setError('Errore nel salvataggio delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profilo', icon: User },
    { id: 'security', name: 'Sicurezza', icon: Shield },
    { id: 'notifications', name: 'Notifiche', icon: Bell },
    { id: 'preferences', name: 'Preferenze', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/client/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Torna alla Dashboard
              </Link>
              <div className="h-px w-8 bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">⚙️ Impostazioni</h1>
                <p className="text-gray-600 mt-1">Gestisci il tuo account e le preferenze</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs di Navigazione */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenuto Tab */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informazioni Personali</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={settings.profile.firstName}
                        onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                      <input
                        type="text"
                        value={settings.profile.lastName}
                        onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">L'email non può essere modificata</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data di Nascita</label>
                      <input
                        type="date"
                        value={settings.profile.dateOfBirth}
                        onChange={(e) => handleInputChange('profile', 'dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nazionalità</label>
                      <input
                        type="text"
                        value={settings.profile.nationality}
                        onChange={(e) => handleInputChange('profile', 'nationality', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sicurezza Account</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Attuale</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={settings.security.currentPassword}
                          onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nuova Password</label>
                      <input
                        type="password"
                        value={settings.security.newPassword}
                        onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Conferma Nuova Password</label>
                      <input
                        type="password"
                        value={settings.security.confirmPassword}
                        onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="twoFactor"
                        checked={settings.security.twoFactorEnabled}
                        onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="twoFactor" className="ml-2 block text-sm text-gray-900">
                        Abilita autenticazione a due fattori
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferenze Notifiche</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Notifiche Email</h4>
                        <p className="text-sm text-gray-500">Ricevi aggiornamenti via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Notifiche SMS</h4>
                        <p className="text-sm text-gray-500">Ricevi aggiornamenti via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Aggiornamenti Investimenti</h4>
                        <p className="text-sm text-gray-500">Ricevi notifiche sui tuoi investimenti</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.investmentUpdates}
                        onChange={(e) => handleInputChange('notifications', 'investmentUpdates', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Avvisi di Sicurezza</h4>
                        <p className="text-sm text-gray-500">Ricevi notifiche per attività sospette</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.securityAlerts}
                        onChange={(e) => handleInputChange('notifications', 'securityAlerts', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Marketing</h4>
                        <p className="text-sm text-gray-500">Ricevi offerte e novità</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.marketingEmails}
                        onChange={(e) => handleInputChange('notifications', 'marketingEmails', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferenze Generali</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lingua</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="it">Italiano</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valuta</label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollaro ($)</option>
                        <option value="GBP">Sterlina (£)</option>
                        <option value="CHF">Franco Svizzero (CHF)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuso Orario</label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Europe/Rome">Roma (UTC+1/+2)</option>
                        <option value="Europe/London">Londra (UTC+0/+1)</option>
                        <option value="America/New_York">New York (UTC-5/-4)</option>
                        <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profilo di Rischio</label>
                      <select
                        value={settings.preferences.riskProfile}
                        onChange={(e) => handleInputChange('preferences', 'riskProfile', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="conservative">Conservativo</option>
                        <option value="moderate">Moderato</option>
                        <option value="aggressive">Aggressivo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messaggi di Successo/Errore */}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="flex items-center">
                  <div className="text-green-600 text-2xl mr-2">✅</div>
                  <span className="text-green-800">Impostazioni salvate con successo!</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <div className="flex items-center">
                  <div className="text-red-600 text-2xl mr-2">⚠️</div>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Pulsante Salva */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleSave(activeTab as keyof ClientSettings)}
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Salvataggio...' : 'Salva Impostazioni'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
