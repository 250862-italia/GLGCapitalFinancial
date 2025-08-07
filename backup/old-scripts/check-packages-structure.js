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

console.log('🔍 Verifica Struttura Tabella Packages');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkPackagesStructure() {
  try {
    console.log('\n📋 1. Struttura Completa Tabella Packages...');
    
    // Get one record and check its structure
    const { data: samplePackage, error: sampleError } = await supabase
      .from('packages')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Errore accesso packages:', sampleError.message);
      return;
    }
    
    if (samplePackage && samplePackage.length > 0) {
      const packageColumns = Object.keys(samplePackage[0]);
      console.log('✅ Colonne disponibili:');
      packageColumns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
      
      // Check for return-related columns
      const returnColumns = packageColumns.filter(col => 
        col.toLowerCase().includes('return') || 
        col.toLowerCase().includes('yield') ||
        col.toLowerCase().includes('profit')
      );
      
      if (returnColumns.length > 0) {
        console.log('\n📈 Colonne rendimento trovate:', returnColumns);
      } else {
        console.log('\n⚠️ Nessuna colonna rendimento trovata');
      }
      
      // Check for investment-related columns
      const investmentColumns = packageColumns.filter(col => 
        col.toLowerCase().includes('investment') || 
        col.toLowerCase().includes('amount') ||
        col.toLowerCase().includes('min') ||
        col.toLowerCase().includes('max')
      );
      
      console.log('\n💰 Colonne investimento:', investmentColumns);
      
    } else {
      console.log('⚠️ Nessun record nella tabella packages');
    }
    
    console.log('\n📋 2. Dati Esistenti...');
    
    // Check existing packages
    const { data: allPackages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .limit(5);
    
    if (packagesError) {
      console.error('❌ Errore lista packages:', packagesError.message);
    } else {
      console.log(`✅ ${allPackages.length} pacchetti trovati`);
      if (allPackages.length > 0) {
        allPackages.forEach(pkg => {
          console.log(`   ID: ${pkg.id}`);
          console.log(`   Nome: ${pkg.name || 'N/A'}`);
          console.log(`   Min Investment: ${pkg.min_investment || 'N/A'}`);
          console.log(`   Max Investment: ${pkg.max_investment || 'N/A'}`);
          console.log(`   Status: ${pkg.status || 'N/A'}`);
          console.log('   ---');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Run the check
checkPackagesStructure(); 