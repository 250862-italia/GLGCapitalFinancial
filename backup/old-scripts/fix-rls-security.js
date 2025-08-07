const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSSecurity() {
  console.log('🔒 Fixing RLS Security Issues');
  console.log('=============================');
  
  try {
    // Read the SQL fix script
    const fixScript = fs.readFileSync('fix-rls-security.sql', 'utf8');
    
    console.log('📋 Applying RLS security fixes...');
    
    // Execute the fix script
    const { data, error } = await supabase.rpc('exec_sql', { sql: fixScript });
    
    if (error) {
      console.error('❌ Error applying RLS fixes:', error);
      return;
    }
    
    console.log('✅ RLS security fixes applied successfully');
    
    // Verify the fixes
    console.log('\n🔍 Verifying RLS status...');
    await verifyRLSStatus();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function verifyRLSStatus() {
  try {
    // Check RLS status on all tables
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_schema', 'public')
      .in('table_name', [
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs'
      ]);

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
      return;
    }

    console.log('\n📊 RLS Status Report:');
    console.log('=====================');
    
    let issuesFound = 0;
    
    rlsStatus.forEach(table => {
      const status = table.row_security ? '✅ Enabled' : '❌ Disabled';
      console.log(`${table.table_name}: ${status}`);
      
      if (!table.row_security) {
        issuesFound++;
      }
    });

    if (issuesFound === 0) {
      console.log('\n🎉 All tables have RLS enabled!');
    } else {
      console.log(`\n⚠️ ${issuesFound} tables still have RLS disabled`);
    }

    // Check policies
    console.log('\n📋 Checking RLS Policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .eq('schemaname', 'public')
      .in('tablename', [
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs'
      ]);

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
      return;
    }

    // Group policies by table
    const policiesByTable = {};
    policies.forEach(policy => {
      if (!policiesByTable[policy.tablename]) {
        policiesByTable[policy.tablename] = [];
      }
      policiesByTable[policy.tablename].push(policy.policyname);
    });

    console.log('\n📋 RLS Policies by Table:');
    console.log('=========================');
    
    Object.keys(policiesByTable).sort().forEach(table => {
      const policyList = policiesByTable[table].join(', ');
      console.log(`${table}: ${policyList}`);
    });

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }
}

async function checkCurrentStatus() {
  console.log('🔍 Checking Current RLS Status');
  console.log('==============================');
  
  try {
    // Read the check script
    const checkScript = fs.readFileSync('check-rls-status.sql', 'utf8');
    
    // Execute the check script
    const { data, error } = await supabase.rpc('exec_sql', { sql: checkScript });
    
    if (error) {
      console.error('❌ Error checking RLS status:', error);
      return;
    }
    
    console.log('✅ RLS status check completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkCurrentStatus();
      break;
    case 'fix':
      await fixRLSSecurity();
      break;
    default:
      console.log('Usage: node fix-rls-security.js [check|fix]');
      console.log('  check - Check current RLS status');
      console.log('  fix   - Apply RLS security fixes');
      break;
  }
}

main().catch(console.error); 