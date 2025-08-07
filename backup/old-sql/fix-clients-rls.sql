-- Fix RLS policies per tabella clients

-- 1. Disabilita temporaneamente RLS
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 2. Elimina tutte le policy esistenti (se presenti)
DROP POLICY IF EXISTS "Users can view their own client data" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own client data" ON clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;

-- 3. Riabilita RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. Crea nuove policy semplici e corrette
CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- 5. Verifica che le policy siano state create
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'clients';

-- 6. Test di accesso
SELECT 'RLS policies per clients create con successo!' as status; 