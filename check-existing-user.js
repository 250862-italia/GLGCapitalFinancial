require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkExistingUser() {
  console.log('🔍 Checking Existing User in Supabase\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Empty');
    console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Empty');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const targetEmail = 'innocentigianni2015@gmail.com';

  try {
    // Step 1: Check Profiles Table
    console.log('1️⃣ Checking Profiles Table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', targetEmail);

    if (profilesError) {
      console.log('❌ Error checking profiles:', profilesError.message);
    } else {
      console.log(`✅ Profiles query successful`);
      console.log(`   Found ${profiles?.length || 0} profile(s)`);
      
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        console.log('   Profile details:');
        console.log(`     ID: ${profile.id}`);
        console.log(`     Email: ${profile.email}`);
        console.log(`     First Name: ${profile.first_name}`);
        console.log(`     Last Name: ${profile.last_name}`);
        console.log(`     Country: ${profile.country}`);
        console.log(`     Created At: ${profile.created_at}`);
        console.log(`     User ID: ${profile.user_id || 'NULL'}`);
      } else {
        console.log('   ❌ No profile found for this email');
      }
    }

    // Step 2: Check Clients Table
    console.log('\n2️⃣ Checking Clients Table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', targetEmail);

    if (clientsError) {
      console.log('❌ Error checking clients:', clientsError.message);
    } else {
      console.log(`✅ Clients query successful`);
      console.log(`   Found ${clients?.length || 0} client(s)`);
      
      if (clients && clients.length > 0) {
        const client = clients[0];
        console.log('   Client details:');
        console.log(`     ID: ${client.id}`);
        console.log(`     Email: ${client.email}`);
        console.log(`     First Name: ${client.first_name}`);
        console.log(`     Last Name: ${client.last_name}`);
        console.log(`     Country: ${client.country}`);
        console.log(`     Created At: ${client.created_at}`);
        console.log(`     User ID: ${client.user_id || 'NULL'}`);
      } else {
        console.log('   ❌ No client found for this email');
      }
    }

    // Step 3: Check for similar emails
    console.log('\n3️⃣ Checking for similar emails...');
    const { data: similarProfiles, error: similarError } = await supabase
      .from('profiles')
      .select('email, created_at')
      .ilike('email', '%innocentigianni%')
      .order('created_at', { ascending: false })
      .limit(5);

    if (similarError) {
      console.log('❌ Error checking similar emails:', similarError.message);
    } else {
      console.log(`✅ Similar emails found: ${similarProfiles?.length || 0}`);
      if (similarProfiles && similarProfiles.length > 0) {
        console.log('   Similar emails:');
        similarProfiles.forEach((profile, index) => {
          console.log(`     ${index + 1}. ${profile.email} (${profile.created_at})`);
        });
      }
    }

    // Step 4: Summary
    console.log('\n📊 SUMMARY:');
    const hasProfile = profiles && profiles.length > 0;
    const hasClient = clients && clients.length > 0;
    
    console.log(`   Target Email: ${targetEmail}`);
    console.log(`   Profile Found: ${hasProfile ? '✅ YES' : '❌ NO'}`);
    console.log(`   Client Found: ${hasClient ? '✅ YES' : '❌ NO'}`);
    
    if (hasProfile && hasClient) {
      console.log('\n🎉 USER EXISTS! Registration system is working correctly!');
      console.log('   The 409 error is expected and correct behavior.');
      console.log('   You can now try to login with this user.');
    } else if (hasProfile || hasClient) {
      console.log('\n⚠️  PARTIAL DATA: User exists but data is incomplete');
      console.log('   This might indicate a registration issue.');
    } else {
      console.log('\n❌ USER NOT FOUND: This is unexpected');
      console.log('   The 409 error suggests the user exists but we cannot find it.');
      console.log('   This might indicate a database connection issue.');
    }

  } catch (error) {
    console.error('❌ Error during check:', error);
  }
}

checkExistingUser(); 