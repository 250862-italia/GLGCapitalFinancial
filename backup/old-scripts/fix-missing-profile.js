const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Fixing Missing Profile for Test User');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixMissingProfile() {
  try {
    console.log('1️⃣ Getting user ID from auth...');
    
    // Get user from auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@glgcapital.com',
      password: 'TestPassword123!'
    });
    
    if (authError) {
      console.log('❌ Auth failed:', authError.message);
      return false;
    }
    
    const userId = authData.user.id;
    console.log('✅ User ID:', userId);
    
    // Check if profile exists
    console.log('\n2️⃣ Checking if profile exists...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile.id);
      return true;
    }
    
    console.log('❌ Profile not found, creating...');
    
    // Create profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'test@glgcapital.com',
        first_name: 'Test',
        last_name: 'User',
        name: 'Test User',
        role: 'user',
        country: 'Italy',
        kyc_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating profile:', createError.message);
      return false;
    }
    
    console.log('✅ Profile created:', newProfile.id);
    
    // Create client record
    console.log('\n3️⃣ Creating client record...');
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        email: 'test@glgcapital.com',
        first_name: 'Test',
        last_name: 'User',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (clientError) {
      console.log('⚠️ Error creating client record:', clientError.message);
      // Don't fail if client creation fails
    } else {
      console.log('✅ Client record created:', newClient.id);
    }
    
    console.log('\n✅ Profile fix completed successfully!');
    return true;
    
  } catch (error) {
    console.log('❌ Error during fix:', error.message);
    return false;
  }
}

async function main() {
  const success = await fixMissingProfile();
  
  if (success) {
    console.log('\n🎉 Profile fix completed!');
    console.log('The user should now be able to login properly.');
  } else {
    console.log('\n❌ Profile fix failed');
  }
}

main().catch(console.error); 