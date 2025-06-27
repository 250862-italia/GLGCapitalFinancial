"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CreditCard, 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Camera,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Globe,
  Banknote,
  FileImage
} from 'lucide-react';

interface KYCData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  
  // Financial Information
  employmentStatus: string;
  employerName: string;
  annualIncome: string;
  sourceOfFunds: string;
  investmentExperience: string;
  riskTolerance: string;
  
  // Banking Information
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: string;
  
  // Documents
  passportImage: File | null;
  proofOfAddress: File | null;
  bankStatement: File | null;
  incomeProof: File | null;
  
  // Compliance
  politicallyExposed: boolean;
  sanctionsCheck: boolean;
  termsAccepted: boolean;
}

export default function KYCPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [kycData, setKycData] = useState<KYCData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    employmentStatus: '',
    employerName: '',
    annualIncome: '',
    sourceOfFunds: '',
    investmentExperience: '',
    riskTolerance: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: '',
    passportImage: null,
    proofOfAddress: null,
    bankStatement: null,
    incomeProof: null,
    politicallyExposed: false,
    sanctionsCheck: false,
    termsAccepted: false
  });

  const steps = [
    { id: 1, title: 'Informazioni Personali', icon: User },
    { id: 2, title: 'Profilo Finanziario', icon: Banknote },
    { id: 3, title: 'Dati Bancari', icon: CreditCard },
    { id: 4, title: 'Documenti', icon: FileText },
    { id: 5, title: 'Conformità', icon: Shield }
  ];

  const handleInputChange = (field: keyof KYCData, value: any) => {
    setKycData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof KYCData, file: File) => {
    setKycData(prev => ({ ...prev, [field]: file }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Here you would typically upload files and submit KYC data
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to dashboard or success page
      router.push('/dashboard?kyc=completed');
    } catch (error) {
      console.error('KYC submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Informazioni Personali</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome *</label>
          <input
            type="text"
            value={kycData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Cognome *</label>
          <input
            type="text"
            value={kycData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Data di Nascita *</label>
          <input
            type="date"
            value={kycData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Nazionalità *</label>
          <input
            type="text"
            value={kycData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Numero Passaporto *</label>
          <input
            type="text"
            value={kycData.passportNumber}
            onChange={(e) => handleInputChange('passportNumber', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Scadenza Passaporto *</label>
          <input
            type="date"
            value={kycData.passportExpiry}
            onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Indirizzo *</label>
        <input
          type="text"
          value={kycData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Città *</label>
          <input
            type="text"
            value={kycData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Paese *</label>
          <input
            type="text"
            value={kycData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">CAP *</label>
          <input
            type="text"
            value={kycData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Telefono *</label>
        <input
          type="tel"
          value={kycData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );

  const renderFinancialProfile = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Profilo Finanziario</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Stato Occupazionale *</label>
          <select
            value={kycData.employmentStatus}
            onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona...</option>
            <option value="employed">Impiegato</option>
            <option value="self-employed">Autonomo</option>
            <option value="unemployed">Disoccupato</option>
            <option value="student">Studente</option>
            <option value="retired">Pensionato</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Nome Datore di Lavoro</label>
          <input
            type="text"
            value={kycData.employerName}
            onChange={(e) => handleInputChange('employerName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Reddito Annuo *</label>
          <select
            value={kycData.annualIncome}
            onChange={(e) => handleInputChange('annualIncome', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona...</option>
            <option value="under-25000">Sotto €25,000</option>
            <option value="25000-50000">€25,000 - €50,000</option>
            <option value="50000-100000">€50,000 - €100,000</option>
            <option value="100000-250000">€100,000 - €250,000</option>
            <option value="over-250000">Oltre €250,000</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Fonte dei Fondi *</label>
          <select
            value={kycData.sourceOfFunds}
            onChange={(e) => handleInputChange('sourceOfFunds', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona...</option>
            <option value="salary">Stipendio</option>
            <option value="business">Attività Commerciale</option>
            <option value="investment">Investimenti</option>
            <option value="inheritance">Eredità</option>
            <option value="savings">Risparmi</option>
            <option value="other">Altro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Esperienza di Investimento *</label>
          <select
            value={kycData.investmentExperience}
            onChange={(e) => handleInputChange('investmentExperience', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona...</option>
            <option value="none">Nessuna</option>
            <option value="beginner">Principiante (1-2 anni)</option>
            <option value="intermediate">Intermedio (3-5 anni)</option>
            <option value="advanced">Avanzato (5+ anni)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tolleranza al Rischio *</label>
          <select
            value={kycData.riskTolerance}
            onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona...</option>
            <option value="conservative">Conservatore</option>
            <option value="moderate">Moderato</option>
            <option value="aggressive">Aggressivo</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBankingInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Informazioni Bancarie</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome Banca *</label>
          <input
            type="text"
            value={kycData.bankName}
            onChange={(e) => handleInputChange('bankName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tipo di Conto *</label>
          <select
            value={kycData.accountType}
            onChange={(e) => handleInputChange('accountType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleziona...</option>
            <option value="checking">Conto Corrente</option>
            <option value="savings">Conto di Risparmio</option>
            <option value="business">Conto Aziendale</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Numero Conto *</label>
          <input
            type="text"
            value={kycData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Codice Routing *</label>
          <input
            type="text"
            value={kycData.routingNumber}
            onChange={(e) => handleInputChange('routingNumber', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Caricamento Documenti</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Passaporto o Carta d'Identità *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleFileUpload('passportImage', e.target.files[0])}
              className="mt-2"
              required
            />
            <p className="text-sm text-gray-500 mt-2">Carica una foto del tuo documento d'identità</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Prova di Residenza *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleFileUpload('proofOfAddress', e.target.files[0])}
              className="mt-2"
              required
            />
            <p className="text-sm text-gray-500 mt-2">Bolletta, estratto conto bancario o altro documento con il tuo indirizzo</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Estratto Conto Bancario *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleFileUpload('bankStatement', e.target.files[0])}
              className="mt-2"
              required
            />
            <p className="text-sm text-gray-500 mt-2">Estratto conto degli ultimi 3 mesi</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Prova di Reddito</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleFileUpload('incomeProof', e.target.files[0])}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">Busta paga, dichiarazione dei redditi o altro documento di prova</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Dichiarazioni di Conformità</h3>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="politicallyExposed"
            checked={kycData.politicallyExposed}
            onChange={(e) => handleInputChange('politicallyExposed', e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="politicallyExposed" className="text-sm">
            Dichiaro di NON essere una persona politicamente esposta (PEP) o di avere legami familiari con PEP
          </label>
        </div>
        
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="sanctionsCheck"
            checked={kycData.sanctionsCheck}
            onChange={(e) => handleInputChange('sanctionsCheck', e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="sanctionsCheck" className="text-sm">
            Dichiaro di NON essere soggetto a sanzioni internazionali o di essere incluso in liste di soggetti vietati
          </label>
        </div>
        
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="termsAccepted"
            checked={kycData.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            className="mt-1"
            required
          />
          <label htmlFor="termsAccepted" className="text-sm">
            Accetto i termini e condizioni del servizio e conferisco il consenso al trattamento dei dati personali *
          </label>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Sicurezza e Privacy</h4>
            <p className="text-sm text-blue-700 mt-1">
              I tuoi dati sono protetti con crittografia di livello bancario. Utilizziamo solo informazioni necessarie 
              per la verifica KYC e rispettiamo rigorosamente le normative sulla privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderFinancialProfile();
      case 3: return renderBankingInfo();
      case 4: return renderDocuments();
      case 5: return renderCompliance();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verifica KYC
            </h1>
            <p className="text-gray-600">
              Completa la verifica per accedere ai servizi di investimento
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive ? 'border-blue-500 bg-blue-500 text-white' :
                      isCompleted ? 'border-green-500 bg-green-500 text-white' :
                      'border-gray-300 bg-gray-50 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' :
                        'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Indietro
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Avanti
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !kycData.termsAccepted}
                className={`px-6 py-3 rounded-lg font-medium ${
                  loading || !kycData.termsAccepted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? 'Invio in corso...' : 'Completa Verifica'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}