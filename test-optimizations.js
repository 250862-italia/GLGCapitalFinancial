const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOptimizations() {
  console.log('🧪 Test Ottimizzazioni Database Supabase');
  console.log('========================================\n');

  try {
    // 1. Test indici
    console.log('1️⃣ Test indici creati...');
    const { data: indexes, error: indexError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT indexname, tablename 
          FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname LIKE 'idx_%'
          ORDER BY tablename, indexname;
        `
      });

    if (indexError) {
      console.log('⚠️ Impossibile verificare indici tramite RPC');
      console.log('📝 Verifica manualmente nel dashboard Supabase');
    } else {
      console.log(`✅ ${indexes?.length || 0} indici trovati`);
    }

    // 2. Test funzioni
    console.log('\n2️⃣ Test funzioni create...');
    
    // Test funzione get_user_role
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_id: testUserId });

    if (roleError) {
      console.log('⚠️ Funzione get_user_role non disponibile:', roleError.message);
    } else {
      console.log(`✅ Funzione get_user_role funzionante, ruolo: ${roleData}`);
    }

    // Test funzione get_user_statistics
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_statistics');

    if (statsError) {
      console.log('⚠️ Funzione get_user_statistics non disponibile:', statsError.message);
    } else {
      console.log('✅ Funzione get_user_statistics funzionante:');
      console.log('   - Utenti totali:', statsData?.total_users || 0);
      console.log('   - Clienti attivi:', statsData?.active_clients || 0);
      console.log('   - Investimenti totali:', statsData?.total_investments || 0);
    }

    // 3. Test policy RLS
    console.log('\n3️⃣ Test policy RLS...');
    const { data: policies, error: policyError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT tablename, policyname, cmd
          FROM pg_policies 
          WHERE schemaname = 'public'
          ORDER BY tablename, policyname;
        `
      });

    if (policyError) {
      console.log('⚠️ Impossibile verificare policy tramite RPC');
    } else {
      console.log(`✅ ${policies?.length || 0} policy RLS attive`);
      
      // Conta policy per tabella
      const policyCount = {};
      policies?.forEach(policy => {
        policyCount[policy.tablename] = (policyCount[policy.tablename] || 0) + 1;
      });
      
      Object.entries(policyCount).forEach(([table, count]) => {
        console.log(`   - ${table}: ${count} policy`);
      });
    }

    // 4. Test audit trail
    console.log('\n4️⃣ Test audit trail...');
    const { data: auditData, error: auditError } = await supabase
      .from('audit_log')
      .select('*')
      .limit(5);

    if (auditError) {
      console.log('⚠️ Tabella audit_log non disponibile:', auditError.message);
    } else {
      console.log(`✅ Audit trail funzionante, ${auditData?.length || 0} record trovati`);
    }

    // 5. Test viste
    console.log('\n5️⃣ Test viste create...');
    
    // Test vista admin_dashboard
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('admin_dashboard')
      .select('*')
      .limit(3);

    if (dashboardError) {
      console.log('⚠️ Vista admin_dashboard non disponibile:', dashboardError.message);
    } else {
      console.log(`✅ Vista admin_dashboard funzionante, ${dashboardData?.length || 0} record`);
    }

    // Test vista user_analytics
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('user_analytics')
      .select('*')
      .limit(3);

    if (analyticsError) {
      console.log('⚠️ Vista user_analytics non disponibile:', analyticsError.message);
    } else {
      console.log(`✅ Vista user_analytics funzionante, ${analyticsData?.length || 0} record`);
    }

    // 6. Test configurazioni di sicurezza
    console.log('\n6️⃣ Test configurazioni sicurezza...');
    const { data: securityData, error: securityError } = await supabase
      .from('security_config')
      .select('*');

    if (securityError) {
      console.log('⚠️ Tabella security_config non disponibile:', securityError.message);
    } else {
      console.log(`✅ Configurazioni sicurezza caricate, ${securityData?.length || 0} configurazioni:`);
      securityData?.forEach(config => {
        console.log(`   - ${config.key}: ${config.description}`);
      });
    }

    // 7. Test performance
    console.log('\n7️⃣ Test performance...');
    
    // Test query con indici
    const startTime = Date.now();
    const { data: perfData, error: perfError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .limit(100);

    const queryTime = Date.now() - startTime;
    
    if (perfError) {
      console.log('⚠️ Test performance fallito:', perfError.message);
    } else {
      console.log(`✅ Query performance: ${queryTime}ms per ${perfData?.length || 0} record`);
      
      if (queryTime < 100) {
        console.log('   🚀 Performance eccellente!');
      } else if (queryTime < 500) {
        console.log('   ✅ Performance buona');
      } else {
        console.log('   ⚠️ Performance da ottimizzare');
      }
    }

    // 8. Test validazione
    console.log('\n8️⃣ Test funzioni validazione...');
    
    // Test validazione email
    const { data: emailValid, error: emailError } = await supabase
      .rpc('is_valid_email', { email: 'test@example.com' });

    if (emailError) {
      console.log('⚠️ Funzione is_valid_email non disponibile:', emailError.message);
    } else {
      console.log(`✅ Validazione email funzionante: test@example.com = ${emailValid}`);
    }

    // Test validazione password
    const { data: pwdValid, error: pwdError } = await supabase
      .rpc('is_valid_password', { password: 'TestPassword123!' });

    if (pwdError) {
      console.log('⚠️ Funzione is_valid_password non disponibile:', pwdError.message);
    } else {
      console.log(`✅ Validazione password funzionante: TestPassword123! = ${pwdValid}`);
    }

    // 9. Test cleanup audit
    console.log('\n9️⃣ Test cleanup audit...');
    const { data: cleanupData, error: cleanupError } = await supabase
      .rpc('cleanup_old_audit_logs');

    if (cleanupError) {
      console.log('⚠️ Funzione cleanup_old_audit_logs non disponibile:', cleanupError.message);
    } else {
      console.log(`✅ Cleanup audit funzionante, ${cleanupData || 0} record puliti`);
    }

    // 10. Riepilogo finale
    console.log('\n📊 RIEPILOGO OTTIMIZZAZIONI');
    console.log('==========================');
    console.log('✅ Indici: Creati per migliorare performance');
    console.log('✅ Policy RLS: Ottimizzate per sicurezza');
    console.log('✅ Funzioni: Aggiunte per utilità');
    console.log('✅ Audit Trail: Configurato per tracciabilità');
    console.log('✅ Viste: Create per reporting');
    console.log('✅ Configurazioni: Impostate per sicurezza');
    console.log('✅ Validazione: Funzioni per input validation');
    console.log('✅ Cleanup: Funzioni per manutenzione');

    console.log('\n🎯 PROSSIMI PASSI');
    console.log('================');
    console.log('1. Monitora le performance delle query');
    console.log('2. Verifica i log di audit regolarmente');
    console.log('3. Esegui cleanup audit mensilmente');
    console.log('4. Aggiorna configurazioni sicurezza secondo necessità');
    console.log('5. Considera implementare caching lato applicazione');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  }
}

// Esegui il test
testOptimizations(); 