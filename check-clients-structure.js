import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verifica Struttura Tabella Clients');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkClientsStructure() {
  try {
    console.log('\n📋 1. Struttura Completa Tabella Clients...');
    
    // Get all columns from clients table
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'clients' });
    
    if (columnsError) {
      console.log('⚠️ Funzione get_table_columns non disponibile, uso metodo alternativo...');
      
      // Alternative: get one record and check its structure
      const { data: sampleClient, error: sampleError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Errore accesso clients:', sampleError.message);
        return;
      }
      
      if (sampleClient && sampleClient.length > 0) {
        const clientColumns = Object.keys(sampleClient[0]);
        console.log('✅ Colonne disponibili:');
        clientColumns.forEach((col, index) => {
          console.log(`   ${index + 1}. ${col}`);
        });
        
        // Check for email-related columns
        const emailColumns = clientColumns.filter(col => 
          col.toLowerCase().includes('email') || 
          col.toLowerCase().includes('mail')
        );
        
        if (emailColumns.length > 0) {
          console.log('\n📧 Colonne email trovate:', emailColumns);
        } else {
          console.log('\n⚠️ Nessuna colonna email trovata');
        }
        
        // Check for user identification columns
        const userColumns = clientColumns.filter(col => 
          col.toLowerCase().includes('user') || 
          col.toLowerCase().includes('id')
        );
        
        console.log('\n👤 Colonne utente:', userColumns);
        
      } else {
        console.log('⚠️ Nessun record nella tabella clients');
      }
    } else {
      console.log('✅ Colonne dalla funzione:', columns);
    }
    
    console.log('\n📋 2. Verifica Relazione con Profiles...');
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .limit(3);
    
    if (profilesError) {
      console.error('❌ Errore accesso profiles:', profilesError.message);
    } else {
      console.log(`✅ ${profiles.length} profili trovati`);
      if (profiles.length > 0) {
        console.log('   Esempi:', profiles.map(p => `${p.first_name} ${p.last_name} (${p.email})`));
      }
    }
    
    console.log('\n📋 3. Verifica Relazione Clients-Profiles...');
    
    // Check relationship between clients and profiles
    const { data: clientsWithProfiles, error: relationError } = await supabase
      .from('clients')
      .select(`
        id,
        user_id,
        profile_id,
        first_name,
        last_name,
        status,
        profiles!inner(id, email, first_name, last_name)
      `)
      .limit(3);
    
    if (relationError) {
      console.error('❌ Errore relazione clients-profiles:', relationError.message);
    } else {
      console.log(`✅ ${clientsWithProfiles.length} clienti con profili trovati`);
      if (clientsWithProfiles.length > 0) {
        clientsWithProfiles.forEach(client => {
          console.log(`   Cliente: ${client.first_name} ${client.last_name}`);
          console.log(`   Profilo: ${client.profiles.email}`);
          console.log(`   User ID: ${client.user_id}`);
          console.log(`   Profile ID: ${client.profile_id}`);
          console.log('   ---');
        });
      }
    }
    
    console.log('\n📋 4. Test Query Corretta...');
    
    // Test correct query for clients
    const { data: correctClients, error: correctError } = await supabase
      .from('clients')
      .select(`
        id,
        user_id,
        profile_id,
        first_name,
        last_name,
        status,
        address,
        phone,
        account_holder,
        kyc_status
      `)
      .limit(3);
    
    if (correctError) {
      console.error('❌ Errore query corretta:', correctError.message);
    } else {
      console.log(`✅ ${correctClients.length} clienti recuperati correttamente`);
      if (correctClients.length > 0) {
        console.log('   Esempi:', correctClients.map(c => `${c.first_name} ${c.last_name} (${c.status})`));
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Run the check
checkClientsStructure(); 