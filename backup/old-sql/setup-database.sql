-- Setup Database per GLG Capital Financial v2
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Abilita le estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Crea la tabella notes
CREATE TABLE IF NOT EXISTS notes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserisci dati di esempio
INSERT INTO notes (title) VALUES
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!')
ON CONFLICT DO NOTHING;

-- 4. Abilita Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 5. Crea le policy per gli utenti autenticati
CREATE POLICY "Allow authenticated users to read notes" ON notes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert notes" ON notes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update notes" ON notes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to delete notes" ON notes
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- 7. Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger per aggiornare updated_at
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Verifica la configurazione
SELECT 'Database setup completato!' as status;
