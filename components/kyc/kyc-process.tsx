"use client";

import { useState } from 'react';
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

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Financial Profile', icon: CreditCard },
    { id: 3, title: 'Document Upload', icon: FileText },
    { id: 4, title: 'Verification', icon: Shield }
  ];

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

    if (step === 3) {
      const { documents } = kycData;
      if (!documents.id_document) newErrors['documents.id_document'] = 'ID document is required';
      if (!documents.proof_of_address) newErrors['documents.proof_of_address'] = 'Proof of address is required';
      if (!documents.bank_statement) newErrors['documents.bank_statement'] = 'Bank statement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Rimuovo la sezione di upload file e mostro istruzioni email
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
    <strong>Per completare la verifica KYC, invia i seguenti documenti a <a href="mailto:kyc@glgcapitalgroup.com" style={{ color: '#b45309', textDecoration: 'underline' }}>kyc@glgcapitalgroup.com</a>:</strong>
    <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24 }}>
      <li>Documento d'identità (fronte/retro)</li>
      <li>Prova di residenza (es. bolletta, estratto conto)</li>
      <li>Estratto conto bancario (opzionale)</li>
    </ul>
    <div style={{ marginTop: 16 }}>
      <em>Riceverai una conferma via email una volta che i documenti saranno stati verificati.</em>
    </div>
  </div>

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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      {/* Progress Steps */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '3rem',
        position: 'relative'
      }}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          return (
            <div key={step.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative'
            }}>
              {/* Step Icon */}
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: status === 'completed' ? '#059669' : 
                          status === 'current' ? '#3b82f6' : '#e5e7eb',
                color: status === 'pending' ? '#9ca3af' : 'white',
                marginBottom: '0.5rem',
                fontWeight: 600
              }}>
                {status === 'completed' ? (
                  <CheckCircle size={24} />
                ) : (
                  <Icon size={24} />
                )}
              </div>
              
              {/* Step Title */}
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: status === 'pending' ? '#9ca3af' : '#374151',
                textAlign: 'center'
              }}>
                {step.title}
              </span>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: 25,
                  left: '50%',
                  width: '100%',
                  height: 2,
                  background: status === 'completed' ? '#059669' : '#e5e7eb',
                  zIndex: -1
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        {currentStep === 1 && (
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <User size={24} />
              Personal Information
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={kycData.personalInfo.first_name}
                  onChange={(e) => handleInputChange('personalInfo', 'first_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.first_name'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your first name"
                />
                {errors['personalInfo.first_name'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.first_name']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={kycData.personalInfo.last_name}
                  onChange={(e) => handleInputChange('personalInfo', 'last_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.last_name'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your last name"
                />
                {errors['personalInfo.last_name'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.last_name']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Date of Birth <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={kycData.personalInfo.date_of_birth}
                  onChange={(e) => handleInputChange('personalInfo', 'date_of_birth', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.date_of_birth'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
                {errors['personalInfo.date_of_birth'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.date_of_birth']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Nationality <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kycData.personalInfo.nationality}
                  onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.nationality'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select nationality</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="IT">Italy</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
                {errors['personalInfo.nationality'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.nationality']}
                  </p>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={kycData.personalInfo.address}
                  onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.address'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your full address"
                />
                {errors['personalInfo.address'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.address']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  City <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={kycData.personalInfo.city}
                  onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.city'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your city"
                />
                {errors['personalInfo.city'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.city']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Country <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kycData.personalInfo.country}
                  onChange={(e) => handleInputChange('personalInfo', 'country', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.country'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="IT">Italy</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
                {errors['personalInfo.country'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.country']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={kycData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.phone'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your phone number"
                />
                {errors['personalInfo.phone'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.phone']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={kycData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.email'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your email address"
                />
                {errors['personalInfo.email'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.email']}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CreditCard size={24} />
              Financial Profile
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Employment Status <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kycData.financialProfile.employment_status}
                  onChange={(e) => handleInputChange('financialProfile', 'employment_status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.employment_status'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select employment status</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
                {errors['financialProfile.employment_status'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.employment_status']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Annual Income <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kycData.financialProfile.annual_income}
                  onChange={(e) => handleInputChange('financialProfile', 'annual_income', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.annual_income'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select annual income</option>
                  <option value="0-25000">$0 - $25,000</option>
                  <option value="25000-50000">$25,000 - $50,000</option>
                  <option value="50000-75000">$50,000 - $75,000</option>
                  <option value="75000-100000">$75,000 - $100,000</option>
                  <option value="100000-250000">$100,000 - $250,000</option>
                  <option value="250000+">$250,000+</option>
                </select>
                {errors['financialProfile.annual_income'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.annual_income']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Source of Funds <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kycData.financialProfile.source_of_funds}
                  onChange={(e) => handleInputChange('financialProfile', 'source_of_funds', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.source_of_funds'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select source of funds</option>
                  <option value="salary">Salary/Wages</option>
                  <option value="business">Business Income</option>
                  <option value="investment">Investment Returns</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="savings">Savings</option>
                  <option value="other">Other</option>
                </select>
                {errors['financialProfile.source_of_funds'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.source_of_funds']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Investment Experience <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kycData.financialProfile.investment_experience}
                  onChange={(e) => handleInputChange('financialProfile', 'investment_experience', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.investment_experience'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select experience level</option>
                  <option value="none">No experience</option>
                  <option value="beginner">Beginner (1-2 years)</option>
                  <option value="intermediate">Intermediate (3-5 years)</option>
                  <option value="advanced">Advanced (5+ years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
                {errors['financialProfile.investment_experience'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.investment_experience']}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#374151'
                }}>
                  Risk Tolerance <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kycData.financialProfile.risk_tolerance}
                  onChange={(e) => handleInputChange('financialProfile', 'risk_tolerance', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.risk_tolerance'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select risk tolerance</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                {errors['financialProfile.risk_tolerance'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.risk_tolerance']}
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#374151'
              }}>
                Investment Goals <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  'Retirement Planning',
                  'Wealth Building',
                  'Income Generation',
                  'Capital Preservation',
                  'Tax Optimization',
                  'Education Funding'
                ].map((goal) => (
                  <label key={goal} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={kycData.financialProfile.investment_goals.includes(goal)}
                      onChange={(e) => {
                        const currentGoals = kycData.financialProfile.investment_goals;
                        const newGoals = e.target.checked
                          ? [...currentGoals, goal]
                          : currentGoals.filter(g => g !== goal);
                        handleInputChange('financialProfile', 'investment_goals', newGoals);
                      }}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: 14, color: '#374151' }}>{goal}</span>
                  </label>
                ))}
              </div>
              {errors['financialProfile.investment_goals'] && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  {errors['financialProfile.investment_goals']}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <FileText size={24} />
              Document Upload
            </h2>
            
            {/* Info Message */}
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 8,
              padding: '1.5rem',
              margin: '2rem 0',
              color: '#92400e',
              fontSize: 16
            }}>
              <strong>Per completare la verifica KYC, invia i seguenti documenti a <a href="mailto:kyc@glgcapitalgroup.com" style={{ color: '#b45309', textDecoration: 'underline' }}>kyc@glgcapitalgroup.com</a>:</strong>
              <ul style={{ marginTop: 16, marginBottom: 0, paddingLeft: 24 }}>
                <li>Documento d'identità (fronte/retro)</li>
                <li>Prova di residenza (es. bolletta, estratto conto)</li>
                <li>Estratto conto bancario (opzionale)</li>
              </ul>
              <div style={{ marginTop: 16 }}>
                <em>Riceverai una conferma via email una volta che i documenti saranno stati verificati.</em>
              </div>
            </div>
            
            <p style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              Please upload the required documents for verification. All documents must be clear, legible, and in PDF, JPG, or PNG format.
            </p>

            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {[
                {
                  key: 'id_document',
                  title: 'Government ID Document',
                  description: 'Passport, driver\'s license, or national ID card',
                  required: true
                },
                {
                  key: 'proof_of_address',
                  title: 'Proof of Address',
                  description: 'Utility bill, bank statement, or lease agreement (not older than 3 months)',
                  required: true
                },
                {
                  key: 'bank_statement',
                  title: 'Bank Statement',
                  description: 'Recent bank statement showing your name and address',
                  required: true
                }
              ].map((doc) => (
                <div key={doc.key} style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: 12,
                  padding: '2rem',
                  textAlign: 'center',
                  background: kycData.documents[doc.key as keyof typeof kycData.documents] ? '#f0fdf4' : '#f8fafc'
                }}>
                  {kycData.documents[doc.key as keyof typeof kycData.documents] ? (
                    <div>
                      <CheckCircle size={48} color="#059669" style={{ marginBottom: '1rem' }} />
                      <h4 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#059669',
                        marginBottom: '0.5rem'
                      }}>
                        {doc.title} Uploaded
                      </h4>
                      <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: '1rem'
                      }}>
                        <a href={kycData.documents[doc.key as keyof typeof kycData.documents] as string} target="_blank" rel="noopener noreferrer">View Document</a>
                      </p>
                      <button
                        onClick={() => handleFileUpload(doc.key, null as any)}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          background: 'white',
                          color: '#374151',
                          fontSize: 14,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                      <h4 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        {doc.title}
                      </h4>
                      <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: '1rem'
                      }}>
                        {doc.description}
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) await handleFileUpload(doc.key, file);
                        }}
                        style={{ display: 'none' }}
                        id={`file-${doc.key}`}
                      />
                      <label
                        htmlFor={`file-${doc.key}`}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          background: 'white',
                          color: '#374151',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                  {errors[`documents.${doc.key}`] && (
                    <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>
                      {errors[`documents.${doc.key}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Shield size={24} />
              Verification Summary
            </h2>
            
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12
              }}>
                <CheckCircle size={24} color="#059669" />
                <h3 style={{
                  color: '#166534',
                  fontSize: 18,
                  fontWeight: 600,
                  margin: 0
                }}>
                  Ready for Verification
                </h3>
              </div>
              <p style={{
                color: '#166534',
                fontSize: 14,
                margin: 0,
                opacity: 0.8
              }}>
                All required information has been provided. Your KYC application will be reviewed within 24-48 hours.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 8
              }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Personal Information</span>
                <CheckCircle size={20} color="#059669" />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 8
              }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Financial Profile</span>
                <CheckCircle size={20} color="#059669" />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 8
              }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Document Upload</span>
                <CheckCircle size={20} color="#059669" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              background: 'white',
              color: currentStep === 1 ? '#9ca3af' : '#374151',
              fontSize: 14,
              fontWeight: 600,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: 8,
                background: '#059669',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: 8,
                background: isSubmitting ? '#9ca3af' : '#059669',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit KYC Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
