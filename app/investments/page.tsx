"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';
import { useRouter } from 'next/navigation';
import PaymentMethodModal, { PaymentMethod } from '@/components/investment-packages/PaymentMethodModal';

export default function InvestmentsPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchPackages = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase.from('packages').select('*').eq('status', 'active');
        if (error) {
          console.error('Error fetching packages:', error);
          setErrorMsg('Errore nel caricamento dei pacchetti');
        } else if (data) {
          setPackages(data);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setErrorMsg('Errore nel caricamento dei pacchetti');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchPackages();
    }
  }, [user]);

  const handleInvestNow = async (pkg: any) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedPackage(pkg);
    setAmount(pkg.min_investment?.toString() || "1000");
    setSuccessMsg("");
    setErrorMsg("");
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelected = async (paymentMethod: PaymentMethod) => {
    if (!selectedPackage || !amount || !user) return;
    
    setPurchaseLoading(true);
    setShowPaymentModal(false);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      // Use the proper API endpoint for investment creation
      const response = await fetchJSONWithCSRF("/api/investments", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          packageId: selectedPackage.id,
          amount: parseFloat(amount),
          packageName: selectedPackage.name,
          paymentMethod: paymentMethod.id
        })
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setSuccessMsg(`✅ Investimento creato con successo! Controlla la tua email per le istruzioni di pagamento con ${paymentMethod.name}.`);
      setSelectedPackage(null);
      setAmount("");
      
    } catch (err: any) {
      console.error('Purchase error:', err);
      setErrorMsg("❌ Errore durante l'acquisto: " + (err.message || err));
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Investimenti</h1>
          <p className="text-gray-600">Scegli il pacchetto di investimento che preferisci e inizia subito</p>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento pacchetti di investimento...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">Nessun pacchetto disponibile</p>
              <p>Al momento non ci sono pacchetti di investimento disponibili. Riprova più tardi.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    {pkg.is_featured && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Popolare
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rendimento atteso:</span>
                      <span className="font-semibold text-green-600">{pkg.expected_return}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Durata:</span>
                      <span className="font-medium">{pkg.duration_months} mesi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rischio:</span>
                      <span className={`font-medium ${
                        pkg.risk_level === 'low' ? 'text-green-600' : 
                        pkg.risk_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {pkg.risk_level === 'low' ? 'Basso' : 
                         pkg.risk_level === 'medium' ? 'Medio' : 'Alto'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Investimento min:</span>
                      <span className="font-semibold">€{pkg.min_investment?.toLocaleString()}</span>
                    </div>
                    {pkg.max_investment && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Investimento max:</span>
                        <span className="font-semibold">€{pkg.max_investment?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleInvestNow(pkg)}
                    disabled={purchaseLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {purchaseLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Elaborazione...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Invest Now
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modale selezione metodo di pagamento */}
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPackage(null);
          }}
          onConfirm={handlePaymentMethodSelected}
          packageName={selectedPackage?.name || ''}
          amount={parseFloat(amount) || 0}
          loading={purchaseLoading}
        />
      </div>
    </div>
  );
}
