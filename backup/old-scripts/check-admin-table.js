require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminTable() {
  try {
    console.log('🔍 Checking admin table structure...');
    
    // Try to fetch users directly
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      
      // Try to create a simple admin user
      console.log('🔧 Trying to create admin user...');
      
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'admin@glgcapitalgroupllc.com',
          first_name: 'Admin',
          last_name: 'Test',
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating admin:', createError);
        return;
      }
      
      console.log('✅ Admin created:', newAdmin);
      return;
    }
    
    console.log('📋 Existing users:', users);
    
    // Check if admin exists
    const admin = users.find(u => u.email === 'admin@glgcapitalgroupllc.com');
    if (admin) {
      console.log('✅ Admin already exists:', admin);
    } else {
      console.log('❌ Admin not found, creating one...');
      
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'admin@glgcapitalgroupllc.com',
          first_name: 'Admin',
          last_name: 'Test',
          role: 'superadmin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating admin:', createError);
        return;
      }
      
      console.log('✅ Admin created:', newAdmin);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAdminTable(); 