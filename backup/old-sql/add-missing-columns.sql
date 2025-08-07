-- Aggiungi colonne mancanti identificate nei log
-- Esegui questo script per allineare il database con i tipi TypeScript

-- 1. Aggiungi colonne mancanti a profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- 2. Aggiungi colonne mancanti a clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS iban VARCHAR(50),
ADD COLUMN IF NOT EXISTS bic VARCHAR(20),
ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255),
ADD COLUMN IF NOT EXISTS usdt_wallet VARCHAR(100);

-- 3. Aggiungi colonne mancanti a users (se la tabella esiste)
-- ALTER TABLE auth.users 
-- ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);

-- 4. Aggiungi colonne mancanti a investments
ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS maturity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_returns DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS daily_returns DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS monthly_returns DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS fees_paid DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Aggiungi colonne mancanti a payments
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS processed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. Aggiungi colonne mancanti a team
ALTER TABLE team 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS hire_date DATE;

-- 7. Aggiungi colonne mancanti a notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 8. Aggiungi colonne mancanti a informational_requests
ALTER TABLE informational_requests 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response TEXT,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS assigned_to UUID;

-- 9. Aggiungi colonne mancanti a kyc_requests
ALTER TABLE kyc_requests 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 10. Aggiungi colonne mancanti a content
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS author_id UUID,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 11. Aggiungi colonne mancanti a email_queue
ALTER TABLE email_queue 
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 12. Verifica che tutte le colonne siano state aggiunte
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'clients', 'investments', 'payments', 'team', 'notifications', 'informational_requests', 'kyc_requests', 'content', 'email_queue')
ORDER BY table_name, column_name;

-- 13. Aggiorna i trigger per le nuove colonne
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ricrea i trigger per tutte le tabelle
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at 
  BEFORE UPDATE ON investments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_updated_at ON team;
CREATE TRIGGER update_team_updated_at 
  BEFORE UPDATE ON team 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Verifica finale
SELECT 'Schema alignment completed successfully' as status; 