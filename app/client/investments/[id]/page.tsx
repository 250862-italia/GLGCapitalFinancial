'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Shield, CheckCircle, Clock } from 'lucide-react';
import { usePackagesUpdates } from '@/lib/use-packages-updates';

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
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;
  
  const { packages, loading, error, lastUpdate, refreshPackages } = usePackagesUpdates();
  const [packageData, setPackageData] = useState<InvestmentPackage | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    acceptTerms: false
  });
  const [investmentComplete, setInvestmentComplete] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('clientToken');
    if (!token) {
      router.push('/client/login');
      return;
    }

    // Find package from the packages list
    if (packages.length > 0) {
      const packageItem = packages.find(pkg => pkg.id === packageId);
      if (packageItem) {
        setPackageData(packageItem);
      }
    }
  }, [packageId, router, packages]);

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
      default: return risk;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.amount) return;
    if (currentStep === 2 && (!formData.firstName || !formData.lastName || !formData.email)) return;
    if (currentStep === 3 && !formData.acceptTerms) return;
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitInvestment = async () => {
    // Simula l'invio dell'investimento
    setInvestmentComplete(true);
    
    // In produzione, qui invieresti i dati al server
    console.log('Investimento inviato:', {
      packageId,
      packageData,
      formData
    });
  };

  if (loading && !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Caricamento pacchetto...</p>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pacchetto non trovato</h1>
          <p className="text-gray-600 mb-6">{error || 'Il pacchetto richiesto non esiste'}</p>
          <button 
            onClick={refreshPackages}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
          >
            Riprova
          </button>
          <button 
            onClick={() => router.push('/client/investments')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Torna ai pacchetti
          </button>
        </div>
      </div>
    );
  }

  if (investmentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Investimento Confermato!</h1>
          <p className="text-gray-600 mb-6">
            Il tuo investimento nel pacchetto <strong>{packageData.name}</strong> è stato registrato con successo.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Importo:</strong> €{parseFloat(formData.amount).toLocaleString()}<br/>
              <strong>Rendimento atteso:</strong> {packageData.expectedReturn}% annuo<br/>
              <strong>Durata:</strong> {packageData.duration} mesi
            </p>
          </div>
          <button 
            onClick={() => router.push('/client/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/client/investments')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna ai pacchetti
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{packageData.name}</h1>
              <p className="text-gray-600 text-lg">{packageData.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(packageData.riskLevel)}`}>
              Rischio {getRiskLabel(packageData.riskLevel)}
            </span>
          </div>

          {/* Ultimo aggiornamento */}
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep === 1 && 'Importo Investimento'}
              {currentStep === 2 && 'Dati Personali'}
              {currentStep === 3 && 'Conferma Termini'}
              {currentStep === 4 && 'Riepilogo Finale'}
            </h2>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{packageData.expectedReturn}%</div>
                <p className="text-gray-600">Rendimento annuo atteso</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importo da investire (€)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min={packageData.minAmount}
                  max={packageData.maxAmount}
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Min: €{packageData.minAmount.toLocaleString()} - Max: €{packageData.maxAmount.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefono (opzionale)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Riepilogo Investimento</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Pacchetto:</strong> {packageData.name}</p>
                  <p><strong>Importo:</strong> €{parseFloat(formData.amount || '0').toLocaleString()}</p>
                  <p><strong>Rendimento atteso:</strong> {packageData.expectedReturn}% annuo</p>
                  <p><strong>Durata:</strong> {packageData.duration} mesi</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label className="ml-2 text-sm text-gray-700">
                  Accetto i <a href="#" className="text-blue-600 hover:underline">termini e condizioni</a> e la 
                  <a href="#" className="text-blue-600 hover:underline"> politica sulla privacy</a>
                </label>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-900 mb-2">Tutto Pronto!</h3>
                <p className="text-sm text-green-800">
                  Verifica i dettagli del tuo investimento prima di confermare
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Dettagli Investimento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pacchetto:</span>
                    <span className="font-medium">{packageData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Importo:</span>
                    <span className="font-medium">€{parseFloat(formData.amount || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rendimento atteso:</span>
                    <span className="font-medium">{packageData.expectedReturn}% annuo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durata:</span>
                    <span className="font-medium">{packageData.duration} mesi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Indietro
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Avanti
              </button>
            ) : (
              <button
                onClick={handleSubmitInvestment}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Conferma Investimento
              </button>
            )}
          </div>
        </div>

        {/* Package Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Dettagli del Pacchetto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{packageData.expectedReturn}%</div>
              <p className="text-sm text-gray-600">Rendimento annuo</p>
            </div>
            
            <div className="text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{packageData.duration}</div>
              <p className="text-sm text-gray-600">Mesi</p>
            </div>
            
            <div className="text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">{getRiskLabel(packageData.riskLevel)}</div>
              <p className="text-sm text-gray-600">Livello di rischio</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Caratteristiche</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packageData.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
