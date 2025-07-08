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
  kyc_status: 'pending' | 'approved' | 'rejected';
  registration_date: string;
  last_login?: string;
  total_invested: number;
  current_balance: number;
  total_returns: number;
  active_packages: number;
  notes?: string;
  
  // New fields for photo and payment details
  profile_photo?: string; // Base64 or URL
  bank_details?: {
    iban: string;
    bic: string;
    account_holder: string;
    bank_name?: string;
  };
  usdt_wallet?: string; // USDT wallet address
  preferred_payment_method: 'bank' | 'usdt' | 'both';
  
  // Additional fields for better tracking
  country?: string;
  city?: string;
  address?: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  tax_id?: string;
  
  // Performance tracking
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  investment_goals: string[];
  source_of_funds: 'salary' | 'business' | 'inheritance' | 'investment' | 'other';
  
  // Communication preferences
  preferred_language: 'en' | 'it' | 'es' | 'fr' | 'de';
  marketing_consent: boolean;
  newsletter_subscription: boolean;
  
  // Security and compliance
  two_factor_enabled: boolean;
  last_password_change?: string;
  failed_login_attempts: number;
  account_locked: boolean;
  lock_reason?: string;
  
  // Audit trail
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  daily_return: number;
  duration: number;
  min_investment: number;
  max_investment: number;
  currency: string;
  status: 'active' | 'inactive';
  features: string[];
  risk_level: 'low' | 'medium' | 'high';
  category: 'conservative' | 'balanced' | 'aggressive';
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  client_id: string;
  package_id: string;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  total_returns: number;
  daily_returns: number;
  last_payout?: string;
  next_payout?: string;
  payment_method: 'bank' | 'usdt';
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  client_id: string;
  package_id?: string;
  amount: number;
  currency: string;
  type: 'investment' | 'withdrawal' | 'fee' | 'bonus';
  method: 'bank' | 'usdt' | 'stripe' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_id?: string;
  description: string;
  fee: number;
  net_amount: number;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface KYCApplication {
  id: string;
  client_id: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    id: string;
    type: 'passport' | 'id_card' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'proof_of_address' | 'selfie';
    filename: string;
    url: string;
    uploaded_at: string;
    verified: boolean;
  }[];
  personal_info: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
    passport_number: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
  };
  financial_info: {
    employment_status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
    annual_income: number;
    source_of_funds: string;
    expected_investment_amount: number;
    investment_experience: 'none' | 'beginner' | 'intermediate' | 'advanced';
    risk_tolerance: 'low' | 'medium' | 'high';
  };
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  permissions: {
    can_view_dashboard: boolean;
    can_manage_packages: boolean;
    can_manage_users: boolean;
    can_manage_payments: boolean;
    can_view_analytics: boolean;
    can_manage_system: boolean;
  };
  is_active: boolean;
  last_login: Date;
  login_attempts: number;
  locked_until?: Date;
  two_factor_enabled: boolean;
  ip_whitelist?: string[];
  profile_photo?: string;
  created_at: string;
  updated_at: string;
}
