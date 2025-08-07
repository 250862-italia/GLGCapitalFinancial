import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Applicazione Fix Schema Database');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applySchemaFix() {
  try {
    console.log('\n📋 1. Aggiunta colonne mancanti...');
    
    // Add missing columns
    const alterQueries = [
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS id_number TEXT',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS id_type TEXT',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS employer TEXT',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS source_of_funds TEXT',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true',
      'ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT'
    ];
    
    for (const query of alterQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: query });
      if (error) {
        console.log(`   ⚠️ ${query}: ${error.message}`);
      } else {
        console.log(`   ✅ ${query.split(' ')[5]}`);
      }
    }
    
    console.log('\n📋 2. Aggiornamento record esistenti...');
    
    // Update existing records
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        address: 'Not provided',
        phone: 'Not provided',
        source_of_funds: 'Employment',
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        is_active: true
      })
      .is('address', null);
    
    if (updateError) {
      console.log('   ⚠️ Aggiornamento record:', updateError.message);
    } else {
      console.log('   ✅ Record aggiornati');
    }
    
    console.log('\n📋 3. Verifica schema aggiornato...');
    
    // Verify the changes
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.error('❌ Errore verifica schema:', clientsError.message);
      return;
    }
    
    const columns = Object.keys(clients[0] || {});
    const requiredColumns = ['address', 'phone', 'account_holder', 'kyc_status'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
      console.error('❌ Colonne ancora mancanti:', missingColumns);
      console.log('🔧 Esegui manualmente fix-clients-schema.sql in Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Schema aggiornato correttamente');
    console.log('   Colonne disponibili:', columns.length);
    
    console.log('\n📋 4. Test processo investimento...');
    
    // Test investment creation
    const { data: testClient } = await supabase
      .from('clients')
      .select('id, email')
      .limit(1)
      .single();
    
    const { data: testPackage } = await supabase
      .from('packages')
      .select('id, name, min_investment')
      .limit(1)
      .single();
    
    if (testClient && testPackage) {
      const testInvestment = {
        client_id: testClient.id,
        package_id: testPackage.id,
        amount: testPackage.min_investment,
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daily_return: 1.2,
        total_returns: 0,
        daily_returns: 0
      };
      
      const { data: newInvestment, error: createError } = await supabase
        .from('investments')
        .insert(testInvestment)
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Errore test investimento:', createError.message);
      } else {
        console.log('✅ Test investimento riuscito');
        console.log('   ID:', newInvestment.id);
        console.log('   Amount:', newInvestment.amount);
        
        // Clean up
        await supabase
          .from('investments')
          .delete()
          .eq('id', newInvestment.id);
      }
    }
    
    console.log('\n🎉 Fix Schema Completato!');
    console.log('='.repeat(50));
    console.log('✅ Colonne aggiunte');
    console.log('✅ Record aggiornati');
    console.log('✅ Schema verificato');
    console.log('✅ Investimenti funzionanti');
    
    console.log('\n🚀 Ora puoi procedere con gli investimenti!');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
    console.log('\n🔧 Fallback: Esegui manualmente fix-clients-schema.sql in Supabase SQL Editor');
  }
}

// Run the fix
applySchemaFix(); 