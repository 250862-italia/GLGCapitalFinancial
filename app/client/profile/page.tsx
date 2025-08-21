'use client';

import Link from 'next/link';
import { User, Mail, Phone, Building, MapPin, Shield, Save, Edit, LogOut, ArrowLeft } from 'lucide-react';

export default function ClientProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
                <h1 className="text-2xl font-bold text-gray-900">👤 Profilo Personale</h1>
                <p className="text-gray-600 mt-1">Gestisci le tue informazioni personali</p>
              </div>
            </div>
            <Link 
              href="/client/login"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Mario Rossi</h2>
              <p className="text-gray-600">Cliente Premium</p>
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-600">Profilo verificato</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Membro dal</p>
              <p className="font-medium">Gennaio 2024</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Informazioni Personali</h3>
            <p className="text-sm text-gray-600 mt-1">Aggiorna i tuoi dati personali e aziendali</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Dati Personali
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value="Mario"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    value="Rossi"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value="mario.rossi@example.com"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value="+39 123 456 7890"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Informazioni Aziendali
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Azienda
                  </label>
                  <input
                    type="text"
                    value="Tech Solutions Srl"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posizione
                  </label>
                  <input
                    type="text"
                    value="Amministratore Delegato"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                Indirizzo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value="Via Roma 123"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Città
                  </label>
                  <input
                    type="text"
                    value="Milano"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paese
                  </label>
                  <input
                    type="text"
                    value="Italia"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CAP
                  </label>
                  <input
                    type="text"
                    value="20100"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Investment Preferences */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Preferenze di Investimento
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profilo di Rischio
                  </label>
                  <select
                    value="moderate"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  >
                    <option value="conservative">Conservativo</option>
                    <option value="moderate">Moderato</option>
                    <option value="aggressive">Aggressivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orizzonte Temporale
                  </label>
                  <select
                    value="medium"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  >
                    <option value="short">Breve termine (1-3 anni)</option>
                    <option value="medium">Medio termine (3-7 anni)</option>
                    <option value="long">Lungo termine (7+ anni)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p>Ultimo aggiornamento: 15 Gennaio 2024</p>
                <p>Profilo sincronizzato con il sistema amministrativo</p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica Profilo
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Save className="h-4 w-4 mr-2" />
                  Salva Modifiche
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Sicurezza del Profilo</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• I tuoi dati sono protetti e crittografati</p>
                <p>• Le modifiche vengono sincronizzate in tempo reale con il sistema amministrativo</p>
                <p>• Contatta il supporto per modificare informazioni sensibili</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
