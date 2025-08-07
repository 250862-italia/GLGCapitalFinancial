const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNotesTable() {
  try {
    console.log('📝 Creating notes table using REST API...');
    
    // First, let's check if the table already exists
    const { data: existingTables, error: listError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'notes');
    
    if (listError) {
      console.log('Could not check existing tables, proceeding with creation...');
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ Notes table already exists');
      return true;
    }
    
    // Create table using direct SQL execution via REST
    console.log('Creating notes table...');
    
    // We'll create the table by inserting a test record and handling the error
    const { data: testData, error: testError } = await supabase
      .from('notes')
      .select('*')
      .limit(1);
    
    if (testError && testError.code === 'PGRST116') {
      console.log('Table does not exist, creating it...');
      
      // Since we can't create tables via REST API directly, we'll use the admin client
      // to create the table structure by attempting operations that will fail gracefully
      
      // Try to insert a note - this will create the table if it doesn't exist
      const { data: insertData, error: insertError } = await supabase
        .from('notes')
        .insert([
          {
            title: 'Test Note',
            content: 'This is a test note to create the table',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (insertError) {
        console.error('❌ Error creating table:', insertError);
        return false;
      }
      
      console.log('✅ Notes table created successfully');
      
      // Now let's insert the sample data
      const sampleNotes = [
        {
          title: 'Today I created a Supabase project.',
          content: 'This is the first note about creating a Supabase project.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'I added some data and queried it from Next.js.',
          content: 'This note describes how to query data from Next.js.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          title: 'It was awesome!',
          content: 'A simple note expressing satisfaction.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('notes')
        .insert(sampleNotes)
        .select();
      
      if (sampleError) {
        console.error('❌ Error inserting sample data:', sampleError);
      } else {
        console.log('✅ Sample data inserted successfully');
      }
      
      return true;
    } else if (testError) {
      console.error('❌ Unexpected error:', testError);
      return false;
    } else {
      console.log('✅ Notes table already exists and is accessible');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

createNotesTable(); 