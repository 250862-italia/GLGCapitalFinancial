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

console.log('🔍 Verifica Struttura Tabella Investments');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkInvestmentsStructure() {
  try {
    console.log('\n📋 1. Struttura Completa Tabella Investments...');
    
    // Get one record and check its structure
    const { data: sampleInvestment, error: sampleError } = await supabase
      .from('investments')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Errore accesso investments:', sampleError.message);
      return;
    }
    
    if (sampleInvestment && sampleInvestment.length > 0) {
      const investmentColumns = Object.keys(sampleInvestment[0]);
      console.log('✅ Colonne disponibili:');
      investmentColumns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
      
      // Check for client-related columns
      const clientColumns = investmentColumns.filter(col => 
        col.toLowerCase().includes('client') || 
        col.toLowerCase().includes('user')
      );
      
      if (clientColumns.length > 0) {
        console.log('\n👤 Colonne cliente trovate:', clientColumns);
      } else {
        console.log('\n⚠️ Nessuna colonna cliente trovata');
      }
      
      // Check for package-related columns
      const packageColumns = investmentColumns.filter(col => 
        col.toLowerCase().includes('package') || 
        col.toLowerCase().includes('product')
      );
      
      if (packageColumns.length > 0) {
        console.log('\n📦 Colonne pacchetto trovate:', packageColumns);
      } else {
        console.log('\n⚠️ Nessuna colonna pacchetto trovata');
      }
      
      // Check for amount-related columns
      const amountColumns = investmentColumns.filter(col => 
        col.toLowerCase().includes('amount') || 
        col.toLowerCase().includes('value') ||
        col.toLowerCase().includes('return')
      );
      
      console.log('\n💰 Colonne importo/rendimento:', amountColumns);
      
    } else {
      console.log('⚠️ Nessun record nella tabella investments');
    }
    
    console.log('\n📋 2. Dati Esistenti...');
    
    // Check existing investments
    const { data: allInvestments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .limit(5);
    
    if (investmentsError) {
      console.error('❌ Errore lista investments:', investmentsError.message);
    } else {
      console.log(`✅ ${allInvestments.length} investimenti trovati`);
      if (allInvestments.length > 0) {
        allInvestments.forEach(inv => {
          console.log(`   ID: ${inv.id}`);
          console.log(`   Amount: ${inv.amount || 'N/A'}`);
          console.log(`   Status: ${inv.status || 'N/A'}`);
          console.log(`   Start Date: ${inv.start_date || 'N/A'}`);
          console.log('   ---');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Run the check
checkInvestmentsStructure(); 