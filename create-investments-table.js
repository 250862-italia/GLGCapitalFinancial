const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://glgcapitalgroup.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZ2NhcGl0YWxncm91cCIsInNvY2V0IjoiYWRtaW4iLCJpYXQiOjE3NTU3ODQ5MzMsImV4cCI6MjA3MTM2MDkzM30.LVcpnV2cJb_xkhtBBMClpmuLWvW1OkOq9_fD4PZISHI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createInvestmentsTable() {
  console.log('🏗️ Creazione tabella investments...');
  
  try {
    // 1. Crea la tabella investments
    console.log('\n1️⃣ Creazione tabella investments...');
    const { data: createResult, error: createError } = await supabase
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS investments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id TEXT NOT NULL,
            package_id TEXT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
            start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            end_date TIMESTAMP WITH TIME ZONE,
            expected_return DECIMAL(5,2) NOT NULL,
            actual_return DECIMAL(5,2) DEFAULT 0,
            total_returns DECIMAL(15,2) DEFAULT 0,
            daily_returns DECIMAL(15,2) DEFAULT 0,
            monthly_returns DECIMAL(15,2) DEFAULT 0,
            fees_paid DECIMAL(15,2) DEFAULT 0,
            payment_method TEXT,
            transaction_id TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
    
    if (createError) {
      console.log('⚠️ Errore creazione tabella (potrebbe già esistere):', createError);
    } else {
      console.log('✅ Tabella investments creata o già esistente');
    }
    
    // 2. Inserisce i dati di test
    console.log('\n2️⃣ Inserimento dati di test...');
    
    // Investimento esistente di €5,000
    const { data: investment1, error: error1 } = await supabase
      .from('investments')
      .insert([{
        client_id: 'temp-client-1',
        package_id: '2',
        amount: 5000,
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        expected_return: 8.5,
        payment_method: 'bank_transfer',
        notes: 'Investimento di test - Mario Rossi'
      }])
      .select()
      .single();
    
    if (error1) {
      if (error1.code === '23505') { // Duplicate key
        console.log('ℹ️ Investimento €5,000 già esistente');
      } else {
        console.error('❌ Errore inserimento investimento €5,000:', error1);
      }
    } else {
      console.log('✅ Investimento €5,000 creato:', investment1.id);
    }
    
    // Nuovo investimento di €100,000
    const { data: investment2, error: error2 } = await supabase
      .from('investments')
      .insert([{
        client_id: 'temp-client-1',
        package_id: '2',
        amount: 100000,
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        expected_return: 8.5,
        payment_method: 'bank_transfer',
        notes: 'Investimento €100,000 - Mario Rossi'
      }])
      .select()
      .single();
    
    if (error2) {
      if (error2.code === '23505') { // Duplicate key
        console.log('ℹ️ Investimento €100,000 già esistente');
      } else {
        console.error('❌ Errore inserimento investimento €100,000:', error2);
      }
    } else {
      console.log('✅ Investimento €100,000 creato:', investment2.id);
    }
    
    // 3. Verifica i dati inseriti
    console.log('\n3️⃣ Verifica dati inseriti...');
    const { data: allInvestments, error: selectError } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (selectError) {
      console.error('❌ Errore nel recupero investimenti:', selectError);
    } else {
      console.log('✅ Totale investimenti nel database:', allInvestments?.length || 0);
      if (allInvestments && allInvestments.length > 0) {
        allInvestments.forEach(inv => {
          console.log(`📊 ID: ${inv.id}, Cliente: ${inv.client_id}, Importo: €${inv.amount}, Status: ${inv.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

createInvestmentsTable();
