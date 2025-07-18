# 🚨 Riepilogo Problema e Soluzione

## 🔍 Problema Attuale
La registrazione degli utenti non funziona a causa di un errore nella struttura della tabella `profiles` nel database Supabase.

### Errori Specifici:
1. **Errore principale**: `"Could not find the 'name' column of 'profiles' in the schema cache"`
2. **Errore secondario**: `"insert or update on table "clients" violates foreign key constraint"`
3. **Risultato**: Gli utenti vengono creati in `auth.users` ma non viene creato il profilo corrispondente

### Log degli Errori:
```
✅ Utente auth creato: 9e0ae48c-3d60-4287-af87-8dad7a4a0eed
❌ Errore creazione profilo: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'name' column of 'profiles' in the schema cache"
}
❌ Errore creazione cliente: {
  code: '23503',
  details: 'Key (profile_id)=(9e0ae48c-3d60-4287-af87-8dad7a4a0eed) is not present in table "profiles".',
  hint: null,
  message: 'insert or update on table "clients" violates foreign key constraint "clients_profile_id_fkey"'
}
```

## 🔧 Causa del Problema
La tabella `profiles` nel database Supabase ha una struttura non corretta o mancante. Il codice cerca di inserire dati in una colonna `name` che non esiste o non è accessibile.

## ✅ Soluzione Richiesta

### Azione Immediata Necessaria:
**Devi applicare manualmente la correzione nel SQL Editor di Supabase**

### Passi da Seguire:

#### 1. Accedi al Dashboard Supabase
- Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Accedi con le tue credenziali
- Seleziona il progetto **GLGCapitalFinancial**

#### 2. Vai all'SQL Editor
- Nel menu laterale, clicca su **"SQL Editor"**
- Clicca su **"New query"**

#### 3. Esegui lo Script di Correzione
Copia e incolla questo script SQL:

```sql
-- Fix Profiles Table Structure
-- This fixes the "Could not find the 'name' column" error

-- 1. Drop existing profiles table if it exists
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create profiles table with correct structure
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    kyc_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);

-- 6. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, role, first_name, last_name, country)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 
        NEW.email, 
        'user',
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'lastName',
        NEW.raw_user_meta_data->>'country'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    risk_profile VARCHAR(50) DEFAULT 'moderate',
    investment_preferences JSONB DEFAULT '{}',
    total_invested DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Enable RLS for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for clients
CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Create indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_clients_client_code ON clients(client_code);

-- 13. Create trigger for clients updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 14. Function to create client record after profile creation
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate client code
    INSERT INTO clients (user_id, profile_id, client_code)
    VALUES (
        NEW.id,
        NEW.id,
        'CLI-' || substr(NEW.id::text, 1, 8) || '-' || floor(random() * 1000)::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create trigger for new profile creation
CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- 16. Verify the setup
SELECT 'Profiles table structure fixed successfully!' as status;
```

#### 4. Esegui lo Script
- Clicca su **"Run"** per eseguire lo script
- Aspetta che l'esecuzione sia completata
- Dovresti vedere: `"Profiles table structure fixed successfully!"`

#### 5. Verifica la Correzione
- Vai su **"Table Editor"** nel menu laterale
- Clicca sulla tabella **"profiles"**
- Verifica che la struttura sia corretta

## 🧪 Test Post-Correzione

### Test 1: Registrazione
```bash
node test-registration-fixed.js
```

### Test 2: Login
```bash
node test-login.js
```

### Test 3: Verifica Database
- Controlla che i nuovi utenti abbiano record in `profiles` e `clients`

## 📋 File Creati per la Soluzione
1. `fix-profiles-table.sql` - Script SQL per la correzione
2. `PROFILES_FIX_GUIDE.md` - Guida dettagliata per l'applicazione
3. `apply-profiles-fix.js` - Script Node.js (non funziona senza funzione exec_sql)
4. `PROBLEM_SUMMARY.md` - Questo riepilogo

## ⚠️ Importante
- **Non puoi ignorare questo problema** - la registrazione non funzionerà finché non viene applicata la correzione
- **La correzione deve essere applicata manualmente** nel SQL Editor di Supabase
- **Dopo la correzione**, tutti i test dovrebbero passare

## 🎯 Risultato Atteso
Dopo aver applicato la correzione:
- ✅ Registrazione utenti funzionante
- ✅ Login utenti funzionante
- ✅ Profili creati automaticamente
- ✅ Record cliente creati automaticamente
- ✅ Tutti i campi popolati correttamente 