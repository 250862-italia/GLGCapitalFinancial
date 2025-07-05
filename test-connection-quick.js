const { createClient } = require('@supabase/supabase-js');

// Test con il nuovo progetto Supabase
const supabaseUrl = 'https://dobjulfwktzltpvqtxbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickTest() {
  console.log('🚀 Quick Supabase connection test...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test semplice
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    } else {
      console.log('✅ Connection successful!');
      return true;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

quickTest().then(success => {
  if (success) {
    console.log('🎉 Supabase is working correctly!');
  } else {
    console.log('⚠️  Supabase connection issues detected');
  }
  process.exit(0);
}).catch(console.error); 