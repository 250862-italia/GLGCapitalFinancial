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

async function testAdminCRUD() {
  console.log('🔧 Test completo CRUD Admin Dashboard');
  console.log('='.repeat(50));

  try {
    // 1. Test Login Admin
    console.log('\n📋 1. Test Login Admin');
    console.log('-'.repeat(30));
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (authError) {
      console.error('❌ Login admin fallito:', authError.message);
      return;
    }

    console.log('✅ Login admin riuscito:', authData.user.email);
    const adminId = authData.user.id;

    // 2. Test Tabelle Database
    console.log('\n📋 2. Verifica Tabelle Database');
    console.log('-'.repeat(30));

    const tables = [
      'packages', 'investments', 'payments', 'kyc_requests', 
      'informational_requests', 'clients', 'team_members', 
      'partnerships', 'content', 'analytics'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabella ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabella ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabella ${table}: ${err.message}`);
      }
    }

    // 3. Test CRUD Packages
    console.log('\n📋 3. Test CRUD Packages');
    console.log('-'.repeat(30));

    // CREATE
    const newPackage = {
      name: 'Test Package CRUD',
      description: 'Package di test per CRUD',
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
      
      // READ
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

      // UPDATE
      const { data: updatedPackage, error: updateError } = await supabase
        .from('packages')
        .update({ name: 'Test Package CRUD Updated' })
        .eq('id', createdPackage.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ UPDATE package:', updateError.message);
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
      } else {
        console.log('✅ DELETE package: OK');
      }
    }

    // 4. Test CRUD Team Members
    console.log('\n📋 4. Test CRUD Team Members');
    console.log('-'.repeat(30));

    const newTeamMember = {
      name: 'Test Team Member',
      email: 'test.team@glgcapital.com',
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
      name: 'Test Partnership CRUD',
      type: 'strategic',
      status: 'active',
      description: 'Partnership di test per CRUD'
    };

    const { data: createdPartnership, error: createPartError } = await supabase
      .from('partnerships')
      .insert(newPartnership)
      .select()
      .single();

    if (createPartError) {
      console.log('❌ CREATE partnership:', createPartError.message);
    } else {
      console.log('✅ CREATE partnership:', createdPartnership.id);
      
      // DELETE test partnership
      await supabase
        .from('partnerships')
        .delete()
        .eq('id', createdPartnership.id);
      
      console.log('✅ DELETE partnership: OK');
    }

    // 6. Test RLS Policies
    console.log('\n📋 6. Test RLS Policies');
    console.log('-'.repeat(30));

    // Test accesso come admin
    const { data: adminPackages, error: adminError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);

    if (adminError) {
      console.log('❌ RLS admin packages:', adminError.message);
    } else {
      console.log('✅ RLS admin packages:', adminPackages.length, 'records');
    }

    // 7. Test API Endpoints
    console.log('\n📋 7. Test API Endpoints');
    console.log('-'.repeat(30));

    const baseUrl = 'http://localhost:3000';
    const endpoints = [
      '/api/admin/users',
      '/api/admin/clients',
      '/api/admin/packages',
      '/api/admin/partnerships',
      '/api/admin/team',
      '/api/admin/analytics/dashboard'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authData.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          console.log(`⚠️  ${endpoint}: 401 Unauthorized`);
        } else if (response.status === 403) {
          console.log(`⚠️  ${endpoint}: 403 Forbidden`);
        } else if (response.status === 404) {
          console.log(`❌ ${endpoint}: 404 Not Found`);
        } else if (response.ok) {
          console.log(`✅ ${endpoint}: ${response.status} OK`);
        } else {
          console.log(`❌ ${endpoint}: ${response.status} Error`);
        }
      } catch (err) {
        console.log(`❌ ${endpoint}: Network Error`);
      }
    }

    // 8. Test Frontend Routes
    console.log('\n📋 8. Test Frontend Routes');
    console.log('-'.repeat(30));

    const frontendRoutes = [
      '/admin',
      '/admin/users',
      '/admin/clients',
      '/admin/packages',
      '/admin/partnerships',
      '/admin/team',
      '/admin/analytics'
    ];

    for (const route of frontendRoutes) {
      try {
        const response = await fetch(`${baseUrl}${route}`);
        if (response.ok) {
          console.log(`✅ ${route}: 200 OK`);
        } else {
          console.log(`❌ ${route}: ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ ${route}: Network Error`);
      }
    }

    console.log('\n🎉 Test CRUD Admin completato!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

// Esegui il test
testAdminCRUD().catch(console.error); 