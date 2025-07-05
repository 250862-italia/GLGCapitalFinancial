const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAnalyticsTable() {
  console.log('🗄️  Setting up Analytics table...');
  
  try {
    // First, let's check if the table already exists
    const { data: existingData, error: checkError } = await supabase
      .from('analytics')
      .select('count')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('📋 Analytics table does not exist, creating it...');
      
      // Since we can't create tables via the client, we'll provide instructions
      console.log('❌ Cannot create table via client. Please run this SQL in Supabase SQL Editor:');
      console.log(`
-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric VARCHAR(255) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  change_percentage DECIMAL(5,2) DEFAULT 0,
  period VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics(category);
CREATE INDEX IF NOT EXISTS idx_analytics_status ON analytics(status);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Allow all operations on analytics" ON analytics;
CREATE POLICY "Allow all operations on analytics" ON analytics FOR ALL USING (true);

-- Insert sample data
INSERT INTO analytics (metric, value, change_percentage, period, category, description) VALUES
('Total Revenue', 1250000, 12.5, 'Q1 2024', 'Financial', 'Total platform revenue'),
('Active Users', 15420, -2.3, 'Q1 2024', 'User', 'Number of active users'),
('Conversion Rate', 3.2, 0.8, 'Q1 2024', 'Performance', 'User conversion rate'),
('Customer Satisfaction', 4.7, 0.2, 'Q1 2024', 'Quality', 'Customer satisfaction score'),
('Total Investments', 8500000, 15.7, 'Q1 2024', 'Financial', 'Total investment volume'),
('New Registrations', 1250, 8.9, 'Q1 2024', 'User', 'New user registrations'),
('KYC Approval Rate', 94.2, 1.5, 'Q1 2024', 'Quality', 'KYC approval success rate'),
('Average Investment', 25000, 5.2, 'Q1 2024', 'Financial', 'Average investment per user'),
('Platform Uptime', 99.8, 0.1, 'Q1 2024', 'Performance', 'Platform availability'),
('Support Response Time', 2.5, -0.3, 'Q1 2024', 'Quality', 'Average support response time in hours');
      `);
      return;
    }

    if (existingData) {
      console.log('✅ Analytics table already exists!');
      
      // Test the table by fetching data
      const { data, error: fetchError } = await supabase
        .from('analytics')
        .select('*')
        .limit(5);

      if (fetchError) {
        console.error('❌ Error fetching analytics data:', fetchError);
        return;
      }

      console.log('✅ Analytics table is working! Found', data.length, 'records');
      console.log('📊 Sample data:', data.slice(0, 2));
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupAnalyticsTable(); 