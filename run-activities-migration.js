const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runActivitiesMigration() {
  console.log('🚀 Starting activities table migration...');
  
  try {
    // Check if activities table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('activities')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('📋 Activities table does not exist, creating it...');
    } else if (existingTable) {
      console.log('✅ Activities table already exists');
      return;
    }

    // Create activities table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('user', 'investment', 'content', 'kyc', 'payment', 'system', 'team', 'data')),
        details JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('❌ Error creating activities table:', createError);
      throw createError;
    }

    console.log('✅ Activities table created successfully');

    // Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
      CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_activities_admin_id ON activities(admin_id);
      CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activities_type_created_at ON activities(type, created_at DESC);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSQL });
    
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      throw indexError;
    }

    console.log('✅ Indexes created successfully');

    // Enable RLS
    const rlsSQL = `ALTER TABLE activities ENABLE ROW LEVEL SECURITY;`;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
      throw rlsError;
    }

    console.log('✅ RLS enabled successfully');

    // Create RLS policies
    const policiesSQL = `
      -- Admins can view all activities
      CREATE POLICY "Admins can view all activities" ON activities
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_user_meta_data->>'role' = 'superadmin')
          )
        );

      -- Admins can insert activities
      CREATE POLICY "Admins can insert activities" ON activities
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_user_meta_data->>'role' = 'superadmin')
          )
        );

      -- Users can view their own activities
      CREATE POLICY "Users can view own activities" ON activities
        FOR SELECT USING (user_id = auth.uid());
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    
    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
      throw policyError;
    }

    console.log('✅ RLS policies created successfully');

    // Create trigger function
    const triggerFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_activities_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: triggerFunctionSQL });
    
    if (functionError) {
      console.error('❌ Error creating trigger function:', functionError);
      throw functionError;
    }

    console.log('✅ Trigger function created successfully');

    // Create trigger
    const triggerSQL = `
      CREATE TRIGGER update_activities_updated_at_trigger
        BEFORE UPDATE ON activities
        FOR EACH ROW
        EXECUTE FUNCTION update_activities_updated_at();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });
    
    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      throw triggerError;
    }

    console.log('✅ Trigger created successfully');

    // Insert sample activities
    const sampleDataSQL = `
      INSERT INTO activities (action, type, details) VALUES
        ('System initialized', 'system', '{"action": "system_init"}'),
        ('Database migration completed', 'system', '{"action": "migration", "version": "1.0.0"}')
      ON CONFLICT DO NOTHING;
    `;

    const { error: sampleError } = await supabase.rpc('exec_sql', { sql: sampleDataSQL });
    
    if (sampleError) {
      console.error('❌ Error inserting sample data:', sampleError);
      throw sampleError;
    }

    console.log('✅ Sample activities inserted successfully');

    console.log('🎉 Activities table migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runActivitiesMigration(); 