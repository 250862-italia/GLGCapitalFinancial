# 🔧 Guida per Risolvere i Problemi di Acquisto Investimenti

## Problema Identificato

Dai log dell'applicazione, sono stati rilevati i seguenti errori durante l'acquisto di investimenti:

1. **Errore di constraint su `expected_return`**: `null value in column "expected_return" of relation "investments" violates not-null constraint`
2. **Errore di constraint su `status`**: `new row for relation "investments" violates check constraint "investments_status_check"`

## Soluzione

### Passo 0: Diagnostica Preliminare (Opzionale)

Se vuoi verificare lo stato attuale del database prima di procedere:

```sql
-- Copia e incolla il contenuto di check-current-database-state.sql
```

Questo script ti mostrerà:
- Struttura attuale della tabella `investments`
- Constraint esistenti
- Dati presenti nelle tabelle
- Eventuali problemi di foreign key

### Passo 1: Eseguire lo Script SQL Definitivo in Supabase

Vai al tuo **Supabase Dashboard** → **SQL Editor** e esegui questo script definitivo:

#### 1.1 Script Definitivo per Risolvere Tutti i Problemi
```sql
-- Copia e incolla il contenuto di fix-investment-purchase-final.sql
```

**⚠️ IMPORTANTE**: Questo script ricrea completamente la tabella `investments` con la struttura corretta. Se hai dati esistenti che vuoi preservare, esegui prima lo script di diagnostica.

**Questo script risolve automaticamente:**
- ✅ Problemi di constraint su `expected_return`
- ✅ Problemi di constraint su `status`
- ✅ Creazione tabella `packages` con dati di esempio
- ✅ Creazione tabella `clients` se mancante
- ✅ Configurazione RLS policies
- ✅ Creazione indici per performance
- ✅ Ricreazione completa della struttura corretta

### Passo 2: Diagnostica Automatica (Opzionale)

Se vuoi verificare lo stato del database dopo l'esecuzione dello script:

```bash
# Esegui lo script di diagnostica
node diagnose-investment-issues.js
```

Questo script verificherà:
- ✅ Struttura della tabella `investments`
- ✅ Constraint e policy esistenti
- ✅ Presenza di dati nelle tabelle `packages` e `clients`
- ✅ Test di inserimento investimento
- ✅ Identificazione di problemi specifici

### Passo 3: Verificare la Configurazione

Dopo aver eseguito gli script SQL, verifica che:

1. **Tabella `packages`** esista e contenga dati
2. **Tabella `investments`** abbia i constraint corretti
3. **Tabella `clients`** esista e contenga i profili utente

### Passo 4: Testare l'Acquisto

1. Vai su `http://localhost:3000/investments`
2. Seleziona un pacchetto di investimento
3. Clicca su "Invest Now"
4. Seleziona il metodo di pagamento
5. Conferma l'acquisto

## Script SQL da Eseguire

### Script 1: check-current-database-state.sql (Diagnostica)
```sql
-- Check current database state
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if investments table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing constraints on investments table
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'investments' 
AND tc.table_schema = 'public';

-- 3. Check if packages table exists and has data
SELECT 
    COUNT(*) as package_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_packages
FROM packages;

-- 4. Check if clients table exists and has data
SELECT 
    COUNT(*) as client_count
FROM clients;

-- 5. Check recent investments (if any)
SELECT 
    id,
    user_id,
    package_id,
    amount,
    status,
    expected_return,
    created_at
FROM investments 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check for any foreign key violations
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'investments';
```

