require('dotenv').config({ path: '.env.local' });

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Aggiornamento pacchetti...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dati dei pacchetti da aggiornare
const packagesToUpdate = [
  {
    name: 'Starter Package',
    description: 'Perfetto per iniziare il tuo percorso di investimento',
    min_investment: 1000,
    max_investment: 5000,
    duration: 90,
    expected_return: 8.5,
    status: 'active'
  },
  {
    name: 'Elite Package',
    description: 'Il nostro pacchetto più popolare per investitori intermedi',
    min_investment: 25000,
    max_investment: 100000,
    duration: 180,
    expected_return: 12.0,
    status: 'active'
  },
  {
    name: 'Premium Package',
    description: 'Per investitori esperti con capitale elevato',
    min_investment: 50000,
    max_investment: 500000,
    duration: 365,
    expected_return: 15.5,
    status: 'active'
  }
];

async function updatePackages() {
  try {
    console.log('🔍 Recupero pacchetti esistenti...');
    
    const { data: existingPackages, error: fetchError } = await supabase
      .from('packages')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Errore nel recupero pacchetti:', fetchError.message);
      return false;
    }
    
    console.log(`📊 Trovati ${existingPackages?.length || 0} pacchetti esistenti`);
    
    // Aggiorna ogni pacchetto esistente
    for (const existingPkg of existingPackages || []) {
      const updateData = packagesToUpdate.find(p => p.name === existingPkg.name);
      
      if (updateData) {
        console.log(`🔄 Aggiornamento pacchetto: ${existingPkg.name}`);
        
        const { error: updateError } = await supabase
          .from('packages')
          .update({
            description: updateData.description,
            min_investment: updateData.min_investment,
            max_investment: updateData.max_investment,
            duration: updateData.duration,
            expected_return: updateData.expected_return,
            status: updateData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPkg.id);
        
        if (updateError) {
          console.error(`❌ Errore aggiornamento ${existingPkg.name}:`, updateError.message);
        } else {
          console.log(`✅ Aggiornato: ${existingPkg.name}`);
        }
      } else {
        console.log(`⚠️  Nessun aggiornamento trovato per: ${existingPkg.name}`);
      }
    }
    
    // Verifica finale
    console.log('🔍 Verifica finale...');
    const { data: finalPackages, error: finalError } = await supabase
      .from('packages')
      .select('*')
      .order('min_investment', { ascending: true });
    
    if (finalError) {
      console.error('❌ Errore verifica finale:', finalError.message);
      return false;
    }
    
    console.log('✅ Pacchetti aggiornati con successo!');
    console.log('📋 Stato finale:');
    finalPackages?.forEach((pkg, index) => {
      console.log(`  ${index + 1}. ${pkg.name}`);
      console.log(`     Min: €${pkg.min_investment?.toLocaleString()}`);
      console.log(`     Max: €${pkg.max_investment?.toLocaleString()}`);
      console.log(`     Durata: ${pkg.duration} giorni`);
      console.log(`     Rendimento: ${pkg.expected_return}%`);
      console.log(`     Stato: ${pkg.status}`);
      console.log('');
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error.message);
    return false;
  }
}

updatePackages().then(success => {
  process.exit(success ? 0 : 1);
}); 