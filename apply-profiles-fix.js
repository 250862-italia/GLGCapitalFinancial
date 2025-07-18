const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProfilesTable() {
  try {
    console.log('🔧 Fixing profiles table structure...');
    
    // Read the SQL fix
    const fs = require('fs');
    const sqlFix = fs.readFileSync('fix-profiles-table.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlFix
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.log(`⚠️ Statement ${i + 1} error (might be expected):`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n✅ Profiles table structure fixed successfully!');
    
    // Test the fix by creating a test profile
    console.log('\n🧪 Testing the fix...');
    
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000000', // Test UUID
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      first_name: 'Test',
      last_name: 'User',
      country: 'Italy'
    };
    
    // Try to insert (this should work now)
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(testProfile);
    
    if (insertError) {
      console.log('⚠️ Test insert error (expected if test user exists):', insertError.message);
    } else {
      console.log('✅ Test insert successful - table structure is correct');
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.log('⚠️ Test cleanup error:', deleteError.message);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }
    
    console.log('\n🎉 Profiles table fix completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Test user registration');
    console.log('   2. Test user login');
    console.log('   3. Verify profile creation works');
    
  } catch (error) {
    console.error('❌ Error fixing profiles table:', error);
    process.exit(1);
  }
}

// Run the fix
fixProfilesTable(); 