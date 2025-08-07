# 🏦 GLG Capital Financial

Piattaforma finanziaria completa per la gestione di investimenti, clienti e pacchetti di investimento.

## 🚀 **Caratteristiche Principali**

### **👥 Gestione Utenti**
- **Sistema di Autenticazione**: Login/registrazione con Supabase
- **Profili Utente**: Gestione completa profili con foto
- **Modalità Offline**: Funziona anche senza connessione database
- **Admin Panel**: Dashboard completa per amministratori

### **💰 Gestione Investimenti**
- **CRUD Completo**: Create, Read, Update, Delete per investimenti
- **Stati Investimento**: Pending, Approved, Rejected, Completed
- **Notifiche Real-time**: Sistema di notifiche per aggiornamenti
- **Dashboard Clienti**: Visualizzazione investimenti personali

### **👨‍💼 Gestione Clienti**
- **Database Reale**: Integrazione completa con Supabase
- **Sincronizzazione**: Sync automatico tra database e locale
- **CRUD Avanzato**: Gestione completa clienti con foto profilo
- **Codici Cliente**: Generazione automatica codici univoci

### **📦 Gestione Pacchetti**
- **Pacchetti Investimento**: Creazione e gestione pacchetti
- **Prezzi Dinamici**: Gestione prezzi e commissioni
- **Categorie**: Organizzazione per tipologie di investimento
- **Stati Pacchetti**: Active, Inactive, Draft

### **📊 Analytics e Grafici**
- **Dashboard Admin**: Metriche e performance overview
- **Grafici Recharts**: Visualizzazioni interattive
- **Report Analytics**: Analisi dettagliate e statistiche
- **Real-time Data**: Dati aggiornati in tempo reale

## 🛠️ **Tecnologie**

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Auth, Storage)
- **Charts**: Recharts
- **Deployment**: Vercel

## 🚀 **Installazione**

### **Prerequisiti**
```bash
Node.js 18+
npm o yarn
```

### **Setup Locale**
```bash
# Clone repository
git clone https://github.com/your-username/GLGCapitalFinancial.git
cd GLGCapitalFinancial

# Installa dipendenze
npm install

# Configura variabili ambiente
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase

# Avvia server di sviluppo
npm run dev
```

### **Configurazione Supabase**
1. Crea un progetto su [Supabase](https://supabase.com)
2. Copia le credenziali nel file `.env.local`
3. Esegui gli script di setup database

## 📋 **Script Utili**

### **Setup Database**
```bash
# Popola database con dati di test
node scripts/populate-database.js

# Verifica salute database
node scripts/db-health-check.js

# Setup admin user
node scripts/setup-admin-browser.js
```

### **Deploy**
```bash
# Deploy su Vercel
fai deploy

# Verifica alias dominio
npx vercel alias glgcapitalgroup.com
```

## 🔐 **Credenziali Test**

### **Admin**
- **Email**: admin@glg.com
- **Password**: Admin123!
- **URL**: http://localhost:3000/admin/login

### **Cliente**
- **Email**: prova@prova.com
- **Password**: password123
- **URL**: http://localhost:3000/login

## 🌐 **URLs**

### **Sviluppo Locale**
- **Home**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login
- **Profile**: http://localhost:3000/profile

### **Produzione**
- **Home**: https://glgcapitalgroup.com
- **Admin**: https://glgcapitalgroup.com/admin
- **Login**: https://glgcapitalgroup.com/login
- **Profile**: https://glgcapitalgroup.com/profile

## 📁 **Struttura Progetto**

```
GLGCapitalFinancial/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── dashboard/         # Client dashboard
│   └── auth/              # Authentication pages
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── ui/               # UI components
│   └── kyc/              # KYC components
├── lib/                  # Utilities and configs
├── scripts/              # Utility scripts
├── public/               # Static assets
└── types/                # TypeScript types
```

## 🔧 **Configurazione Avanzata**

### **Modalità Offline**
Il sistema supporta modalità offline completa:
- Autenticazione offline
- Dati locali sincronizzati
- Fallback automatico

### **Sicurezza**
- CSRF protection
- Admin authentication
- RLS policies Supabase
- Input validation

### **Performance**
- Image optimization
- Lazy loading
- Caching strategies
- Memory management

## 📈 **Monitoraggio**

### **Health Checks**
```bash
# Verifica salute sistema
node scripts/healthcheck.js

# Test connessione database
node scripts/db-health-check.js
```

### **Logs**
- Console logs per debug
- Error tracking
- Performance monitoring

## 🤝 **Contribuire**

1. Fork il progetto
2. Crea un branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 **Licenza**

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per dettagli.

## 📞 **Supporto**

Per supporto tecnico o domande:
- Email: support@glgcapitalgroup.com
- Documentazione: [Wiki del progetto](link-wiki)

---

**GLG Capital Financial** - Piattaforma finanziaria moderna e sicura 🏦✨
