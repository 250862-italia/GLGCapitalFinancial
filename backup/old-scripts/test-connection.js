import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Diagnostica Connessione Supabase');
console.log('='.repeat(50));

// Verifica variabili d'ambiente
console.log('\n📋 1. Verifica Variabili d\'Ambiente:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Presente' : '❌ Mancante');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Mancante');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅ Presente' : '❌ Mancante');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Variabili d\'ambiente mancanti!');
  console.log('📋 Crea il file .env.local con:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://dobjulfwktzltpvqtxbql.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30');
  process.exit(1);
}

// Test connessione base
console.log('\n📋 2. Test Connessione Base:');
try {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  
  console.log('   Status:', response.status);
  console.log('   Headers:', Object.fromEntries(response.headers.entries()));
  
  if (response.status === 200) {
    console.log('   ✅ Progetto Supabase accessibile');
  } else {
    console.log('   ❌ Progetto Supabase non accessibile');
  }
} catch (error) {
  console.log('   ❌ Errore connessione:', error.message);
}

// Test client Supabase
console.log('\n📋 3. Test Client Supabase:');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

try {
  const { data, error } = await supabase
    .from('clients')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log('   ❌ Errore database:', error.message);
    console.log('   Code:', error.code);
    console.log('   Details:', error.details);
  } else {
    console.log('   ✅ Connessione database riuscita');
    console.log('   Data:', data);
  }
} catch (error) {
  console.log('   ❌ Errore client:', error.message);
}

// Test service role
console.log('\n📋 4. Test Service Role:');
const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

try {
  const { data, error } = await supabaseService
    .from('clients')
    .select('count')
    .limit(1);
  
  if (error) {
    console.log('   ❌ Errore service role:', error.message);
  } else {
    console.log('   ✅ Service role funzionante');
  }
} catch (error) {
  console.log('   ❌ Errore service role:', error.message);
}

// Test real-time
console.log('\n📋 5. Test Real-time:');
try {
  const channel = supabase.channel('test-connection');
  
  channel
    .on('presence', { event: 'sync' }, () => {
      console.log('   ✅ Real-time presence funzionante');
    })
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      console.log('   ✅ Real-time changes funzionante');
    })
    .subscribe((status) => {
      console.log('   Real-time status:', status);
    });
    
  // Cleanup dopo 5 secondi
  setTimeout(() => {
    supabase.removeChannel(channel);
  }, 5000);
  
} catch (error) {
  console.log('   ❌ Errore real-time:', error.message);
}

console.log('\n📋 6. Riepilogo:');
console.log('   Se vedi errori sopra, il problema è:');
console.log('   - Variabili d\'ambiente mancanti (.env.local)');
console.log('   - Progetto Supabase sospeso');
console.log('   - Credenziali scadute');
console.log('   - Problemi di rete');

console.log('\n🔧 Soluzioni:');
console.log('   1. Verifica che il file .env.local esista');
console.log('   2. Controlla le credenziali Supabase');
console.log('   3. Verifica lo stato del progetto Supabase');
console.log('   4. Riavvia il server Next.js'); 