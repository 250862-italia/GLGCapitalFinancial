# 🧹 Guida Reset Database GLG Capital Financial

Questa guida spiega come resettare completamente il database per renderlo vergine.

## ⚠️ ATTENZIONE

**Questi script eliminano TUTTI i dati esistenti!** Assicurati di avere un backup prima di procedere.

## 📁 File Disponibili

### 1. `reset-database.js` (RACCOMANDATO)
Script completo che:
- ✅ Elimina tutti i dati dal database
- ✅ Pulisce gli utenti auth
- ✅ Pulisce lo storage
- ✅ Ricrea il Super Admin
- ✅ Verifica il risultato

### 2. `cleanup-database.sql`
Script SQL per pulizia manuale tramite Supabase Dashboard

### 3. `cleanup-database.js`
Script di pulizia senza ricreazione Super Admin

### 4. `setup-superadmin.js`
Script per ricreare solo il Super Admin

## 🚀 Reset Rapido (Raccomandato)

```bash
# 1. Assicurati di avere le variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue credenziali Supabase

# 2. Installa le dipendenze (se non già fatto)
npm install

# 3. Esegui il reset completo
node reset-database.js
```

## 📋 Cosa Fa il Reset

### Fase 1: Pulizia Database
- ❌ Elimina audit trail
- ❌ Elimina KYC records
- ❌ Elimina investimenti
- ❌ Elimina pagamenti
- ❌ Elimina richieste informative
- ❌ Elimina partnership
- ❌ Elimina contenuti
- ❌ Elimina notifiche
- ❌ Elimina backup
- ❌ Elimina impostazioni
- ❌ Elimina team
- ❌ Elimina clienti
- ❌ Elimina utenti admin

### Fase 2: Pulizia Auth
- ❌ Elimina tutti gli utenti clienti
- ✅ Mantiene solo utenti admin (@glgcapital.com, @magnificusdominus.com)

### Fase 3: Pulizia Storage
- ❌ Elimina tutti i file caricati
- ✅ Mantiene bucket avatars

### Fase 4: Creazione Super Admin
- ✅ Crea utente auth: admin@glgcapital.com
- ✅ Crea record nella tabella users
- ✅ Crea record nella tabella clients

### Fase 5: Verifica
- ✅ Conta i record in tutte le tabelle
- ✅ Conferma che tutto sia pulito

## 🔐 Credenziali Super Admin

Dopo il reset, potrai accedere con:

- **Email:** admin@glgcapital.com
- **Password:** GLGAdmin2024!
- **URL:** https://glg-dashboard.vercel.app/admin/login

## 🛠️ Reset Manuale (SQL)

Se preferisci usare SQL direttamente:

1. Vai su [Supabase Dashboard](https://supabase.com)
2. Apri il tuo progetto
3. Vai su "SQL Editor"
4. Copia e incolla il contenuto di `cleanup-database.sql`
5. Esegui lo script

## 🔄 Reset Parziale

Se vuoi solo pulire alcune tabelle:

```bash
# Solo pulizia (senza ricreare Super Admin)
node cleanup-database.js

# Solo ricreare Super Admin
node setup-superadmin.js
```

## 📊 Verifica Post-Reset

Dopo il reset, verifica che:

1. **Tutte le tabelle siano vuote** (tranne users con Super Admin)
2. **Solo il Super Admin esista** in auth
3. **Storage sia pulito** (tranne avatars)
4. **Login admin funzioni** con le credenziali fornite

## 🚨 Risoluzione Problemi

### Errore "Variabili d'ambiente mancanti"
```bash
# Assicurati di avere nel file .env:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Errore "Permission denied"
- Verifica che la `SUPABASE_SERVICE_ROLE_KEY` sia corretta
- Assicurati che abbia i permessi di amministratore

### Errore "Table doesn't exist"
- Alcune tabelle potrebbero non esistere (normale)
- Lo script gestisce automaticamente questi errori

## 📞 Supporto

Se hai problemi:

1. Controlla i log dell'errore
2. Verifica le credenziali Supabase
3. Assicurati di avere i permessi necessari
4. Contatta il team di sviluppo

## 🎯 Prossimi Passi

Dopo il reset:

1. **Cambia la password** del Super Admin
2. **Configura le impostazioni** base
3. **Testa la registrazione** di un nuovo cliente
4. **Verifica il processo KYC**
5. **Controlla l'admin dashboard**

---

**⚠️ IMPORTANTE:** Questo reset è irreversibile! Assicurati di avere un backup prima di procedere. 