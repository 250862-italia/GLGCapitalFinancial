const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://dobjulfwktzltpvqtxbql.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30'
};

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);

async function fixRLSPolicies() {
  console.log('🔧 GLG Capital Financial - Fix RLS Policies');
  console.log('============================================');
  
  try {
    // Step 1: Read the SQL script
    console.log('\n1️⃣ Reading SQL script...');
    const sqlScript = fs.readFileSync('./fix-rls-policies.sql', 'utf8');
    console.log('✅ SQL script loaded');

    // Step 2: Execute the script via RPC
    console.log('\n2️⃣ Executing RLS policy fixes...');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_script: statement + ';' });
          if (error) {
            console.log(`⚠️  Statement failed: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.log(`⚠️  RPC failed for statement: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Execution results:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errorCount}`);

    // Step 3: Test connectivity to all tables
    console.log('\n3️⃣ Testing table access...');
    
    const tables = [
      'clients', 'packages', 'investments', 'analytics', 
      'informational_requests', 'team_members', 'content', 
      'partnerships', 'settings'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Accessible`);
        }
      } catch (error) {
        console.log(`❌ ${table}: Connection failed - ${error.message}`);
      }
    }

    // Step 4: Verify data exists
    console.log('\n4️⃣ Verifying data...');
    
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .limit(5);
    
    if (analyticsError) {
      console.log('❌ Analytics table error:', analyticsError.message);
    } else {
      console.log(`✅ Analytics table has ${analyticsData?.length || 0} records`);
    }

    const { data: packagesData, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);
    
    if (packagesError) {
      console.log('❌ Packages table error:', packagesError.message);
    } else {
      console.log(`✅ Packages table has ${packagesData?.length || 0} records`);
    }

    console.log('\n🎉 RLS Policy Fix Completed!');
    console.log('================================');
    console.log('✅ All tables should now be accessible');
    console.log('✅ Admin pages should load properly');
    console.log('✅ Test the application now');
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. You may need to run the SQL manually in Supabase Dashboard.');
      console.log('📋 Go to: https://supabase.com/dashboard/project/dobjulfwktzltpvqtxbql/sql');
      console.log('📋 Copy and paste the contents of fix-rls-policies.sql');
    }

  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
    console.log('\n📋 Manual execution required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/dobjulfwktzltpvqtxbql/sql');
    console.log('2. Click "New query"');
    console.log('3. Copy the contents of fix-rls-policies.sql');
    console.log('4. Paste and click "Run"');
  }
}

// Run the fix
fixRLSPolicies().catch(console.error); 