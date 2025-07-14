const { createClient } = require('@supabase/supabase-js');

// Usa le stesse credenziali del file supabase.ts
const supabaseUrl = 'https://dobjulfwktzltpvqtxbql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection...\n');

  try {
    // Test connessione base
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`❌ Basic connection failed: ${error.message}`);
      console.log(`   Details: ${error.details}`);
      console.log(`   Hint: ${error.hint}`);
    } else {
      console.log(`✅ Basic connection successful`);
      console.log(`   Data: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`💥 Basic connection exception: ${error.message}`);
  }

  console.log('');

  try {
    // Test connessione admin
    console.log('🔑 Testing admin connection...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .limit(5);
    
    if (adminError) {
      console.log(`❌ Admin connection failed: ${adminError.message}`);
      console.log(`   Details: ${adminError.details}`);
      console.log(`   Hint: ${adminError.hint}`);
    } else {
      console.log(`✅ Admin connection successful`);
      console.log(`   Records found: ${adminData?.length || 0}`);
      if (adminData && adminData.length > 0) {
        console.log(`   Sample record: ${JSON.stringify(adminData[0], null, 2)}`);
      }
    }
  } catch (error) {
    console.log(`💥 Admin connection exception: ${error.message}`);
  }

  console.log('');

  // Test tabelle specifiche
  const tables = ['clients', 'packages', 'investments', 'analytics', 'informational_requests', 'team_members', 'content', 'partnerships', 'settings'];
  
  for (const table of tables) {
    try {
      console.log(`📊 Testing table: ${table}`);
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.message.includes('does not exist')) {
          console.log(`   💡 Table ${table} does not exist`);
        }
      } else {
        console.log(`   ✅ Success: ${data?.length || 0} records`);
      }
    } catch (error) {
      console.log(`   💥 Exception: ${error.message}`);
    }
  }

  console.log('\n🏁 Supabase connection testing completed!');
}

testSupabaseConnection().catch(console.error); 