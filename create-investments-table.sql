-- Script per creare la tabella investments nel database Supabase
-- Eseguire questo script nel SQL Editor di Supabase

-- Crea la tabella investments se non esiste
CREATE TABLE IF NOT EXISTS investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    expected_return DECIMAL(5,2) NOT NULL,
    actual_return DECIMAL(5,2) DEFAULT 0,
    total_returns DECIMAL(15,2) DEFAULT 0,
    daily_returns DECIMAL(15,2) DEFAULT 0,
    monthly_returns DECIMAL(15,2) DEFAULT 0,
    fees_paid DECIMAL(15,2) DEFAULT 0,
    payment_method TEXT,
    transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_investments_client_id ON investments(client_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);

-- Abilita Row Level Security (RLS)
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere agli admin di accedere a tutti gli investimenti
CREATE POLICY "Admin can manage all investments" ON investments
    FOR ALL USING (true);

-- Inserisce i dati di test esistenti
INSERT INTO investments (
    client_id, 
    package_id, 
    amount, 
    status, 
    start_date, 
    end_date, 
    expected_return, 
    payment_method, 
    notes
) VALUES (
    'temp-client-1',
    '2',
    5000,
    'pending',
    NOW(),
    NOW() + INTERVAL '24 months',
    8.5,
    'bank_transfer',
    'Investimento di test - Mario Rossi'
) ON CONFLICT DO NOTHING;

-- Inserisce il nuovo investimento di €100,000 per Mario Rossi
INSERT INTO investments (
    client_id, 
    package_id, 
    amount, 
    status, 
    start_date, 
    end_date, 
    expected_return, 
    payment_method, 
    notes
) VALUES (
    'temp-client-1',
    '2',
    100000,
    'pending',
    NOW(),
    NOW() + INTERVAL '24 months',
    8.5,
    'bank_transfer',
    'Investimento €100,000 - Mario Rossi'
) ON CONFLICT DO NOTHING;

-- Verifica che i dati siano stati inseriti
SELECT 
    i.id,
    i.client_id,
    i.package_id,
    i.amount,
    i.status,
    i.expected_return,
    i.created_at
FROM investments i
ORDER BY i.created_at DESC;
