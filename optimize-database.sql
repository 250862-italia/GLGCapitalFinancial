-- 🚀 Script di Ottimizzazione Database Supabase
-- Esegui questo script nel SQL Editor di Supabase per migliorare performance e sicurezza

-- =====================================================
-- 1. INDICI AGGIUNTIVI PER PERFORMANCE
-- =====================================================

-- Indici per tabella profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);

-- Indici per tabella clients
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_client_code ON clients(client_code);
CREATE INDEX IF NOT EXISTS idx_clients_risk_profile ON clients(risk_profile);

-- Indici compositi per query frequenti
CREATE INDEX IF NOT EXISTS idx_clients_user_status ON clients(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON profiles(role, created_at);

-- Indici per altre tabelle
CREATE INDEX IF NOT EXISTS idx_analytics_user_timestamp ON analytics(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_investments_user_status ON investments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user_created ON payments(user_id, created_at);

-- =====================================================
-- 2. OTTIMIZZAZIONE POLICY RLS
-- =====================================================

-- Rimuovi policy esistenti problematiche
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics;
DROP POLICY IF EXISTS "Admins can manage team" ON team;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all investments" ON investments;
DROP POLICY IF EXISTS "Admins can manage partnerships" ON partnerships;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

-- Crea policy ottimizzate per admin access
CREATE POLICY "Admin access profiles" ON profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admin access clients" ON clients
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admin access analytics" ON analytics
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admin access team" ON team
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admin access notifications" ON notifications
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admin access investments" ON investments
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admin access partnerships" ON partnerships
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admin access payments" ON payments
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

-- =====================================================
-- 3. FUNZIONI PER CLAIMS JWT
-- =====================================================

-- Funzione per ottenere il ruolo utente
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

-- Funzione per ottenere informazioni utente complete
CREATE OR REPLACE FUNCTION get_user_info(user_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'id', p.id,
            'email', p.email,
            'role', p.role,
            'name', p.name,
            'kyc_status', p.kyc_status,
            'created_at', p.created_at
        )
        FROM profiles p
        WHERE p.id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TABELLA AUDIT TRAIL
-- =====================================================

-- Crea tabella audit log
CREATE TABLE IF NOT EXISTS audit_log (
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

-- Indici per audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Abilita RLS su audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy per audit log (solo admin possono vedere)
CREATE POLICY "Admin access audit log" ON audit_log
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
        )
    );

-- =====================================================
-- 5. TRIGGER PER AUDIT AUTOMATICO
-- =====================================================

-- Funzione per audit automatico
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

-- Applica trigger di audit alle tabelle principali
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_clients_trigger ON clients;
CREATE TRIGGER audit_clients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_investments_trigger ON investments;
CREATE TRIGGER audit_investments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON investments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- 6. FUNZIONI DI UTILITÀ
-- =====================================================

-- Funzione per pulire audit log vecchi (mantiene ultimi 90 giorni)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_log 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Funzione per statistiche utenti
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'total_users', (SELECT COUNT(*) FROM profiles),
            'active_users', (SELECT COUNT(*) FROM profiles WHERE kyc_status = 'approved'),
            'pending_kyc', (SELECT COUNT(*) FROM profiles WHERE kyc_status = 'pending'),
            'admin_users', (SELECT COUNT(*) FROM profiles WHERE role IN ('admin', 'superadmin')),
            'total_clients', (SELECT COUNT(*) FROM clients),
            'active_clients', (SELECT COUNT(*) FROM clients WHERE status = 'active'),
            'total_investments', (SELECT COUNT(*) FROM investments),
            'total_invested', (SELECT COALESCE(SUM(total_invested), 0) FROM clients)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VISTE PER REPORTING
-- =====================================================

-- Vista per dashboard admin
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT 
    p.id,
    p.email,
    p.name,
    p.role,
    p.kyc_status,
    p.created_at,
    c.client_code,
    c.status as client_status,
    c.total_invested,
    COUNT(i.id) as investment_count,
    COALESCE(SUM(i.amount), 0) as total_investment_amount
FROM profiles p
LEFT JOIN clients c ON p.id = c.user_id
LEFT JOIN investments i ON c.id = i.client_id
GROUP BY p.id, p.email, p.name, p.role, p.kyc_status, p.created_at, c.client_code, c.status, c.total_invested;

-- Vista per analytics utente
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
    a.user_id,
    p.email,
    p.name,
    COUNT(a.id) as page_visits,
    AVG(a.session_duration) as avg_session_duration,
    MAX(a.timestamp) as last_visit,
    MIN(a.timestamp) as first_visit
FROM analytics a
JOIN profiles p ON a.user_id = p.id
GROUP BY a.user_id, p.email, p.name;

-- =====================================================
-- 8. CONFIGURAZIONI DI SICUREZZA
-- =====================================================

-- Tabella per configurazioni di sicurezza
CREATE TABLE IF NOT EXISTS security_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisci configurazioni di default
INSERT INTO security_config (key, value, description) VALUES
    ('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": true}', 'Password policy configuration'),
    ('session_timeout', '{"hours": 24}', 'Session timeout in hours'),
    ('max_login_attempts', '{"count": 5, "lockout_minutes": 15}', 'Maximum login attempts before lockout'),
    ('kyc_requirements', '{"required_fields": ["first_name", "last_name", "date_of_birth", "address", "phone"]}', 'KYC requirements configuration')
ON CONFLICT (key) DO NOTHING;

-- Abilita RLS su security_config
ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

-- Policy per security_config (solo superadmin)
CREATE POLICY "Superadmin access security config" ON security_config
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'superadmin'
        )
    );

-- =====================================================
-- 9. FUNZIONI DI VALIDAZIONE
-- =====================================================

-- Funzione per validare email
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funzione per validare password
CREATE OR REPLACE FUNCTION is_valid_password(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN 
        length(password) >= 8 AND
        password ~ '[A-Z]' AND
        password ~ '[a-z]' AND
        password ~ '[0-9]' AND
        password ~ '[^A-Za-z0-9]';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 10. VERIFICA FINALE
-- =====================================================

-- Verifica che tutti gli indici siano stati creati
SELECT 'Indici creati:' as info, COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Verifica che tutte le policy siano attive
SELECT 'Policy RLS attive:' as info, COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- Verifica funzioni create
SELECT 'Funzioni create:' as info, COUNT(*) as count
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('get_user_role', 'get_user_info', 'audit_trigger_function', 'cleanup_old_audit_logs', 'get_user_statistics');

-- Messaggio di successo
SELECT '🎉 Ottimizzazioni database completate con successo!' as status;
SELECT '📊 Indici creati per migliorare performance' as info;
SELECT '🛡️ Policy RLS ottimizzate per sicurezza' as info;
SELECT '📝 Audit trail configurato per tracciabilità' as info;
SELECT '🔧 Funzioni di utilità aggiunte' as info; 