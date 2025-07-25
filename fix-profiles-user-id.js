require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fixProfilesTable() {
  console.log('🔧 Fixing profiles table - Adding user_id column...\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Step 1: Check current structure
    console.log('1️⃣ Checking current profiles table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.log('❌ Error checking profiles table:', columnsError.message);
      return;
    }

    console.log('✅ Profiles table accessible');

    // Step 2: Add user_id column if it doesn't exist
    console.log('\n2️⃣ Adding user_id column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      `
    });

    if (alterError) {
      console.log('⚠️ Error adding user_id column (might already exist):', alterError.message);
      
      // Try alternative approach
      console.log('🔄 Trying alternative approach...');
      const { error: alterError2 } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN 
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'profiles' AND column_name = 'user_id'
            ) THEN
              ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            END IF;
          END $$;
        `
      });

      if (alterError2) {
        console.log('❌ Alternative approach failed:', alterError2.message);
        return;
      }
    }

    console.log('✅ user_id column added successfully');

    // Step 3: Update existing profiles to set user_id = id
    console.log('\n3️⃣ Updating existing profiles...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE profiles 
        SET user_id = id 
        WHERE user_id IS NULL;
      `
    });

    if (updateError) {
      console.log('⚠️ Error updating profiles:', updateError.message);
    } else {
      console.log('✅ Existing profiles updated');
    }

    // Step 4: Verify the fix
    console.log('\n4️⃣ Verifying the fix...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, user_id, name, email')
      .limit(5);

    if (testError) {
      console.log('❌ Error testing profiles table:', testError.message);
      return;
    }

    console.log('✅ Profiles table structure verified:');
    console.log('Sample data:', testData);

    console.log('\n🎉 Profiles table fix completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixProfilesTable(); 