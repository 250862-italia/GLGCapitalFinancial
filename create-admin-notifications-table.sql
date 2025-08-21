-- Script per creare la tabella admin_notifications in Supabase
-- Esegui questo script nel SQL Editor di Supabase

-- Crea la tabella admin_notifications se non esiste
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('package_update', 'package_create', 'package_delete', 'investment_request', 'client_update')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_timestamp ON admin_notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);

-- Abilita Row Level Security (RLS)
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere agli admin di gestire tutte le notifiche
CREATE POLICY "Admin can manage all notifications" ON admin_notifications
    FOR ALL USING (true);

-- Inserisce alcune notifiche di esempio per test
INSERT INTO admin_notifications (
    type,
    title,
    message,
    timestamp,
    read,
    data
) VALUES 
(
    'package_update',
    'Pacchetto Aggiornato',
    'Il pacchetto "Premium Plus" è stato aggiornato dall''amministratore',
    NOW() - INTERVAL '1 hour',
    false,
    '{"package_id": "1", "package_name": "Premium Plus", "changes": {"expected_return": 12.5, "risk_level": "medium"}}'
),
(
    'investment_request',
    'Nuova Richiesta di Investimento',
    'Mario Rossi ha richiesto di investire €25,000 nel Pacchetto Premium',
    NOW() - INTERVAL '30 minutes',
    false,
    '{"client_name": "Mario Rossi", "client_email": "mario.rossi@example.com", "amount": 25000, "package_name": "Pacchetto Premium"}'
),
(
    'client_update',
    'Cliente Aggiornato',
    'Il profilo di Mario Rossi è stato aggiornato',
    NOW() - INTERVAL '15 minutes',
    true,
    '{"client_id": "temp-client-1", "client_name": "Mario Rossi", "changes": ["email", "phone"]}'
)
ON CONFLICT DO NOTHING;

-- Verifica la creazione
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE read = false) as unread_notifications,
    COUNT(*) FILTER (WHERE read = true) as read_notifications
FROM admin_notifications;
