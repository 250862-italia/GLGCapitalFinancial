#!/usr/bin/env node

/**
 * Setup script for new Supabase project
 * This script helps configure the new Supabase project after creation
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setup Nuovo Progetto Supabase');
console.log('================================');

// Template for new environment variables
const envTemplate = `# Nuovo Progetto Supabase - GLG Capital Financial v2
# Sostituisci questi valori con quelli del tuo nuovo progetto Supabase

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[NUOVO-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NUOVA-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[NUOVA-SERVICE-ROLE-KEY]

# Email Configuration (Supabase Auth)
SUPABASE_SMTP_HOST=smtp.gmail.com
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USER=[TUA-EMAIL]
SUPABASE_SMTP_PASS=[TUA-PASSWORD]

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Security
JWT_SECRET=[GENERA-UNA-CHIAVE-SECRETA]
CSRF_SECRET=[GENERA-UNA-CHIAVE-CSRF]

# Database Configuration (se necessario)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
`;

// SQL script for database setup
const sqlSetup = `-- Setup Database per GLG Capital Financial v2
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
`;

// Instructions for manual setup
const instructions = `
📋 ISTRUZIONI PER CREARE IL NUOVO PROGETTO SUPABASE:

1. 🌐 Vai su https://supabase.com
2. 🔐 Accedi al tuo account
3. ➕ Clicca "New Project"
4. 📝 Configura il progetto:
   - Name: glg-capital-financial-v2
   - Database Password: [genera una password sicura]
   - Region: us-east-1 (per performance ottimali)
   - Pricing Plan: Free tier

5. ⏳ Aspetta che il progetto sia creato (2-3 minuti)

6. 🔑 Copia le credenziali:
   - Project URL: https://[project-id].supabase.co
   - anon/public key: [chiave pubblica]
   - service_role key: [chiave privata]

7. 📁 Sostituisci i valori nel file .env.local con le nuove credenziali

8. 🗄️ Esegui lo script SQL nel SQL Editor di Supabase

9. 🧪 Testa la connessione con: npm run test-supabase

10. 🚀 Deploy: npm run build && npm run deploy
`;

// Write files
try {
  // Create .env.template
  fs.writeFileSync('.env.template', envTemplate);
  console.log('✅ Creato .env.template');
  
  // Create SQL setup script
  fs.writeFileSync('setup-database.sql', sqlSetup);
  console.log('✅ Creato setup-database.sql');
  
  // Create instructions
  fs.writeFileSync('SUPABASE_SETUP_INSTRUCTIONS.md', instructions);
  console.log('✅ Creato SUPABASE_SETUP_INSTRUCTIONS.md');
  
  console.log('\n🎉 Setup completato!');
  console.log('\n📖 Prossimi passi:');
  console.log('1. Leggi SUPABASE_SETUP_INSTRUCTIONS.md');
  console.log('2. Crea il progetto su Supabase.com');
  console.log('3. Copia le credenziali in .env.local');
  console.log('4. Esegui setup-database.sql nel SQL Editor');
  console.log('5. Testa la connessione');
  
} catch (error) {
  console.error('❌ Errore durante la creazione dei file:', error);
} 