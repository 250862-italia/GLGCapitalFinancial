-- Creazione tabelle mancanti per GLGCapitalFinancial

-- 1. Tabella analytics per tracking
CREATE TABLE IF NOT EXISTS analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    page_visited VARCHAR(255) NOT NULL,
    session_duration INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabella team per gestione team
CREATE TABLE IF NOT EXISTS team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'member',
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabella notifications per notifiche
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- 4. Tabella profiles (se non esiste)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
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

-- 5. Aggiungi colonna expected_return alla tabella packages se non esiste
ALTER TABLE packages ADD COLUMN IF NOT EXISTS expected_return DECIMAL(5,2) DEFAULT 1.0;

-- Aggiorna i valori per i pacchetti esistenti
UPDATE packages SET expected_return = 8.5 WHERE name = 'Starter Package';
UPDATE packages SET expected_return = 12.0 WHERE name = 'Elite Package';
UPDATE packages SET expected_return = 15.5 WHERE name = 'Premium Package';

-- 6. Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_team_user_id ON team(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 7. Abilita RLS su tutte le tabelle
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Crea policy RLS per analytics
CREATE POLICY "Users can view their own analytics" ON analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 9. Crea policy RLS per team
CREATE POLICY "Users can view team members" ON team
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage team" ON team
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 10. Crea policy RLS per notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 11. Crea policy RLS per profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 12. Inserisci dati di esempio per team
INSERT INTO team (user_id, name, email, role, department) VALUES
    (gen_random_uuid(), 'Admin User', 'admin@glgcapital.com', 'admin', 'Management'),
    (gen_random_uuid(), 'Support Team', 'support@glgcapital.com', 'support', 'Customer Service')
ON CONFLICT (email) DO NOTHING;

-- Verifica finale
SELECT 'Tabelle create con successo!' as status; 