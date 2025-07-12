// Simplified KYC System
// This replaces the complex KYC system with a simple, reliable approach

export interface SimpleKYCData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  address?: string;
  date_of_birth?: string;
  nationality?: string;
  employment_status?: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
  annual_income?: string;
  source_of_funds?: string;
  investment_experience?: 'none' | 'beginner' | 'intermediate' | 'advanced';
  risk_tolerance?: 'low' | 'medium' | 'high';
  investment_goals?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'email_verified';
  email_verified: boolean;
  email_verification_code?: string;
  email_verification_expires?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface SimpleKYCValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

// Simple validation function
export function validateSimpleKYC(data: Partial<SimpleKYCData>): SimpleKYCValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Required fields validation
  if (!data.first_name?.trim()) {
    errors.push('Nome è obbligatorio');
    score -= 20;
  }
  if (!data.last_name?.trim()) {
    errors.push('Cognome è obbligatorio');
    score -= 20;
  }
  if (!data.email?.trim()) {
    errors.push('Email è obbligatoria');
    score -= 20;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email non valida');
    score -= 10;
  }
  if (!data.phone?.trim()) {
    errors.push('Telefono è obbligatorio');
    score -= 15;
  }
  if (!data.country?.trim()) {
    errors.push('Paese è obbligatorio');
    score -= 15;
  }

  // Optional fields validation (warnings only)
  if (!data.city?.trim()) {
    warnings.push('Città non specificata');
    score -= 5;
  }
  if (!data.address?.trim()) {
    warnings.push('Indirizzo non specificato');
    score -= 5;
  }
  if (!data.date_of_birth) {
    warnings.push('Data di nascita non specificata');
    score -= 5;
  }
  if (!data.nationality?.trim()) {
    warnings.push('Nazionalità non specificata');
    score -= 5;
  }
  if (!data.employment_status) {
    warnings.push('Stato occupazionale non specificato');
    score -= 5;
  }
  if (!data.annual_income) {
    warnings.push('Reddito annuale non specificato');
    score -= 5;
  }
  if (!data.source_of_funds) {
    warnings.push('Fonte dei fondi non specificata');
    score -= 5;
  }
  if (!data.investment_experience) {
    warnings.push('Esperienza di investimento non specificata');
    score -= 5;
  }
  if (!data.risk_tolerance) {
    warnings.push('Tolleranza al rischio non specificata');
    score -= 5;
  }
  if (!data.investment_goals?.length) {
    warnings.push('Obiettivi di investimento non specificati');
    score -= 5;
  }

  // Age validation if date of birth is provided
  if (data.date_of_birth) {
    const birthDate = new Date(data.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      errors.push('Devi avere almeno 18 anni');
      score -= 30;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

// Generate email verification code
export function generateEmailVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Check if email verification code is expired
export function isEmailVerificationExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}

// Calculate verification expiry time (24 hours from now)
export function getEmailVerificationExpiry(): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry.toISOString();
}

// Simple KYC status management
export const KYC_STATUS = {
  PENDING: 'pending',
  EMAIL_VERIFIED: 'email_verified',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

// KYC approval criteria
export function canApproveKYC(kycData: SimpleKYCData): { canApprove: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  if (!kycData.email_verified) {
    reasons.push('Email non verificata');
  }
  
  if (!kycData.first_name || !kycData.last_name) {
    reasons.push('Nome e cognome obbligatori');
  }
  
  if (!kycData.phone) {
    reasons.push('Telefono obbligatorio');
  }
  
  if (!kycData.country) {
    reasons.push('Paese obbligatorio');
  }
  
  return {
    canApprove: reasons.length === 0,
    reasons
  };
} 