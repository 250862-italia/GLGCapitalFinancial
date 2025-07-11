-- Script di pulizia completa del database GLG Capital Financial
-- ATTENZIONE: Questo script elimina TUTTI i dati esistenti!

-- Disabilita temporaneamente i trigger di audit per evitare errori
SET session_replication_role = replica;

-- Elimina tutti i dati dalle tabelle (in ordine per evitare errori di foreign key)

-- 1. Elimina audit trail (dipende da altre tabelle)
DELETE FROM audit_trail;

-- 2. Elimina KYC records
DELETE FROM kyc_records;

-- 3. Elimina documenti caricati
DELETE FROM documents;

-- 4. Elimina investimenti
DELETE FROM investments;

-- 5. Elimina pagamenti
DELETE FROM payments;

-- 6. Elimina richieste informative
DELETE FROM informational_requests;

-- 7. Elimina partnership
DELETE FROM partnerships;

-- 8. Elimina contenuti
DELETE FROM content;

-- 9. Elimina notifiche
DELETE FROM notifications;

-- 10. Elimina backup
DELETE FROM backups;

-- 11. Elimina impostazioni
DELETE FROM settings;

-- 12. Elimina team
DELETE FROM team_members;

-- 13. Elimina utenti admin
DELETE FROM users WHERE role IN ('admin', 'superadmin');

-- 14. Elimina clienti (mantieni solo la struttura)
DELETE FROM clients;

-- 15. Elimina utenti clienti
DELETE FROM auth.users WHERE email NOT LIKE '%@glgcapital.com' AND email NOT LIKE '%@magnificusdominus.com';

-- Reset delle sequenze (se esistono)
-- Nota: Le sequenze vengono ricreate automaticamente da Supabase

-- Riabilita i trigger di audit
SET session_replication_role = DEFAULT;

-- Verifica che le tabelle siano vuote
SELECT 
    'audit_trail' as table_name, COUNT(*) as record_count FROM audit_trail
UNION ALL
SELECT 'kyc_records', COUNT(*) FROM kyc_records
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'investments', COUNT(*) FROM investments
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'informational_requests', COUNT(*) FROM informational_requests
UNION ALL
SELECT 'partnerships', COUNT(*) FROM partnerships
UNION ALL
SELECT 'content', COUNT(*) FROM content
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'backups', COUNT(*) FROM backups
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'clients', COUNT(*) FROM clients;

-- Messaggio di conferma
SELECT 'Database pulito con successo! Tutti i dati sono stati eliminati.' as status; 