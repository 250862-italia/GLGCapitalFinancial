require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfiles() {
  try {
    console.log('🔍 Checking profiles table...');
    
    // Get profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }
    
    console.log('📋 Profiles found:', profiles);
    
    // Check if any profile has admin role
    const adminProfiles = profiles.filter(p => p.role === 'admin' || p.role === 'superadmin');
    console.log('👑 Admin profiles:', adminProfiles);
    
    // Create admin profile if none exists
    if (adminProfiles.length === 0) {
      console.log('🔧 Creating admin profile...');
      
      const { data: newAdmin, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: 'admin-profile-id',
          name: 'Admin Test',
          email: 'admin@glgcapitalgroupllc.com',
          role: 'superadmin',
          first_name: 'Admin',
          last_name: 'Test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating admin profile:', createError);
        return;
      }
      
      console.log('✅ Admin profile created:', newAdmin);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProfiles(); 