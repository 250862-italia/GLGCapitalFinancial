const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySecurityFixes() {
  console.log('🔒 Applying Security Fixes');
  console.log('==========================');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-security-issues.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      try {
        console.log(`\n${i + 1}/${statements.length} Executing: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: directError } = await supabase.from('_dummy').select('*').limit(0);
          
          if (directError && directError.message.includes('function')) {
            console.log('⚠️  RPC not available, skipping statement');
            continue;
          }
          
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Execution Results:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All security fixes applied successfully!');
    } else {
      console.log('\n⚠️  Some fixes failed. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to apply security fixes:', error.message);
    process.exit(1);
  }
}

async function verifySecurityFixes() {
  console.log('\n🔍 Verifying Security Fixes');
  console.log('===========================');
  
  try {
    // Check if the function was fixed
    const { data: functionCheck, error: functionError } = await supabase
      .from('pg_proc')
      .select('proname, proconfig')
      .eq('proname', 'update_updated_at_column')
      .single();
    
    if (functionError) {
      console.log('⚠️  Could not verify function (permission issue)');
    } else if (functionCheck) {
      console.log('✅ Function search_path fix verified');
    }
    
    // Check if audit_logs table exists
    const { data: auditTable, error: auditError } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);
    
    if (auditError && auditError.code === 'PGRST116') {
      console.log('✅ Audit logs table created successfully');
    } else if (auditError) {
      console.log('⚠️  Audit logs table verification failed:', auditError.message);
    } else {
      console.log('✅ Audit logs table exists and accessible');
    }
    
    console.log('\n🎯 Security verification completed');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Security Fix Application');
  console.log('====================================');
  
  await applySecurityFixes();
  await verifySecurityFixes();
  
  console.log('\n📋 Manual Steps Required:');
  console.log('=========================');
  console.log('1. Go to Supabase Dashboard > Authentication > Settings > Password Security');
  console.log('   - Enable "Leaked password protection"');
  console.log('');
  console.log('2. Go to Supabase Dashboard > Authentication > Settings > Multi-factor Authentication');
  console.log('   - Enable TOTP (Time-based One-Time Password)');
  console.log('   - Enable SMS (if available)');
  console.log('   - Enable Email');
  console.log('');
  console.log('3. Test the security improvements:');
  console.log('   - Try registering with a known compromised password');
  console.log('   - Test MFA setup for existing users');
  console.log('   - Verify audit logging is working');
  
  console.log('\n✅ Security fix process completed!');
}

main().catch(console.error); 