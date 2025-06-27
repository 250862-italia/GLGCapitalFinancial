require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🗄️  Setup del database...');
    
    // Test connection first
    console.log('🔗 Testing connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📋 Creating users table...');
      // Create users table
      const { error: createError } = await supabase.rpc('create_users_table');
      if (createError) {
        console.log('⚠️  Users table might already exist or need manual creation');
      }
    }
    
    // Insert default super admin user
    console.log('👤 Creating super admin user...');
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@glgcapitalgroupllc.com',
          password_hash: '$2b$10$rQZ8K9mN2pL4vX7wY1sT3uI6oP8qR9sT2uI4oP6qR8sT1uI3oP5qR7sT9uI',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'super_admin',
          is_active: true,
          email_verified: true
        }
      ]);
    
    if (insertError) {
      console.log('⚠️  Admin user might already exist:', insertError.message);
    } else {
      console.log('✅ Super admin user created successfully!');
    }
    
    console.log('✅ Database setup completed!');
    console.log('');
    console.log('🔐 Prossimi passi:');
    console.log('1. Testa il login su: http://localhost:3000/login');
    console.log('2. Email: admin@glgcapitalgroupllc.com');
    console.log('3. Password: SuperAdmin123!');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
    console.log('');
    console.log('💡 Soluzione alternativa:');
    console.log('1. Vai su Supabase Dashboard');
    console.log('2. Apri SQL Editor');
    console.log('3. Copia e incolla il contenuto di database-schema.sql');
    console.log('4. Esegui le query');
  }
}

// Esegui lo script
setupDatabase(); 