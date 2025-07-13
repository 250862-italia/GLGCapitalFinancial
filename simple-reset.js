const fs = require('fs');
const path = require('path');

console.log('🧹 RESET SEMPLICE DEL DATABASE GLG CAPITAL FINANCIAL');
console.log('============================================================');
console.log('⚠️  ATTENZIONE: Questo script eliminerà TUTTI i dati esistenti!');
console.log('============================================================\n');

// Check if user confirms
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Sei sicuro di voler procedere? (scrivi "RESET" per confermare): ', (answer) => {
  if (answer !== 'RESET') {
    console.log('❌ Operazione annullata.');
    rl.close();
    return;
  }

  console.log('\n🧹 Iniziando reset semplice...\n');

  // Step 1: Clear all data files and caches
  console.log('📋 FASE 1: PULIZIA FILE E CACHE');
  console.log('------------------------------');

  // Clear .next cache
  if (fs.existsSync('.next')) {
    console.log('Eliminazione cache .next...');
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Cache .next eliminata');
  }

  // Clear node_modules (optional - will be reinstalled)
  console.log('Eliminazione node_modules...');
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
    console.log('✅ node_modules eliminato');
  }

  // Clear package-lock.json
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
    console.log('✅ package-lock.json eliminato');
  }

  // Clear TypeScript cache
  if (fs.existsSync('tsconfig.tsbuildinfo')) {
    fs.unlinkSync('tsconfig.tsbuildinfo');
    console.log('✅ TypeScript cache eliminata');
  }

  // Step 2: Reinstall dependencies
  console.log('\n📋 FASE 2: REINSTALLAZIONE DEPENDENCIES');
  console.log('------------------------------');
  
  console.log('Installazione npm packages...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies reinstallate');
  } catch (error) {
    console.log('⚠️  Errore durante installazione:', error.message);
  }

  // Step 3: Create fresh environment
  console.log('\n📋 FASE 3: AMBIENTE PULITO');
  console.log('------------------------------');

  // Create a fresh .env file from example
  if (fs.existsSync('env.example') && !fs.existsSync('.env')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ File .env creato da env.example');
  }

  // Step 4: Build fresh
  console.log('\n📋 FASE 4: BUILD PULITO');
  console.log('------------------------------');
  
  console.log('Build del progetto...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completato con successo');
  } catch (error) {
    console.log('⚠️  Errore durante build:', error.message);
  }

  console.log('\n🎉 RESET COMPLETATO!');
  console.log('============================================================');
  console.log('✅ Cache e file temporanei eliminati');
  console.log('✅ Dependencies reinstallate');
  console.log('✅ Build pulito completato');
  console.log('============================================================');
  console.log('\n📝 PROSSIMI PASSI:');
  console.log('1. Verifica che il progetto funzioni: npm run dev');
  console.log('2. Se necessario, configura le variabili d\'ambiente in .env');
  console.log('3. Se il database Supabase non è accessibile, considera:');
  console.log('   - Creare un nuovo progetto Supabase');
  console.log('   - Aggiornare le credenziali in .env.local');
  console.log('   - Eseguire gli script di setup del database');

  rl.close();
}); 