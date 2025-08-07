-- Add KYC columns to clients table
-- Execute this in Supabase SQL Editor

-- 1. Add Financial Information columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS net_worth DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_experience TEXT DEFAULT 'beginner';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS risk_tolerance TEXT DEFAULT 'medium';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_goals JSONB DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_investment_types JSONB DEFAULT '[]';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_investment_budget DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS emergency_fund DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS debt_amount DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_score INTEGER DEFAULT 0;

-- 2. Add Employment Information columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS employment_status TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS employer_name TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS job_title TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS years_employed INTEGER DEFAULT 0;

-- 3. Add Source of Funds and Tax Information
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_of_funds TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_residency TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id TEXT DEFAULT '';

-- 4. Add Investment Profile columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS risk_profile TEXT DEFAULT 'moderate';

-- 5. Update existing records with default values
UPDATE clients SET 
  annual_income = COALESCE(annual_income, 0.00),
  net_worth = COALESCE(net_worth, 0.00),
  investment_experience = COALESCE(investment_experience, 'beginner'),
  risk_tolerance = COALESCE(risk_tolerance, 'medium'),
  investment_goals = COALESCE(investment_goals, '{}'),
  preferred_investment_types = COALESCE(preferred_investment_types, '[]'),
  monthly_investment_budget = COALESCE(monthly_investment_budget, 0.00),
  emergency_fund = COALESCE(emergency_fund, 0.00),
  debt_amount = COALESCE(debt_amount, 0.00),
  credit_score = COALESCE(credit_score, 0),
  employment_status = COALESCE(employment_status, ''),
  employer_name = COALESCE(employer_name, ''),
  job_title = COALESCE(job_title, ''),
  years_employed = COALESCE(years_employed, 0),
  source_of_funds = COALESCE(source_of_funds, ''),
  tax_residency = COALESCE(tax_residency, ''),
  tax_id = COALESCE(tax_id, ''),
  risk_profile = COALESCE(risk_profile, 'moderate');

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_investment_experience ON clients(investment_experience);
CREATE INDEX IF NOT EXISTS idx_clients_risk_tolerance ON clients(risk_tolerance);
CREATE INDEX IF NOT EXISTS idx_clients_employment_status ON clients(employment_status);
CREATE INDEX IF NOT EXISTS idx_clients_annual_income ON clients(annual_income);

-- 7. Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name IN (
  'annual_income', 'net_worth', 'investment_experience', 'risk_tolerance',
  'investment_goals', 'preferred_investment_types', 'monthly_investment_budget',
  'emergency_fund', 'debt_amount', 'credit_score', 'employment_status',
  'employer_name', 'job_title', 'years_employed', 'source_of_funds',
  'tax_residency', 'tax_id', 'risk_profile'
)
ORDER BY column_name;

-- 8. Show current data count
SELECT COUNT(*) as total_clients FROM clients; 