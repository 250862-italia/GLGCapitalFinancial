'use client';

import React, { useState, useEffect } from 'react';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // KYC Information
  idType: string;
  idNumber: string;
  
  // Investment
  selectedPackage: string;
  investmentAmount: number;
  
  // Payment
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardholderName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface Package {
  id: string;
  name: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  expectedReturn: number;
  duration: number;
  riskLevel: string;
}

export default function IscrivitiPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idType: '',
    idNumber: '',
    selectedPackage: '',
    investmentAmount: 0,
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [returns, setReturns] = useState<{ total: number; finalAmount: number } | null>(null);

  const packages: Package[] = [
    {
      id: '1',
      name: 'Pacchetto Starter',
      description: 'Perfetto per iniziare il tuo percorso di investimento',
      minInvestment: 5000,
      maxInvestment: 25000,
      expectedReturn: 8,
      duration: 12,
      riskLevel: 'basso'
    },
    {
      id: '2',
      name: 'Pacchetto Growth',
      description: 'Ideale per investitori con esperienza',
      minInvestment: 25000,
      maxInvestment: 100000,
      expectedReturn: 12,
      duration: 18,
      riskLevel: 'medio'
    },
    {
      id: '3',
      name: 'Pacchetto Premium',
      description: 'Per investitori esperti che cercano rendimenti elevati',
      minInvestment: 100000,
      maxInvestment: 500000,
      expectedReturn: 15,
      duration: 24,
      riskLevel: 'alto'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const calculateReturns = () => {
    if (formData.selectedPackage && formData.investmentAmount > 0) {
      const selectedPkg = packages.find(p => p.id === formData.selectedPackage);
      if (selectedPkg) {
        const totalReturn = (formData.investmentAmount * selectedPkg.expectedReturn) / 100;
        const finalAmount = formData.investmentAmount + totalReturn;
        setReturns({ total: totalReturn, finalAmount });
      }
    }
  };

  useEffect(() => {
    calculateReturns();
  }, [formData.selectedPackage, formData.investmentAmount]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registrazione Cliente
            </h1>
            <p className="text-gray-600">
              Completa la registrazione per accedere ai nostri servizi di investimento
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex items-center ${
                    stepNumber < 4 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informazioni Personali</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cognome *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefono *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Avanti
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: KYC Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Verifica KYC</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Documento *</label>
                    <select
                      name="idType"
                      value={formData.idType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleziona tipo documento</option>
                      <option value="passport">Passaporto</option>
                      <option value="id_card">Carta d'Identità</option>
                      <option value="driving_license">Patente di Guida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numero Documento *</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Avanti
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Investment Package */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Scegli il Pacchetto di Investimento</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pacchetti Disponibili</h3>
                    <div className="space-y-4">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            formData.selectedPackage === pkg.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, selectedPackage: pkg.id }))}
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Investimento:</span>
                              <div className="font-medium">
                                €{pkg.minInvestment.toLocaleString()} - €{pkg.maxInvestment.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Rendimento:</span>
                              <div className="font-medium text-green-600">{pkg.expectedReturn}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Calcolatore Investimento</h3>
                    {formData.selectedPackage && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Importo Investimento (€)
                          </label>
                          <input
                            type="number"
                            name="investmentAmount"
                            value={formData.investmentAmount || ''}
                            onChange={handleInputChange}
                            min="0"
                            step="1000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Inserisci l'importo"
                          />
                        </div>
                        {returns && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Proiezione Rendimenti</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rendimento Totale:</span>
                                <span className="font-medium text-green-600">€{returns.total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold">
                                <span className="text-gray-900">Importo Finale:</span>
                                <span className="text-green-600">€{returns.finalAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Avanti
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informazioni di Pagamento</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numero Carta *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scadenza *</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                      <input
                        type="text"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Titolare Carta *</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome e Cognome come sulla carta"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Termini e Condizioni</h3>
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          required
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Accetto i <a href="#" className="text-blue-600 hover:underline">Termini e Condizioni</a> *
                        </span>
                      </label>
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          name="acceptPrivacy"
                          checked={formData.acceptPrivacy}
                          onChange={handleInputChange}
                          required
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Accetto la <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> *
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Indietro
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Completa Registrazione
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 