-- Add Financial Information fields to clients table
-- Run this in Supabase SQL Editor

-- Add financial information fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS net_worth DECIMAL(15,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_experience VARCHAR(50) DEFAULT 'beginner';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS risk_tolerance VARCHAR(50) DEFAULT 'medium';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_goals JSONB DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_investment_types JSONB DEFAULT '[]';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_investment_budget DECIMAL(15,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS emergency_fund DECIMAL(15,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS debt_amount DECIMAL(15,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_score INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS employer_name VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS years_employed INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source_of_funds VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_residency VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);

-- Update existing records with default values
UPDATE clients 
SET 
  investment_experience = COALESCE(investment_experience, 'beginner'),
  risk_tolerance = COALESCE(risk_tolerance, 'medium'),
  investment_goals = COALESCE(investment_goals, '{}'),
  preferred_investment_types = COALESCE(preferred_investment_types, '[]'),
  employment_status = COALESCE(employment_status, 'employed'),
  source_of_funds = COALESCE(source_of_funds, 'employment')
WHERE investment_experience IS NULL OR risk_tolerance IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_financial ON clients(annual_income, net_worth, risk_tolerance);

-- Add comments for documentation
COMMENT ON COLUMN clients.annual_income IS 'Annual income in USD';
COMMENT ON COLUMN clients.net_worth IS 'Total net worth in USD';
COMMENT ON COLUMN clients.investment_experience IS 'beginner, intermediate, advanced, expert';
COMMENT ON COLUMN clients.risk_tolerance IS 'low, medium, high, aggressive';
COMMENT ON COLUMN clients.investment_goals IS 'JSON object with investment goals';
COMMENT ON COLUMN clients.preferred_investment_types IS 'JSON array of preferred investment types';
COMMENT ON COLUMN clients.monthly_investment_budget IS 'Monthly budget for investments in USD';
COMMENT ON COLUMN clients.emergency_fund IS 'Emergency fund amount in USD';
COMMENT ON COLUMN clients.debt_amount IS 'Total debt amount in USD';
COMMENT ON COLUMN clients.credit_score IS 'Credit score (300-850)';
COMMENT ON COLUMN clients.employment_status IS 'employed, self-employed, retired, unemployed, student';
COMMENT ON COLUMN clients.source_of_funds IS 'employment, inheritance, business, investment, other'; 