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

export default function IscrivitiPage() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>Registrazione Clienti</h1>
      <p>Questa è una pagina di test minima. Il modulo di registrazione verrà reinserito dopo la verifica del build.</p>
    </div>
  );
} 