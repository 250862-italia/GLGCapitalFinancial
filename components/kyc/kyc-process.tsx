"use client";

import { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Lock,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'next-i18next';

interface KYCData {
  personalInfo: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
  };
  financialProfile: {
    employment_status: string;
    annual_income: string;
    source_of_funds: string;
    investment_experience: string;
    risk_tolerance: string;
    investment_goals: string[];
  };
  documents: {
    id_document: string | null;
    proof_of_address: string | null;
    bank_statement: string | null;
  };
  verification: {
    personal_info_verified: boolean;
    documents_verified: boolean;
    financial_profile_verified: boolean;
    overall_status: 'pending' | 'approved' | 'rejected' | 'in_review';
  };
}

interface KYCProcessProps {
  userId: string;
  onComplete: (status: string) => void;
}

export default function KYCProcess({ userId, onComplete }: KYCProcessProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKycData] = useState<KYCData>({
    personalInfo: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      nationality: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: ''
    },
    financialProfile: {
      employment_status: '',
      annual_income: '',
      source_of_funds: '',
      investment_experience: '',
      risk_tolerance: '',
      investment_goals: []
    },
    documents: {
      id_document: null,
      proof_of_address: null,
      bank_statement: null
    },
    verification: {
      personal_info_verified: false,
      documents_verified: false,
      financial_profile_verified: false,
      overall_status: 'pending'
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Stato per messaggio di errore UX
  const [showStepError, setShowStepError] = useState(false);
  const { t } = useTranslation('common');

  // Rimuovo lo step 3 (Document Upload) e la validazione dei documenti
  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Financial Profile', icon: CreditCard },
    { id: 3, title: 'Documents', icon: FileText },
    { id: 4, title: 'Confirmation', icon: CheckCircle }
  ];

  // FETCH DATI KYC ALL'INIZIO
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/kyc/submit?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setKycData(prev => ({
            ...prev,
            personalInfo: data.personalInfo || prev.personalInfo,
            financialProfile: data.financialProfile || prev.financialProfile,
            documents: data.documents || prev.documents
          }));
        }
      } catch (e) {
        // Ignora errori fetch, fallback vuoto
      }
    })();
  }, [userId]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setKycData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof KYCData],
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      const { personalInfo } = kycData;
      if (!personalInfo.first_name) newErrors['personalInfo.first_name'] = 'First name is required';
      if (!personalInfo.last_name) newErrors['personalInfo.last_name'] = 'Last name is required';
      if (!personalInfo.date_of_birth) newErrors['personalInfo.date_of_birth'] = 'Date of birth is required';
      if (!personalInfo.nationality) newErrors['personalInfo.nationality'] = 'Nationality is required';
      if (!personalInfo.address) newErrors['personalInfo.address'] = 'Address is required';
      if (!personalInfo.city) newErrors['personalInfo.city'] = 'City is required';
      if (!personalInfo.country) newErrors['personalInfo.country'] = 'Country is required';
      if (!personalInfo.phone) newErrors['personalInfo.phone'] = 'Phone number is required';
      if (!personalInfo.email) newErrors['personalInfo.email'] = 'Email is required';
    }

    if (step === 2) {
      const { financialProfile } = kycData;
      if (!financialProfile.employment_status) newErrors['financialProfile.employment_status'] = 'Employment status is required';
      if (!financialProfile.annual_income) newErrors['financialProfile.annual_income'] = 'Annual income is required';
      if (!financialProfile.source_of_funds) newErrors['financialProfile.source_of_funds'] = 'Source of funds is required';
      if (!financialProfile.investment_experience) newErrors['financialProfile.investment_experience'] = 'Investment experience is required';
      if (!financialProfile.risk_tolerance) newErrors['financialProfile.risk_tolerance'] = 'Risk tolerance is required';
      if (financialProfile.investment_goals.length === 0) newErrors['financialProfile.investment_goals'] = 'At least one investment goal is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Rimuovo ogni riferimento a handleFileUpload e i bottoni associati
  // Sostituisco la sezione di upload con:
  <div style={{
    background: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: 8,
    padding: '1.5rem',
    margin: '2rem 0',
    color: '#92400e',
    fontSize: 16
  }}>
    <div style={{ marginBottom: 12 }}>
      For any KYC verification request, please contact us by email. We will be happy to assist you.
    </div>
    <strong>Email: <a href="mailto:kyc@glgcapitalgroup.com" style={{ color: '#b45309', textDecoration: 'underline' }}>kyc@glgcapitalgroup.com</a></strong>
    <div style={{ marginTop: 16 }}>
      <em>You will receive a confirmation email once your documents have been verified.</em>
    </div>
  </div>

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setShowStepError(false);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      setShowStepError(true);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('📋 Saving KYC data:', kycData);
      
      // Submit KYC data to API
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          personalInfo: kycData.personalInfo,
          financialProfile: kycData.financialProfile,
          documents: kycData.documents,
          verification: kycData.verification
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit KYC data');
      }

      console.log('✅ KYC submission completed successfully:', result);
      
      // Update local state
      setKycData(prev => ({
        ...prev,
        verification: {
          personal_info_verified: true,
          documents_verified: true,
          financial_profile_verified: true,
          overall_status: 'in_review'
        }
      }));
      
      onComplete('in_review');
    } catch (error) {
      console.error('KYC submission error:', error);
      alert('Error during KYC submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  // Rimuovo la sezione 'Verification Summary' e ogni riferimento a step, flag o messaggi di stato KYC
  // La pagina mostra solo il messaggio di cortesia e l'email di contatto
  return (
    <div>
      {/* Stepper UI (opzionale) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {steps.map((step, idx) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <step.icon size={24} color={currentStep === step.id ? '#6366f1' : '#d1d5db'} />
            <span style={{ fontWeight: currentStep === step.id ? 700 : 400 }}>{step.title}</span>
            {idx < steps.length - 1 && <span style={{ color: '#d1d5db' }}>&rarr;</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <div>
          <h2>Personal Information</h2>
          {/* Qui i campi anagrafici come prima */}
          {/* ... */}
          <button onClick={handleNext}>Next</button>
          {showStepError && (
            <div style={{ color: '#dc2626', marginTop: 12, fontWeight: 500 }}>
              {t('required_fields_error')}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Financial Profile */}
      {currentStep === 2 && (
        <div>
          <h2>Financial Profile</h2>
          {/* Qui i campi del profilo finanziario come prima */}
          {/* ... */}
          <button onClick={handlePrevious}>Back</button>
          <button onClick={handleNext}>Next</button>
          {showStepError && (
            <div style={{ color: '#dc2626', marginTop: 12, fontWeight: 500 }}>
              Please fill in all required fields before continuing.
            </div>
          )}
        </div>
      )}

      {/* Step 3: Documenti (solo messaggio/email) */}
      {currentStep === 3 && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: '1.5rem',
          margin: '2rem 0',
          color: '#92400e',
          fontSize: 16
        }}>
          <div style={{ marginBottom: 12 }}>
            For KYC document verification, please send your documents by email. We will be happy to assist you.
          </div>
          <strong>Email: <a href="mailto:kyc@glgcapitalgroup.com" style={{ color: '#b45309', textDecoration: 'underline' }}>kyc@glgcapitalgroup.com</a></strong>
          <div style={{ marginTop: 16 }}>
            <em>You will receive a confirmation email once your documents have been verified.</em>
          </div>
          <button style={{ marginTop: 32 }} onClick={handleNext}>Next</button>
          <button style={{ marginTop: 32, marginLeft: 16 }} onClick={handlePrevious}>Back</button>
        </div>
      )}

      {/* Step 4: Conferma invio dati */}
      {currentStep === 4 && (
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <CheckCircle size={48} color="#059669" style={{ marginBottom: 16 }} />
          <h2>Thank you!</h2>
          <p>Your KYC data has been submitted. Our team will review your information and contact you soon.</p>
        </div>
      )}
    </div>
  );
}
