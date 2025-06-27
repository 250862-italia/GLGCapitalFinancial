"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CreditCard, 
  Wallet, 
  Copy, 
  Upload, 
  X, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Building2,
  Globe,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Target,
  TrendingUp,
  Mail,
  Phone,
  Lock
} from 'lucide-react';
import { usePackages } from '../../lib/package-context';

interface RegistrationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  
  // Profile Photo (required)
  profilePhoto: string;
  
  // Bank Details
  bankDetails: {
    iban: string;
    bic: string;
    accountHolder: string;
    bankName?: string;
  };
  
  // USDT Wallet
  usdtWallet: string;
  preferredPaymentMethod: 'bank' | 'usdt' | 'both';
  
  // Additional Information
  country: string;
  city: string;
  address: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  taxId: string;
  
  // Investment Profile
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  sourceOfFunds: 'salary' | 'business' | 'inheritance' | 'investment' | 'other';
  annualIncome: number;
  expectedInvestmentAmount: number;
  investmentExperience: 'none' | 'beginner' | 'intermediate' | 'advanced';
  
  // Communication Preferences
  preferredLanguage: 'en' | 'it' | 'es' | 'fr' | 'de';
  marketingConsent: boolean;
  newsletterSubscription: boolean;
}

export default function RegistrationPage() {
  const router = useRouter();
  const { packages } = usePackages();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    profilePhoto: '',
    bankDetails: {
      iban: '',
      bic: '',
      accountHolder: '',
      bankName: ''
    },
    usdtWallet: '',
    preferredPaymentMethod: 'bank',
    country: '',
    city: '',
    address: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    taxId: '',
    riskProfile: 'moderate',
    investmentGoals: [],
    sourceOfFunds: 'salary',
    annualIncome: 0,
    expectedInvestmentAmount: 0,
    investmentExperience: 'beginner',
    preferredLanguage: 'en',
    marketingConsent: false,
    newsletterSubscription: false
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof RegistrationData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profilePhoto: ''
    }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${field} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const validateStep1 = () => {
    return formData.firstName && formData.lastName && formData.email && formData.phone && formData.profilePhoto;
  };

  const validateStep2 = () => {
    return formData.bankDetails.iban && formData.bankDetails.bic && formData.bankDetails.accountHolder && formData.usdtWallet;
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically send the data to your API
      console.log('Registration data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page or dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: '0.5rem' }}>
            GLG Capital Group LLC
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9 }}>
            Complete Your Registration
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '2rem 2rem 0' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: currentStep >= 1 ? '#059669' : '#6b7280'
            }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%',
                background: currentStep >= 1 ? '#059669' : '#e5e7eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}>
                {currentStep > 1 ? <CheckCircle size={20} /> : '1'}
              </div>
              <span style={{ fontWeight: 600 }}>Personal Information</span>
            </div>
            
            <div style={{ 
              flex: 1, 
              height: 2, 
              background: currentStep >= 2 ? '#059669' : '#e5e7eb',
              margin: '0 1rem'
            }} />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: currentStep >= 2 ? '#059669' : '#6b7280'
            }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%',
                background: currentStep >= 2 ? '#059669' : '#e5e7eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}>
                {currentStep > 2 ? <CheckCircle size={20} /> : '2'}
              </div>
              <span style={{ fontWeight: 600 }}>Payment Details</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ padding: '0 2rem 2rem' }}>
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: '2rem', color: '#1f2937' }}>
                Personal Information
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Basic Information */}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} />
                    Basic Information
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        First Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Last Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Email <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Phone <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={20} />
                    Profile Photo <span style={{ color: '#ef4444' }}>*</span>
                  </h3>
                  
                  <div style={{ 
                    border: '2px dashed #d1d5db', 
                    borderRadius: 8, 
                    padding: '2rem',
                    textAlign: 'center',
                    background: formData.profilePhoto ? 'white' : '#f9fafb'
                  }}>
                    {formData.profilePhoto ? (
                      <div>
                        <img 
                          src={formData.profilePhoto} 
                          alt="Profile" 
                          style={{ 
                            width: 120, 
                            height: 120, 
                            borderRadius: '50%', 
                            objectFit: 'cover',
                            marginBottom: '1rem'
                          }} 
                        />
                        <button
                          onClick={removePhoto}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '0 auto'
                          }}
                        >
                          <X size={16} />
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                          Click to upload your profile photo
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'inline-block'
                          }}
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={20} />
                    Company Information (Optional)
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter your company name"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Position
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter your position"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: '2rem', color: '#1f2937' }}>
                Payment Details
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Bank Details */}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={20} />
                    Bank Account Details
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        IBAN <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={formData.bankDetails.iban}
                          onChange={(e) => handleInputChange('bankDetails.iban', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            paddingRight: '3rem',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 16
                          }}
                          placeholder="Enter IBAN"
                        />
                        <button
                          onClick={() => copyToClipboard(formData.bankDetails.iban, 'IBAN')}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        BIC/SWIFT <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.bic}
                        onChange={(e) => handleInputChange('bankDetails.bic', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter BIC/SWIFT code"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Account Holder <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.accountHolder}
                        onChange={(e) => handleInputChange('bankDetails.accountHolder', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter account holder name"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.bankName}
                        onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16
                        }}
                        placeholder="Enter bank name"
                      />
                    </div>
                  </div>
                </div>

                {/* USDT Wallet */}
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wallet size={20} />
                    USDT Wallet
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        USDT Wallet Address <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={formData.usdtWallet}
                          onChange={(e) => handleInputChange('usdtWallet', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            paddingRight: '3rem',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 16
                          }}
                          placeholder="Enter USDT wallet address"
                        />
                        <button
                          onClick={() => copyToClipboard(formData.usdtWallet, 'USDT Address')}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                        Preferred Payment Method
                      </label>
                      <select
                        value={formData.preferredPaymentMethod}
                        onChange={(e) => handleInputChange('preferredPaymentMethod', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 16,
                          background: 'white'
                        }}
                      >
                        <option value="bank">Bank Transfer</option>
                        <option value="usdt">USDT</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                background: currentStep === 1 ? '#e5e7eb' : '#6b7280',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !validateStep1()) ||
                (currentStep === 2 && !validateStep2())
              }
              style={{
                background: (
                  (currentStep === 1 && !validateStep1()) ||
                  (currentStep === 2 && !validateStep2())
                ) ? '#e5e7eb' : '#059669',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                cursor: (
                  (currentStep === 1 && !validateStep1()) ||
                  (currentStep === 2 && !validateStep2())
                ) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              {currentStep === 2 ? 'Complete Registration' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}