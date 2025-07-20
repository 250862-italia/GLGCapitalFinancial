-- Create clients table for KYC functionality
-- This table stores all client information including banking and financial data

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Status and timestamps
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'under_review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Banking Information
    iban VARCHAR(50),
    bic VARCHAR(20),
    account_holder VARCHAR(200),
    usdt_wallet VARCHAR(255),
    
    -- Financial Information
    annual_income DECIMAL(15,2) DEFAULT 0,
    net_worth DECIMAL(15,2) DEFAULT 0,
    investment_experience VARCHAR(50),
    risk_tolerance VARCHAR(50),
    investment_goals TEXT,
    preferred_investment_types TEXT,
    monthly_investment_budget DECIMAL(15,2) DEFAULT 0,
    emergency_fund DECIMAL(15,2) DEFAULT 0,
    debt_amount DECIMAL(15,2) DEFAULT 0,
    credit_score INTEGER,
    employment_status VARCHAR(50),
    employer_name VARCHAR(200),
    job_title VARCHAR(200),
    years_employed INTEGER,
    source_of_funds VARCHAR(100),
    tax_residency VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- Investment Profile
    total_invested DECIMAL(15,2) DEFAULT 0,
    risk_profile VARCHAR(50)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own client data" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own client data" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client data" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (for admin users)
CREATE POLICY "Admins can view all client data" ON public.clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can update all client data" ON public.clients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO public.clients (
    user_id,
    first_name,
    last_name,
    email,
    phone,
    nationality,
    country,
    status,
    iban,
    account_holder,
    annual_income,
    net_worth,
    investment_experience,
    risk_tolerance,
    employment_status
) VALUES 
(
    '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
    'Francesco',
    'fra',
    'info@washtw.it',
    '+39 123456789',
    'Italian',
    'Italy',
    'active',
    'IT60X0542811101000000123456',
    'Francesco fra',
    75000.00,
    250000.00,
    'Intermediate',
    'Moderate',
    'Employed'
) ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

-- Comments for documentation
COMMENT ON TABLE public.clients IS 'Client information table for KYC and profile management';
COMMENT ON COLUMN public.clients.user_id IS 'Reference to auth.users table';
COMMENT ON COLUMN public.clients.status IS 'Client status: pending, active, suspended, under_review';
COMMENT ON COLUMN public.clients.annual_income IS 'Annual income in USD';
COMMENT ON COLUMN public.clients.net_worth IS 'Net worth in USD';
COMMENT ON COLUMN public.clients.investment_experience IS 'Investment experience level';
COMMENT ON COLUMN public.clients.risk_tolerance IS 'Risk tolerance level'; 