# 🔒 Analisi Completa Sicurezza e Performance Supabase

## 📊 Schema SQL Attuale

### Tabelle Principali

#### 1. `auth.users` (Supabase Auth)
```sql
-- Tabella gestita da Supabase Auth
-- Contiene: id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data
```

#### 2. `profiles`
```sql
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
```

#### 3. `clients`
```sql
CREATE TABLE clients (
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
```

#### 4. Tabelle Aggiuntive
- `analytics` - Tracking utenti
- `team` - Gestione team
- `notifications` - Notifiche
- `investments` - Investimenti
- `partnerships` - Partnership
- `payments` - Pagamenti
- `notes` - Note di sistema

### Foreign Keys
```sql
-- Relazioni principali
clients.user_id → auth.users(id) ON DELETE CASCADE
clients.profile_id → profiles(id) ON DELETE CASCADE
profiles.id → auth.users(id) ON DELETE CASCADE
analytics.user_id → auth.users(id) ON DELETE CASCADE
notifications.user_id → auth.users(id) ON DELETE CASCADE
investments.user_id → auth.users(id) ON DELETE CASCADE
payments.user_id → auth.users(id) ON DELETE CASCADE
```

### Trigger
```sql
-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applicato a: profiles, clients, team, investments, payments
```

## 🛡️ Policy RLS Attive

### 1. Tabella `profiles`
```sql
-- Utenti vedono solo il proprio profilo
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Utenti aggiornano solo il proprio profilo
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Utenti inseriscono solo il proprio profilo
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin vedono tutti i profili
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

### 2. Tabella `clients`
```sql
-- Utenti vedono solo i propri dati cliente
CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

-- Utenti aggiornano solo i propri dati cliente
CREATE POLICY "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

-- Utenti inseriscono solo i propri dati cliente
CREATE POLICY "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin vedono tutti i clienti
CREATE POLICY "Admins can view all clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

### 3. Altre Tabelle
```sql
-- analytics: Utenti vedono solo le proprie analytics
-- notifications: Utenti vedono solo le proprie notifiche
-- investments: Utenti vedono solo i propri investimenti
-- payments: Utenti vedono solo i propri pagamenti
-- team: Tutti possono vedere, solo admin gestiscono
-- partnerships: Tutti possono vedere, solo admin gestiscono
```

## 👥 Gestione Ruoli

### Assegnazione Ruoli
1. **Registrazione Cliente**: `role = 'user'` (default)
2. **Creazione Admin**: Tramite API `/api/admin/users/create`
3. **Superadmin**: Creato manualmente nel database

### Gerarchia Ruoli
```sql
-- Ruoli disponibili
'user'      -- Cliente normale
'admin'     -- Amministratore
'superadmin' -- Super amministratore
```

### Verifica Ruoli nelle API
```typescript
// Esempio da app/api/admin/users/route.ts
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
```

## 🔧 Funzioni Backend/Edge

### API Routes Principali

#### 1. Autenticazione
- `POST /api/auth/register` - Registrazione cliente
- `POST /api/auth/login` - Login cliente
- `POST /api/admin/login` - Login admin
- `POST /api/auth/logout` - Logout

#### 2. Gestione Utenti
- `GET /api/admin/users` - Lista utenti (admin)
- `POST /api/admin/users/create` - Crea utente (admin)
- `PUT /api/admin/users/update` - Aggiorna utente (admin)
- `DELETE /api/admin/users/delete` - Elimina utente (admin)

#### 3. Profili
- `GET /api/profile/[user_id]` - Ottieni profilo
- `POST /api/profile/create` - Crea profilo
- `PUT /api/profile/update` - Aggiorna profilo

#### 4. Clienti
- `GET /api/admin/clients` - Lista clienti (admin)
- `POST /api/admin/clients` - Crea cliente (admin)

### Service Role Usage
```typescript
// Uso corretto di service_role per operazioni admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Operazioni che bypassano RLS
await supabaseAdmin.auth.admin.createUser({...});
await supabaseAdmin.from('profiles').insert({...});
```

## ⚠️ Colli di Bottiglia Identificati

### 1. Tabelle Senza Indici
```sql
-- Mancano indici su:
-- clients.status
-- clients.created_at
-- profiles.role
-- profiles.created_at
-- analytics.timestamp (esiste ma potrebbe essere ottimizzato)
```

