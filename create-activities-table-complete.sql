-- Create activities table for tracking system activities
-- Run this SQL in your Supabase SQL Editor

-- Create activities table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_admin_id ON activities(admin_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type_created_at ON activities(type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create trigger function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_activities_updated_at_trigger
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();

-- Insert sample activities
INSERT INTO activities (action, type, details) VALUES
  ('System initialized', 'system', '{"action": "system_init"}'),
  ('Database migration completed', 'system', '{"action": "migration", "version": "1.0.0"}')
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT 
  'Activities table created successfully!' as status,
  COUNT(*) as total_activities
FROM activities; 