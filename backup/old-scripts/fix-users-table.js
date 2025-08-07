const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leggi le variabili d'ambiente dal file .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return envVars;
  }
  return {};
}

const envVars = loadEnvFile();
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'OK' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixUsersTable() {
  console.log('🔧 Verifica e correzione tabella users...\n');

  try {
    // 1. Verifica se la tabella users esiste
    console.log('1. Verifica esistenza tabella users...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Tabella users non esiste, creazione...');
      
      // Crea la tabella users direttamente
      const { error: createError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (createError && createError.message.includes('does not exist')) {
        console.log('Creazione tabella users tramite SQL...');
        // Prova a creare la tabella con una query SQL diretta
        const { error: sqlError } = await supabase
          .rpc('exec_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
                is_active BOOLEAN DEFAULT true,
                email_confirmed BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `
          });

        if (sqlError) {
          console.error('❌ Errore creazione tabella users:', sqlError);
          console.log('Prova a creare la tabella manualmente nel Supabase SQL Editor');
          return;
        }
      }
      console.log('✅ Tabella users creata/verificata');
    } else {
      console.log('✅ Tabella users esiste');
    }

    // 2. Prova a inserire un utente di test per verificare la struttura
    console.log('\n2. Test inserimento utente...');
    const testUserId = `test_${Date.now()}`;
    const { data: testUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        password_hash: 'test_hash',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        is_active: true,
        email_confirmed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Errore inserimento test:', insertError);
      console.log('La tabella users potrebbe non avere la struttura corretta');
      console.log('Crea manualmente la tabella nel Supabase SQL Editor con questa struttura:');
      console.log(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
          is_active BOOLEAN DEFAULT true,
          email_confirmed BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      return;
    }

    console.log('✅ Inserimento test riuscito');
    console.log('Utente test creato:', testUser);

    // 3. Elimina l'utente di test
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);

    if (deleteError) {
      console.log('⚠️  Errore eliminazione utente test:', deleteError);
    } else {
      console.log('✅ Utente test eliminato');
    }

    console.log('\n🎉 Tabella users verificata e funzionante!');
    console.log('Il nuovo sistema di autenticazione può ora essere utilizzato.');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

fixUsersTable(); 