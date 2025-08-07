-- Fix struttura tabella users per login clienti
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT true; 