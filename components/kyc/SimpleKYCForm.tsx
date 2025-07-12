"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Target, Shield, CheckCircle, AlertCircle, Send, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { validateSimpleKYC, generateEmailVerificationCode, getEmailVerificationExpiry, KYC_STATUS } from '../../lib/simple-kyc';

interface SimpleKYCFormProps {
  onComplete: (status: string) => void;
}

export default function SimpleKYCForm({ onComplete }: SimpleKYCFormProps) {
  const { user } = useAuth ? useAuth() : { user: null };
  const [step, setStep] = useState<'form' | 'email-verification' | 'complete'>('form');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: '',
    city: '',
    address: '',
    date_of_birth: '',
    nationality: '',
    employment_status: '',
    annual_income: '',
    source_of_funds: '',
    investment_experience: '',
    risk_tolerance: '',
    investment_goals: [] as string[]
  });

  const employmentOptions = [
    { value: 'employed', label: 'Impiegato' },
    { value: 'self_employed', label: 'Autonomo' },
    { value: 'unemployed', label: 'Disoccupato' },
    { value: 'retired', label: 'Pensionato' },
    { value: 'student', label: 'Studente' }
  ];

  const incomeOptions = [
    { value: 'under_25000', label: 'Sotto €25,000' },
    { value: '25000_50000', label: '€25,000 - €50,000' },
    { value: '50000_100000', label: '€50,000 - €100,000' },
    { value: 'over_100000', label: 'Oltre €100,000' }
  ];

  const experienceOptions = [
    { value: 'none', label: 'Nessuna esperienza' },
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzato' }
  ];

  const riskOptions = [
    { value: 'low', label: 'Bassa' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' }
  ];

  const goalOptions = [
    'Crescita del capitale',
    'Reddito regolare',
    'Pianificazione pensionistica',
    'Acquisto immobiliare',
    'Educazione dei figli',
    'Altro'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      investment_goals: prev.investment_goals.includes(goal)
        ? prev.investment_goals.filter(g => g !== goal)
        : [...prev.investment_goals, goal]
    }));
  };

  const validateForm = () => {
    const validation = validateSimpleKYC(formData);
    const newErrors: Record<string, string> = {};
    
    validation.errors.forEach(error => {
      // Map validation errors to form fields
      if (error.includes('Nome')) newErrors.first_name = error;
      else if (error.includes('Cognome')) newErrors.last_name = error;
      else if (error.includes('Email')) newErrors.email = error;
      else if (error.includes('Telefono')) newErrors.phone = error;
      else if (error.includes('Paese')) newErrors.country = error;
      else if (error.includes('anni')) newErrors.date_of_birth = error;
    });

    setErrors(newErrors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/simple-kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          ...formData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('email-verification');
        setEmailSent(true);
      } else {
        setErrors({ submit: result.error || 'Errore durante l\'invio' });
      }
    } catch (error) {
      setErrors({ submit: 'Errore di rete' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    if (!verificationCode.trim()) {
      setErrors({ verification: 'Inserisci il codice di verifica' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/simple-kyc/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          code: verificationCode
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('complete');
        onComplete(KYC_STATUS.EMAIL_VERIFIED);
      } else {
        setErrors({ verification: result.error || 'Codice non valido' });
      }
    } catch (error) {
      setErrors({ verification: 'Errore di rete' });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/simple-kyc/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      });

      const result = await response.json();
      
      if (result.success) {
        setEmailSent(true);
        setErrors({});
      } else {
        setErrors({ resend: result.error || 'Errore durante l\'invio' });
      }
    } catch (error) {
      setErrors({ resend: 'Errore di rete' });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email-verification') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica Email</h2>
          <p className="text-gray-600">
            Abbiamo inviato un codice di verifica a <strong>{formData.email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Codice di verifica
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inserisci il codice a 6 caratteri"
              maxLength={6}
            />
            {errors.verification && (
              <p className="text-red-500 text-sm mt-1">{errors.verification}</p>
            )}
          </div>

          <button
            onClick={handleEmailVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verifica Email'}
          </button>

          <div className="text-center">
            <button
              onClick={resendVerificationCode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Non hai ricevuto il codice? Invia di nuovo
            </button>
            {errors.resend && (
              <p className="text-red-500 text-sm mt-1">{errors.resend}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Completato!</h2>
        <p className="text-gray-600 mb-4">
          La tua email è stata verificata. Il tuo profilo KYC è ora in attesa di approvazione da parte del nostro team.
        </p>
        <p className="text-sm text-gray-500">
          Riceverai una notifica via email quando il tuo profilo sarà stato esaminato.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica Identità</h2>
        <p className="text-gray-600">
          Completa il processo KYC per accedere ai nostri servizi di investimento
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        {/* Informazioni Personali */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informazioni Personali
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cognome *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data di nascita
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date_of_birth && (
                <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazionalità
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="es. Italiana"
              />
            </div>
          </div>
        </div>

        {/* Indirizzo */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Indirizzo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indirizzo
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Via e numero civico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Città
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paese *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profilo Finanziario */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Profilo Finanziario
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato occupazionale
              </label>
              <select
                value={formData.employment_status}
                onChange={(e) => handleInputChange('employment_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona...</option>
                {employmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reddito annuale
              </label>
              <select
                value={formData.annual_income}
                onChange={(e) => handleInputChange('annual_income', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona...</option>
                {incomeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonte dei fondi
              </label>
              <input
                type="text"
                value={formData.source_of_funds}
                onChange={(e) => handleInputChange('source_of_funds', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="es. Stipendio, eredità, risparmi..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Esperienza di investimento
              </label>
              <select
                value={formData.investment_experience}
                onChange={(e) => handleInputChange('investment_experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona...</option>
                {experienceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tolleranza al rischio
              </label>
              <select
                value={formData.risk_tolerance}
                onChange={(e) => handleInputChange('risk_tolerance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleziona...</option>
                {riskOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obiettivi di investimento
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {goalOptions.map(goal => (
                <label key={goal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.investment_goals.includes(goal)}
                    onChange={() => handleGoalToggle(goal)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            'Invio in corso...'
          ) : (
            <>
              Invia KYC
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
} 