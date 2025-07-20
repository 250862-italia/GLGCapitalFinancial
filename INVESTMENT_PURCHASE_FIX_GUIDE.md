# 🔧 Guida per Risolvere i Problemi di Acquisto Investimenti

## Problema Identificato

Dai log dell'applicazione, sono stati rilevati i seguenti errori durante l'acquisto di investimenti:

1. **Errore di constraint su `expected_return`**: `null value in column "expected_return" of relation "investments" violates not-null constraint`
2. **Errore di constraint su `status`**: `new row for relation "investments" violates check constraint "investments_status_check"`

## Soluzione

### Passo 1: Eseguire gli Script SQL in Supabase

Vai al tuo **Supabase Dashboard** → **SQL Editor** e esegui questi script in ordine:

#### 1.1 Fix Constraints della Tabella Investments
```sql
-- Copia e incolla il contenuto di fix-investments-constraints.sql
```

#### 1.2 Creare Tabella Packages con Dati di Esempio
```sql
-- Copia e incolla il contenuto di create-packages-table-fixed.sql
```

### Passo 2: Verificare la Configurazione

Dopo aver eseguito gli script SQL, verifica che:

1. **Tabella `packages`** esista e contenga dati
2. **Tabella `investments`** abbia i constraint corretti
3. **Tabella `clients`** esista e contenga i profili utente

### Passo 3: Testare l'Acquisto

1. Vai su `http://localhost:3000/investments`
2. Seleziona un pacchetto di investimento
3. Clicca su "Invest Now"
4. Seleziona il metodo di pagamento
5. Conferma l'acquisto

## Script SQL da Eseguire

### Script 1: fix-investments-constraints.sql
```sql
-- Fix investments table constraints
-- Run this in Supabase SQL Editor

-- 1. Drop existing constraints that are causing issues
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_status_check;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_expected_return_check;

-- 2. Add the correct status constraint
ALTER TABLE investments ADD CONSTRAINT investments_status_check 
CHECK (status IN ('pending', 'pending_payment', 'approved', 'rejected', 'active', 'completed', 'cancelled'));

-- 3. Make expected_return nullable or provide default value
ALTER TABLE investments ALTER COLUMN expected_return DROP NOT NULL;
ALTER TABLE investments ALTER COLUMN expected_return SET DEFAULT 1.8;

-- 4. Add payment_method column if it doesn't exist
ALTER TABLE investments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- 5. Add client_id column if it doesn't exist (make it nullable)
ALTER TABLE investments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- 6. Update existing records to have proper values
UPDATE investments 
SET expected_return = 1.8 
WHERE expected_return IS NULL;

UPDATE investments 
SET status = 'pending' 
WHERE status = 'pending_payment';

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);

-- 8. Enable RLS if not already enabled
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- 9. Create or replace RLS policies
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
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );
```

### Script 2: create-packages-table-fixed.sql
```sql
-- Create packages table and insert sample data (FIXED VERSION)
-- Run this in Supabase SQL Editor

-- 1. Drop existing table if it exists (optional - comment out if you want to keep existing data)
-- DROP TABLE IF EXISTS packages CASCADE;

-- 2. Create packages table
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

-- 3. Insert sample packages (only if they don't exist)
INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT * FROM (VALUES
    ('GLG Balanced Growth', 'A balanced investment package offering steady growth with moderate risk. Perfect for investors seeking consistent returns.', 'Balanced', 1000.00, 100000.00, 1.8, 12, 'medium', 'active', true),
    ('GLG Conservative Income', 'Low-risk investment package focused on capital preservation and steady income generation.', 'Conservative', 500.00, 50000.00, 1.2, 6, 'low', 'active', false),
    ('GLG Aggressive Growth', 'High-growth investment package for experienced investors willing to take higher risks for potentially higher returns.', 'Aggressive', 5000.00, 500000.00, 2.5, 24, 'high', 'active', true),
    ('GLG Premium Portfolio', 'Exclusive investment package with premium features and personalized management.', 'Premium', 10000.00, 1000000.00, 2.0, 18, 'medium', 'active', true)
) AS v(name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE packages.name = v.name);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(type);
CREATE INDEX IF NOT EXISTS idx_packages_risk_level ON packages(risk_level);
CREATE INDEX IF NOT EXISTS idx_packages_is_featured ON packages(is_featured);

-- 5. Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
DROP POLICY IF EXISTS "Public can view active packages" ON packages;
CREATE POLICY "Public can view active packages" ON packages
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage packages" ON packages;
CREATE POLICY "Admins can manage packages" ON packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 7. Grant permissions
GRANT SELECT ON packages TO authenticated;
GRANT ALL ON packages TO service_role;

-- 8. Verify the data
SELECT * FROM packages WHERE status = 'active' ORDER BY is_featured DESC, name;
```

## Verifica Post-Fix

Dopo aver eseguito gli script, verifica che tutto funzioni:

1. **Controlla le tabelle**:
   ```sql
   SELECT * FROM packages WHERE status = 'active';
   SELECT COUNT(*) FROM investments;
   ```

2. **Testa l'acquisto**:
   - Vai su `/investments`
   - Seleziona un pacchetto
   - Completa l'acquisto

3. **Controlla i log**:
   - Verifica che non ci siano più errori di constraint
   - Controlla che le email vengano inviate correttamente

## Problemi Comuni

### Errore: "relation 'packages' does not exist"
- Esegui prima lo script `create-packages-table.sql`

### Errore: "foreign key violation"
- Verifica che l'utente esista in `auth.users`
- Verifica che il package_id esista in `packages`

### Errore: "RLS policy violation"
- Verifica che le policy RLS siano state create correttamente
- Controlla che l'utente sia autenticato

### Errore: "42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification"
- Questo errore si verifica quando si usa `ON CONFLICT` su una colonna senza constraint univoco
- **Soluzione**: Usa lo script `create-packages-table-fixed.sql` invece di `create-packages-table.sql`
- Lo script corretto usa `WHERE NOT EXISTS` invece di `ON CONFLICT`

## Supporto

Se continui ad avere problemi dopo aver seguito questa guida:

1. Controlla i log dell'applicazione per errori specifici
2. Verifica la struttura delle tabelle nel Supabase Dashboard
3. Testa la connessione al database

## Note Importanti

- **Backup**: Fai sempre un backup del database prima di eseguire script SQL
- **Test**: Testa sempre in un ambiente di sviluppo prima di applicare in produzione
- **Permessi**: Assicurati di avere i permessi necessari per modificare le tabelle 