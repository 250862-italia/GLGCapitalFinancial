
📋 ISTRUZIONI PER CREARE IL NUOVO PROGETTO SUPABASE:

1. 🌐 Vai su https://supabase.com
2. 🔐 Accedi al tuo account
3. ➕ Clicca "New Project"
4. 📝 Configura il progetto:
   - Name: glg-capital-financial-v2
   - Database Password: [genera una password sicura]
   - Region: us-east-1 (per performance ottimali)
   - Pricing Plan: Free tier

5. ⏳ Aspetta che il progetto sia creato (2-3 minuti)

6. 🔑 Copia le credenziali:
   - Project URL: https://[project-id].supabase.co
   - anon/public key: [chiave pubblica]
   - service_role key: [chiave privata]

7. 📁 Sostituisci i valori nel file .env.local con le nuove credenziali

8. 🗄️ Esegui lo script SQL nel SQL Editor di Supabase

9. 🧪 Testa la connessione con: npm run test-supabase

10. 🚀 Deploy: npm run build && npm run deploy
