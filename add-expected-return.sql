-- Aggiungi colonna expected_return alla tabella packages
ALTER TABLE packages ADD COLUMN IF NOT EXISTS expected_return DECIMAL(5,2) DEFAULT 1.0;

-- Aggiorna i valori per i pacchetti esistenti
UPDATE packages SET expected_return = 8.5 WHERE name = 'Starter Package';
UPDATE packages SET expected_return = 12.0 WHERE name = 'Elite Package';
UPDATE packages SET expected_return = 15.5 WHERE name = 'Premium Package';

-- Verifica i risultati
SELECT name, min_investment, max_investment, duration, expected_return, status 
FROM packages 
ORDER BY min_investment; 