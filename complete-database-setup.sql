-- Setup Completo Database per GLG Capital Financial v2
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Abilita le estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Crea la tabella profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crea la tabella clients
CREATE TABLE IF NOT EXISTS clients (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  date_of_birth DATE,
  nationality TEXT,
  profile_photo TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  iban TEXT,
  bic TEXT,
  account_holder TEXT,
  usdt_wallet TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crea la tabella notes (se non esiste)
CREATE TABLE IF NOT EXISTS notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inserisci dati di esempio per notes
INSERT INTO notes (title) VALUES
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!')
ON CONFLICT DO NOTHING;

-- 6. Inserisci dati di esempio per clients
INSERT INTO clients (user_id, first_name, last_name, email, phone, company, position, date_of_birth, nationality, address, city, country, postal_code, iban, bic, account_holder, usdt_wallet) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mario', 'Rossi', 'client1@example.com', '+39 123 456 7890', 'Tech Solutions Ltd', 'CEO', '1985-03-15', 'Italian', 'Via Roma 123', 'Milano', 'Italy', '20100', 'IT60X0542811101000000123456', 'UNCRITMMXXX', 'Mario Rossi', 'TQn9Y2khDD95J42FQtQTdwVVRqQqCqXqXq'),
  ('00000000-0000-0000-0000-000000000002', 'Giulia', 'Bianchi', 'client2@example.com', '+39 987 654 3210', 'Finance Corp', 'CFO', '1990-07-22', 'Italian', 'Corso Italia 456', 'Roma', 'Italy', '00100', 'IT60X0542811101000000654321', 'UNCRITMMXXX', 'Giulia Bianchi', 'TQn9Y2khDD95J42FQtQTdwVVRqQqCqXqXq')
ON CONFLICT DO NOTHING;

-- 7. Abilita Row Level Security su tutte le tabelle
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 8. Crea le policy per notes
CREATE POLICY "Allow all users to read notes" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert notes" ON notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update notes" ON notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete notes" ON notes
  FOR DELETE USING (true);

-- 9. Crea le policy per profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert on signup" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 10. Crea le policy per clients
CREATE POLICY "Users can view own client data" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own client data" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client data" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- 12. Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Trigger per aggiornare updated_at
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 14. Funzione per creare automaticamente il profilo quando si registra un utente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Trigger per creare automaticamente il profilo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 16. Verifica la configurazione
SELECT 'Database setup completato!' as status; 