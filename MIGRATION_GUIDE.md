# 🚀 Guida alla Migrazione Supabase v2

## 📋 Panoramica

Questa guida ti aiuterà a migrare dal progetto Supabase non funzionante al nuovo progetto `glg-capital-financial-v2`.

## ✅ Stato Attuale

- ❌ **Progetto Supabase originale**: Eliminato (`dobjulfwktzltpvqtxbql`)
- ✅ **Sistema offline**: Completamente funzionante
- ✅ **Fallback automatico**: Attivo per tutti gli endpoint
- ✅ **Applicazione**: Operativa con dati mock

## 🔧 Passi per la Migrazione

### Passo 1: Preparazione
```bash
# Genera i file di setup
npm run setup:supabase
```

### Passo 2: Creare Nuovo Progetto Supabase

1. **Vai su [Supabase.com](https://supabase.com)**
2. **Accedi al tuo account**
3. **Clicca "New Project"**
4. **Configura il progetto:**
   - **Name**: `glg-capital-financial-v2`
   - **Database Password**: Genera una password sicura
   - **Region**: `us-east-1` (per performance ottimali)
   - **Pricing Plan**: Free tier

5. **Aspetta la creazione** (2-3 minuti)

### Passo 3: Ottenere le Credenziali

1. **Vai su Settings > API**
2. **Copia le credenziali:**
   - **Project URL**: `https://[project-id].supabase.co`
   - **anon/public key**: `[chiave pubblica]`
   - **service_role key**: `[chiave privata]`

### Passo 4: Configurare l'Ambiente

1. **Modifica `.env.local`:**
```bash
# Sostituisci con le nuove credenziali
NEXT_PUBLIC_SUPABASE_URL=https://[NUOVO-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NUOVA-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[NUOVA-SERVICE-ROLE-KEY]
```

### Passo 5: Setup Database

1. **Vai su SQL Editor in Supabase**
2. **Copia e incolla il contenuto di `setup-database.sql`**
3. **Esegui lo script**

### Passo 6: Testare la Connessione

```bash
# Testa la connessione al nuovo progetto
npm run test:supabase
```

### Passo 7: Deploy

```bash
# Build e deploy
npm run build
npm run deploy
```

## 🧪 Test di Verifica

### Test API
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test notes API
curl http://localhost:3000/api/notes

# Test creazione nota
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test migrazione"}'
```

### Test Frontend
1. **Vai su `http://localhost:3000/notes`**
2. **Verifica che le note si carichino**
3. **Testa creazione, modifica, eliminazione**

## 🔄 Rollback (se necessario)

Se qualcosa non funziona:

1. **Ripristina le credenziali originali in `.env.local`**
2. **Il sistema tornerà automaticamente in modalità offline**
3. **Nessun dato verrà perso**

## 📊 Monitoraggio

### Log da controllare:
```bash
# Verifica i log del server
npm run dev

# Cerca questi messaggi:
✅ "Using online data" - Connessione Supabase attiva
⚠️ "Using offline data" - Fallback attivo
❌ "Error fetching" - Problemi di connessione
```

### Health Check:
```bash
# Verifica lo stato del sistema
curl http://localhost:3000/api/health | jq .
```

## 🎯 Risultato Atteso

Dopo la migrazione dovresti vedere:

- ✅ **Connessione Supabase attiva**
- ✅ **Dati reali dal database**
- ✅ **Autenticazione funzionante**
- ✅ **Real-time updates**
- ✅ **Email system operativo**

## 🆘 Risoluzione Problemi

### Problema: "fetch failed"
**Soluzione**: Verifica le credenziali in `.env.local`

### Problema: "Table not found"
**Soluzione**: Esegui `setup-database.sql` nel SQL Editor

### Problema: "Unauthorized"
**Soluzione**: Verifica che le chiavi API siano corrette

### Problema: "Connection timeout"
**Soluzione**: Verifica la connessione internet e le impostazioni firewall

## 📞 Supporto

Se hai problemi:

1. **Controlla i log del server**
2. **Verifica le credenziali**
3. **Testa con `npm run test:supabase`**
4. **Controlla la documentazione Supabase**

---

**🎉 Buona migrazione! Il sistema è progettato per essere resiliente e non dovrebbe mai smettere di funzionare.** 