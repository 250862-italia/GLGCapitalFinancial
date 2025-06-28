"use client";

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CreditCard, 
  Shield, 
  TrendingUp, 
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Percent,
  Clock,
  Target,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  X
} from 'lucide-react';
import { usePackages } from '../../lib/package-context';

interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  expectedReturn: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  isActive: boolean;
  features: string[];
  terms: string;
  status: 'Active' | 'Fundraising' | 'Closed';
  createdAt: string;
}

interface RegistrationData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  
  // KYC Info
  idType: string;
  idNumber: string;
  idExpiry: string;
  occupation: string;
  annualIncome: string;
  sourceOfFunds: string;
  
  // Investment
  selectedPackage: string;
  investmentAmount: number;
  
  // Payment
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardholderName: string;
  
  // Terms
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

export default function IscrivitiPage() {
  const { packages } = usePackages();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});

  const [formData, setFormData] = useState<RegistrationData>({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    
    // KYC Info
    idType: '',
    idNumber: '',
    idExpiry: '',
    occupation: '',
    annualIncome: '',
    sourceOfFunds: '',
    
    // Investment
    selectedPackage: '',
    investmentAmount: 0,
    
    // Payment
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardholderName: '',
    
    // Terms
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const validateStep1 = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push('Nome richiesto');
    if (!formData.lastName.trim()) errors.push('Cognome richiesto');
    if (!formData.email.trim()) errors.push('Email richiesta');
    if (!formData.phone.trim()) errors.push('Telefono richiesto');
    if (formData.password.length < 8) errors.push('Password deve essere di almeno 8 caratteri');
    if (formData.password !== formData.confirmPassword) errors.push('Le password non coincidono');
    if (!formData.dateOfBirth) errors.push('Data di nascita richiesta');
    if (!formData.nationality.trim()) errors.push('Nazionalità richiesta');
    if (!formData.address.trim()) errors.push('Indirizzo richiesto');
    if (!formData.city.trim()) errors.push('Città richiesta');
    if (!formData.country.trim()) errors.push('Paese richiesto');
    if (!formData.postalCode.trim()) errors.push('CAP richiesto');
    
    return errors;
  };

  const validateStep2 = () => {
    const errors = [];
    if (!formData.idType) errors.push('Tipo documento richiesto');
    if (!formData.idNumber.trim()) errors.push('Numero documento richiesto');
    if (!formData.idExpiry) errors.push('Scadenza documento richiesta');
    if (!formData.occupation.trim()) errors.push('Occupazione richiesta');
    if (!formData.annualIncome) errors.push('Reddito annuale richiesto');
    if (!formData.sourceOfFunds.trim()) errors.push('Fonte fondi richiesta');
    
    return errors;
  };

  const validateStep3 = () => {
    const errors = [];
    if (!formData.selectedPackage) errors.push('Pacchetto di investimento richiesto');
    if (formData.investmentAmount <= 0) errors.push('Importo investimento richiesto');
    
    const selectedPkg = packages.find(p => p.id === formData.selectedPackage);
    if (selectedPkg) {
      if (formData.investmentAmount < selectedPkg.minInvestment) {
        errors.push(`Importo minimo: €${selectedPkg.minInvestment.toLocaleString()}`);
      }
      if (formData.investmentAmount > selectedPkg.maxInvestment) {
        errors.push(`Importo massimo: €${selectedPkg.maxInvestment.toLocaleString()}`);
      }
    }
    
    return errors;
  };

  const validateStep4 = () => {
    const errors = [];
    if (!formData.cardNumber.trim()) errors.push('Numero carta richiesto');
    if (!formData.cardExpiry.trim()) errors.push('Scadenza carta richiesta');
    if (!formData.cardCvv.trim()) errors.push('CVV richiesto');
    if (!formData.cardholderName.trim()) errors.push('Nome titolare carta richiesto');
    if (!formData.acceptTerms) errors.push('Devi accettare i termini e condizioni');
    if (!formData.acceptPrivacy) errors.push('Devi accettare la privacy policy');
    
    return errors;
  };

  const nextStep = () => {
    let errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        errors = validateStep1();
        break;
      case 2:
        errors = validateStep2();
        break;
      case 3:
        errors = validateStep3();
        break;
      case 4:
        errors = validateStep4();
        break;
    }
    
    if (errors.length > 0) {
      setErrorMessage(errors.join(', '));
      return;
    }
    
    setErrorMessage('');
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Registrazione completata con successo! Riceverai una email di conferma.');
        setCurrentStep(5); // Success step
      } else {
        setErrorMessage(data.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      setErrorMessage('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateReturns = () => {
    const selectedPkg = packages.find(p => p.id === formData.selectedPackage);
    if (!selectedPkg || formData.investmentAmount <= 0) return null;

    const dailyReturn = (formData.investmentAmount * selectedPkg.expectedReturn / 100) / 365;
    const monthlyReturn = dailyReturn * 30;
    const totalReturn = formData.investmentAmount * selectedPkg.expectedReturn / 100;

    return {
      daily: dailyReturn,
      monthly: monthlyReturn,
      total: totalReturn,
      finalAmount: formData.investmentAmount + totalReturn
    };
  };

  const returns = calculateReturns();

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Informazioni Personali
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Il tuo nome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cognome *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Il tuo cognome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="la-tua-email@esempio.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefono *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+39 123 456 7890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimo 8 caratteri"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conferma Password *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Conferma la password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data di Nascita *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nazionalità *
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="es. Italiana"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indirizzo *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Via/Piazza e numero civico"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Città *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nome della città"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paese *
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="es. Italia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CAP *
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="12345"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Verifica KYC
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo Documento *
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numero Documento *
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Numero del documento"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Scadenza *
          </label>
          <input
            type="date"
            name="idExpiry"
            value={formData.idExpiry}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupazione *
          </label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="es. Impiegato, Libero professionista"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reddito Annuale *
          </label>
          <select
            name="annualIncome"
            value={formData.annualIncome}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona fascia di reddito</option>
            <option value="under_25000">Sotto €25.000</option>
            <option value="25000_50000">€25.000 - €50.000</option>
            <option value="50000_100000">€50.000 - €100.000</option>
            <option value="100000_250000">€100.000 - €250.000</option>
            <option value="over_250000">Oltre €250.000</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fonte Fondi *
          </label>
          <select
            name="sourceOfFunds"
            value={formData.sourceOfFunds}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleziona fonte fondi</option>
            <option value="salary">Stipendio</option>
            <option value="business">Attività commerciale</option>
            <option value="investment">Investimenti</option>
            <option value="inheritance">Eredità</option>
            <option value="savings">Risparmi</option>
            <option value="other">Altro</option>
          </select>
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carica Documenti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento d'Identità (Fronte)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e, 'id_front')}
                className="hidden"
                id="id_front"
              />
              <label htmlFor="id_front" className="cursor-pointer">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploadedFiles['id_front'] ? uploadedFiles['id_front'].name : 'Clicca per caricare'}
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento d'Identità (Retro)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e, 'id_back')}
                className="hidden"
                id="id_back"
              />
              <label htmlFor="id_back" className="cursor-pointer">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploadedFiles['id_back'] ? uploadedFiles['id_back'].name : 'Clicca per caricare'}
                </p>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Scegli il Tuo Pacchetto di Investimento
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Package Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pacchetti Disponibili</h3>
          <div className="space-y-4">
            {packages.filter(p => p.status === 'Active').map((pkg) => (
              <div
                key={pkg.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.selectedPackage === pkg.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, selectedPackage: pkg.id }))}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                  {formData.selectedPackage === pkg.id && (
                    <CheckCircle size={20} className="text-blue-500" />
                  )}
                </div>
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
                  <div>
                    <span className="text-gray-500">Durata:</span>
                    <div className="font-medium">{pkg.duration} mesi</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Rischio:</span>
                    <div className="font-medium capitalize">{pkg.riskLevel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Calculator */}
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
                      <span className="text-gray-600">Rendimento Giornaliero:</span>
                      <span className="font-medium">€{returns.daily.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rendimento Mensile:</span>
                      <span className="font-medium">€{returns.monthly.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rendimento Totale:</span>
                      <span className="font-medium text-green-600">€{returns.total.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
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
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Informazioni di Pagamento
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numero Carta *
          </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scadenza *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Titolare Carta *
          </label>
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

        {/* Terms and Conditions */}
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

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="acceptMarketing"
                checked={formData.acceptMarketing}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Accetto di ricevere comunicazioni marketing (opzionale)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-6">
        <CheckCircle size={64} className="mx-auto text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Registrazione Completata!
      </h2>
      <p className="text-gray-600 mb-6">
        Grazie per esserti registrato. Riceverai una email di conferma con i dettagli del tuo account.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          Il nostro team verificherà le tue informazioni e ti contatterà entro 24-48 ore.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrazione Clienti
          </h1>
          <p className="text-gray-600">
            Completa la registrazione per accedere ai nostri servizi di investimento
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Informazioni Personali</span>
            <span>Verifica KYC</span>
            <span>Investimento</span>
            <span>Pagamento</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-red-700">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderSuccess()}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Indietro
              </button>

              {currentStep === 4 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Registrazione in corso...
                    </>
                  ) : (
                    <>
                      Completa Registrazione
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Avanti
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 