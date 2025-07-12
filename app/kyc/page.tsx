"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import SimpleKYCForm from '@/components/kyc/SimpleKYCForm';
import { getLocalDatabase } from '@/lib/local-database';

export default function KYCPage() {
  const { user } = useAuth ? useAuth() : { user: null };
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if using local database
        const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

        if (useLocalDatabase) {
          const db = await getLocalDatabase();
          const kycRecord = await db.getSimpleKYCByUserId(user.id);
          
          if (kycRecord) {
            setKycStatus(kycRecord.status);
          } else {
            setKycStatus('not_submitted');
          }
        } else {
          // Mock status for non-local database
          setKycStatus('not_submitted');
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
        setKycStatus('not_submitted');
      } finally {
        setLoading(false);
      }
    };

    checkKYCStatus();
  }, [user]);

  const handleKYCComplete = (status: string) => {
    setKycStatus(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Richiesto</h1>
          <p className="text-gray-600">Devi effettuare l'accesso per completare il processo KYC.</p>
        </div>
      </div>
    );
  }

  // Show different content based on KYC status
  if (kycStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Approvato!</h1>
          <p className="text-gray-600 mb-4">
            Il tuo profilo KYC è stato approvato. Ora puoi accedere a tutti i nostri servizi di investimento.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Vai alla Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Rifiutato</h1>
          <p className="text-gray-600 mb-4">
            Il tuo profilo KYC non è stato approvato. Contatta il supporto per maggiori informazioni.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Contatta il Supporto
          </a>
        </div>
      </div>
    );
  }

  if (kycStatus === 'email_verified' || kycStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC in Revisione</h1>
          <p className="text-gray-600 mb-4">
            Il tuo profilo KYC è stato inviato e sta essere esaminato dal nostro team. 
            Riceverai una notifica via email quando sarà completata la revisione.
          </p>
          <p className="text-sm text-gray-500">
            Tempo di elaborazione: 1-3 giorni lavorativi
          </p>
        </div>
      </div>
    );
  }

  // Show the KYC form for new submissions
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verifica Identità (KYC)
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Completa il processo di verifica dell'identità per accedere ai nostri servizi di investimento. 
            Questo processo è obbligatorio per conformità normativa.
          </p>
        </div>

        <SimpleKYCForm onComplete={handleKYCComplete} />
      </div>
    </div>
  );
}