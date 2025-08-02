-- Aggiungi indici unique per prevenire duplicati
-- Esegui questo script per garantire integrità referenziale

-- 1. Indice unique per email in profiles
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
ON profiles(email) 
WHERE email IS NOT NULL;

-- 2. Indice unique per email in auth.users
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_email_unique 
ON auth.users(email) 
WHERE email IS NOT NULL;

-- 3. Indice unique per client_code in clients
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_code_unique 
ON clients(client_code) 
WHERE client_code IS NOT NULL;

-- 4. Verifica integrità referenziale
-- Controlla che tutti i client abbiano un user_id valido
SELECT COUNT(*) as orphaned_clients 
FROM clients c 
LEFT JOIN auth.users u ON c.user_id = u.id 
WHERE u.id IS NULL;

-- Controlla che tutti i client abbiano un profile_id valido
SELECT COUNT(*) as orphaned_profiles 
FROM clients c 
LEFT JOIN profiles p ON c.profile_id = p.id 
WHERE p.id IS NULL;

-- Controlla che tutti gli investments abbiano un user_id valido
SELECT COUNT(*) as orphaned_investments 
FROM investments i 
LEFT JOIN auth.users u ON i.user_id = u.id 
WHERE u.id IS NULL;

-- 5. Cleanup dati orfani (esegui solo se necessario)
-- DELETE FROM clients WHERE user_id NOT IN (SELECT id FROM auth.users);
-- DELETE FROM investments WHERE user_id NOT IN (SELECT id FROM auth.users);
-- DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 6. Aggiungi constraint per garantire integrità
ALTER TABLE clients 
ADD CONSTRAINT fk_clients_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE clients 
ADD CONSTRAINT fk_clients_profile_id 
FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE investments 
ADD CONSTRAINT fk_investments_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE investments 
ADD CONSTRAINT fk_investments_client_id 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- 7. Verifica finale
SELECT 
  'profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT email) as unique_emails
FROM profiles
UNION ALL
SELECT 
  'clients' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM clients
UNION ALL
SELECT 
  'investments' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM investments; 