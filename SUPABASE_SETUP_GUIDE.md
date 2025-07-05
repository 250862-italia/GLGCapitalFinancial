# 🚀 GLG Capital Dashboard - Supabase Setup Guide

## 📋 Setup Manuale Completo

### **1. Accesso a Supabase Dashboard**

1. Vai su: https://supabase.com/dashboard
2. Accedi con le tue credenziali
3. Seleziona il progetto: **dobjulfwktzltpvqtxbql**
4. URL del progetto: `https://dobjulfwktzltpvqtxbql.supabase.co`

### **2. Configurazione Database**

#### **Step 1: Apri SQL Editor**
1. Nel menu laterale, clicca su **"SQL Editor"**
2. Clicca su **"New query"**
3. Dai un nome alla query: `GLG Dashboard Setup`

#### **Step 2: Esegui Setup Completo**
Copia e incolla tutto il contenuto di `setup-production.sql` e clicca **"Run"**

#### **Step 3: Esegui Migration Analytics (se necessario)**
Se ricevi errori di colonne mancanti (es. "column category does not exist"), esegui anche `migrate-analytics-table.sql`

### **3. Verifica Setup**

#### **Step 1: Controlla le Tabelle**
Dopo aver eseguito lo script, verifica che le tabelle siano state create:

```sql
-- Verifica tabelle
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Tabelle che dovrebbero esistere:**
- ✅ `users` - Autenticazione utenti
- ✅ `clients` - Profili clienti
- ✅ `kyc_records` - Documenti KYC
- ✅ `investments` - Investimenti
- ✅ `analytics` - Metriche dashboard
- ✅ `informational_requests` - Richieste documenti
- ✅ `team_members` - Team amministrativo
- ✅ `content` - Contenuti news/markets
- ✅ `partnerships` - Partnership
- ✅ `settings` - Configurazione sistema

#### **Step 2: Controlla Storage Buckets**
1. Vai su **"Storage"** nel menu laterale
2. Verifica che esistano i bucket:
   - ✅ `kyc-documents` (privato)
   - ✅ `profile-photos` (pubblico)
   - ✅ `partnership-docs` (privato)

#### **Step 3: Controlla RLS Policies**
```sql
-- Verifica policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### **4. Configurazione Environment Variables**

#### **Step 1: Vercel Dashboard**
1. Vai su: https://vercel.com/dashboard
2. Seleziona il progetto GLG Dashboard
3. Vai su **"Settings"** → **"Environment Variables"**

#### **Step 2: Aggiungi Variabili**
```
NEXT_PUBLIC_SUPABASE_URL=https://dobjulfwktzltpvqtxbql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30
```

#### **Step 3: Email Configuration (Opzionale)**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### **5. Test Setup**

#### **Step 1: Test Connessione**
```sql
-- Test connessione base
SELECT 'Connection OK' as status;
```

#### **Step 2: Test Tabelle**
```sql
-- Test inserimento dati
INSERT INTO analytics (metric, value, change_percentage, period, category, description) 
VALUES ('Test Metric', 100, 5.0, 'daily', 'test', 'Test metric for verification')
ON CONFLICT DO NOTHING;

-- Verifica inserimento
SELECT * FROM analytics WHERE metric = 'Test Metric';
```

#### **Step 3: Test Storage**
1. Vai su **"Storage"** → **"kyc-documents"**
2. Prova a caricare un file di test
3. Verifica che il file sia visibile

### **6. Creazione Utenti di Test**

#### **Step 1: Superadmin**
```sql
-- Crea superadmin
INSERT INTO users (email, password_hash, role, is_active, email_verified) 
VALUES (
  'admin@glgcapital.com',
  '$2a$10$hashedpasswordhere', -- Usa bcrypt per hashare la password
  'superadmin',
  true,
  true
);
```

#### **Step 2: Cliente di Test**
```sql
-- Crea cliente di test
INSERT INTO users (email, password_hash, role, is_active, email_verified) 
VALUES (
  'test@example.com',
  '$2a$10$hashedpasswordhere',
  'user',
  true,
  true
);

-- Crea profilo cliente
INSERT INTO clients (user_id, "firstName", "lastName", email, phone) 
VALUES (
  (SELECT id FROM users WHERE email = 'test@example.com'),
  'Test',
  'User',
  'test@example.com',
  '+1234567890'
);
```

### **7. Troubleshooting**

#### **Problema: "Table doesn't exist"**
**Soluzione:** Esegui di nuovo lo script `setup-production.sql`

#### **Problema: "RLS Policy error"**
**Soluzione:** Verifica che RLS sia abilitato:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- Ripeti per tutte le tabelle
```

#### **Problema: "Storage bucket not found"**
**Soluzione:** Crea manualmente i bucket:
1. Vai su **"Storage"**
2. Clicca **"New bucket"**
3. Crea: `kyc-documents`, `profile-photos`, `partnership-docs`

#### **Problema: "Connection failed"**
**Soluzione:** Verifica:
1. URL Supabase corretto
2. Chiavi API corrette
3. Network/firewall settings

### **8. Deployment**

#### **Step 1: Build e Deploy**
```bash
# Build locale
npm run build

# Deploy su Vercel
vercel --prod
```

#### **Step 2: Verifica Produzione**
1. Testa login admin: `admin@glgcapital.com`
2. Testa registrazione cliente
3. Testa upload documenti KYC
4. Testa dashboard analytics

### **9. Monitoraggio**

#### **Step 1: Supabase Dashboard**
- **Database**: Monitora query performance
- **Storage**: Controlla uso spazio
- **Auth**: Verifica login/logout
- **Logs**: Controlla errori

#### **Step 2: Vercel Dashboard**
- **Functions**: Monitora API routes
- **Analytics**: Controlla performance
- **Logs**: Verifica errori

### **10. Backup e Sicurezza**

#### **Step 1: Backup Database**
```sql
-- Esporta dati importanti
SELECT * FROM users;
SELECT * FROM clients;
SELECT * FROM investments;
```

#### **Step 2: Sicurezza**
- ✅ RLS abilitato su tutte le tabelle
- ✅ Policies configurate correttamente
- ✅ Storage buckets con permessi appropriati
- ✅ Environment variables sicure

---

## ✅ **Setup Completato!**

Dopo aver seguito questa guida, il sistema sarà completamente configurato e pronto per la produzione.

**Prossimi passi:**
1. Testare tutte le funzionalità
2. Configurare email SMTP (opzionale)
3. Personalizzare contenuti e branding
4. Monitorare performance e sicurezza 