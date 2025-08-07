const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingTables() {
  console.log('🔧 Creating missing tables for admin dashboard...\n');

  try {
    // 1. Create packages table
    console.log('1. Creating packages table...');
    const { error: packagesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS packages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(100) NOT NULL,
          min_investment DECIMAL(15,2) NOT NULL,
          max_investment DECIMAL(15,2),
          expected_return DECIMAL(5,2),
          risk_level VARCHAR(50),
          duration_months INTEGER,
          management_fee DECIMAL(5,2) DEFAULT 0,
          performance_fee DECIMAL(5,2) DEFAULT 0,
          currency VARCHAR(10) DEFAULT 'USD',
          status VARCHAR(50) DEFAULT 'active',
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (packagesError) {
      console.log('⚠️  Could not create packages table via RPC (function not available)');
      console.log('💡 You need to create the packages table manually in Supabase SQL Editor');
    } else {
      console.log('✅ Packages table created successfully');
    }

    // 2. Create investments table
    console.log('\n2. Creating investments table...');
    const { error: investmentsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS investments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
          amount DECIMAL(15,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          investment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          maturity_date TIMESTAMP WITH TIME ZONE,
          expected_return DECIMAL(5,2),
          actual_return DECIMAL(5,2),
          fees_paid DECIMAL(15,2) DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (investmentsError) {
      console.log('⚠️  Could not create investments table via RPC (function not available)');
      console.log('💡 You need to create the investments table manually in Supabase SQL Editor');
    } else {
      console.log('✅ Investments table created successfully');
    }

    // 3. Create payments table
    console.log('\n3. Creating payments table...');
    const { error: paymentsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS payments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
          amount DECIMAL(15,2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'USD',
          payment_method VARCHAR(100),
          status VARCHAR(50) DEFAULT 'pending',
          transaction_id VARCHAR(255),
          payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_date TIMESTAMP WITH TIME ZONE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (paymentsError) {
      console.log('⚠️  Could not create payments table via RPC (function not available)');
      console.log('💡 You need to create the payments table manually in Supabase SQL Editor');
    } else {
      console.log('✅ Payments table created successfully');
    }

    // 4. Create kyc_requests table
    console.log('\n4. Creating kyc_requests table...');
    const { error: kycError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS kyc_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'pending',
          document_type VARCHAR(100),
          document_url TEXT,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          reviewed_by UUID REFERENCES auth.users(id),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (kycError) {
      console.log('⚠️  Could not create kyc_requests table via RPC (function not available)');
      console.log('💡 You need to create the kyc_requests table manually in Supabase SQL Editor');
    } else {
      console.log('✅ KYC requests table created successfully');
    }

    // 5. Create informational_requests table
    console.log('\n5. Creating informational_requests table...');
    const { error: infoError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS informational_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          request_type VARCHAR(100) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          priority VARCHAR(20) DEFAULT 'medium',
          assigned_to UUID REFERENCES auth.users(id),
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          resolved_at TIMESTAMP WITH TIME ZONE,
          response TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (infoError) {
      console.log('⚠️  Could not create informational_requests table via RPC (function not available)');
      console.log('💡 You need to create the informational_requests table manually in Supabase SQL Editor');
    } else {
      console.log('✅ Informational requests table created successfully');
    }

    // 6. Test if tables exist by trying to access them
    console.log('\n6. Testing table access...');
    
    // Test packages table
    const { data: packagesTest, error: packagesTestError } = await supabase
      .from('packages')
      .select('count')
      .limit(1);

    if (packagesTestError) {
      console.log('❌ Packages table does not exist:', packagesTestError.message);
    } else {
      console.log('✅ Packages table exists and accessible');
    }

    // Test investments table
    const { data: investmentsTest, error: investmentsTestError } = await supabase
      .from('investments')
      .select('count')
      .limit(1);

    if (investmentsTestError) {
      console.log('❌ Investments table does not exist:', investmentsTestError.message);
    } else {
      console.log('✅ Investments table exists and accessible');
    }

    // Test payments table
    const { data: paymentsTest, error: paymentsTestError } = await supabase
      .from('payments')
      .select('count')
      .limit(1);

    if (paymentsTestError) {
      console.log('❌ Payments table does not exist:', paymentsTestError.message);
    } else {
      console.log('✅ Payments table exists and accessible');
    }

    // Test kyc_requests table
    const { data: kycTest, error: kycTestError } = await supabase
      .from('kyc_requests')
      .select('count')
      .limit(1);

    if (kycTestError) {
      console.log('❌ KYC requests table does not exist:', kycTestError.message);
    } else {
      console.log('✅ KYC requests table exists and accessible');
    }

    // Test informational_requests table
    const { data: infoTest, error: infoTestError } = await supabase
      .from('informational_requests')
      .select('count')
      .limit(1);

    if (infoTestError) {
      console.log('❌ Informational requests table does not exist:', infoTestError.message);
    } else {
      console.log('✅ Informational requests table exists and accessible');
    }

    console.log('\n🎉 TABLE CREATION COMPLETED!');
    console.log('\n📋 Summary:');
    console.log('⚠️  Tables need to be created manually in Supabase SQL Editor');
    console.log('💡 Copy and paste the SQL commands below into Supabase SQL Editor');

    console.log('\n📝 SQL Commands to run in Supabase SQL Editor:');
    console.log(`
-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  min_investment DECIMAL(15,2) NOT NULL,
  max_investment DECIMAL(15,2),
  expected_return DECIMAL(5,2),
  risk_level VARCHAR(50),
  duration_months INTEGER,
  management_fee DECIMAL(5,2) DEFAULT 0,
  performance_fee DECIMAL(5,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  investment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  maturity_date TIMESTAMP WITH TIME ZONE,
  expected_return DECIMAL(5,2),
  actual_return DECIMAL(5,2),
  fees_paid DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kyc_requests table
CREATE TABLE IF NOT EXISTS kyc_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  document_type VARCHAR(100),
  document_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create informational_requests table
CREATE TABLE IF NOT EXISTS informational_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for packages (public read, admin write)
CREATE POLICY "Public can view active packages" ON packages
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage packages" ON packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Create RLS policies for investments
CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments" ON investments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Create RLS policies for payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Create RLS policies for kyc_requests
CREATE POLICY "Users can view own kyc requests" ON kyc_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all kyc requests" ON kyc_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'superadmin')
    )
  );

-- Create RLS policies for informational_requests
CREATE POLICY "Users can view own informational requests" ON informational_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all informational requests" ON informational_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'superadmin')
    )
  );
    `);

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Execute the table creation
createMissingTables(); 