const fs = require('fs');
const path = require('path');

console.log('🎨 Verifica e Miglioramento CSS');
console.log('');

// Controlla i file CSS principali
const cssFiles = [
  'app/globals.css',
  'tailwind.config.js',
  'components.json'
];

console.log('📁 File CSS trovati:');
cssFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} (non trovato)`);
  }
});

console.log('');

// Verifica Tailwind config
const tailwindConfigPath = path.join(__dirname, '..', 'tailwind.config.js');
if (fs.existsSync(tailwindConfigPath)) {
  console.log('🔧 Configurazione Tailwind:');
  try {
    const config = require(tailwindConfigPath);
    console.log('✅ Tailwind config caricato');
    console.log(`   - Content paths: ${config.content?.length || 0} patterns`);
    console.log(`   - Theme colors: ${Object.keys(config.theme?.colors || {}).length} colors`);
  } catch (error) {
    console.log('❌ Errore nel caricamento della config Tailwind:', error.message);
  }
}

console.log('');

// Suggerimenti per migliorare il CSS
console.log('💡 Suggerimenti per migliorare il CSS:');
console.log('');
console.log('1. 🎯 Verifica che Tailwind sia correttamente importato:');
console.log('   - Controlla che @tailwind sia in globals.css');
console.log('   - Verifica che il layout admin importi globals.css');
console.log('');
console.log('2. 🎨 Aggiungi classi CSS personalizzate se necessario:');
console.log('   - Componenti specifici per admin');
console.log('   - Stili per tabelle e modali');
console.log('   - Responsive design per mobile');
console.log('');
console.log('3. 🔧 Verifica la configurazione Tailwind:');
console.log('   - Contenuto: app/**/*.{js,ts,jsx,tsx}');
console.log('   - Tema: colori, font, spacing personalizzati');
console.log('');
console.log('4. 📱 Testa la responsività:');
console.log('   - Desktop: 1024px+');
console.log('   - Tablet: 768px-1023px');
console.log('   - Mobile: <768px');
console.log('');

// Verifica se ci sono problemi comuni
const globalsCssPath = path.join(__dirname, '..', 'app', 'globals.css');
if (fs.existsSync(globalsCssPath)) {
  const cssContent = fs.readFileSync(globalsCssPath, 'utf8');
  
  console.log('🔍 Analisi globals.css:');
  
  if (cssContent.includes('@tailwind base')) {
    console.log('✅ @tailwind base trovato');
  } else {
    console.log('❌ @tailwind base mancante');
  }
  
  if (cssContent.includes('@tailwind components')) {
    console.log('✅ @tailwind components trovato');
  } else {
    console.log('❌ @tailwind components mancante');
  }
  
  if (cssContent.includes('@tailwind utilities')) {
    console.log('✅ @tailwind utilities trovato');
  } else {
    console.log('❌ @tailwind utilities mancante');
  }
  
  // Conta le classi personalizzate
  const customClasses = cssContent.match(/\.\w+\s*{/g)?.length || 0;
  console.log(`📊 Classi CSS personalizzate: ${customClasses}`);
}

console.log('');
console.log('🚀 Per testare il CSS:');
console.log('   1. Avvia il server: npm run dev');
console.log('   2. Vai su: http://localhost:3000/admin');
console.log('   3. Controlla che tutti gli stili siano applicati');
console.log('   4. Testa su diversi dispositivi');
console.log('');
console.log('💡 Se ci sono problemi:');
console.log('   - Verifica che il layout importi globals.css');
console.log('   - Controlla la console del browser per errori CSS');
console.log('   - Usa gli strumenti di sviluppo per debuggare'); 