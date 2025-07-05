-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES investment_packages(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  gateway_response JSONB,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_package_id ON payments(package_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample payments data
INSERT INTO payments (user_id, package_id, amount, currency, status, payment_method, transaction_id, description)
SELECT 
  u.id as user_id,
  p.id as package_id,
  CASE 
    WHEN p.type = 'Conservative' THEN 5000.00
    WHEN p.type = 'Balanced' THEN 10000.00
    WHEN p.type = 'Aggressive' THEN 25000.00
    ELSE 15000.00
  END as amount,
  'USD' as currency,
  CASE 
    WHEN random() > 0.8 THEN 'failed'
    WHEN random() > 0.6 THEN 'processing'
    ELSE 'completed'
  END as status,
  CASE 
    WHEN random() > 0.5 THEN 'credit_card'
    ELSE 'bank_transfer'
  END as payment_method,
  'TXN_' || substr(md5(random()::text), 1, 10) as transaction_id,
  'Investment in ' || p.name || ' package' as description
FROM users u
CROSS JOIN investment_packages p
WHERE u.role = 'user'
LIMIT 20
ON CONFLICT DO NOTHING; 