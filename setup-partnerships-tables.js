const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPartnershipsTables() {
  console.log('🚀 Setting up Partnerships Management tables...\n');

  try {
    // Create partnerships table
    console.log('📝 Creating partnerships table...');
    const { error: partnershipsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS partnerships (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('strategic', 'financial', 'technology', 'distribution', 'research')),
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'terminated')),
          start_date DATE,
          end_date DATE,
          value DECIMAL(15,2) DEFAULT 0,
          description TEXT,
          contact_person VARCHAR(255),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          country VARCHAR(100),
          industry VARCHAR(100),
          benefits TEXT[] DEFAULT '{}',
          website VARCHAR(500),
          logo_url VARCHAR(500),
          documents TEXT[] DEFAULT '{}',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (partnershipsError) {
      console.log('⚠️  partnerships table:', partnershipsError.message);
    } else {
      console.log('✅ partnerships table created');
    }

    // Create partnership_types table
    console.log('📝 Creating partnership_types table...');
    const { error: typesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS partnership_types (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(7) DEFAULT '#3B82F6',
          icon VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (typesError) {
      console.log('⚠️  partnership_types table:', typesError.message);
    } else {
      console.log('✅ partnership_types table created');
    }

    // Create partnership_statuses table
    console.log('📝 Creating partnership_statuses table...');
    const { error: statusesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS partnership_statuses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          color VARCHAR(7) DEFAULT '#6B7280',
          icon VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (statusesError) {
      console.log('⚠️  partnership_statuses table:', statusesError.message);
    } else {
      console.log('✅ partnership_statuses table created');
    }

    // Create partnership_activities table
    console.log('📝 Creating partnership_activities table...');
    const { error: activitiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS partnership_activities (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
          activity_type VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          amount DECIMAL(15,2),
          status VARCHAR(50) DEFAULT 'completed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (activitiesError) {
      console.log('⚠️  partnership_activities table:', activitiesError.message);
    } else {
      console.log('✅ partnership_activities table created');
    }

    // Create partnership_contacts table
    console.log('📝 Creating partnership_contacts table...');
    const { error: contactsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS partnership_contacts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(50),
          role VARCHAR(100),
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (contactsError) {
      console.log('⚠️  partnership_contacts table:', contactsError.message);
    } else {
      console.log('✅ partnership_contacts table created');
    }

    // Create partnership_documents table
    console.log('📝 Creating partnership_documents table...');
    const { error: documentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS partnership_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          file_url VARCHAR(500) NOT NULL,
          file_type VARCHAR(50),
          file_size INTEGER,
          category VARCHAR(100),
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (documentsError) {
      console.log('⚠️  partnership_documents table:', documentsError.message);
    } else {
      console.log('✅ partnership_documents table created');
    }

    // Insert sample data
    console.log('\n📝 Inserting sample data...');
    
    // Insert partnership types
    const { error: typesInsertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO partnership_types (name, description, color, icon) VALUES
        ('strategic', 'Strategic business partnerships for long-term growth', '#10B981', 'Handshake'),
        ('financial', 'Financial partnerships and investment collaborations', '#F59E0B', 'DollarSign'),
        ('technology', 'Technology partnerships and digital collaborations', '#8B5CF6', 'Cpu'),
        ('distribution', 'Distribution and market access partnerships', '#EF4444', 'Truck'),
        ('research', 'Research and development partnerships', '#06B6D4', 'Microscope')
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (typesInsertError) {
      console.log('⚠️  Partnership types insert:', typesInsertError.message);
    } else {
      console.log('✅ Sample partnership types inserted');
    }

    // Insert partnership statuses
    const { error: statusesInsertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO partnership_statuses (name, description, color, icon) VALUES
        ('active', 'Partnership is currently active and operational', '#10B981', 'CheckCircle'),
        ('pending', 'Partnership is under review or negotiation', '#F59E0B', 'Clock'),
        ('expired', 'Partnership has reached its end date', '#EF4444', 'AlertTriangle'),
        ('terminated', 'Partnership has been terminated', '#6B7280', 'XCircle')
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (statusesInsertError) {
      console.log('⚠️  Partnership statuses insert:', statusesInsertError.message);
    } else {
      console.log('✅ Sample partnership statuses inserted');
    }

    // Insert partnerships
    const { error: partnershipsInsertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO partnerships (name, type, status, start_date, end_date, value, description, contact_person, contact_email, contact_phone, country, industry, benefits, website, notes) VALUES
        (
            'European Investment Bank',
            'financial',
            'active',
            '2024-01-15',
            '2027-01-15',
            5000000.00,
            'Strategic financial partnership for European market expansion and investment opportunities. This partnership provides access to European capital markets and regulatory expertise.',
            'Marco Rossi',
            'marco.rossi@eib.eu',
            '+39 02 1234567',
            'Italy',
            'Financial Services',
            ARRAY['Market Access', 'Capital Investment', 'Regulatory Support', 'European Network'],
            'https://www.eib.org',
            'Key partnership for European market entry. Regular quarterly reviews scheduled.'
        ),
        (
            'Tech Innovation Hub',
            'technology',
            'active',
            '2023-11-20',
            '2026-11-20',
            2500000.00,
            'Technology partnership for digital transformation and fintech solutions development. Focus on blockchain and AI applications.',
            'Sarah Chen',
            'sarah.chen@techhub.com',
            '+1 415 9876543',
            'United States',
            'Technology',
            ARRAY['Technology Transfer', 'R&D Collaboration', 'Innovation Support', 'Talent Exchange'],
            'https://www.techhub.com',
            'Leading edge technology partnership. Monthly innovation workshops.'
        ),
        (
            'Global Distribution Network',
            'distribution',
            'pending',
            NULL,
            NULL,
            1500000.00,
            'Distribution partnership for expanding market reach across multiple regions. Will provide logistics and local market expertise.',
            'Carlos Rodriguez',
            'carlos.rodriguez@globaldist.com',
            '+34 91 4567890',
            'Spain',
            'Distribution',
            ARRAY['Market Expansion', 'Logistics Support', 'Local Expertise', 'Regional Networks'],
            'https://www.globaldist.com',
            'Under negotiation. Expected to close by end of Q2 2024.'
        ),
        (
            'Research Institute Partnership',
            'research',
            'expired',
            '2022-06-01',
            '2023-12-31',
            800000.00,
            'Research collaboration for market analysis and investment strategy development. Provided valuable insights into emerging markets.',
            'Dr. Anna Schmidt',
            'anna.schmidt@research.org',
            '+49 30 1234567',
            'Germany',
            'Research',
            ARRAY['Market Research', 'Data Analytics', 'Expert Consultation', 'Academic Collaboration'],
            'https://www.research.org',
            'Partnership completed successfully. Renewal under consideration.'
        ),
        (
            'Asian Market Alliance',
            'strategic',
            'active',
            '2023-08-01',
            '2028-08-01',
            3000000.00,
            'Strategic partnership for Asian market penetration and local business development. Multi-country collaboration.',
            'Yuki Tanaka',
            'yuki.tanaka@asianalliance.com',
            '+81 3 1234567',
            'Japan',
            'Consulting',
            ARRAY['Market Entry', 'Local Partnerships', 'Cultural Expertise', 'Regulatory Guidance'],
            'https://www.asianalliance.com',
            'Critical partnership for Asian expansion. Quarterly performance reviews.'
        ),
        (
            'Digital Banking Solutions',
            'technology',
            'active',
            '2024-02-01',
            '2027-02-01',
            1800000.00,
            'Technology partnership for digital banking platform development and integration services.',
            'Alex Johnson',
            'alex.johnson@digitalbank.com',
            '+44 20 1234567',
            'United Kingdom',
            'Fintech',
            ARRAY['Platform Development', 'API Integration', 'Security Solutions', 'Compliance Support'],
            'https://www.digitalbank.com',
            'Focus on mobile banking solutions and API development.'
        )
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (partnershipsInsertError) {
      console.log('⚠️  Partnerships insert:', partnershipsInsertError.message);
    } else {
      console.log('✅ Sample partnerships inserted');
    }

    console.log('\n🎉 Partnerships Management tables setup completed!');
    console.log('\n📊 Tables created:');
    console.log('   • partnerships');
    console.log('   • partnership_types');
    console.log('   • partnership_statuses');
    console.log('   • partnership_activities');
    console.log('   • partnership_contacts');
    console.log('   • partnership_documents');
    
    console.log('\n📋 Sample data inserted:');
    console.log('   • 6 partnerships');
    console.log('   • 5 partnership types');
    console.log('   • 4 partnership statuses');

  } catch (error) {
    console.error('❌ Error setting up partnerships tables:', error);
    process.exit(1);
  }
}

// Run the setup
setupPartnershipsTables(); 