"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';
import { useRouter } from 'next/navigation';
import PaymentMethodModal, { PaymentMethod } from '@/components/investment-packages/PaymentMethodModal';

const BANK_DETAILS = `
Beneficiario: GLG capital group LLC
Indirizzo del beneficiario: 1309 Coffeen Ave, Ste H, Sheridan, WY, 82801-5714, United States
Numero di conto: 218086576410
Numero di instradamento bancario: REVOUS31
SWIFT/BIC: REVOUS31
BIC banca intermediaria: CHASDEFX
`;

export default function InvestmentsPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
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

  const handleBuy = async (pkg: any) => {
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
    
    setSelectedPaymentMethod(paymentMethod);
    setShowPaymentModal(false);
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      // Calculate total amount including fees
      let totalAmount = parseFloat(amount);
      if (paymentMethod.id === 'credit_card') {
        totalAmount = totalAmount * 1.025 + 0.30;
      } else if (paymentMethod.id === 'crypto') {
        totalAmount = totalAmount * 1.01;
      }
      
      // Save investment with payment method
      const { error: investError } = await supabase.from('investments').insert({
        user_id: user.id,
        package_id: selectedPackage.id,
        amount: parseFloat(amount),
        payment_method: paymentMethod.id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      if (investError) {
        console.error('Investment error:', investError);
        throw new Error(investError.message);
      }
      
      // Send email based on payment method
      let emailSubject = '';
      let emailHtml = '';
      
      switch (paymentMethod.id) {
        case 'bank_transfer':
          emailSubject = `Istruzioni Bonifico - Acquisto Pacchetto ${selectedPackage.name}`;
          emailHtml = `<p>Gentile ${user.email},<br/>grazie per aver scelto il pacchetto <b>${selectedPackage.name}</b>.<br/><br/>Per completare l'acquisto, effettua un bonifico alle seguenti coordinate bancarie:</p><pre>${BANK_DETAILS}</pre><p><b>Causale:</b> Acquisto pacchetto ${selectedPackage.name} - ${user.email}<br/><b>Importo:</b> ${amount} EUR</p><p>Una volta effettuato il bonifico, invia la ricevuta a <a href='mailto:corefound@glgcapitalgroupllc.com'>corefound@glgcapitalgroupllc.com</a>.</p><p>Cordiali saluti,<br/>GLG Capital Group LLC</p>`;
          break;
          
        case 'credit_card':
          emailSubject = `Pagamento Carta - Acquisto Pacchetto ${selectedPackage.name}`;
          emailHtml = `<p>Gentile ${user.email},<br/>grazie per aver scelto il pacchetto <b>${selectedPackage.name}</b>.<br/><br/>Il tuo pagamento con carta di credito è stato elaborato con successo.</p><p><b>Dettagli:</b><br/>- Pacchetto: ${selectedPackage.name}<br/>- Importo: ${amount} EUR<br/>- Commissioni: ${(totalAmount - parseFloat(amount)).toFixed(2)} EUR<br/>- Totale: ${totalAmount.toFixed(2)} EUR</p><p>Il tuo investimento sarà attivato entro 24 ore.</p><p>Cordiali saluti,<br/>GLG Capital Group LLC</p>`;
          break;
          
        case 'crypto':
          emailSubject = `Istruzioni Crypto - Acquisto Pacchetto ${selectedPackage.name}`;
          emailHtml = `<p>Gentile ${user.email},<br/>grazie per aver scelto il pacchetto <b>${selectedPackage.name}</b>.<br/><br/>Per completare il pagamento in criptovalute, invia ${totalAmount.toFixed(2)} EUR equivalenti a uno dei seguenti indirizzi:</p><p><b>Bitcoin (BTC):</b> bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh<br/><b>Ethereum (ETH):</b> 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6<br/><b>USDT (TRC20):</b> TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</p><p><b>Importo da inviare:</b> ${totalAmount.toFixed(2)} EUR equivalenti<br/><b>Commissioni:</b> ${(totalAmount - parseFloat(amount)).toFixed(2)} EUR</p><p>Una volta effettuato il pagamento, invia la ricevuta della transazione a <a href='mailto:corefound@glgcapitalgroupllc.com'>corefound@glgcapitalgroupllc.com</a>.</p><p>Cordiali saluti,<br/>GLG Capital Group LLC</p>`;
          break;
      }
      
      await fetchJSONWithCSRF("/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: user.email,
          subject: emailSubject,
          html: emailHtml
        })
      });
      
      // Send notification to admin
      await fetchJSONWithCSRF("/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: 'corefound@glgcapitalgroupllc.com',
          subject: `Nuovo Investimento - ${paymentMethod.name} - ${selectedPackage.name}`,
          html: `<p>Nuovo investimento ricevuto:</p><p><b>Cliente:</b> ${user.email}<br/><b>Pacchetto:</b> ${selectedPackage.name}<br/><b>Importo:</b> ${amount} EUR<br/><b>Metodo di pagamento:</b> ${paymentMethod.name}<br/><b>Totale:</b> ${totalAmount.toFixed(2)} EUR</p>`
        })
      });
      
      setSuccessMsg(`Richiesta di acquisto inviata! Controlla la tua email per le istruzioni di pagamento con ${paymentMethod.name}.`);
      setSelectedPackage(null);
      setAmount("");
      setSelectedPaymentMethod(null);
    } catch (err: any) {
      console.error('Purchase error:', err);
      setErrorMsg("Errore durante l'acquisto: " + (err.message || err));
    } finally {
      setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">Investimenti</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pacchetti disponibili</h2>
        {successMsg && <div className="bg-green-100 text-green-800 rounded p-3 mb-4">{successMsg}</div>}
        {errorMsg && <div className="bg-red-100 text-red-800 rounded p-3 mb-4">{errorMsg}</div>}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Caricamento pacchetti...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nessun pacchetto di investimento disponibile al momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="border-b pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{pkg.name}</h3>
                  <p className="text-gray-600">{pkg.description}</p>
                  <p className="text-gray-600">Durata: {pkg.duration} giorni • Rendimento atteso: {pkg.expected_return}%</p>
                  <p className="text-gray-600">Min: €{pkg.min_investment?.toLocaleString()} • Max: €{pkg.max_investment?.toLocaleString()}</p>
                </div>
                <button className="btn-primary" onClick={() => handleBuy(pkg)}>Acquista</button>
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
            setSelectedPaymentMethod(null);
          }}
          onConfirm={handlePaymentMethodSelected}
          packageName={selectedPackage?.name || ''}
          amount={parseFloat(amount) || 0}
          loading={loading}
        />
      </div>
    </div>
  );
}
