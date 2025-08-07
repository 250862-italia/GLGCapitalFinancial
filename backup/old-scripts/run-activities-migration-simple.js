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

    // Since we can't use exec_sql, let's create the table using the Supabase client
    // We'll create it step by step using the REST API
    
    console.log('⚠️  Note: This migration requires manual SQL execution in Supabase dashboard');
    console.log('📋 Please run the following SQL in your Supabase SQL editor:');
    console.log('');
    console.log('-- Create activities table');
    console.log('CREATE TABLE IF NOT EXISTS activities (');
    console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
    console.log('  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,');
    console.log('  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,');
    console.log('  action TEXT NOT NULL,');
    console.log('  type TEXT NOT NULL CHECK (type IN (\'user\', \'investment\', \'content\', \'kyc\', \'payment\', \'system\', \'team\', \'data\')),');
    console.log('  details JSONB DEFAULT \'{}\',');
    console.log('  ip_address INET,');
    console.log('  user_agent TEXT,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);');
    console.log('CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_activities_admin_id ON activities(admin_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);');
    console.log('CREATE INDEX IF NOT EXISTS idx_activities_type_created_at ON activities(type, created_at DESC);');
    console.log('');
    console.log('-- Enable RLS');
    console.log('ALTER TABLE activities ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Create RLS policies');
    console.log('CREATE POLICY "Admins can view all activities" ON activities');
    console.log('  FOR SELECT USING (');
    console.log('    EXISTS (');
    console.log('      SELECT 1 FROM auth.users ');
    console.log('      WHERE auth.users.id = auth.uid() ');
    console.log('      AND (auth.users.raw_user_meta_data->>\'role\' = \'super_admin\' OR auth.users.raw_user_meta_data->>\'role\' = \'superadmin\')');
    console.log('    )');
    console.log('  );');
    console.log('');
    console.log('CREATE POLICY "Admins can insert activities" ON activities');
    console.log('  FOR INSERT WITH CHECK (');
    console.log('    EXISTS (');
    console.log('      SELECT 1 FROM auth.users ');
    console.log('      WHERE auth.users.id = auth.uid() ');
    console.log('      AND (auth.users.raw_user_meta_data->>\'role\' = \'super_admin\' OR auth.users.raw_user_meta_data->>\'role\' = \'superadmin\')');
    console.log('    )');
    console.log('  );');
    console.log('');
    console.log('CREATE POLICY "Users can view own activities" ON activities');
    console.log('  FOR SELECT USING (user_id = auth.uid());');
    console.log('');
    console.log('-- Create trigger function');
    console.log('CREATE OR REPLACE FUNCTION update_activities_updated_at()');
    console.log('RETURNS TRIGGER AS $$');
    console.log('BEGIN');
    console.log('  NEW.updated_at = NOW();');
    console.log('  RETURN NEW;');
    console.log('END;');
    console.log('$$ LANGUAGE plpgsql;');
    console.log('');
    console.log('-- Create trigger');
    console.log('CREATE TRIGGER update_activities_updated_at_trigger');
    console.log('  BEFORE UPDATE ON activities');
    console.log('  FOR EACH ROW');
    console.log('  EXECUTE FUNCTION update_activities_updated_at();');
    console.log('');
    console.log('-- Insert sample activities');
    console.log('INSERT INTO activities (action, type, details) VALUES');
    console.log('  (\'System initialized\', \'system\', \'{"action": "system_init"}\'),');
    console.log('  (\'Database migration completed\', \'system\', \'{"action": "migration", "version": "1.0.0"}\');');
    console.log('');
    console.log('🎯 After running the SQL above, the activities system will be ready!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runActivitiesMigration(); 