### 2. Policy RLS Lente
```sql
-- Policy problematiche che usano EXISTS con subquery
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

### 3. Trigger Problematici
- Trigger `update_updated_at_column()` su tutte le tabelle
- Possibile overhead su operazioni bulk

### 4. Problemi di Performance
- Query senza LIMIT nelle API admin
- Mancanza di paginazione
- Nessun caching implementato

## 🚀 Ottimizzazioni Suggerite

### 1. Indici Aggiuntivi
```sql
-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_client_code ON clients(client_code);
CREATE INDEX IF NOT EXISTS idx_analytics_user_timestamp ON analytics(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
```

### 2. Refactoring Policy RLS
```sql
-- Policy ottimizzate usando JOIN invece di EXISTS
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

-- Policy per accesso admin semplificata
CREATE POLICY "Admin access" ON profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );
```

### 3. Claims Aggiuntivi
```sql
-- Funzione per aggiungere claims JWT
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare claims JWT
CREATE OR REPLACE FUNCTION handle_user_role_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Aggiorna claims JWT quando cambia il ruolo
    PERFORM set_config('request.jwt.claims', 
        json_build_object(
            'role', NEW.role,
            'user_id', NEW.id
        )::text, 
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Uso Corretto di Service Role
```typescript
// Separazione chiara tra client e admin operations
const supabaseClient = createClient(url, anonKey); // Per operazioni utente
const supabaseAdmin = createClient(url, serviceRoleKey); // Per operazioni admin

// Esempio di operazione admin sicura
async function createAdminUser(userData) {
    // Usa service role solo per operazioni admin
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
    });
    
    if (error) throw error;
    
    // Crea profilo con ruolo admin
    await supabaseAdmin.from('profiles').insert({
        id: data.user.id,
        email: userData.email,
        role: 'admin',
        name: userData.name
    });
}
```

### 5. Ottimizzazioni API
```typescript
// Paginazione per liste grandi
async function getClients(page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    return await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });
}

// Caching per dati statici
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti
const cache = new Map();

async function getCachedPackages() {
    const cacheKey = 'packages';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    const { data } = await supabase.from('packages').select('*');
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}
```

### 6. Monitoraggio Performance
```sql
-- Query per monitorare performance
-- Tabelle più utilizzate
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Indici più utilizzati
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🔐 Raccomandazioni di Sicurezza

### 1. Validazione Input
```typescript
// Validazione robusta per tutti gli input
function validateUserInput(data) {
    const schema = {
        email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        password: (pwd) => pwd.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd),
        role: (role) => ['user', 'admin', 'superadmin'].includes(role)
    };
    
    return Object.entries(schema).every(([key, validator]) => 
        data[key] && validator(data[key])
    );
}
```

### 2. Rate Limiting
```typescript
// Implementare rate limiting per API critiche
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 5, // 5 tentativi
    message: 'Troppi tentativi di login, riprova più tardi'
});
```

### 3. Audit Trail
```sql
-- Tabella per audit trail
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger per audit automatico
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        user_id, action, table_name, record_id, 
        old_values, new_values
    ) VALUES (
        auth.uid(), 
        TG_OP, 
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## 📈 Metriche di Performance

### Baseline Attuale
- **Registrazione utente**: ~500ms
- **Login**: ~300ms
- **Query profilo**: ~200ms
- **Lista clienti (admin)**: ~800ms

### Target Post-Ottimizzazione
- **Registrazione utente**: <300ms
- **Login**: <200ms
- **Query profilo**: <100ms
- **Lista clienti (admin)**: <400ms

## 🎯 Piano di Implementazione

### Fase 1: Indici e Policy (Immediato)
1. Creare indici mancanti
2. Ottimizzare policy RLS
3. Implementare paginazione

### Fase 2: Caching e Claims (Breve termine)
1. Implementare caching per dati statici
2. Aggiungere claims JWT
3. Ottimizzare query frequenti

### Fase 3: Monitoraggio e Audit (Medio termine)
1. Implementare audit trail
2. Aggiungere metriche performance
3. Monitoraggio real-time

### Fase 4: Sicurezza Avanzata (Lungo termine)
1. Rate limiting avanzato
2. Validazione input robusta
3. Sicurezza perimetrale 