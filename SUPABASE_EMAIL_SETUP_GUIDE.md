# 📧 Guida Completa Setup Email Supabase - GLG Capital Group

## 🎯 Panoramica

Questa guida ti spiega come configurare il sistema email integrato di Supabase per sostituire il sistema SMTP esterno attualmente in uso.

## ✅ Vantaggi del Sistema Email Supabase

### **1. Gestione Automatica**
- ✅ Email di conferma automatiche
- ✅ Magic link per login
- ✅ Reset password automatico
- ✅ Template email predefiniti
- ✅ Gestione bounce e spam

### **2. Affidabilità**
- ✅ Deliverability superiore al 99%
- ✅ Rate limiting automatico
- ✅ Retry automatico su errori
- ✅ Monitoraggio integrato

### **3. Semplicità**
- ✅ Zero configurazione SMTP
- ✅ Nessun server da gestire
- ✅ API semplici da usare
- ✅ Dashboard integrato

## 🚀 Step 1: Configurazione Supabase Dashboard

### **1.1 Accedi a Supabase Dashboard**
1. Vai su: https://supabase.com/dashboard
2. Seleziona il progetto GLG Capital Group
3. Vai su **"Authentication"** → **"Settings"**

### **1.2 Configura Email Settings**
```
Site URL: https://www.glgcapitalgroup.com
Redirect URLs: 
- https://www.glgcapitalgroup.com/auth/confirm
- https://www.glgcapitalgroup.com/dashboard
- https://www.glgcapitalgroup.com/reset-password
```

### **1.3 Configura Email Templates**
Vai su **"Authentication"** → **"Email Templates"**

#### **Confirm Signup Template**
```html
<h2>Welcome to GLG Capital Group!</h2>
<p>Thank you for choosing GLG Capital Group for your investment needs.</p>
<p>Please confirm your email address by clicking the button below:</p>
<a href="{{ .ConfirmationURL }}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
  Confirm Your Email Address
</a>
<p>If you didn't create this account, you can safely ignore this email.</p>
<p>Best regards,<br>GLG Capital Group Team</p>
```

#### **Magic Link Template**
```html
<h2>Login to GLG Capital Group</h2>
<p>Click the button below to log in to your account:</p>
<a href="{{ .ConfirmationURL }}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
  Log In to Your Account
</a>
<p>This link will expire in 1 hour.</p>
<p>Best regards,<br>GLG Capital Group Team</p>
```

#### **Reset Password Template**
```html
<h2>Reset Your Password</h2>
<p>You requested to reset your password for your GLG Capital Group account.</p>
<p>Click the button below to set a new password:</p>
<a href="{{ .ConfirmationURL }}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px;">
  Reset Password
</a>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Best regards,<br>GLG Capital Group Team</p>
```

## 🔧 Step 2: Configurazione Codice

### **2.1 Aggiorna Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dobjulfwktzltpvqtxbql.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration (ora gestita da Supabase)
NEXT_PUBLIC_APP_URL=https://www.glgcapitalgroup.com

# Rimuovi le vecchie variabili SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### **2.2 Aggiorna Vercel Environment**
1. Vai su Vercel Dashboard
2. Seleziona il progetto GLG Capital Group
3. Vai su **"Settings"** → **"Environment Variables"**
4. Aggiorna le variabili come sopra
5. Rimuovi le variabili SMTP obsolete

## 📧 Step 3: Test del Sistema

### **3.1 Test Registrazione**
```bash
# Testa la registrazione di un nuovo utente
curl -X POST https://www.glgcapitalgroup.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "country": "Italy"
  }'
```

### **3.2 Test Reset Password**
```bash
# Testa il reset password
curl -X POST https://www.glgcapitalgroup.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### **3.3 Verifica Email**
1. Controlla la casella email di test
2. Verifica che le email arrivino correttamente
3. Testa i link di conferma e reset

## 🔄 Step 4: Migrazione Dati

### **4.1 Backup Email Queue**
```sql
-- Backup della coda email esistente
CREATE TABLE email_queue_backup AS 
SELECT * FROM email_queue 
WHERE created_at < NOW() - INTERVAL '1 day';
```

### **4.2 Aggiorna Utenti Esistenti**
```sql
-- Aggiorna utenti esistenti per usare Supabase Auth
UPDATE users 
SET email_confirmed = true 
WHERE email_confirmed = false 
AND created_at < NOW() - INTERVAL '1 day';
```

## 📊 Step 5: Monitoraggio

### **5.1 Dashboard Supabase**
1. Vai su **"Authentication"** → **"Users"**
2. Monitora le registrazioni e conferme
3. Controlla i log di autenticazione

### **5.2 Log Email**
```sql
-- Query per monitorare le email inviate
SELECT 
  to_email,
  subject,
  status,
  created_at,
  sent_at
