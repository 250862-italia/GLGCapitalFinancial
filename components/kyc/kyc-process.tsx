"use client";

import { useState } from 'react';
import { User, Shield, FileText, CreditCard, CheckCircle, AlertCircle, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

interface KYCData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    codiceFiscale: string; // AGGIUNTO
  };
  financialProfile: {
    employmentStatus: string;
    annualIncome: string;
    sourceOfFunds: string;
    investmentExperience: string;
    riskTolerance: string;
    investmentGoals: string[];
  };
  documents: {
    idDocument: string | null;
    proofOfAddress: string | null;
    bankStatement: string | null;
  };
  verification: {
    personalInfoVerified: boolean;
    documentsVerified: boolean;
    financialProfileVerified: boolean;
    overallStatus: 'pending' | 'approved' | 'rejected' | 'in_review';
  };
}

const steps = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Financial Profile', icon: CreditCard },
  { id: 3, title: 'Document Upload', icon: FileText },
  { id: 4, title: 'Verification Summary', icon: Shield }
];

export default function KYCProcess({ userId, onComplete }: { userId: string; onComplete: (status: string) => void }) {
  const { user } = useAuth ? useAuth() : { user: null };
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKycData] = useState<KYCData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      codiceFiscale: '' // AGGIUNTO
    },
    financialProfile: {
      employmentStatus: '',
      annualIncome: '',
      sourceOfFunds: '',
      investmentExperience: '',
      riskTolerance: '',
      investmentGoals: []
    },
    documents: {
      idDocument: null,
      proofOfAddress: null,
      bankStatement: null
    },
    verification: {
      personalInfoVerified: false,
      documentsVerified: false,
      financialProfileVerified: false,
      overallStatus: 'pending'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'idle' | 'uploading' | 'success' | 'error' }>({});
  const [uploadError, setUploadError] = useState<{ [key: string]: string }>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      const { personalInfo } = kycData;
      if (!personalInfo.firstName) newErrors['personalInfo.firstName'] = 'First name is required';
      if (!personalInfo.lastName) newErrors['personalInfo.lastName'] = 'Last name is required';
      if (!personalInfo.dateOfBirth) newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
      if (!personalInfo.nationality) newErrors['personalInfo.nationality'] = 'Nationality is required';
      if (!personalInfo.address) newErrors['personalInfo.address'] = 'Address is required';
      if (!personalInfo.city) newErrors['personalInfo.city'] = 'City is required';
      if (!personalInfo.country) newErrors['personalInfo.country'] = 'Country is required';
      if (!personalInfo.phone) newErrors['personalInfo.phone'] = 'Phone number is required';
      if (!personalInfo.email) newErrors['personalInfo.email'] = 'Email is required';
      // Validazione Codice Fiscale solo se nazionalità Italia
      if (personalInfo.nationality && personalInfo.nationality.toLowerCase() === 'italia' && !personalInfo.codiceFiscale) {
        newErrors['personalInfo.codiceFiscale'] = 'Codice Fiscale obbligatorio per cittadini italiani';
      }
    }
    if (step === 2) {
      const { financialProfile } = kycData;
      if (!financialProfile.employmentStatus) newErrors['financialProfile.employmentStatus'] = 'Employment status is required';
      if (!financialProfile.annualIncome) newErrors['financialProfile.annualIncome'] = 'Annual income is required';
      if (!financialProfile.sourceOfFunds) newErrors['financialProfile.sourceOfFunds'] = 'Source of funds is required';
      if (!financialProfile.investmentExperience) newErrors['financialProfile.investmentExperience'] = 'Investment experience is required';
      if (!financialProfile.riskTolerance) newErrors['financialProfile.riskTolerance'] = 'Risk tolerance is required';
      if (financialProfile.investmentGoals.length === 0) newErrors['financialProfile.investmentGoals'] = 'At least one investment goal is required';
    }
    if (step === 3) {
      const { documents } = kycData;
      if (!documents.idDocument) newErrors['documents.idDocument'] = 'ID document is required';
      if (!documents.proofOfAddress) newErrors['documents.proofOfAddress'] = 'Proof of address is required';
      if (!documents.bankStatement) newErrors['documents.bankStatement'] = 'Bank statement is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload document to API and save URL
  const handleFileUpload = async (field: string, file: File | null) => {
    if (!file) {
      setKycData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: null
        }
      }));
      setUploadStatus(prev => ({ ...prev, [field]: 'idle' }));
      setUploadError(prev => ({ ...prev, [field]: '' }));
      return;
    }
    setUploadStatus(prev => ({ ...prev, [field]: 'uploading' }));
    setUploadError(prev => ({ ...prev, [field]: '' }));
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', userId);
      // Mappa il campo in documentType
      let documentType = '';
      if (field === 'idDocument') documentType = 'ID_DOCUMENT';
      if (field === 'proofOfAddress') documentType = 'PROOF_OF_ADDRESS';
      if (field === 'bankStatement') documentType = 'BANK_STATEMENT';
      formData.append('documentType', documentType);
      const res = await fetch('/api/kyc/upload-document', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.documentUrl) {
        setUploadStatus(prev => ({ ...prev, [field]: 'error' }));
        setUploadError(prev => ({ ...prev, [field]: data.error || 'Upload failed' }));
        setKycData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [field]: null
          }
        }));
        return;
      }
      setKycData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: data.documentUrl
        }
      }));
      setUploadStatus(prev => ({ ...prev, [field]: 'success' }));
      setUploadError(prev => ({ ...prev, [field]: '' }));
    } catch (err: any) {
      setUploadStatus(prev => ({ ...prev, [field]: 'error' }));
      setUploadError(prev => ({ ...prev, [field]: err.message || 'Upload failed' }));
      setKycData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: null
        }
      }));
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setKycData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof KYCData],
        [field]: value
      }
    }));
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          personalInfo: kycData.personalInfo,
          financialProfile: kycData.financialProfile,
          documents: kycData.documents,
          verification: kycData.verification
        })
      });
      const result = await response.json();
      if (result.success) {
        setKycData(prev => ({
          ...prev,
          verification: {
            ...prev.verification,
            overallStatus: 'in_review'
          }
        }));
        onComplete('in_review');
      } else {
        setErrors({ submit: result.error || 'Errore invio KYC' });
      }
    } catch (error) {
      setErrors({ submit: 'Errore di rete o server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'completed' ? '#059669' : status === 'current' ? '#3b82f6' : '#e5e7eb', color: status === 'pending' ? '#9ca3af' : 'white', marginBottom: '0.5rem', fontWeight: 600 }}>
                {status === 'completed' ? (<CheckCircle size={24} />) : (<Icon size={24} />)}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: status === 'pending' ? '#9ca3af' : '#374151', textAlign: 'center' }}>{step.title}</span>
              {index < steps.length - 1 && (<div style={{ position: 'absolute', top: 25, left: '50%', width: '100%', height: 2, background: status === 'completed' ? '#059669' : '#e5e7eb', zIndex: -1 }} />)}
            </div>
          );
        })}
      </div>
      {/* Step Content */}
      <div style={{ background: 'white', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><User size={24} />Personal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={kycData.personalInfo.firstName} onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.firstName'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your first name" />
                {errors['personalInfo.firstName'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.firstName']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={kycData.personalInfo.lastName} onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.lastName'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your last name" />
                {errors['personalInfo.lastName'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.lastName']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Date of Birth <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="date" value={kycData.personalInfo.dateOfBirth} onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.dateOfBirth'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} />
                {errors['personalInfo.dateOfBirth'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.dateOfBirth']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Nationality <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={kycData.personalInfo.nationality} onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.nationality'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
                  <option value="">Select nationality</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="IT">Italy</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
                {errors['personalInfo.nationality'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.nationality']}</p>)}
              </div>
              {/* Mostra il campo Codice Fiscale solo se la nazionalità è Italia */}
              {kycData.personalInfo.nationality && kycData.personalInfo.nationality.toLowerCase() === 'italia' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Codice Fiscale <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" value={kycData.personalInfo.codiceFiscale} onChange={(e) => handleInputChange('personalInfo', 'codiceFiscale', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.codiceFiscale'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your Codice Fiscale" />
                    {errors['personalInfo.codiceFiscale'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.codiceFiscale']}</p>)}
                  </div>
                </>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={kycData.personalInfo.address} onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.address'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your full address" />
                {errors['personalInfo.address'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.address']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>City <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={kycData.personalInfo.city} onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.city'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your city" />
                {errors['personalInfo.city'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.city']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Country <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={kycData.personalInfo.country} onChange={(e) => handleInputChange('personalInfo', 'country', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.country'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="IT">Italy</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
                {errors['personalInfo.country'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.country']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="tel" value={kycData.personalInfo.phone} onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.phone'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your phone number" />
                {errors['personalInfo.phone'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.phone']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="email" value={kycData.personalInfo.email} onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['personalInfo.email'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your email address" />
                {errors['personalInfo.email'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['personalInfo.email']}</p>)}
              </div>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div> {/* ...Financial Profile step... */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={24} />Financial Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Employment Status <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={kycData.financialProfile.employmentStatus} onChange={(e) => handleInputChange('financialProfile', 'employmentStatus', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['financialProfile.employmentStatus'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
                  <option value="">Select employment status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </select>
                {errors['financialProfile.employmentStatus'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['financialProfile.employmentStatus']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Annual Income <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={kycData.financialProfile.annualIncome} onChange={(e) => handleInputChange('financialProfile', 'annualIncome', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['financialProfile.annualIncome'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }} placeholder="Enter your annual income" />
                {errors['financialProfile.annualIncome'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['financialProfile.annualIncome']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Source of Funds <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={kycData.financialProfile.sourceOfFunds} onChange={(e) => handleInputChange('financialProfile', 'sourceOfFunds', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['financialProfile.sourceOfFunds'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
                  <option value="">Select source of funds</option>
                  <option value="Savings">Savings</option>
                  <option value="Investments">Investments</option>
                  <option value="Inheritance">Inheritance</option>
                  <option value="Other">Other</option>
                </select>
                {errors['financialProfile.sourceOfFunds'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['financialProfile.sourceOfFunds']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Investment Experience <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={kycData.financialProfile.investmentExperience} onChange={(e) => handleInputChange('financialProfile', 'investmentExperience', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['financialProfile.investmentExperience'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
                  <option value="">Select investment experience</option>
                  <option value="None">None</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                {errors['financialProfile.investmentExperience'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['financialProfile.investmentExperience']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Risk Tolerance <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={kycData.financialProfile.riskTolerance} onChange={(e) => handleInputChange('financialProfile', 'riskTolerance', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: errors['financialProfile.riskTolerance'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
                  <option value="">Select risk tolerance</option>
                  <option value="Very Conservative">Very Conservative</option>
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                  <option value="Very Aggressive">Very Aggressive</option>
                </select>
                {errors['financialProfile.riskTolerance'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['financialProfile.riskTolerance']}</p>)}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Investment Goals <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={kycData.financialProfile.investmentGoals[0] || ''} onChange={(e) => handleInputChange('financialProfile', 'investmentGoals', [e.target.value])} style={{ width: '100%', padding: '0.75rem', border: errors['financialProfile.investmentGoals'] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}>
                  <option value="">Select investment goal</option>
                  <option value="Growth">Growth</option>
                  <option value="Income">Income</option>
                  <option value="Preservation">Preservation</option>
                  <option value="Other">Other</option>
                </select>
                {errors['financialProfile.investmentGoals'] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors['financialProfile.investmentGoals']}</p>)}
              </div>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div> {/* ...Document Upload step... */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={24} />Document Upload</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {(['idDocument', 'proofOfAddress', 'bankStatement'] as const).map((field) => (
                <div key={field}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                    {field === 'idDocument' && 'ID Document'}
                    {field === 'proofOfAddress' && 'Proof of Address'}
                    {field === 'bankStatement' && 'Bank Statement'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => handleFileUpload(field, e.target.files?.[0] || null)}
                    style={{ width: '100%', padding: '0.75rem', border: errors[`documents.${field}`] ? '1px solid #ef4444' : '1px solid #d1d5db', borderRadius: 8, fontSize: 16 }}
                  />
                  {uploadStatus[field] === 'uploading' && <span style={{ color: '#3b82f6', fontSize: 12 }}>Uploading...</span>}
                  {uploadStatus[field] === 'success' && kycData.documents[field as keyof typeof kycData.documents] && <span style={{ color: '#059669', fontSize: 12 }}>Uploaded ✓</span>}
                  {uploadStatus[field] === 'error' && <span style={{ color: '#ef4444', fontSize: 12 }}>{uploadError[field]}</span>}
                  {errors[`documents.${field}`] && (<p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors[`documents.${field}`]}</p>)}
                  {kycData.documents[field as keyof typeof kycData.documents] && typeof kycData.documents[field as keyof typeof kycData.documents] === 'string' && (
                    <a href={kycData.documents[field as keyof typeof kycData.documents] as string} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'underline', display: 'block', marginTop: 4 }}>View uploaded file</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {currentStep === 4 && (
          <div> {/* ...Verification Summary step... */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={24} />Verification Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Personal Information</h3>
                <p><strong>First Name:</strong> {kycData.personalInfo.firstName}</p>
                <p><strong>Last Name:</strong> {kycData.personalInfo.lastName}</p>
                <p><strong>Date of Birth:</strong> {kycData.personalInfo.dateOfBirth}</p>
                <p><strong>Nationality:</strong> {kycData.personalInfo.nationality}</p>
                <p><strong>Address:</strong> {kycData.personalInfo.address}, {kycData.personalInfo.city}, {kycData.personalInfo.country}</p>
                <p><strong>Phone:</strong> {kycData.personalInfo.phone}</p>
                <p><strong>Email:</strong> {kycData.personalInfo.email}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Financial Profile</h3>
                <p><strong>Employment Status:</strong> {kycData.financialProfile.employmentStatus}</p>
                <p><strong>Annual Income:</strong> {kycData.financialProfile.annualIncome}</p>
                <p><strong>Source of Funds:</strong> {kycData.financialProfile.sourceOfFunds}</p>
                <p><strong>Investment Experience:</strong> {kycData.financialProfile.investmentExperience}</p>
                <p><strong>Risk Tolerance:</strong> {kycData.financialProfile.riskTolerance}</p>
                <p><strong>Investment Goals:</strong> {kycData.financialProfile.investmentGoals.join(', ')}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Documents</h3>
                <p><strong>ID Document:</strong> {kycData.documents.idDocument ? <a href={kycData.documents.idDocument} target="_blank" rel="noopener noreferrer">{kycData.documents.idDocument}</a> : 'Not uploaded'}</p>
                <p><strong>Proof of Address:</strong> {kycData.documents.proofOfAddress ? <a href={kycData.documents.proofOfAddress} target="_blank" rel="noopener noreferrer">{kycData.documents.proofOfAddress}</a> : 'Not uploaded'}</p>
                <p><strong>Bank Statement:</strong> {kycData.documents.bankStatement ? <a href={kycData.documents.bankStatement} target="_blank" rel="noopener noreferrer">{kycData.documents.bankStatement}</a> : 'Not uploaded'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button onClick={handlePrevious} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: 8, background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><ArrowLeft size={16} />Previous</button>
              <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: 8, background: isSubmitting ? '#9ca3af' : '#059669', color: 'white', fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>{isSubmitting ? 'Submitting...' : 'Submit KYC Application'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
