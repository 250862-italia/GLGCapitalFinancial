# GLG Capital Group Mobile App

App mobile React Native per GLG Capital Group LLC - Piattaforma di investimenti.

## 🚀 Funzionalità

### Autenticazione
- Login/Registrazione utenti
- Gestione sessioni con Supabase
- Reset password

### Dashboard
- Panoramica investimenti
- Statistiche portfolio
- Pacchetti disponibili
- Stato KYC

### Investimenti
- Lista investimenti attivi
- Dettagli investimenti
- Statistiche performance
- Storico transazioni

### Profilo Utente
- Informazioni personali
- Profilo investimenti
- Impostazioni account
- Gestione sicurezza

### KYC (Know Your Customer)
- Processo di verifica identità
- Upload documenti
- Stato verifica
- Informazioni finanziarie

## 🛠️ Tecnologie Utilizzate

- **React Native** - Framework mobile
- **Expo** - Piattaforma di sviluppo
- **TypeScript** - Linguaggio di programmazione
- **Supabase** - Backend e autenticazione
- **React Navigation** - Navigazione
- **Expo Vector Icons** - Icone

## 📱 Requisiti di Sistema

- Node.js 18+
- npm o yarn
- Expo CLI
- iOS Simulator (per iOS) o Android Studio (per Android)

## 🔧 Installazione

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd GLGMobileApp
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura Supabase**
   - Assicurati che il database Supabase sia configurato correttamente
   - Le credenziali sono già configurate nel file `src/services/supabase.ts`

4. **Avvia l'app**
   ```bash
   # Per iOS
   npm run ios
   
   # Per Android
   npm run android
   
   # Per web (solo sviluppo)
   npm run web
   ```

## 📁 Struttura del Progetto

```
src/
├── components/          # Componenti riutilizzabili
├── hooks/              # Custom hooks (useAuth)
├── navigation/         # Configurazione navigazione
├── screens/           # Schermate dell'app
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── InvestmentsScreen.tsx
│   ├── ProfileScreen.tsx
│   └── KYCScreen.tsx
├── services/          # Servizi API
│   ├── auth.ts        # Autenticazione
│   ├── investments.ts # Gestione investimenti
│   ├── kyc.ts         # Processo KYC
│   └── supabase.ts    # Configurazione Supabase
└── types/             # Definizioni TypeScript
    └── index.ts
```

## 🔐 Configurazione Autenticazione

L'app utilizza Supabase per l'autenticazione. Le credenziali sono configurate in `src/services/supabase.ts`:

```typescript
const SUPABASE_CONFIG = {
  url: 'https://dobjulfwktzltpvqtxbql.supabase.co',
  anonKey: 'your-anon-key'
};
```

## 📊 Database Schema

L'app si connette alle seguenti tabelle Supabase:

- `clients` - Informazioni clienti
- `investments` - Investimenti utenti
- `packages` - Pacchetti di investimento
- `kyc_applications` - Applicazioni KYC
- `users` - Utenti autenticati

## 🎨 Design System

L'app utilizza un design system coerente con:

- **Colori principali**: Blu (#3b82f6), Verde (#059669), Giallo (#f59e0b)
- **Font**: System fonts (iOS/Android)
- **Icone**: Expo Vector Icons (Ionicons)
- **Stile**: Cards con ombre, bordi arrotondati, spaziature consistenti

## 📱 Navigazione

L'app utilizza React Navigation con:

- **Stack Navigator** per autenticazione e dettagli
- **Tab Navigator** per le schermate principali
- **Bottom Tabs** per Dashboard, Investimenti, Profilo, KYC

## 🔄 Stato dell'App

L'app gestisce lo stato attraverso:

- **Context API** per autenticazione globale
- **Local State** per dati specifici delle schermate
- **Supabase** per persistenza dati

## 🚀 Deployment

### Expo Build

1. **Configura Expo**
   ```bash
   expo login
   ```

2. **Build per produzione**
   ```bash
   expo build:ios
   expo build:android
   ```

### App Store / Google Play

1. **Genera build nativo**
   ```bash
   expo eject
   ```

2. **Segui le guide ufficiali per il deployment**

## 🐛 Debugging

### Logs
```bash
# Visualizza logs in tempo reale
expo logs

# Logs specifici per piattaforma
npx react-native log-ios
npx react-native log-android
```

### Debug Tools
- React Native Debugger
- Flipper (Facebook)
- Chrome DevTools

## 📈 Performance

### Ottimizzazioni Implementate
- Lazy loading delle schermate
- Memoizzazione componenti
- Gestione efficiente dello stato
- Ottimizzazione immagini

### Monitoraggio
- Expo Analytics (opzionale)
- Crash reporting
- Performance metrics

## 🔒 Sicurezza

### Implementazioni
- Autenticazione Supabase
- Validazione input
- Gestione sicura delle credenziali
- HTTPS per tutte le API calls

### Best Practices
- Non salvare password in chiaro
- Validazione lato client e server
- Gestione sessioni sicura
- Rate limiting

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è proprietario di GLG Capital Group LLC.

## 📞 Supporto

Per supporto tecnico:
- Email: support@glgcapitalgroup.com
- Documentazione: [Link alla documentazione]
- Issues: [Repository GitHub]

## 🔄 Versioni

- **v1.0.0** - Versione iniziale con funzionalità base
- **v1.1.0** - Aggiunta funzionalità KYC
- **v1.2.0** - Miglioramenti UI/UX
- **v1.3.0** - Ottimizzazioni performance

---

**GLG Capital Group LLC** - Piattaforma di investimenti innovativa 