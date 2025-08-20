'use client';

import Link from 'next/link';
import GLGLogo from '@/components/GLGLogo';
import { Home, ArrowLeft, Search, Users2, CreditCard, BarChart3 } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* Logo e Header */}
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <GLGLogo size="lg" showText={false} />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Pagina Non Trovata</h2>
          <p className="text-xl text-gray-600 mb-8">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
        </div>

        {/* Messaggio di Aiuto */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ecco alcune pagine che potrebbero interessarti:
          </h3>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Link
              href="/admin"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <Home className="w-6 h-6 text-blue-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-blue-900">Dashboard</div>
                <div className="text-sm text-blue-600">Panoramica generale</div>
              </div>
            </Link>
            
            <Link
              href="/admin/clients"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <Users2 className="w-6 h-6 text-green-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-green-900">Clienti</div>
                <div className="text-sm text-green-600">Gestione clienti</div>
              </div>
            </Link>
            
            <Link
              href="/admin/packages"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <CreditCard className="w-6 h-6 text-purple-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-purple-900">Pacchetti</div>
                <div className="text-sm text-purple-600">Gestione investimenti</div>
              </div>
            </Link>
            
            <Link
              href="/admin/analytics"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
            >
              <BarChart3 className="w-6 h-6 text-orange-600 mr-3" />
              <div className="text-left">
                <div className="font-medium text-orange-900">Analytics</div>
                <div className="text-sm text-orange-600">Report e statistiche</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Torna alla Dashboard
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Homepage
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2024 GLG Capital Group LLC. Tutti i diritti riservati.</p>
          <p className="mt-1">Se ritieni che questo sia un errore, contatta l'amministratore del sistema.</p>
        </div>
      </div>
    </div>
  );
}