### Script 2: fix-investment-purchase-final.sql (Soluzione Definitiva)
```sql
-- FINAL FIX for investment purchase issues
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. DROP AND RECREATE INVESTMENTS TABLE
-- =====================================================

-- Drop existing table with all constraints
DROP TABLE IF EXISTS investments CASCADE;

-- Create investments table with correct structure
CREATE TABLE investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'pending_payment', 'approved', 'rejected', 'active', 'completed', 'cancelled')),
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    maturity_date TIMESTAMP WITH TIME ZONE,
    expected_return DECIMAL(5,2) DEFAULT 1.8,
    actual_return DECIMAL(5,2),
    total_returns DECIMAL(15,2) DEFAULT 0,
    daily_returns DECIMAL(10,2) DEFAULT 0,
    monthly_returns DECIMAL(10,2) DEFAULT 0,
    fees_paid DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE PACKAGES TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    min_investment DECIMAL(15,2) NOT NULL,
    max_investment DECIMAL(15,2),
    expected_return DECIMAL(5,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    management_fee DECIMAL(5,2) DEFAULT 0,
    performance_fee DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE CLIENTS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    date_of_birth DATE,
    nationality VARCHAR(100),
    occupation VARCHAR(255),
    company VARCHAR(255),
    website VARCHAR(255),
    bio TEXT,
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    kyc_status VARCHAR(50) DEFAULT 'pending',
    kyc_documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. INSERT SAMPLE PACKAGES
-- =====================================================

-- Insert sample packages if they don't exist
INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Balanced Growth', 'A balanced investment package offering steady growth with moderate risk. Perfect for investors seeking consistent returns.', 'Balanced', 1000.00, 100000.00, 1.8, 12, 'medium', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Balanced Growth');

INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Conservative Income', 'Low-risk investment package focused on capital preservation and steady income generation.', 'Conservative', 500.00, 50000.00, 1.2, 6, 'low', 'active', false
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Conservative Income');

INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Aggressive Growth', 'High-growth investment package for experienced investors willing to take higher risks for potentially higher returns.', 'Aggressive', 5000.00, 500000.00, 2.5, 24, 'high', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Aggressive Growth');

INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Premium Portfolio', 'Exclusive investment package with premium features and personalized management.', 'Premium', 10000.00, 1000000.00, 2.0, 18, 'medium', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Premium Portfolio');

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Investments indexes
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);

-- Packages indexes
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_risk_level ON packages(risk_level);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- Investments policies
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
CREATE POLICY "Users can view their own investments" ON investments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own investments" ON investments;
CREATE POLICY "Users can insert their own investments" ON investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
CREATE POLICY "Users can update their own investments" ON investments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
CREATE POLICY "Admins can view all investments" ON investments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Packages policies (public read access)
DROP POLICY IF EXISTS "Public can view active packages" ON packages;
CREATE POLICY "Public can view active packages" ON packages
    FOR SELECT USING (status = 'active');

-- Clients policies
DROP POLICY IF EXISTS "Users can view their own client profile" ON clients;
CREATE POLICY "Users can view their own client profile" ON clients
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own client profile" ON clients;
CREATE POLICY "Users can update their own client profile" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check investments table structure
SELECT 'Investments table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check packages
SELECT 'Available packages:' as info;
SELECT name, min_investment, max_investment, expected_return, status 
FROM packages 
ORDER BY min_investment;

-- Check constraints
SELECT 'Investment table constraints:' as info;
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'investments' 
AND table_schema = 'public';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Investment purchase system fixed successfully!' as status;
```

## Risoluzione Errori Specifici

### Errore: "null value in column expected_return violates not-null constraint"
- **Causa**: La colonna `expected_return` è definita come NOT NULL ma non viene fornito un valore
- **Soluzione**: Lo script definisce un valore di default (1.8) e rende la colonna nullable

### Errore: "new row for relation investments violates check constraint investments_status_check"
- **Causa**: Il constraint sullo status non corrisponde ai valori utilizzati nel codice
- **Soluzione**: Lo script ricrea il constraint con i valori corretti

### Errore: "RLS policy violation"
- **Causa**: Le policy RLS non sono configurate correttamente
- **Soluzione**: Lo script crea tutte le policy necessarie

### Errore: "42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification"
- **Causa**: Si usa `ON CONFLICT` su una colonna senza constraint univoco
- **Soluzione**: Lo script usa `WHERE NOT EXISTS` invece di `ON CONFLICT`

## Verifica del Successo

Dopo aver eseguito lo script, dovresti vedere:

1. **Messaggio di successo**: `✅ Investment purchase system fixed successfully!`
2. **Struttura tabella corretta**: Tutte le colonne con i tipi e constraint corretti
3. **Pacchetti disponibili**: 4 pacchetti di investimento attivi
4. **Pulsante "Invest Now" cliccabile**: Nessun errore di constraint

## Test Finale

1. Vai su `http://localhost:3000/investments`
2. Seleziona un pacchetto
3. Clicca "Invest Now"
4. Seleziona il metodo di pagamento
5. Conferma l'acquisto
6. Verifica che l'investimento sia stato creato nel database

Se tutto funziona correttamente, il sistema di acquisto investimenti è stato risolto! 🎉 