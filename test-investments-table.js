const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://glgcapitalgroup.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZ2NhcGl0YWxncm91cCIsInNvY2V0IjoiYWRtaW4iLCJpYXQiOjE3NTU3ODQ5MzMsImV4cCI6MjA3MTM2MDkzM30.LVcpnV2cJb_xkhtBBMClpmuLWvW1OkOq9_fD4PZISHI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInvestmentsTable() {
  console.log('🧪 Test accesso tabella investments...');
  
  try {
    // Test 1: Verifica se la tabella esiste
    console.log('\n1️⃣ Test esistenza tabella...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Errore nel recupero tabelle:', tablesError);
    } else {
      console.log('✅ Tabelle disponibili:', tables.map(t => t.table_name));
      const hasInvestments = tables.some(t => t.table_name === 'investments');
      console.log('📊 Tabella investments presente:', hasInvestments);
    }
    
    // Test 2: Prova a leggere dalla tabella investments
    console.log('\n2️⃣ Test lettura tabella investments...');
    const { data: investments, error: investmentsError } = await supabase
      .from('investments')
      .select('*')
      .limit(5);
    
    if (investmentsError) {
      console.error('❌ Errore nel recupero investimenti:', investmentsError);
    } else {
      console.log('✅ Investimenti recuperati:', investments?.length || 0);
      if (investments && investments.length > 0) {
        console.log('📋 Primo investimento:', investments[0]);
      }
    }
    
    // Test 3: Prova a creare un investimento di test
    console.log('\n3️⃣ Test creazione investimento...');
    const testInvestment = {
      client_id: 'temp-client-1',
      package_id: '2',
      amount: 100000,
      status: 'pending',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      expected_return: 8.5,
      actual_return: 0,
      total_returns: 0,
      daily_returns: 0,
      monthly_returns: 0,
      fees_paid: 0,
      payment_method: 'bank_transfer',
      notes: 'Test investimento €100,000 - Mario Rossi'
    };
    
    const { data: newInvestment, error: createError } = await supabase
      .from('investments')
      .insert([testInvestment])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Errore nella creazione investimento:', createError);
    } else {
      console.log('✅ Investimento creato con successo:', newInvestment);
      
      // Test 4: Verifica che sia stato creato
      console.log('\n4️⃣ Verifica investimento creato...');
      const { data: verifyInvestment, error: verifyError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', newInvestment.id)
        .single();
      
      if (verifyError) {
        console.error('❌ Errore nella verifica:', verifyError);
      } else {
        console.log('✅ Investimento verificato:', verifyInvestment);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

testInvestmentsTable();
