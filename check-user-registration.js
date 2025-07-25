require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkUserRegistration() {
  console.log('🔍 Checking User Registration Status\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const targetEmail = 'innocentigianni2015@gmail.com';

  try {
    // Step 1: Check auth.users table
    console.log('1️⃣ Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', targetEmail);

    if (authError) {
      console.log('❌ Error checking auth.users:', authError.message);
    } else {
      console.log('✅ Auth users found:', authUsers?.length || 0);
      if (authUsers && authUsers.length > 0) {
        console.log('📧 User in auth.users:', {
          id: authUsers[0].id,
          email: authUsers[0].email,
          created_at: authUsers[0].created_at,
          email_confirmed_at: authUsers[0].email_confirmed_at
        });
      }
    }

    // Step 2: Check profiles table
    console.log('\n2️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', targetEmail);

    if (profilesError) {
      console.log('❌ Error checking profiles:', profilesError.message);
    } else {
      console.log('✅ Profiles found:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        console.log('👤 Profile data:', {
          id: profiles[0].id,
          email: profiles[0].email,
          first_name: profiles[0].first_name,
          last_name: profiles[0].last_name,
          created_at: profiles[0].created_at
        });
      }
    }

    // Step 3: Check clients table
    console.log('\n3️⃣ Checking clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', targetEmail);

    if (clientsError) {
      console.log('❌ Error checking clients:', clientsError.message);
    } else {
      console.log('✅ Clients found:', clients?.length || 0);
      if (clients && clients.length > 0) {
        console.log('🏢 Client data:', {
          id: clients[0].id,
          email: clients[0].email,
          first_name: clients[0].first_name,
          last_name: clients[0].last_name,
          created_at: clients[0].created_at
        });
      }
    }

    // Step 4: Check all users with similar email
    console.log('\n4️⃣ Checking for similar emails...');
    const { data: similarUsers, error: similarError } = await supabase
      .from('auth.users')
      .select('*')
      .ilike('email', '%innocentigianni%');

    if (similarError) {
      console.log('❌ Error checking similar emails:', similarError.message);
    } else {
      console.log('✅ Similar emails found:', similarUsers?.length || 0);
      if (similarUsers && similarUsers.length > 0) {
        console.log('🔍 Similar emails:');
        similarUsers.forEach(user => {
          console.log(`  - ${user.email} (created: ${user.created_at})`);
        });
      }
    }

    // Step 5: Check recent registrations
    console.log('\n5️⃣ Checking recent registrations (last 24 hours)...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentUsers, error: recentError } = await supabase
      .from('auth.users')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.log('❌ Error checking recent users:', recentError.message);
    } else {
      console.log('✅ Recent users found:', recentUsers?.length || 0);
      if (recentUsers && recentUsers.length > 0) {
        console.log('🕒 Recent registrations:');
        recentUsers.forEach(user => {
          console.log(`  - ${user.email} (${user.created_at})`);
        });
      }
    }

    // Step 6: Summary
    console.log('\n📊 SUMMARY:');
    const hasAuthUser = authUsers && authUsers.length > 0;
    const hasProfile = profiles && profiles.length > 0;
    const hasClient = clients && clients.length > 0;

    console.log(`  - Auth User: ${hasAuthUser ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - Profile: ${hasProfile ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - Client: ${hasClient ? '✅ Found' : '❌ Not found'}`);

    if (!hasAuthUser) {
      console.log('\n❌ USER NOT FOUND IN AUTH.USERS');
      console.log('Possible reasons:');
      console.log('  1. Registration failed');
      console.log('  2. Email was mistyped');
      console.log('  3. User was deleted');
      console.log('  4. Database connection issues');
    } else if (!hasProfile || !hasClient) {
      console.log('\n⚠️ USER FOUND BUT INCOMPLETE');
      console.log('The user exists in auth.users but missing profile/client data');
    } else {
      console.log('\n✅ USER REGISTRATION COMPLETE');
      console.log('All data is present in the database');
    }

  } catch (error) {
    console.error('❌ Error during check:', error);
  }
}

checkUserRegistration(); 