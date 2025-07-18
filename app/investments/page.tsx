"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { fetchJSONWithCSRF } from '@/lib/csrf-client';
import { useRouter } from 'next/navigation';

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
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleConfirmBuy = async () => {
    if (!selectedPackage || !amount || !user) return;
    
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      // Save investment
      const { error: investError } = await supabase.from('investments').insert({
        user_id: user.id,
        package_id: selectedPackage.id,
        amount: parseFloat(amount),
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      if (investError) {
        console.error('Investment error:', investError);
        throw new Error(investError.message);
      }
      
      // Send email with bank details
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: `Istruzioni Bonifico - Acquisto Pacchetto ${selectedPackage.name}`,
          html: `<p>Gentile ${user.email},<br/>grazie per aver scelto il pacchetto <b>${selectedPackage.name}</b>.<br/><br/>Per completare l'acquisto, effettua un bonifico alle seguenti coordinate bancarie:</p><pre>${BANK_DETAILS}</pre><p><b>Causale:</b> Acquisto pacchetto ${selectedPackage.name} - ${user.email}<br/><b>Importo:</b> ${amount} EUR</p><p>Una volta effettuato il bonifico, invia la ricevuta a <a href='mailto:corefound@glgcapitalgroupllc.com'>corefound@glgcapitalgroupllc.com</a>.</p><p>Cordiali saluti,<br/>GLG Capital Group LLC</p>`
        })
      });
      
      setSuccessMsg("Richiesta di acquisto inviata! Controlla la tua email per le istruzioni di pagamento.");
      setSelectedPackage(null);
      setAmount("");
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
        {/* Modale acquisto */}
        {selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setSelectedPackage(null)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Acquista {selectedPackage.name}</h2>
              <label className="block mb-2 font-medium">Importo da investire (EUR)</label>
              <input type="number" min={selectedPackage.min_investment} max={selectedPackage.max_investment} value={amount} onChange={e => setAmount(e.target.value)} className="border p-2 rounded w-full mb-4" />
              <button className="btn-success w-full" onClick={handleConfirmBuy} disabled={loading || !amount}>Conferma Acquisto</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
