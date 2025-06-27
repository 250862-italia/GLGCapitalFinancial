# 🔐 Setup Sistema di Autenticazione GLG Dashboard

## 📋 Prerequisiti

1. **Supabase configurato** con le variabili d'ambiente nel file `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

## 🗄️ Setup Database

### Opzione 1: Script automatico
```bash
npm run setup-db
```

### Opzione 2: Manuale (se lo script non funziona)
1. Vai su **Supabase Dashboard**
2. Apri **SQL Editor**
3. Copia e incolla il contenuto di `database-schema.sql`
4. Esegui le query

## 👑 Creazione Super Admin

### Opzione 1: Script automatico
```bash
npm run create-admin
```

### Opzione 2: Manuale
1. Vai su **Supabase Dashboard**
2. Apri **Table Editor**
3. Seleziona la tabella `users`
4. Inserisci manualmente:
   ```sql
   INSERT INTO users (
     email, 
     password_hash, 
     first_name, 
     last_name, 
     role, 
     is_active, 
     email_verified
   ) VALUES (
     'admin@glgcapital.com',
     '$2a$12$...', -- Hash della password "Admin123!@#"
     'Super',
     'Admin',
     'super_admin',
     true,
     true
   );
   ```

## 🔑 Credenziali di Default

- **Email:** `admin@glgcapital.com`
- **Password:** `Admin123!@#`
- **URL Login:** `http://localhost:3000/login`

## 🚀 Test del Sistema

1. **Avvia il server:**
   ```bash
   npm run dev
   ```

2. **Vai alla pagina di login:**
   ```
   http://localhost:3000/login
   ```

3. **Accedi con le credenziali del superadmin**

4. **Verifica il redirect automatico** alla dashboard admin

## 🔒 Sicurezza

- ✅ Password hashate con bcrypt (12 rounds)
- ✅ Protezione contro brute force (max 5 tentativi)
- ✅ Blocco account temporaneo (15 minuti)
- ✅ JWT con scadenza 24 ore
- ✅ Validazione input lato server
- ✅ Sanitizzazione dati

## 📧 Email Automatiche

Il sistema invierà automaticamente email per:
- ✅ Registrazione nuovi utenti
- ✅ Reset password
- ✅ Notifiche KYC
- ✅ Pagamenti
- ✅ Azioni admin

## 🛠️ Troubleshooting

### Errore "Module not found"
```bash
npm install
rm -rf .next
npm run dev
```

### Errore database
1. Verifica le variabili d'ambiente
2. Controlla la connessione Supabase
3. Esegui manualmente le query SQL

### Errore autenticazione
1. Verifica che la tabella `users` esista
2. Controlla che il superadmin sia stato creato
3. Verifica le policy RLS

## 📞 Supporto

Per problemi tecnici, controlla:
1. Console del browser (F12)
2. Log del server Next.js
3. Log di Supabase 