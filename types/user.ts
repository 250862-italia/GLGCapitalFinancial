export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: 'user' | 'admin' | 'super_admin'
  kyc_status: "pending" | "verified" | "rejected"
  is_active: boolean
  created_at: string
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  status: 'active' | 'inactive' | 'pending';
  kycStatus: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
  lastLogin?: string;
  totalInvested: number;
  currentBalance: number;
  totalReturns: number;
  activePackages: number;
  notes?: string;
  
  // New fields for photo and payment details
  profilePhoto?: string; // Base64 or URL
  bankDetails?: {
    iban: string;
    bic: string;
    accountHolder: string;
    bankName?: string;
  };
  usdtWallet?: string; // USDT wallet address
  preferredPaymentMethod: 'bank' | 'usdt' | 'both';
  
  // Additional fields for better tracking
  country?: string;
  city?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  taxId?: string;
  
  // Performance tracking
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  sourceOfFunds: 'salary' | 'business' | 'inheritance' | 'investment' | 'other';
  
  // Communication preferences
  preferredLanguage: 'en' | 'it' | 'es' | 'fr' | 'de';
  marketingConsent: boolean;
  newsletterSubscription: boolean;
  
  // Security and compliance
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockReason?: string;
  
  // Audit trail
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  dailyReturn: number;
  duration: number;
  minInvestment: number;
  maxInvestment: number;
  currency: string;
  status: 'active' | 'inactive';
  features: string[];
  riskLevel: 'low' | 'medium' | 'high';
  category: 'conservative' | 'balanced' | 'aggressive';
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  clientId: string;
  packageId: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalReturns: number;
  dailyReturns: number;
  lastPayout?: string;
  nextPayout?: string;
  paymentMethod: 'bank' | 'usdt';
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  clientId: string;
  packageId?: string;
  amount: number;
  currency: string;
  type: 'investment' | 'withdrawal' | 'fee' | 'bonus';
  method: 'bank' | 'usdt' | 'stripe' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  description: string;
  fee: number;
  netAmount: number;
  processedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCApplication {
  id: string;
  clientId: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    id: string;
    type: 'passport' | 'id_card' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'proof_of_address' | 'selfie';
    filename: string;
    url: string;
    uploadedAt: string;
    verified: boolean;
  }[];
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  financialInfo: {
    employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
    annualIncome: number;
    sourceOfFunds: string;
    expectedInvestmentAmount: number;
    investmentExperience: 'none' | 'beginner' | 'intermediate' | 'advanced';
    riskTolerance: 'low' | 'medium' | 'high';
  };
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  permissions: {
    canViewDashboard: boolean;
    canManagePackages: boolean;
    canManageUsers: boolean;
    canManagePayments: boolean;
    canViewAnalytics: boolean;
    canManageSystem: boolean;
  };
  isActive: boolean;
  lastLogin: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  twoFactorEnabled: boolean;
  ipWhitelist?: string[];
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}