FROM email_queue 
ORDER BY created_at DESC 
LIMIT 50;
```

### **5.3 Metriche Performance**
- **Email Delivery Rate**: >99%
- **Confirmation Rate**: >80%
- **Bounce Rate**: <1%
- **Spam Complaints**: <0.1%

## 🛠️ Step 6: Ottimizzazioni

### **6.1 Rate Limiting**
```typescript
// Implementa rate limiting per le API email
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5 // max 5 richieste per finestra
};
```

### **6.2 Retry Logic**
```typescript
// Implementa retry automatico per email fallite
async function retryFailedEmails() {
  const { data: failedEmails } = await supabaseAdmin
    .from('email_queue')
    .select('*')
    .eq('status', 'error')
    .lt('retry_count', 3);
  
  for (const email of failedEmails) {
    await supabaseEmailService.sendEmail({
      to: email.to_email,
      subject: email.subject,
      template: 'custom',
      html: email.html_content
    });
  }
}
```

### **6.3 Template Dinamici**
```typescript
// Crea template email dinamici
const emailTemplates = {
  welcome: (data: any) => ({
    subject: `Welcome ${data.firstName}!`,
    html: generateWelcomeEmail(data)
  }),
  investment: (data: any) => ({
    subject: `Investment Update - ${data.packageName}`,
    html: generateInvestmentEmail(data)
  })
};
```

## 🔒 Step 7: Sicurezza

### **7.1 Validazione Input**
```typescript
// Valida sempre gli input email
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}
```

### **7.2 Rate Limiting**
```typescript
// Implementa rate limiting per prevenire spam
const emailRateLimit = new Map();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxEmails = 3; // max 3 email per minuto
  
  if (!emailRateLimit.has(email)) {
    emailRateLimit.set(email, []);
  }
  
  const emails = emailRateLimit.get(email);
  const recentEmails = emails.filter(time => now - time < windowMs);
  
  if (recentEmails.length >= maxEmails) {
    return false;
  }
  
  recentEmails.push(now);
  emailRateLimit.set(email, recentEmails);
  return true;
}
```

### **7.3 Logging Sicurezza**
```typescript
// Logga tutte le attività email per sicurezza
async function logEmailActivity(email: string, action: string, success: boolean) {
  await supabaseAdmin
    .from('email_logs')
    .insert({
      email,
      action,
      success,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'],
      created_at: new Date().toISOString()
    });
}
```

## 📈 Step 8: Testing Completo

### **8.1 Test End-to-End**
```bash
# Script di test completo
node test-supabase-email-system.js
```

### **8.2 Test Scenari**
1. ✅ Registrazione nuovo utente
2. ✅ Conferma email
3. ✅ Login con magic link
4. ✅ Reset password
5. ✅ Email personalizzate
6. ✅ Gestione errori
7. ✅ Rate limiting
8. ✅ Sicurezza

### **8.3 Test Performance**
```bash
# Test di carico
ab -n 100 -c 10 -p test-data.json -T application/json \
  https://www.glgcapitalgroup.com/api/auth/register
```

## 🚀 Step 9: Deploy

### **9.1 Deploy su Vercel**
```bash
# Deploy con le nuove configurazioni
npx vercel --prod
```

### **9.2 Verifica Post-Deploy**
1. ✅ Testa registrazione su produzione
2. ✅ Verifica email di conferma
3. ✅ Testa reset password
4. ✅ Controlla log Supabase
5. ✅ Monitora metriche

## 📞 Supporto

### **Problemi Comuni**

#### **Email non arrivano**
1. Controlla configurazione Supabase Dashboard
2. Verifica template email
3. Controlla log Supabase
4. Verifica rate limiting

#### **Link non funzionano**
1. Controlla redirect URLs
2. Verifica Site URL
3. Controlla template email
4. Testa link manualmente

#### **Errori di autenticazione**
1. Verifica service role key
2. Controlla permessi RLS
3. Verifica configurazione Auth
4. Controlla log errori

### **Contatti**
- **Supabase Support**: https://supabase.com/support
- **Documentazione**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase

---

## 🎉 Risultato Finale

Dopo aver completato questa guida, avrai:

✅ **Sistema email completamente integrato con Supabase**
✅ **Email di conferma automatiche**
✅ **Magic link per login**
✅ **Reset password automatico**
✅ **Template email personalizzati**
✅ **Monitoraggio e logging**
✅ **Sicurezza avanzata**
✅ **Performance ottimizzate**

Il sistema email sarà ora molto più affidabile, sicuro e facile da gestire rispetto al sistema SMTP esterno precedente. 