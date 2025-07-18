-- Create missing tables for GLG Capital Financial Dashboard
-- Run this script in Supabase SQL Editor
-- This version handles existing triggers and tables gracefully

-- 1. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_packages_updated_at ON public.packages;
DROP TRIGGER IF EXISTS update_investments_updated_at ON public.investments;
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
DROP TRIGGER IF EXISTS update_kyc_requests_updated_at ON public.kyc_requests;
DROP TRIGGER IF EXISTS update_informational_requests_updated_at ON public.informational_requests;
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;

-- 2. Create packages table
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_investment DECIMAL(15,2) NOT NULL,
    max_investment DECIMAL(15,2),
    expected_return DECIMAL(5,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled')),
    expected_return DECIMAL(5,2) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create kyc_requests table
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    document_type VARCHAR(100),
    document_url TEXT,
    verification_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create informational_requests table
CREATE TABLE IF NOT EXISTS public.informational_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Fix clients table - add missing columns
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS iban VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS investment_experience VARCHAR(50),
ADD COLUMN IF NOT EXISTS risk_tolerance VARCHAR(50),
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON public.investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_investment_id ON public.payments(investment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_user_id ON public.kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_requests_status ON public.kyc_requests(status);
CREATE INDEX IF NOT EXISTS idx_informational_requests_email ON public.informational_requests(email);
CREATE INDEX IF NOT EXISTS idx_informational_requests_status ON public.informational_requests(status);

-- 9. Create RLS policies for packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Packages are viewable by everyone" ON public.packages;
CREATE POLICY "Packages are viewable by everyone" ON public.packages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert packages" ON public.packages;
CREATE POLICY "Only admins can insert packages" ON public.packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can update packages" ON public.packages;
CREATE POLICY "Only admins can update packages" ON public.packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete packages" ON public.packages;
CREATE POLICY "Only admins can delete packages" ON public.packages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 10. Create RLS policies for investments table
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
CREATE POLICY "Users can view their own investments" ON public.investments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
CREATE POLICY "Users can insert their own investments" ON public.investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can update investments" ON public.investments;
CREATE POLICY "Only admins can update investments" ON public.investments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete investments" ON public.investments;
CREATE POLICY "Only admins can delete investments" ON public.investments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 11. Create RLS policies for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
CREATE POLICY "Users can insert their own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can update payments" ON public.payments;
CREATE POLICY "Only admins can update payments" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete payments" ON public.payments;
CREATE POLICY "Only admins can delete payments" ON public.payments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 12. Create RLS policies for kyc_requests table
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own KYC requests" ON public.kyc_requests;
CREATE POLICY "Users can view their own KYC requests" ON public.kyc_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own KYC requests" ON public.kyc_requests;
CREATE POLICY "Users can insert their own KYC requests" ON public.kyc_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can update KYC requests" ON public.kyc_requests;
CREATE POLICY "Only admins can update KYC requests" ON public.kyc_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete KYC requests" ON public.kyc_requests;
CREATE POLICY "Only admins can delete KYC requests" ON public.kyc_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 13. Create RLS policies for informational_requests table
ALTER TABLE public.informational_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Informational requests are viewable by admins" ON public.informational_requests;
CREATE POLICY "Informational requests are viewable by admins" ON public.informational_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Anyone can insert informational requests" ON public.informational_requests;
CREATE POLICY "Anyone can insert informational requests" ON public.informational_requests
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update informational requests" ON public.informational_requests;
CREATE POLICY "Only admins can update informational requests" ON public.informational_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete informational requests" ON public.informational_requests;
CREATE POLICY "Only admins can delete informational requests" ON public.informational_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 14. Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_requests_updated_at BEFORE UPDATE ON public.kyc_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_informational_requests_updated_at BEFORE UPDATE ON public.informational_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Insert sample data
INSERT INTO public.packages (name, description, min_investment, max_investment, expected_return, duration_months, risk_level, status) VALUES
('Conservative Growth', 'Low-risk investment with steady returns', 10000.00, 100000.00, 5.50, 12, 'low', 'active'),
('Balanced Portfolio', 'Medium-risk balanced investment strategy', 25000.00, 500000.00, 8.75, 24, 'medium', 'active'),
('Aggressive Growth', 'High-risk high-return investment opportunity', 50000.00, 1000000.00, 12.25, 36, 'high', 'active'),
('Fixed Income', 'Stable income-generating investment', 15000.00, 300000.00, 6.25, 18, 'low', 'active'),
('Tech Innovation', 'Technology sector focused investment', 30000.00, 750000.00, 15.50, 48, 'high', 'active')
ON CONFLICT (id) DO NOTHING;

-- 16. Verify tables were created
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('packages', 'investments', 'payments', 'kyc_requests', 'informational_requests') 
        THEN '✅ Created' 
        ELSE '⚠️ Already exists'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('packages', 'investments', 'payments', 'kyc_requests', 'informational_requests', 'clients')
ORDER BY table_name;

-- 17. Show success message
SELECT '🎉 Database setup completed successfully!' as message; 