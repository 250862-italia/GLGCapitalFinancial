const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function setupTeamTables() {
  console.log('🚀 Setting up Team Management tables...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'setup-team-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
          } else {
            console.log(`✅ Statement ${i + 1}: Executed successfully`);
          }
        } catch (err) {
          console.log(`❌ Statement ${i + 1}: ${err.message}`);
        }
      }
    }

    console.log('\n🎉 Team Management tables setup completed!');
    console.log('\n📊 Tables created:');
    console.log('   • team_members');
    console.log('   • team_departments');
    console.log('   • team_roles');
    console.log('   • team_activity_log');
    console.log('   • team_permissions');
    
    console.log('\n📋 Sample data inserted:');
    console.log('   • 6 team members');
    console.log('   • 7 departments');
    console.log('   • 4 roles');
    console.log('   • 13 permissions');

  } catch (error) {
    console.error('❌ Error setting up team tables:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function setupTeamTablesDirect() {
  console.log('🚀 Setting up Team Management tables (direct method)...\n');

  try {
    // Create team_members table
    console.log('📝 Creating team_members table...');
    const { error: membersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'analyst', 'support')),
          department VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
          join_date DATE NOT NULL,
          last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          permissions TEXT[] DEFAULT '{}',
          avatar_url VARCHAR(500),
          bio TEXT,
          skills TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (membersError) {
      console.log('⚠️  team_members table:', membersError.message);
    } else {
      console.log('✅ team_members table created');
    }

    // Create team_departments table
    console.log('📝 Creating team_departments table...');
    const { error: deptError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_departments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          manager_id UUID REFERENCES team_members(id),
          color VARCHAR(7) DEFAULT '#3B82F6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (deptError) {
      console.log('⚠️  team_departments table:', deptError.message);
    } else {
      console.log('✅ team_departments table created');
    }

    // Create team_roles table
    console.log('📝 Creating team_roles table...');
    const { error: rolesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_roles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          permissions TEXT[] DEFAULT '{}',
          level INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (rolesError) {
      console.log('⚠️  team_roles table:', rolesError.message);
    } else {
      console.log('✅ team_roles table created');
    }

    // Create team_activity_log table
    console.log('📝 Creating team_activity_log table...');
    const { error: logError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_activity_log (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
          action VARCHAR(100) NOT NULL,
          description TEXT,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (logError) {
      console.log('⚠️  team_activity_log table:', logError.message);
    } else {
      console.log('✅ team_activity_log table created');
    }

    // Create team_permissions table
    console.log('📝 Creating team_permissions table...');
    const { error: permError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team_permissions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          category VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (permError) {
      console.log('⚠️  team_permissions table:', permError.message);
    } else {
      console.log('✅ team_permissions table created');
    }

    // Insert sample data
    console.log('\n📝 Inserting sample data...');
    
    // Insert departments
    const { error: deptInsertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO team_departments (name, description, color) VALUES
        ('Management', 'Executive and senior management team', '#10B981'),
        ('Operations', 'Day-to-day operations and administration', '#F59E0B'),
        ('Analytics', 'Data analysis and reporting', '#8B5CF6'),
        ('Customer Service', 'Client support and service', '#EF4444'),
        ('IT & Development', 'Technology and development team', '#3B82F6'),
        ('Finance', 'Financial operations and accounting', '#06B6D4'),
        ('Marketing', 'Marketing and communications', '#EC4899')
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (deptInsertError) {
      console.log('⚠️  Departments insert:', deptInsertError.message);
    } else {
      console.log('✅ Sample departments inserted');
    }

    // Insert roles
    const { error: rolesInsertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO team_roles (name, description, permissions, level) VALUES
        ('admin', 'Full system administrator with all permissions', 
         ARRAY['full_access', 'user_management', 'analytics', 'content', 'team_management', 'settings', 'payments'], 1),
        ('manager', 'Department manager with limited administrative access', 
         ARRAY['analytics', 'content', 'team_view', 'reports', 'user_view'], 2),
        ('analyst', 'Data analyst with analytics and reporting access', 
         ARRAY['analytics', 'reports', 'data_export'], 3),
        ('support', 'Customer support with limited access', 
         ARRAY['support', 'user_view', 'ticket_management'], 4)
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (rolesInsertError) {
      console.log('⚠️  Roles insert:', rolesInsertError.message);
    } else {
      console.log('✅ Sample roles inserted');
    }

    // Insert permissions
    const { error: permInsertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO team_permissions (name, description, category) VALUES
        ('full_access', 'Full system access', 'system'),
        ('user_management', 'Manage users and accounts', 'users'),
        ('analytics', 'Access to analytics and reports', 'analytics'),
        ('content', 'Manage content and media', 'content'),
        ('team_management', 'Manage team members', 'team'),
        ('settings', 'Access to system settings', 'system'),
        ('payments', 'Manage payments and transactions', 'finance'),
        ('reports', 'Generate and view reports', 'analytics'),
        ('data_export', 'Export data and reports', 'analytics'),
        ('support', 'Access to support tools', 'support'),
        ('user_view', 'View user information', 'users'),
        ('ticket_management', 'Manage support tickets', 'support'),
        ('team_view', 'View team information', 'team')
        ON CONFLICT (name) DO NOTHING;
      `
    });

    if (permInsertError) {
      console.log('⚠️  Permissions insert:', permInsertError.message);
    } else {
      console.log('✅ Sample permissions inserted');
    }

    // Insert team members
    const { error: membersInsertError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO team_members (name, email, phone, role, department, status, join_date, permissions, bio, skills) VALUES
        (
            'John Smith',
            'john.smith@glgcapitalgroupllc.com',
            '+1 786 798 8311',
            'admin',
            'Management',
            'active',
            '2023-01-15',
            ARRAY['full_access', 'user_management', 'analytics', 'content'],
            'Senior executive with over 15 years of experience in financial services and investment management.',
            ARRAY['Leadership', 'Strategic Planning', 'Financial Analysis', 'Team Management']
        ),
        (
            'Maria Garcia',
            'maria.garcia@glgcapitalgroupllc.com',
            '+1 786 798 8312',
            'manager',
            'Operations',
            'active',
            '2023-03-20',
            ARRAY['analytics', 'content', 'team_view'],
            'Operations manager specializing in process optimization and team coordination.',
            ARRAY['Operations Management', 'Process Optimization', 'Team Leadership', 'Project Management']
        ),
        (
            'David Chen',
            'david.chen@glgcapitalgroupllc.com',
            '+1 786 798 8313',
            'analyst',
            'Analytics',
            'active',
            '2023-06-10',
            ARRAY['analytics', 'reports'],
            'Data analyst with expertise in financial modeling and market analysis.',
            ARRAY['Data Analysis', 'Financial Modeling', 'Market Research', 'Statistical Analysis']
        ),
        (
            'Sarah Johnson',
            'sarah.johnson@glgcapitalgroupllc.com',
            '+1 786 798 8314',
            'support',
            'Customer Service',
            'inactive',
            '2023-02-28',
            ARRAY['support', 'user_view'],
            'Customer service specialist with strong communication skills.',
            ARRAY['Customer Service', 'Communication', 'Problem Solving', 'Client Relations']
        ),
        (
            'Michael Brown',
            'michael.brown@glgcapitalgroupllc.com',
            '+1 786 798 8315',
            'manager',
            'IT & Development',
            'active',
            '2023-04-15',
            ARRAY['analytics', 'content', 'team_view', 'settings'],
            'IT manager with expertise in system administration and development.',
            ARRAY['System Administration', 'Software Development', 'IT Management', 'Cybersecurity']
        ),
        (
            'Lisa Wang',
            'lisa.wang@glgcapitalgroupllc.com',
            '+1 786 798 8316',
            'analyst',
            'Finance',
            'active',
            '2023-07-01',
            ARRAY['analytics', 'reports', 'data_export'],
            'Financial analyst specializing in investment analysis and portfolio management.',
            ARRAY['Financial Analysis', 'Portfolio Management', 'Investment Research', 'Risk Assessment']
        )
        ON CONFLICT (email) DO NOTHING;
      `
    });

    if (membersInsertError) {
      console.log('⚠️  Team members insert:', membersInsertError.message);
    } else {
      console.log('✅ Sample team members inserted');
    }

    console.log('\n🎉 Team Management tables setup completed!');
    console.log('\n📊 Tables created:');
    console.log('   • team_members');
    console.log('   • team_departments');
    console.log('   • team_roles');
    console.log('   • team_activity_log');
    console.log('   • team_permissions');
    
    console.log('\n📋 Sample data inserted:');
    console.log('   • 6 team members');
    console.log('   • 7 departments');
    console.log('   • 4 roles');
    console.log('   • 13 permissions');

  } catch (error) {
    console.error('❌ Error setting up team tables:', error);
    process.exit(1);
  }
}

// Run the setup
setupTeamTablesDirect(); 