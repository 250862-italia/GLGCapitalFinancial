#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Aggiornamento Variabili d\'Ambiente per Nuovo Progetto Supabase');
console.log('================================================================\n');

const envPath = path.join(process.cwd(), '.env.local');
const envBackupPath = path.join(process.cwd(), '.env.local.backup.' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));

// Leggi il file .env.local attuale
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ File .env.local letto correttamente');
} catch (error) {
  console.log('❌ Errore nella lettura del file .env.local:', error.message);
  process.exit(1);
}

// Crea backup
try {
  fs.writeFileSync(envBackupPath, envContent);
  console.log('✅ Backup creato:', envBackupPath);
} catch (error) {
  console.log('⚠️  Errore nella creazione del backup:', error.message);
}

// Aggiorna le variabili Supabase
const newEnvContent = envContent
  .replace(/NEXT_PUBLIC_SUPABASE_URL=.*/, 'NEXT_PUBLIC_SUPABASE_URL=https://rnshmasnrzoejxemlkbv.supabase.co')
  .replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, 'NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_ANON_KEY')
  .replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, 'SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_YOUR_SERVICE_ROLE_KEY');

// Scrivi il nuovo contenuto
try {
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ File .env.local aggiornato');
} catch (error) {
  console.log('❌ Errore nella scrittura del file .env.local:', error.message);
  process.exit(1);
}

console.log('\n📋 PROSSIMI PASSI:');
console.log('1. Vai su https://supabase.com/dashboard/project/rnshmasnrzoejxemlkbv');
console.log('2. Naviga su Settings > API');
console.log('3. Copia anon/public key e service_role key');
console.log('4. Sostituisci REPLACE_WITH_YOUR_ANON_KEY e REPLACE_WITH_YOUR_SERVICE_ROLE_KEY nel file .env.local');
console.log('5. Esegui: npm run setup:database');
console.log('6. Testa la connessione: npm run test:supabase');
console.log('\n🎉 Setup completato!'); 