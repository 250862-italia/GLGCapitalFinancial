-- GLG Capital Financial - Fix RLS Policies
-- Questo script crea policy permissive per sbloccare tutte le tabelle
-- DA USARE SOLO PER SVILUPPO/TEST - NON PER PRODUZIONE

-- =====================================================
-- 1. RIMUOVI TUTTE LE POLICY ESISTENTI
-- =====================================================

-- Rimuovi policy esistenti per evitare conflitti
DROP POLICY IF EXISTS "Clients can view own profile" ON clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON clients;
DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;
DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can manage all packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics;
DROP POLICY IF EXISTS "Admins can view all requests" ON informational_requests;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

-- =====================================================
-- 2. CREA POLICY PERMISSIVE PER TUTTE LE TABELLE
-- =====================================================

-- CLIENTS TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

-- PACKAGES TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON packages
    FOR ALL USING (auth.role() = 'authenticated');

-- INVESTMENTS TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON investments
    FOR ALL USING (auth.role() = 'authenticated');

-- ANALYTICS TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON analytics
    FOR ALL USING (auth.role() = 'authenticated');

-- INFORMATIONAL_REQUESTS TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON informational_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- TEAM_MEMBERS TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON team_members
    FOR ALL USING (auth.role() = 'authenticated');

-- CONTENT TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON content
    FOR ALL USING (auth.role() = 'authenticated');

-- PARTNERSHIPS TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON partnerships
    FOR ALL USING (auth.role() = 'authenticated');

-- SETTINGS TABLE - Policy permissive per tutti gli utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON settings
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. POLICY PER STORAGE (se necessario)
-- =====================================================

-- Storage policy permissive per utenti autenticati
CREATE POLICY "Enable all access for authenticated users" ON storage.objects
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. VERIFICA CHE RLS SIA ABILITATO SU TUTTE LE TABELLE
-- =====================================================

-- Assicurati che RLS sia abilitato su tutte le tabelle
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. INSERISCI DATI DI TEST SE LE TABELLE SONO VUOTE
-- =====================================================

-- Inserisci dati di test per analytics se la tabella è vuota
INSERT INTO analytics (metric, value, change_percentage, period, category, description) 
SELECT 'Total Revenue', 1250000, 12.5, 'monthly', 'financial', 'Monthly revenue tracking'
WHERE NOT EXISTS (SELECT 1 FROM analytics WHERE metric = 'Total Revenue');

INSERT INTO analytics (metric, value, change_percentage, period, category, description) 
SELECT 'Active Users', 1250, 8.3, 'weekly', 'user', 'Weekly active user count'
WHERE NOT EXISTS (SELECT 1 FROM analytics WHERE metric = 'Active Users');

INSERT INTO analytics (metric, value, change_percentage, period, category, description) 
SELECT 'Investment Packages', 45, 15.2, 'monthly', 'product', 'Available investment packages'
WHERE NOT EXISTS (SELECT 1 FROM analytics WHERE metric = 'Investment Packages');

-- Inserisci pacchetti di investimento se la tabella è vuota
INSERT INTO packages (name, description, min_investment, max_investment, duration, expected_return, status) 
SELECT 'Pacchetto Starter', 'Perfetto per iniziare il tuo percorso di investimento', 1000.00, 5000.00, 90, 8.50, 'active'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Pacchetto Starter');

INSERT INTO packages (name, description, min_investment, max_investment, duration, expected_return, status) 
SELECT 'Pacchetto Growth', 'Il nostro pacchetto più popolare', 5000.00, 25000.00, 180, 12.00, 'active'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Pacchetto Growth');

-- Inserisci impostazioni di default se la tabella è vuota
INSERT INTO settings (key, value, description) 
SELECT 'email_config', '{"smtp_host": "smtp.gmail.com", "smtp_port": 587}', 'Email configuration'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'email_config');

INSERT INTO settings (key, value, description) 
SELECT 'app_config', '{"maintenance_mode": false, "registration_enabled": true}', 'Application configuration'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'app_config');

-- =====================================================
-- 6. VERIFICA FINALE
-- =====================================================

-- Conta i record in ogni tabella per verificare l'accesso
SELECT 'clients' as table_name, COUNT(*) as record_count FROM clients
UNION ALL
SELECT 'packages' as table_name, COUNT(*) as record_count FROM packages
UNION ALL
SELECT 'investments' as table_name, COUNT(*) as record_count FROM investments
UNION ALL
SELECT 'analytics' as table_name, COUNT(*) as record_count FROM analytics
UNION ALL
SELECT 'informational_requests' as table_name, COUNT(*) as record_count FROM informational_requests
UNION ALL
SELECT 'team_members' as table_name, COUNT(*) as record_count FROM team_members
UNION ALL
SELECT 'content' as table_name, COUNT(*) as record_count FROM content
UNION ALL
SELECT 'partnerships' as table_name, COUNT(*) as record_count FROM partnerships
UNION ALL
SELECT 'settings' as table_name, COUNT(*) as record_count FROM settings;

-- Messaggio di completamento
SELECT 'RLS policies fixed successfully! All tables should now be accessible.' as status; 