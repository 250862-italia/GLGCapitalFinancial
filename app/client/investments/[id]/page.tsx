'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import GLGLogo from '@/components/GLGLogo';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
  CreditCard,
  FileText
} from 'lucide-react';

interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  expectedReturn: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  status: 'active' | 'inactive';
  features: string[];
}

export default function InvestmentDetailPage() {
  const [packageData, setPackageData] = useState<InvestmentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    acceptTerms: false,
    acceptRisk: false
  });
  
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('clientToken');
    if (!token) {
      router.push('/client/login');
      return;
    }

    fetchPackageDetails();
  }, [packageId, router]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client/packages`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const packageItem = data.packages.find((pkg: InvestmentPackage) => pkg.id === packageId);
          if (packageItem) {
            setPackageData(packageItem);
          } else {
            setError('Pacchetto non trovato');
          }
        } else {
          setError(data.message || 'Pacchetto non trovato');
        }
      } else {
        setError('Pacchetto non trovato');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Basso';
      case 'medium': return 'Medio';
      case 'high': return 'Alto';
      default: return 'Sconosciuto';
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (packageData && numValue >= packageData.minAmount && numValue <= packageData.maxAmount) {
      setInvestmentAmount(value);
    } else {
      setInvestmentAmount(value);
    }
  };

  const getExpectedReturn = () => {
    if (!investmentAmount || !packageData) return 0;
    const amount = parseFloat(investmentAmount);
    return (amount * packageData.expectedReturn / 100).toFixed(2);
  };

  const handleNextStep = () => {
    if (step === 1 && investmentAmount && parseFloat(investmentAmount) >= (packageData?.minAmount || 0)) {
      setStep(2);
    } else if (step === 2 && formData.acceptTerms && formData.acceptRisk) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    // TODO: Implement actual investment submission
    console.log('Submitting investment:', {
      packageId,
      amount: investmentAmount,
      formData
    });
    
    // For now, just show success
    setStep(4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Errore</h2>
          <p className="text-gray-600 mb-4">{error || 'Pacchetto non trovato'}</p>
          <Link
            href="/client/investments"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna ai Pacchetti
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GLGLogo size="sm" showText={false} />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">GLG Capital Group</h1>
                <p className="text-sm text-gray-600">Processo di Investimento</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/client/investments"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Pacchetti
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Importo</span>
            <span>Dettagli</span>
            <span>Conferma</span>
            <span>Completato</span>
          </div>
        </div>

        {/* Step 1: Investment Amount */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Scegli l'Importo di Investimento</h2>
            
            {/* Package Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{packageData.name}</h3>
                  <p className="text-gray-600">{packageData.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(packageData.riskLevel)}`}>
                  {getRiskLabel(packageData.riskLevel)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{packageData.expectedReturn}%</div>
                  <div className="text-sm text-gray-500">Rendimento Atteso</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{packageData.duration} mesi</div>
                  <div className="text-sm text-gray-500">Durata</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{packageData.category}</div>
                  <div className="text-sm text-gray-500">Categoria</div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importo di Investimento (€)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                min={packageData.minAmount}
                max={packageData.maxAmount}
                step="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl font-bold"
                placeholder={`Min: €${packageData.minAmount.toLocaleString()} - Max: €${packageData.maxAmount.toLocaleString()}`}
              />
              
              {investmentAmount && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-medium text-gray-700">Rendimento Atteso</div>
                      <div className="text-2xl font-bold text-blue-600">€{getExpectedReturn()}</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-gray-700">Durata</div>
                      <div className="text-2xl font-bold text-green-600">{packageData.duration} mesi</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              disabled={!investmentAmount || parseFloat(investmentAmount) < packageData.minAmount}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Continua
            </button>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">I Tuoi Dettagli</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cognome *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Città</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CAP</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
                  Accetto i <Link href="/terms" className="text-blue-600 hover:underline">termini e condizioni</Link> e la <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link> *
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptRisk"
                  checked={formData.acceptRisk}
                  onChange={(e) => setFormData({...formData, acceptRisk: e.target.checked})}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptRisk" className="ml-2 text-sm text-gray-700">
                  Comprendo i rischi associati a questo investimento e accetto di procedere *
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Indietro
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.acceptTerms || !formData.acceptRisk}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Continua
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Conferma il Tuo Investimento</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Riepilogo Investimento</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-600">Pacchetto:</span>
                  <span className="font-medium ml-2">{packageData.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Importo:</span>
                  <span className="font-medium ml-2">€{parseFloat(investmentAmount).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Rendimento Atteso:</span>
                  <span className="font-medium ml-2">€{getExpectedReturn()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Durata:</span>
                  <span className="font-medium ml-2">{packageData.duration} mesi</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h4 className="font-medium text-blue-900 mb-2">Informazioni Personali</h4>
              <p className="text-blue-800">
                {formData.firstName} {formData.lastName}<br />
                {formData.email}<br />
                {formData.phone && `${formData.phone}<br />`}
                {formData.address && `${formData.address}<br />`}
                {formData.city && formData.postalCode && `${formData.city}, ${formData.postalCode}`}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Indietro
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Conferma Investimento
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Investimento Confermato!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Il tuo investimento è stato registrato con successo. Riceverai una email di conferma con tutti i dettagli.
            </p>
            
            <div className="bg-green-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-medium text-green-900 mb-2">Dettagli Investimento</h3>
              <p className="text-green-800">
                <strong>Pacchetto:</strong> {packageData.name}<br />
                <strong>Importo:</strong> €{parseFloat(investmentAmount).toLocaleString()}<br />
                <strong>Rendimento Atteso:</strong> €{getExpectedReturn()}<br />
                <strong>Durata:</strong> {packageData.duration} mesi
              </p>
            </div>

            <div className="space-y-4">
              <Link
                href="/client/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Torna alla Dashboard
              </Link>
              <br />
              <Link
                href="/client/investments"
                className="inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Vedi Altri Pacchetti
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
