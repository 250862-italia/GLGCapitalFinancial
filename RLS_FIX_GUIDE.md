# 🔧 Fix RLS Policies - Guida Rapida

## 🚨 Problema
Le pagine admin sono bianche perché le policy RLS (Row Level Security) sono troppo restrittive e bloccano l'accesso alle tabelle del database.

## ✅ Soluzione
Eseguire il file `fix-rls-policies.sql` nel Supabase Dashboard per creare policy permissive.

## 📋 Passi da Seguire

### 1. Apri Supabase Dashboard
1. Vai su: https://supabase.com/dashboard
2. Accedi con le tue credenziali
3. Seleziona il progetto: **dobjulfwktzltpvqtxbql**

### 2. Apri SQL Editor
1. Nel menu laterale, clicca su **"SQL Editor"**
2. Clicca su **"New query"**
3. Dai un nome alla query: `Fix RLS Policies`

### 3. Esegui lo Script
1. **Copia tutto il contenuto** del file `fix-rls-policies.sql`
2. **Incolla** nel SQL Editor
3. Clicca **"Run"**
4. Aspetta che tutte le operazioni siano completate

### 4. Verifica il Risultato
Dopo l'esecuzione, dovresti vedere:
- ✅ Messaggio: "RLS policies fixed successfully!"
- ✅ Conteggio dei record in tutte le tabelle
- ✅ Nessun errore di accesso

## 🔍 Cosa Fa lo Script

### Rimuove Policy Esistenti
- Elimina tutte le policy RLS esistenti che causano conflitti

### Crea Policy Permissive
- **clients**: Accesso completo per utenti autenticati
- **packages**: Accesso completo per utenti autenticati  
- **investments**: Accesso completo per utenti autenticati
- **analytics**: Accesso completo per utenti autenticati
- **informational_requests**: Accesso completo per utenti autenticati
- **team_members**: Accesso completo per utenti autenticati
- **content**: Accesso completo per utenti autenticati
- **partnerships**: Accesso completo per utenti autenticati
- **settings**: Accesso completo per utenti autenticati

### Inserisce Dati di Test
- Dati analytics di esempio
- Pacchetti di investimento di esempio
- Impostazioni di default

## 🧪 Test Post-Fix

### 1. Testa le Pagine Admin
- Vai su `/admin/analytics/dashboard`
- Vai su `/admin/clients`
- Vai su `/admin/investments`
- Verifica che non siano più bianche

### 2. Testa le API
- Vai su `/api/admin/analytics/dashboard`
- Vai su `/api/admin/clients`
- Verifica che restituiscano dati

### 3. Testa il Frontend
- Accedi come admin
- Naviga tra le pagine admin
- Verifica che i dati si carichino

## ⚠️ Importante

### Solo per Sviluppo/Test
- Queste policy sono **permissive** e permettono accesso completo
- **NON USARE** in produzione senza modifiche
- Per produzione, creare policy più restrittive

### Backup
- Prima di eseguire, fai un backup del database se hai dati importanti
- Le policy esistenti verranno eliminate

## 🆘 Se Qualcosa Non Funziona

### Errore "Table doesn't exist"
- Esegui prima `setup-production.sql`
- Poi esegui `fix-rls-policies.sql`

### Errore "Permission denied"
- Verifica di avere i permessi di amministratore su Supabase
- Usa la Service Role Key se necessario

### Pagine ancora bianche
- Pulisci la cache del browser
- Riavvia l'applicazione
- Verifica le variabili d'ambiente

## 📞 Supporto
Se hai problemi, controlla:
1. I log di Supabase per errori SQL
2. I log dell'applicazione per errori di fetch
3. La console del browser per errori JavaScript 