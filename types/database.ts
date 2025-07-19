// Database Types per GLG Capital Financial
// Tipi TypeScript avanzati per tutte le tabelle del database

import { Database } from '@supabase/supabase-js';

// =====================================================
// 1. TIPI BASE
// =====================================================

export type UUID = string;
export type Email = string;
export type Phone = string;
export type Currency = 'USD' | 'EUR' | 'GBP';
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'completed' | 'cancelled';
export type RiskLevel = 'low' | 'medium' | 'high';
export type UserRole = 'user' | 'admin' | 'superadmin';
export type KYCStatus = 'pending' | 'processing' | 'approved' | 'rejected';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// =====================================================
// 2. TIPI DI VALIDAZIONE
// =====================================================

export type ValidEmail<T extends string> = T extends `${string}@${string}.${string}` ? T : never;
export type ValidPhone<T extends string> = T extends `+${string}` | `${string}` ? T : never;
export type ValidIBAN<T extends string> = T extends `${string}` ? T : never;
export type ValidAmount<T extends number> = T extends number ? (T extends 0 ? never : T) : never;

// =====================================================
// 3. TIPI PROFILO UTENTE
// =====================================================

export interface UserProfile {
  id: UUID;
  name: string;
  email: ValidEmail<Email>;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: ValidPhone<Phone>;
  date_of_birth?: Date;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  kyc_status: KYCStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserProfile {
  name: string;
  email: ValidEmail<Email>;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: ValidPhone<Phone>;
  date_of_birth?: Date;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  kyc_status?: KYCStatus;
}

export interface UpdateUserProfile extends Partial<CreateUserProfile> {
  id: UUID;
}

// =====================================================
// 4. TIPI CLIENTE
// =====================================================

export interface Client {
  id: UUID;
  user_id: UUID;
  profile_id: UUID;
  first_name: string;
  last_name: string;
  email: ValidEmail<Email>;
  phone?: ValidPhone<Phone>;
  company?: string;
  position?: string;
  date_of_birth?: Date;
  nationality?: string;
  profile_photo?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  iban?: ValidIBAN<string>;
  bic?: string;
  account_holder?: string;
  usdt_wallet?: string;
  client_code: string;
  status: Status;
  risk_profile: RiskLevel;
  investment_preferences: Record<string, any>;
  total_invested: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClient {
  user_id: UUID;
  profile_id: UUID;
  first_name: string;
  last_name: string;
  email: ValidEmail<Email>;
  phone?: ValidPhone<Phone>;
  company?: string;
  position?: string;
  date_of_birth?: Date;
  nationality?: string;
  profile_photo?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  iban?: ValidIBAN<string>;
  bic?: string;
  account_holder?: string;
  usdt_wallet?: string;
  client_code?: string;
  status?: Status;
  risk_profile?: RiskLevel;
  investment_preferences?: Record<string, any>;
  total_invested?: number;
}

export interface UpdateClient extends Partial<CreateClient> {
  id: UUID;
}

// =====================================================
// 5. TIPI PACCHETTO INVESTIMENTO
// =====================================================

export interface InvestmentPackage {
  id: UUID;
  name: string;
  description?: string;
  type: string;
  min_investment: ValidAmount<number>;
  max_investment?: ValidAmount<number>;
  expected_return: number; // percentage
  duration_months: number;
  risk_level: RiskLevel;
  management_fee: number; // percentage
  performance_fee: number; // percentage
  currency: Currency;
  status: Status;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvestmentPackage {
  name: string;
  description?: string;
  type: string;
  min_investment: ValidAmount<number>;
  max_investment?: ValidAmount<number>;
  expected_return: number;
  duration_months: number;
  risk_level: RiskLevel;
  management_fee?: number;
  performance_fee?: number;
  currency?: Currency;
  status?: Status;
  is_featured?: boolean;
}

export interface UpdateInvestmentPackage extends Partial<CreateInvestmentPackage> {
  id: UUID;
}

// =====================================================
// 6. TIPI INVESTIMENTO
// =====================================================

export interface Investment {
  id: UUID;
  user_id: UUID;
  client_id: UUID;
  package_id: UUID;
  amount: ValidAmount<number>;
  status: Status;
  investment_date: Date;
  maturity_date?: Date;
  expected_return: number;
  actual_return?: number;
  total_returns: number;
  daily_returns: number;
  monthly_returns: number;
  fees_paid: number;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvestment {
  user_id: UUID;
  client_id: UUID;
  package_id: UUID;
  amount: ValidAmount<number>;
  status?: Status;
  investment_date?: Date;
  maturity_date?: Date;
  expected_return: number;
  actual_return?: number;
  total_returns?: number;
  daily_returns?: number;
  monthly_returns?: number;
  fees_paid?: number;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
}

export interface UpdateInvestment extends Partial<CreateInvestment> {
  id: UUID;
}

// =====================================================
// 7. TIPI PAGAMENTO
// =====================================================

export interface Payment {
  id: UUID;
  user_id: UUID;
  investment_id: UUID;
  amount: ValidAmount<number>;
  currency: Currency;
  payment_method?: string;
  status: Status;
  transaction_id?: string;
  payment_date: Date;
  processed_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePayment {
  user_id: UUID;
  investment_id: UUID;
  amount: ValidAmount<number>;
  currency?: Currency;
  payment_method?: string;
  status?: Status;
  transaction_id?: string;
  payment_date?: Date;
  processed_date?: Date;
  notes?: string;
}

export interface UpdatePayment extends Partial<CreatePayment> {
  id: UUID;
}

// =====================================================
// 8. TIPI TEAM MEMBER
// =====================================================

export interface TeamMember {
  id: UUID;
  user_id?: UUID;
  first_name: string;
  last_name: string;
  email: ValidEmail<Email>;
  role: string;
  department?: string;
  phone?: ValidPhone<Phone>;
  hire_date?: Date;
  status: Status;
  permissions: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTeamMember {
  user_id?: UUID;
  first_name: string;
  last_name: string;
  email: ValidEmail<Email>;
  role: string;
  department?: string;
  phone?: ValidPhone<Phone>;
  hire_date?: Date;
  status?: Status;
  permissions?: Record<string, any>;
}

export interface UpdateTeamMember extends Partial<CreateTeamMember> {
  id: UUID;
}

// =====================================================
// 9. TIPI CONTENUTO
// =====================================================

export type ContentType = 'news' | 'article' | 'announcement' | 'policy' | 'market';

export interface Content {
  id: UUID;
  title: string;
  content: string;
  type: ContentType;
  status: Status;
  author_id?: UUID;
  tags?: string[];
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContent {
  title: string;
  content: string;
  type: ContentType;
  status?: Status;
  author_id?: UUID;
  tags?: string[];
  published_at?: Date;
}

export interface UpdateContent extends Partial<CreateContent> {
  id: UUID;
}

// =====================================================
// 10. TIPI RICHIESTE
// =====================================================

export interface KYCRequest {
  id: UUID;
  user_id: UUID;
  status: KYCStatus;
  document_type?: string;
  document_url?: string;
  submitted_at: Date;
  reviewed_at?: Date;
  reviewed_by?: UUID;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateKYCRequest {
  user_id: UUID;
  status?: KYCStatus;
  document_type?: string;
  document_url?: string;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: UUID;
  notes?: string;
}

export interface UpdateKYCRequest extends Partial<CreateKYCRequest> {
  id: UUID;
}

export interface InformationalRequest {
  id: UUID;
  user_id: UUID;
  request_type: string;
  subject?: string;
  message: string;
  status: Status;
  priority: Priority;
  assigned_to?: UUID;
  submitted_at: Date;
  resolved_at?: Date;
  response?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInformationalRequest {
  user_id: UUID;
  request_type: string;
  subject?: string;
  message: string;
  status?: Status;
  priority?: Priority;
  assigned_to?: UUID;
  submitted_at?: Date;
  resolved_at?: Date;
  response?: string;
}

export interface UpdateInformationalRequest extends Partial<CreateInformationalRequest> {
  id: UUID;
}

// =====================================================
// 11. TIPI ANALYTICS E MONITORING
// =====================================================

export interface Analytics {
  id: UUID;
  user_id?: UUID;
  page_visited: string;
  session_duration: number;
  timestamp: Date;
  user_agent?: string;
  ip_address?: string;
  created_at: Date;
}

export interface CreateAnalytics {
  user_id?: UUID;
  page_visited: string;
  session_duration?: number;
  timestamp?: Date;
  user_agent?: string;
  ip_address?: string;
}

export interface Notification {
  id: UUID;
  user_id: UUID;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

export interface CreateNotification {
  user_id: UUID;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  is_read?: boolean;
  read_at?: Date;
}

export interface UpdateNotification extends Partial<CreateNotification> {
  id: UUID;
}

// =====================================================
// 12. TIPI EMAIL QUEUE
// =====================================================

export interface EmailQueue {
  id: UUID;
  to_email: ValidEmail<Email>;
  from_email: ValidEmail<Email>;
  subject: string;
  html_content?: string;
  text_content?: string;
  status: Status;
  error_message?: string;
  sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmailQueue {
  to_email: ValidEmail<Email>;
  from_email: ValidEmail<Email>;
  subject: string;
  html_content?: string;
  text_content?: string;
  status?: Status;
  error_message?: string;
  sent_at?: Date;
}

export interface UpdateEmailQueue extends Partial<CreateEmailQueue> {
  id: UUID;
}

// =====================================================
// 13. TIPI UTILITY
// =====================================================

// Tipo per filtri di ricerca
export interface SearchFilters {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  status?: Status;
  date_from?: Date;
  date_to?: Date;
}

// Tipo per risposte paginate
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Tipo per statistiche
export interface DashboardStats {
  total_users: number;
  total_investments: number;
  total_amount_invested: number;
  active_investments: number;
  pending_requests: number;
  monthly_growth: number;
}

// Tipo per export dati
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: SearchFilters;
  fields?: string[];
  include_headers?: boolean;
}

// =====================================================
// 14. TIPI DI VALIDAZIONE SCHEMA
// =====================================================

export interface ValidationSchema {
  [key: string]: (value: any) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// =====================================================
// 15. TIPI DI CONFIGURAZIONE
// =====================================================

export interface DatabaseConfig {
  url: string;
  anon_key: string;
  service_key: string;
  region?: string;
}

export interface EmailConfig {
  provider: 'supabase' | 'resend' | 'nodemailer';
  api_key?: string;
  from_email: ValidEmail<Email>;
  reply_to?: ValidEmail<Email>;
}

export interface SecurityConfig {
  csrf_enabled: boolean;
  rate_limit_enabled: boolean;
  rate_limit_window: number;
  rate_limit_max_requests: number;
  session_timeout: number;
}

// =====================================================
// 16. EXPORT TUTTI I TIPI
// =====================================================

export type {
  UUID,
  Email,
  Phone,
  Currency,
  Status,
  RiskLevel,
  UserRole,
  KYCStatus,
  Priority,
  ValidEmail,
  ValidPhone,
  ValidIBAN,
  ValidAmount,
  UserProfile,
  CreateUserProfile,
  UpdateUserProfile,
  Client,
  CreateClient,
  UpdateClient,
  InvestmentPackage,
  CreateInvestmentPackage,
  UpdateInvestmentPackage,
  Investment,
  CreateInvestment,
  UpdateInvestment,
  Payment,
  CreatePayment,
  UpdatePayment,
  TeamMember,
  CreateTeamMember,
  UpdateTeamMember,
  ContentType,
  Content,
  CreateContent,
  UpdateContent,
  KYCRequest,
  CreateKYCRequest,
  UpdateKYCRequest,
  InformationalRequest,
  CreateInformationalRequest,
  UpdateInformationalRequest,
  Analytics,
  CreateAnalytics,
  Notification,
  CreateNotification,
  UpdateNotification,
  EmailQueue,
  CreateEmailQueue,
  UpdateEmailQueue,
  SearchFilters,
  PaginatedResponse,
  DashboardStats,
  ExportOptions,
  ValidationSchema,
  ValidationResult,
  DatabaseConfig,
  EmailConfig,
  SecurityConfig
}; 