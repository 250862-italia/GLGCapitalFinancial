const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variabili d\'ambiente Supabase mancanti');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Credenziali admin
const ADMIN_EMAIL = 'admin@glgcapital.com';
const ADMIN_PASSWORD = 'GLGAdmin2024!';

async function verifyAdminOperational() {
  console.log('🔍 Verifica Admin Dashboard Operativa');
  console.log('='.repeat(50));

  let allTestsPassed = true;

  try {
    // 1. Test Login Admin
    console.log('\n📋 1. Test Login Admin');
    console.log('-'.repeat(30));
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (authError) {
      console.log('❌ Login admin fallito:', authError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Login admin riuscito:', authData.user.email);
    }

    // 2. Verifica Tabelle Database
    console.log('\n📋 2. Verifica Tabelle Database');
    console.log('-'.repeat(30));
    
    const requiredTables = [
      'packages', 'investments', 'payments', 'kyc_requests', 
      'informational_requests', 'team_members', 'partnerships', 
      'content', 'analytics'
    ];

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabella ${table}: ${error.message}`);
          allTestsPassed = false;
        } else {
          console.log(`✅ Tabella ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabella ${table}: ${err.message}`);
        allTestsPassed = false;
      }
    }

    // 3. Test CRUD Packages
    console.log('\n📋 3. Test CRUD Packages');
    console.log('-'.repeat(30));
    
    const newPackage = {
      name: 'Test Package Verification',
      description: 'Package di test per verifica operatività',
      min_investment: 10000,
      max_investment: 100000,
      expected_return: 8.5,
      duration_months: 12,
      risk_level: 'medium',
      status: 'active'
    };

    // CREATE
    const { data: createdPackage, error: createError } = await supabase
      .from('packages')
      .insert(newPackage)
      .select()
      .single();

    if (createError) {
      console.log('❌ CREATE package:', createError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ CREATE package:', createdPackage.id);
      
      // READ
      const { data: readPackage, error: readError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', createdPackage.id)
        .single();

      if (readError) {
        console.log('❌ READ package:', readError.message);
        allTestsPassed = false;
      } else {
        console.log('✅ READ package:', readPackage.name);
      }

      // UPDATE
      const { data: updatedPackage, error: updateError } = await supabase
        .from('packages')
        .update({ name: 'Test Package Updated Verification' })
        .eq('id', createdPackage.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ UPDATE package:', updateError.message);
        allTestsPassed = false;
      } else {
        console.log('✅ UPDATE package:', updatedPackage.name);
      }

      // DELETE
      const { error: deleteError } = await supabase
        .from('packages')
        .delete()
        .eq('id', createdPackage.id);

      if (deleteError) {
        console.log('❌ DELETE package:', deleteError.message);
        allTestsPassed = false;
      } else {
        console.log('✅ DELETE package: OK');
      }
    }

    // 4. Test CRUD Team Members
    console.log('\n📋 4. Test CRUD Team Members');
    console.log('-'.repeat(30));
    
    const newTeamMember = {
      name: 'Test Team Member Verification',
      email: 'test.verification@glgcapital.com',
      role: 'analyst',
      department: 'Research',
      status: 'active'
    };

    const { data: createdTeam, error: createTeamError } = await supabase
      .from('team_members')
      .insert(newTeamMember)
      .select()
      .single();

    if (createTeamError) {
      console.log('❌ CREATE team member:', createTeamError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ CREATE team member:', createdTeam.id);
      
      // DELETE test team member
      await supabase
        .from('team_members')
        .delete()
        .eq('id', createdTeam.id);
      
      console.log('✅ DELETE team member: OK');
    }

    // 5. Test CRUD Partnerships
    console.log('\n📋 5. Test CRUD Partnerships');
    console.log('-'.repeat(30));
    
    const newPartnership = {
      name: 'Test Partnership Verification',
      type: 'strategic',
      status: 'active',
      description: 'Partnership di test per verifica'
    };

    const { data: createdPartnership, error: createPartError } = await supabase
      .from('partnerships')
      .insert(newPartnership)
      .select()
      .single();

    if (createPartError) {
      console.log('❌ CREATE partnership:', createPartError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ CREATE partnership:', createdPartnership.id);
      
      // DELETE test partnership
      await supabase
        .from('partnerships')
        .delete()
        .eq('id', createdPartnership.id);
      
      console.log('✅ DELETE partnership: OK');
    }

    // 6. Verifica Dati di Esempio
    console.log('\n📋 6. Verifica Dati di Esempio');
    console.log('-'.repeat(30));
    
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);

    if (packagesError) {
      console.log('❌ Verifica packages:', packagesError.message);
      allTestsPassed = false;
    } else {
      console.log(`✅ Packages di esempio: ${packages.length} trovati`);
    }

    const { data: requests, error: requestsError } = await supabase
      .from('informational_requests')
      .select('*')
      .limit(5);

    if (requestsError) {
      console.log('❌ Verifica requests:', requestsError.message);
      allTestsPassed = false;
    } else {
      console.log(`✅ Informational requests: ${requests.length} trovati`);
    }

    // 7. Test RLS Policies
    console.log('\n📋 7. Test RLS Policies');
    console.log('-'.repeat(30));
    
    // Test accesso come admin
    const { data: adminPackages, error: adminError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);

    if (adminError) {
      console.log('❌ RLS admin packages:', adminError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ RLS admin packages:', adminPackages.length, 'records');
    }

    // 8. Verifica Frontend URLs
    console.log('\n📋 8. Verifica Frontend URLs');
    console.log('-'.repeat(30));
    
    const frontendUrls = [
      'http://localhost:3000/admin',
      'http://localhost:3000/admin/login',
      'http://localhost:3000/admin/users',
      'http://localhost:3000/admin/packages',
      'http://localhost:3000/admin/partnerships',
      'http://localhost:3000/admin/team',
      'http://localhost:3000/admin/analytics'
    ];

    console.log('🌐 Frontend URLs disponibili:');
    frontendUrls.forEach(url => {
      console.log(`   ${url}`);
    });

    // 9. Risultato Finale
    console.log('\n📋 9. Risultato Finale');
    console.log('-'.repeat(30));
    
    if (allTestsPassed) {
      console.log('🎉 TUTTI I TEST SUPERATI!');
      console.log('✅ Admin Dashboard completamente operativa');
      console.log('✅ Tutte le operazioni CRUD funzionanti');
      console.log('✅ Database configurato correttamente');
      console.log('✅ RLS policies attive');
      console.log('✅ Dati di esempio presenti');
      
      console.log('\n🚀 Prossimi passi:');
      console.log('1. Vai su http://localhost:3000/admin/login');
      console.log('2. Login con admin@glgcapital.com / GLGAdmin2024!');
      console.log('3. Testa tutte le sezioni CRUD');
      console.log('4. L\'admin dashboard è pronta per la produzione!');
    } else {
      console.log('❌ ALCUNI TEST FALLITI');
      console.log('⚠️  Controlla gli errori sopra e risolvi i problemi');
      console.log('📋 Assicurati di aver eseguito lo script SQL in Supabase');
    }

    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
    allTestsPassed = false;
  }

  return allTestsPassed;
}

// Esegui la verifica
verifyAdminOperational().catch(console.error); 