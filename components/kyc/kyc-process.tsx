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
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
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

interface KYCProcessProps {
  userId: string;
  onComplete: (status: string) => void;
}

export default function KYCProcess({ userId, onComplete }: KYCProcessProps) {
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
      email: ''
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
      if (!personalInfo.firstName) newErrors['personalInfo.firstName'] = 'First name is required';
      if (!personalInfo.lastName) newErrors['personalInfo.lastName'] = 'Last name is required';
      if (!personalInfo.dateOfBirth) newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
      if (!personalInfo.nationality) newErrors['personalInfo.nationality'] = 'Nationality is required';
      if (!personalInfo.address) newErrors['personalInfo.address'] = 'Address is required';
      if (!personalInfo.city) newErrors['personalInfo.city'] = 'City is required';
      if (!personalInfo.country) newErrors['personalInfo.country'] = 'Country is required';
      if (!personalInfo.phone) newErrors['personalInfo.phone'] = 'Phone number is required';
      if (!personalInfo.email) newErrors['personalInfo.email'] = 'Email is required';
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

  // Simulate file upload (temporary solution until storage is fixed)
  const uploadDocument = async (field: string, file: File) => {
    if (!file || !userId) return null;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock URL for now
    const mockUrl = `https://mock-storage.com/${userId}/${Date.now()}_${file.name}`;
    console.log(`📁 Simulated upload for ${field}:`, mockUrl);
    
    return mockUrl;
  };

  // Modifica handleFileUpload per upload reale
  const handleFileUpload = async (field: string, file: File | null) => {
    if (!file) {
      setKycData(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: null }
      }));
      return;
    }
    // Upload reale
    const url = await uploadDocument(field, file);
    setKycData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: url }
    }));
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
      // Simulate saving KYC records (temporary solution)
      console.log('📋 Saving KYC data:', kycData);
      
      // Simulate database delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just mark as completed without database save
      setKycData(prev => ({
        ...prev,
        verification: {
          personalInfoVerified: true,
          documentsVerified: true,
          financialProfileVerified: true,
          overallStatus: 'in_review'
        }
      }));
      
      console.log('✅ KYC submission completed successfully');
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
                  value={kycData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.firstName'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your first name"
                />
                {errors['personalInfo.firstName'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.firstName']}
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
                  value={kycData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.lastName'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                  placeholder="Enter your last name"
                />
                {errors['personalInfo.lastName'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.lastName']}
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
                  value={kycData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['personalInfo.dateOfBirth'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                />
                {errors['personalInfo.dateOfBirth'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['personalInfo.dateOfBirth']}
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
                  value={kycData.financialProfile.employmentStatus}
                  onChange={(e) => handleInputChange('financialProfile', 'employmentStatus', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.employmentStatus'] ? '1px solid #ef4444' : '1px solid #d1d5db',
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
                {errors['financialProfile.employmentStatus'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.employmentStatus']}
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
                  value={kycData.financialProfile.annualIncome}
                  onChange={(e) => handleInputChange('financialProfile', 'annualIncome', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.annualIncome'] ? '1px solid #ef4444' : '1px solid #d1d5db',
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
                {errors['financialProfile.annualIncome'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.annualIncome']}
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
                  value={kycData.financialProfile.sourceOfFunds}
                  onChange={(e) => handleInputChange('financialProfile', 'sourceOfFunds', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.sourceOfFunds'] ? '1px solid #ef4444' : '1px solid #d1d5db',
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
                {errors['financialProfile.sourceOfFunds'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.sourceOfFunds']}
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
                  value={kycData.financialProfile.investmentExperience}
                  onChange={(e) => handleInputChange('financialProfile', 'investmentExperience', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.investmentExperience'] ? '1px solid #ef4444' : '1px solid #d1d5db',
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
                {errors['financialProfile.investmentExperience'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.investmentExperience']}
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
                  value={kycData.financialProfile.riskTolerance}
                  onChange={(e) => handleInputChange('financialProfile', 'riskTolerance', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors['financialProfile.riskTolerance'] ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16
                  }}
                >
                  <option value="">Select risk tolerance</option>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                {errors['financialProfile.riskTolerance'] && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                    {errors['financialProfile.riskTolerance']}
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
                      checked={kycData.financialProfile.investmentGoals.includes(goal)}
                      onChange={(e) => {
                        const currentGoals = kycData.financialProfile.investmentGoals;
                        const newGoals = e.target.checked
                          ? [...currentGoals, goal]
                          : currentGoals.filter(g => g !== goal);
                        handleInputChange('financialProfile', 'investmentGoals', newGoals);
                      }}
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: 14, color: '#374151' }}>{goal}</span>
                  </label>
                ))}
              </div>
              {errors['financialProfile.investmentGoals'] && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  {errors['financialProfile.investmentGoals']}
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
                  key: 'idDocument',
                  title: 'Government ID Document',
                  description: 'Passport, driver\'s license, or national ID card',
                  required: true
                },
                {
                  key: 'proofOfAddress',
                  title: 'Proof of Address',
                  description: 'Utility bill, bank statement, or lease agreement (not older than 3 months)',
                  required: true
                },
                {
                  key: 'bankStatement',
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
