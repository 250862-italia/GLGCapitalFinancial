-- GLG Capital Financial - Fix RLS Policies Complete
-- Questo script crea policy sicure e funzionali per tutte le tabelle

-- =====================================================
-- 1. RIMUOVI TUTTE LE POLICY ESISTENTI
-- =====================================================

-- Rimuovi policy esistenti per evitare conflitti
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;
DROP POLICY IF EXISTS "Users can view own investments" ON investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON investments;
DROP POLICY IF EXISTS "Users can update own investments" ON investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
DROP POLICY IF EXISTS "Admins can manage all investments" ON investments;
DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;
DROP POLICY IF EXISTS "Admins can manage all packages" ON packages;
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics;
DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own team" ON team;
DROP POLICY IF EXISTS "Admins can view all team" ON team;
DROP POLICY IF EXISTS "Admins can view all content" ON content;
DROP POLICY IF EXISTS "Admins can manage all content" ON content;
DROP POLICY IF EXISTS "Admins can view all partnerships" ON partnerships;
DROP POLICY IF EXISTS "Admins can manage all partnerships" ON partnerships;
DROP POLICY IF EXISTS "Admins can view all settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage all settings" ON settings;

-- =====================================================
-- 2. CLIENTS TABLE - Policy per utenti e admin
-- =====================================================

-- Utenti autenticati possono vedere solo i propri dati
CREATE POLICY "Users can view their own clients"
  ON public.clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Utenti autenticati possono aggiornare solo i propri dati
CREATE POLICY "Users can update their own clients"
  ON public.clients
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Utenti autenticati possono inserire solo i propri dati
CREATE POLICY "Users can insert their own clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Utenti autenticati possono eliminare solo i propri dati
CREATE POLICY "Users can delete their own clients"
  ON public.clients
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin possono vedere tutti i clienti
CREATE POLICY "Admins can view all clients"
  ON public.clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Admin possono gestire tutti i clienti
CREATE POLICY "Admins can manage all clients"
  ON public.clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 3. INVESTMENTS TABLE - Policy per utenti e admin
-- =====================================================

-- Utenti autenticati possono vedere solo i propri investimenti
CREATE POLICY "Users can view own investments"
  ON public.investments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.user_id = auth.uid() 
      AND clients.id = investments.client_id
    )
  );

-- Utenti autenticati possono inserire solo i propri investimenti
CREATE POLICY "Users can insert own investments"
  ON public.investments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.user_id = auth.uid() 
      AND clients.id = investments.client_id
    )
  );

-- Utenti autenticati possono aggiornare solo i propri investimenti
CREATE POLICY "Users can update own investments"
  ON public.investments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.user_id = auth.uid() 
      AND clients.id = investments.client_id
    )
  );

-- Admin possono vedere tutti gli investimenti
CREATE POLICY "Admins can view all investments"
  ON public.investments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Admin possono gestire tutti gli investimenti
CREATE POLICY "Admins can manage all investments"
  ON public.investments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 4. PACKAGES TABLE - Policy per tutti gli utenti
-- =====================================================

-- Tutti gli utenti autenticati possono vedere i pacchetti attivi
CREATE POLICY "Anyone can view active packages"
  ON public.packages
  FOR SELECT
  USING (status = 'active');

-- Solo admin possono gestire i pacchetti
CREATE POLICY "Admins can manage all packages"
  ON public.packages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 5. ANALYTICS TABLE - Policy per utenti e admin
-- =====================================================

-- Utenti autenticati possono vedere solo le proprie analytics
CREATE POLICY "Users can view own analytics"
  ON public.analytics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo admin possono vedere tutte le analytics
CREATE POLICY "Admins can view all analytics"
  ON public.analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 6. NOTIFICATIONS TABLE - Policy per utenti e admin
-- =====================================================

-- Utenti autenticati possono vedere solo le proprie notifiche
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo admin possono vedere tutte le notifiche
CREATE POLICY "Admins can view all notifications"
  ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 7. TEAM TABLE - Policy per admin
-- =====================================================

-- Solo admin possono vedere e gestire il team
CREATE POLICY "Admins can view all team"
  ON public.team
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage all team"
  ON public.team
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 8. CONTENT TABLE - Policy per admin
-- =====================================================

-- Solo admin possono vedere e gestire il contenuto
CREATE POLICY "Admins can view all content"
  ON public.content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage all content"
  ON public.content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 9. PARTNERSHIPS TABLE - Policy per admin
-- =====================================================

-- Solo admin possono vedere e gestire le partnership
CREATE POLICY "Admins can view all partnerships"
  ON public.partnerships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage all partnerships"
  ON public.partnerships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 10. SETTINGS TABLE - Policy per admin
-- =====================================================

-- Solo admin possono vedere e gestire le impostazioni
CREATE POLICY "Admins can view all settings"
  ON public.settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage all settings"
  ON public.settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- 11. STORAGE POLICIES
-- =====================================================

-- Solo admin possono vedere tutti i documenti
CREATE POLICY "Admins can view all documents"
  ON storage.objects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Utenti autenticati possono vedere solo i propri documenti
CREATE POLICY "Users can view own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Utenti autenticati possono caricare solo i propri documenti
CREATE POLICY "Users can upload own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================
-- 12. VERIFICA FINALE
-- =====================================================

-- Verifica che tutte le policy siano state create
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
SELECT 'RLS policies create con successo! Sistema sicuro e funzionale.' as status; 