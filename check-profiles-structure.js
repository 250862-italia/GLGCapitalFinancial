const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Profiles Table Structure');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkProfilesStructure() {
  try {
    console.log('1️⃣ Fetching profiles table structure...');
    
    // Get a sample profile to see the structure
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return false;
    }
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Profiles table structure:');
      const sampleProfile = profiles[0];
      Object.keys(sampleProfile).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleProfile[key]} (${sampleProfile[key]})`);
      });
    } else {
      console.log('⚠️ No profiles found, checking table structure...');
      
      // Try to insert a minimal profile to see what columns exist
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: 'test-structure-check',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.log('❌ Insert error:', insertError.message);
        console.log('   This shows us what columns are missing');
      } else {
        console.log('✅ Minimal profile inserted successfully');
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Error checking structure:', error.message);
    return false;
  }
}

async function main() {
  const success = await checkProfilesStructure();
  
  if (success) {
    console.log('\n✅ Structure check completed');
  } else {
    console.log('\n❌ Structure check failed');
  }
}

main().catch(console.error); 