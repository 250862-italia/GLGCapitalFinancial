const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurazione Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variabili d\'ambiente Supabase mancanti');
  console.log('📋 Assicurati che il file .env.local contenga:');
  console.log('   SUPABASE_URL=your_supabase_url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Credenziali admin
const ADMIN_EMAIL = 'admin@glgcapital.com';
const ADMIN_PASSWORD = 'GLGAdmin2024!';

async function makeAdminOperational() {
  console.log('🚀 Rendiamo l\'Admin Dashboard Operativa!');
  console.log('='.repeat(60));

  try {
    // 1. Verifica connessione Supabase
    console.log('\n📋 1. Verifica Connessione Supabase');
    console.log('-'.repeat(40));
    
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('⚠️  Errore connessione Supabase:', healthError.message);
    } else {
      console.log('✅ Connessione Supabase OK');
    }

    // 2. Verifica esistenza admin
    console.log('\n📋 2. Verifica Admin Esistente');
    console.log('-'.repeat(40));
    
    const { data: adminUser, error: adminError } = await supabase.auth.admin.listUsers();
    if (adminError) {
      console.log('❌ Errore recupero utenti:', adminError.message);
    } else {
      const admin = adminUser.users.find(u => u.email === ADMIN_EMAIL);
      if (admin) {
        console.log('✅ Admin esistente trovato:', admin.email);
      } else {
        console.log('⚠️  Admin non trovato, procedo con la creazione...');
        await createAdminUser();
      }
    }

    // 3. Verifica tabelle database
    console.log('\n📋 3. Verifica Tabelle Database');
    console.log('-'.repeat(40));
    
    const requiredTables = [
      'packages', 'investments', 'payments', 'kyc_requests', 
      'informational_requests', 'team_members', 'partnerships', 
      'content', 'analytics'
    ];

    let missingTables = [];
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          missingTables.push(table);
          console.log(`❌ Tabella ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabella ${table}: OK`);
        }
      } catch (err) {
        missingTables.push(table);
        console.log(`❌ Tabella ${table}: ${err.message}`);
      }
    }

    // 4. Se mancano tabelle, esegui script SQL
    if (missingTables.length > 0) {
      console.log('\n📋 4. Creazione Tabelle Mancanti');
      console.log('-'.repeat(40));
      console.log('⚠️  Tabelle mancanti:', missingTables.join(', '));
      console.log('📋 Esegui manualmente lo script SQL in Supabase:');
      console.log('   1. Vai su https://supabase.com/dashboard');
      console.log('   2. Seleziona il tuo progetto');
      console.log('   3. Vai su SQL Editor');
      console.log('   4. Copia e incolla il contenuto di create-missing-tables-pure-sql.sql');
      console.log('   5. Clicca "Run"');
      
      // Mostra il contenuto dello script
      const sqlFile = path.join(__dirname, 'create-missing-tables-pure-sql.sql');
      if (fs.existsSync(sqlFile)) {
        console.log('\n📄 Contenuto dello script SQL:');
        console.log('-'.repeat(40));
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        console.log(sqlContent);
      }
    } else {
      console.log('✅ Tutte le tabelle sono presenti!');
    }

    // 5. Test login admin
    console.log('\n📋 5. Test Login Admin');
    console.log('-'.repeat(40));
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (authError) {
      console.log('❌ Login admin fallito:', authError.message);
      console.log('📋 Credenziali admin:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else {
      console.log('✅ Login admin riuscito:', authData.user.email);
    }

    // 6. Test CRUD operations
    console.log('\n📋 6. Test CRUD Operations');
    console.log('-'.repeat(40));
    
    await testCRUDOperations();

    // 7. Verifica frontend
    console.log('\n📋 7. Verifica Frontend');
    console.log('-'.repeat(40));
    
    console.log('🌐 Frontend disponibile su:');
    console.log('   http://localhost:3000 (o 3001 se 3000 è occupato)');
    console.log('   Admin Dashboard: http://localhost:3000/admin');
    console.log('   Admin Login: http://localhost:3000/admin/login');

    // 8. Istruzioni finali
    console.log('\n📋 8. Istruzioni per Rendere Operativo');
    console.log('-'.repeat(40));
    
    console.log('🎯 PASSI DA SEGUIRE:');
    console.log('1. Esegui lo script SQL in Supabase SQL Editor');
    console.log('2. Aspetta che lo script completi');
    console.log('3. Vai su http://localhost:3000/admin/login');
    console.log('4. Login con:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('5. Testa tutte le sezioni CRUD:');
    console.log('   - Users Management');
    console.log('   - Team Management');
    console.log('   - Packages Management');
    console.log('   - Partnerships');
    console.log('   - Content Management');
    console.log('   - Clients Management');
    console.log('   - Analytics');

    console.log('\n🎉 Admin Dashboard sarà completamente operativa!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

async function createAdminUser() {
  console.log('🔧 Creazione admin user...');
  
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { 
        role: 'superadmin',
        first_name: 'Admin',
        last_name: 'GLG'
      }
    });

    if (authError) {
      console.log('❌ Errore creazione admin:', authError.message);
      return;
    }

    console.log('✅ Admin creato con successo:', authData.user.email);
    
    // Crea profilo admin
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: ADMIN_EMAIL,
        full_name: 'Admin GLG',
        role: 'superadmin',
        status: 'active',
        email_verified: true
      });

    if (profileError) {
      console.log('⚠️  Errore creazione profilo admin:', profileError.message);
    } else {
      console.log('✅ Profilo admin creato');
    }

  } catch (error) {
    console.log('❌ Errore creazione admin:', error.message);
  }
}

async function testCRUDOperations() {
  try {
    // Test CREATE package
    const newPackage = {
      name: 'Test Package Operational',
      description: 'Package di test per verifica operatività',
      min_investment: 10000,
      max_investment: 100000,
      expected_return: 8.5,
      duration_months: 12,
      risk_level: 'medium',
      status: 'active'
    };

    const { data: createdPackage, error: createError } = await supabase
      .from('packages')
      .insert(newPackage)
      .select()
      .single();

    if (createError) {
      console.log('❌ CREATE package:', createError.message);
    } else {
      console.log('✅ CREATE package:', createdPackage.id);
      
      // Test READ
      const { data: readPackage, error: readError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', createdPackage.id)
        .single();

      if (readError) {
        console.log('❌ READ package:', readError.message);
      } else {
        console.log('✅ READ package:', readPackage.name);
      }

      // Test UPDATE
      const { data: updatedPackage, error: updateError } = await supabase
        .from('packages')
        .update({ name: 'Test Package Updated' })
        .eq('id', createdPackage.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ UPDATE package:', updateError.message);
      } else {
        console.log('✅ UPDATE package:', updatedPackage.name);
      }

      // Test DELETE
      const { error: deleteError } = await supabase
        .from('packages')
        .delete()
        .eq('id', createdPackage.id);

      if (deleteError) {
        console.log('❌ DELETE package:', deleteError.message);
      } else {
        console.log('✅ DELETE package: OK');
      }
    }

  } catch (error) {
    console.log('❌ Errore test CRUD:', error.message);
  }
}

// Esegui il script
makeAdminOperational().catch(console.error); 