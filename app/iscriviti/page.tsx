"use client";

import { useState } from 'react';
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
  Target
} from 'lucide-react';

interface InvestmentPackage {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyReturn: number;
  duration: number;
  features: string[];
  popular?: boolean;
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
  
  // Terms
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing: boolean;
}

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<RegistrationData>({
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
    idType: '',
    idNumber: '',
    idExpiry: '',
    occupation: '',
    annualIncome: '',
    sourceOfFunds: '',
    selectedPackage: '',
    investmentAmount: 0,
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false
  });

  const investmentPackages: InvestmentPackage[] = [
    {
      id: 'starter',
      name: 'Starter Package',
      minAmount: 1000,
      maxAmount: 5000,
      dailyReturn: 0.8,
      duration: 30,
      features: ['Daily returns', '24/7 support', 'Risk management', 'Mobile app access']
    },
    {
      id: 'premium',
      name: 'Premium Package',
      minAmount: 5000,
      maxAmount: 25000,
      dailyReturn: 1.2,
      duration: 60,
      features: ['Higher daily returns', 'Priority support', 'Advanced analytics', 'Portfolio management'],
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP Package',
      minAmount: 25000,
      maxAmount: 100000,
      dailyReturn: 1.8,
      duration: 90,
      features: ['Maximum returns', 'Dedicated manager', 'Exclusive events', 'Custom strategies']
    }
  ];

  const calculateReturns = (amount: number, dailyReturn: number, duration: number) => {
    const dailyEarnings = (amount * dailyReturn) / 100;
    const monthlyEarnings = dailyEarnings * 30;
    const totalEarnings = dailyEarnings * duration;
    return { dailyEarnings, monthlyEarnings, totalEarnings };
  };

  const selectedPackage = investmentPackages.find(p => p.id === formData.selectedPackage);

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && 
               formData.phone && formData.password && formData.confirmPassword &&
               formData.password === formData.confirmPassword && 
               formData.password.length >= 8 &&
               formData.dateOfBirth && formData.nationality && 
               formData.address && formData.city && formData.country && formData.postalCode;
      case 2:
        return formData.idType && formData.idNumber && formData.idExpiry &&
               formData.occupation && formData.annualIncome && formData.sourceOfFunds;
      case 3:
        return formData.selectedPackage && formData.investmentAmount > 0;
      case 4:
        return formData.acceptTerms && formData.acceptPrivacy;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
        setError('');
      }
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

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
        setSuccess('Registration successful! You will receive a confirmation email shortly.');
        // Reset form
        setFormData({
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
          idType: '',
          idNumber: '',
          idExpiry: '',
          occupation: '',
          annualIncome: '',
          sourceOfFunds: '',
          selectedPackage: '',
          investmentAmount: 0,
          acceptTerms: false,
          acceptPrivacy: false,
          acceptMarketing: false
        });
        setCurrentStep(1);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
        Personal Information
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nationality *</label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Address *</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Country *</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Postal Code *</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
        KYC Verification
      </h2>
      
      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Shield size={20} color="#059669" />
          <span style={{ fontWeight: 600, color: '#059669' }}>Know Your Customer (KYC)</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          We are required to verify your identity for regulatory compliance and security purposes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>ID Type *</label>
          <select
            value={formData.idType}
            onChange={(e) => handleInputChange('idType', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          >
            <option value="">Select ID Type</option>
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="drivers_license">Driver's License</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>ID Number *</label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>ID Expiry Date *</label>
        <input
          type="date"
          value={formData.idExpiry}
          onChange={(e) => handleInputChange('idExpiry', e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Occupation *</label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => handleInputChange('occupation', e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Annual Income *</label>
          <select
            value={formData.annualIncome}
            onChange={(e) => handleInputChange('annualIncome', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          >
            <option value="">Select Income Range</option>
            <option value="under_25000">Under $25,000</option>
            <option value="25000_50000">$25,000 - $50,000</option>
            <option value="50000_100000">$50,000 - $100,000</option>
            <option value="100000_250000">$100,000 - $250,000</option>
            <option value="over_250000">Over $250,000</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Source of Funds *</label>
          <select
            value={formData.sourceOfFunds}
            onChange={(e) => handleInputChange('sourceOfFunds', e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            required
          >
            <option value="">Select Source</option>
            <option value="salary">Salary/Employment</option>
            <option value="business">Business Income</option>
            <option value="investment">Investment Returns</option>
            <option value="inheritance">Inheritance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
        Choose Your Investment Package
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {investmentPackages.map(package => (
          <div
            key={package.id}
            style={{
              border: formData.selectedPackage === package.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              background: 'white',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
            onClick={() => handleInputChange('selectedPackage', package.id)}
          >
            {package.popular && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#f59e0b',
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                MOST POPULAR
              </div>
            )}
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {package.name}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={20} color="#059669" />
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
                {package.dailyReturn}%
              </span>
              <span style={{ color: '#6b7280' }}>daily return</span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                Investment Range: ${package.minAmount.toLocaleString()} - ${package.maxAmount.toLocaleString()}
              </p>
              <p style={{ color: '#6b7280' }}>
                Duration: {package.duration} days
              </p>
            </div>
            
            <ul style={{ marginBottom: '1rem' }}>
              {package.features.map((feature, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <CheckCircle size={14} color="#059669" />
                  <span style={{ fontSize: '0.875rem' }}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            Investment Amount
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Amount (${selectedPackage.minAmount.toLocaleString()} - ${selectedPackage.maxAmount.toLocaleString()})
            </label>
            <input
              type="number"
              value={formData.investmentAmount || ''}
              onChange={(e) => handleInputChange('investmentAmount', parseFloat(e.target.value) || 0)}
              min={selectedPackage.minAmount}
              max={selectedPackage.maxAmount}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>

          {formData.investmentAmount > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {(() => {
                const returns = calculateReturns(formData.investmentAmount, selectedPackage.dailyReturn, selectedPackage.duration);
                return (
                  <>
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>
                        ${returns.dailyEarnings.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Daily Earnings</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                        ${returns.monthlyEarnings.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Monthly Earnings</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>
                        ${returns.totalEarnings.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Earnings</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
        Payment & Terms
      </h2>
      
      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Payment Information</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Card Number *</label>
          <div style={{ position: 'relative' }}>
            <CreditCard size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              style={{ width: '100%', padding: '0.75rem', paddingLeft: '2.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Expiry Date *</label>
            <input
              type="text"
              placeholder="MM/YY"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>CVV *</label>
            <input
              type="text"
              placeholder="123"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cardholder Name *</label>
          <input
            type="text"
            placeholder="John Doe"
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: '0.875rem' }}>
            I accept the <a href="#" style={{ color: '#3b82f6' }}>Terms and Conditions</a> *
          </span>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="checkbox"
            checked={formData.acceptPrivacy}
            onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: '0.875rem' }}>
            I accept the <a href="#" style={{ color: '#3b82f6' }}>Privacy Policy</a> *
          </span>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={formData.acceptMarketing}
            onChange={(e) => handleInputChange('acceptMarketing', e.target.checked)}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: '0.875rem' }}>
            I agree to receive marketing communications
          </span>
        </label>
      </div>

      <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AlertCircle size={20} color="#92400e" />
          <span style={{ fontWeight: 600, color: '#92400e' }}>Important Notice</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5 }}>
          Investment involves risk. Past performance does not guarantee future results. 
          Please ensure you understand the risks before investing.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>
            Join GLG Capital Group
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Start your investment journey with our premium financial services
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#059669',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Progress Bar */}
        <div style={{ maxWidth: 600, margin: '0 auto 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            {[1, 2, 3, 4].map(step => (
              <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: step <= currentStep ? '#3b82f6' : '#e5e7eb',
                  color: step <= currentStep ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem',
                  fontWeight: 600
                }}>
                  {step}
                </div>
                <span style={{ fontSize: '0.875rem', color: step <= currentStep ? '#3b82f6' : '#6b7280' }}>
                  {step === 1 && 'Personal Info'}
                  {step === 2 && 'KYC'}
                  {step === 3 && 'Investment'}
                  {step === 4 && 'Payment'}
                </span>
              </div>
            ))}
          </div>
          <div style={{ background: '#e5e7eb', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              background: '#3b82f6',
              height: '100%',
              width: `${(currentStep / 4) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Form Content */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#374151',
                borderRadius: '6px',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.acceptTerms || !formData.acceptPrivacy || isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: formData.acceptTerms && formData.acceptPrivacy && !isLoading ? '#059669' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: formData.acceptTerms && formData.acceptPrivacy && !isLoading ? 'pointer' : 'not-allowed',
                  fontWeight: 600
                }}
              >
                {isLoading ? 'Processing...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 