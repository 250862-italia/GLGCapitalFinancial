# 🗄️ Istruzioni Setup Database Supabase

## 📋 Problema Attuale
La registrazione dei clienti non funziona perché le tabelle `profiles` e `clients` non esistono nel database Supabase.

## 🔧 Soluzione

### Passo 1: Accedi al Dashboard Supabase
1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Accedi con le tue credenziali
3. Seleziona il progetto **GLGCapitalFinancial**

### Passo 2: Vai all'SQL Editor
1. Nel menu laterale, clicca su **"SQL Editor"**
2. Clicca su **"New query"**

### Passo 3: Esegui lo Script SQL
Copia e incolla questo script SQL:

```sql
-- Script essenziale per creare le tabelle profiles e clients

-- 1. Tabella profiles
CREATE TABLE IF NOT EXISTS profiles (
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

-- 2. Tabella clients
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

-- 3. Crea indici essenziali
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON clients(profile_id);

-- 4. Abilita RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 5. Crea policy RLS per profiles
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

-- 6. Crea policy RLS per clients
CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 7. Crea trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verifica finale
SELECT 'Tabelle essenziali create con successo!' as status;
```

### Passo 4: Esegui lo Script
1. Clicca su **"Run"** per eseguire lo script
2. Aspetta che l'esecuzione sia completata
3. Dovresti vedere il messaggio: `"Tabelle essenziali create con successo!"`

### Passo 5: Verifica le Tabelle
1. Vai su **"Table Editor"** nel menu laterale
2. Dovresti vedere le nuove tabelle:
   - `profiles`
   - `clients`

## 🧪 Test della Registrazione

Dopo aver creato le tabelle, puoi testare la registrazione:

1. Vai su [https://glgcapitalfinancial-bd5hcs12n-250862-italias-projects.vercel.app/register](https://glgcapitalfinancial-bd5hcs12n-250862-italias-projects.vercel.app/register)
2. Compila il form di registrazione
3. Clicca su "Register"
4. Dovresti vedere un messaggio di successo

## 🔍 Verifica nel Database

Per verificare che tutto funzioni, puoi eseguire questo script:

```bash
node check-users.js
```

Dovresti vedere:
- ✅ Utenti Auth: [numero] utenti trovati
- ✅ Profili Utenti: [numero] profili trovati  
- ✅ Clienti: [numero] clienti trovati

## 📝 Note Importanti

- **RLS (Row Level Security)**: Le tabelle sono protette da RLS per garantire che gli utenti possano vedere solo i propri dati
- **Foreign Keys**: Le tabelle sono collegate tramite foreign keys per mantenere l'integrità dei dati
- **Indici**: Sono stati creati indici per ottimizzare le performance delle query
- **Trigger**: I trigger aggiornano automaticamente il campo `updated_at` quando i record vengono modificati

## 🚨 Risoluzione Problemi

Se incontri errori:

1. **Errore "relation does not exist"**: Assicurati di aver eseguito lo script SQL completo
2. **Errore di permessi**: Verifica che le policy RLS siano state create correttamente
3. **Errore di foreign key**: Assicurati che l'utente esista in `auth.users` prima di creare profili e clienti

## 📞 Supporto

Se hai problemi, controlla:
1. I log dell'applicazione per errori specifici
2. Il dashboard Supabase per errori SQL
3. La console del browser per errori JavaScript 