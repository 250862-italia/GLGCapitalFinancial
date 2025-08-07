const fs = require('fs');
const path = require('path');

console.log('🔧 Configurazione Variabili d\'Ambiente');
console.log('');

const envPath = path.join(__dirname, '..', '.env.local');

// Contenuto del file .env.local
const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zaeakwbpiqzhywhlqqse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWFrd2JwaXF6aHl3aGxxcXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1OTcyOTAsImV4cCI6MjA1MDE3MzI5MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWFrd2JwaXF6aHl3aGxxcXNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI5MCwiZXhwIjoyMDUwMTczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
`;

try {
  // Verifica se il file esiste già
  if (fs.existsSync(envPath)) {
    console.log('⚠️  File .env.local già esistente');
    console.log('📁 Percorso:', envPath);
    console.log('');
    console.log('💡 Per aggiornare le variabili:');
    console.log('   1. Elimina il file .env.local esistente');
    console.log('   2. Riesegui questo script');
    console.log('');
  } else {
    // Crea il file .env.local
    fs.writeFileSync(envPath, envContent);
    console.log('✅ File .env.local creato con successo!');
    console.log('📁 Percorso:', envPath);
    console.log('');
  }
  
  console.log('📋 Variabili configurate:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - NEXTAUTH_URL');
  console.log('   - NEXTAUTH_SECRET');
  console.log('');
  console.log('🚀 Prossimi passi:');
  console.log('   1. Riavvia il server: npm run dev');
  console.log('   2. Testa la connessione: node scripts/test-database.js');
  console.log('   3. Accedi come admin: http://localhost:3000/admin');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Le chiavi API potrebbero non essere valide');
  console.log('   - Controlla il tuo progetto Supabase per le chiavi corrette');
  console.log('   - Il sistema funzionerà comunque con i dati mock');
  
} catch (error) {
  console.error('❌ Errore durante la creazione del file:', error.message);
} 