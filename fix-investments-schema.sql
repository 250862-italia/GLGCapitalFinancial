-- Fix Investments Table Schema - Add Missing Columns
-- Run this script in Supabase SQL Editor

-- 1. Add missing columns to investments table
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.packages(id),
ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS daily_return DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_returns DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_returns DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_client_id ON public.investments(client_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON public.investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON public.investments(created_at);

-- 3. Update RLS policies for investments table
DROP POLICY IF EXISTS "Clients can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON public.investments;

CREATE POLICY "Clients can view own investments" ON public.investments
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create own investments" ON public.investments
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all investments" ON public.investments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- 4. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Test query to ensure everything works
SELECT 
  'investments' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'; 