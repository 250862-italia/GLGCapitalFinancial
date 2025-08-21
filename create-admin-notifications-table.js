const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://glgcapitalgroup.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZ2NhcGl0YWxncm91cCIsInNvY2V0IjoiYWRtaW4iLCJpYXQiOjE3NTU3ODQ5MzMsImV4cCI6MjA3MTM2MDkzM30.LVcpnV2cJb_xkhtBBMClpmuLWvW1OkOq9_fD4PZISHI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminNotificationsTable() {
  console.log('🏗️ Creazione tabella admin_notifications...');

  try {
    // 1. Crea la tabella admin_notifications
    console.log('📋 Creazione struttura tabella...');
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS admin_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN ('package_update', 'package_create', 'package_delete', 'investment_request', 'client_update')),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          read BOOLEAN DEFAULT FALSE,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('❌ Errore nella creazione tabella:', createError);
      return;
    }

    console.log('✅ Tabella admin_notifications creata con successo');

    // 2. Crea indici per performance
    console.log('📊 Creazione indici...');
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
        CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
        CREATE INDEX IF NOT EXISTS idx_admin_notifications_timestamp ON admin_notifications(timestamp);
        CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at);
      `
    });

    if (indexError) {
      console.log('⚠️ Errore nella creazione indici (non critico):', indexError);
    } else {
      console.log('✅ Indici creati con successo');
    }

    // 3. Abilita RLS e crea policy
    console.log('🔒 Configurazione RLS e policy...');
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Admin can manage all notifications" ON admin_notifications;
        CREATE POLICY "Admin can manage all notifications" ON admin_notifications
          FOR ALL USING (true);
      `
    });

    if (rlsError) {
      console.log('⚠️ Errore nella configurazione RLS (non critico):', rlsError);
    } else {
      console.log('✅ RLS e policy configurati con successo');
    }

    // 4. Inserisce notifiche di esempio
    console.log('📝 Inserimento notifiche di esempio...');
    
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO admin_notifications (
          type,
          title,
          message,
          timestamp,
          read,
          data
        ) VALUES 
        (
          'package_update',
          'Pacchetto Aggiornato',
          'Il pacchetto "Premium Plus" è stato aggiornato dall''amministratore',
          NOW() - INTERVAL '1 hour',
          false,
          '{"package_id": "1", "package_name": "Premium Plus", "changes": {"expected_return": 12.5, "risk_level": "medium"}}'
        ),
        (
          'investment_request',
          'Nuova Richiesta di Investimento',
          'Mario Rossi ha richiesto di investire €25,000 nel Pacchetto Premium',
          NOW() - INTERVAL '30 minutes',
          false,
          '{"client_name": "Mario Rossi", "client_email": "mario.rossi@example.com", "amount": 25000, "package_name": "Pacchetto Premium"}'
        ),
        (
          'client_update',
          'Cliente Aggiornato',
          'Il profilo di Mario Rossi è stato aggiornato',
          NOW() - INTERVAL '15 minutes',
          true,
          '{"client_id": "temp-client-1", "client_name": "Mario Rossi", "changes": ["email", "phone"]}'
        )
        ON CONFLICT DO NOTHING;
      `
    });

    if (insertError) {
      console.log('⚠️ Errore nell\'inserimento notifiche (non critico):', insertError);
    } else {
      console.log('✅ Notifiche di esempio inserite con successo');
    }

    // 5. Verifica la creazione
    console.log('🔍 Verifica finale...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('admin_notifications')
      .select('*');

    if (verifyError) {
      console.error('❌ Errore nella verifica:', verifyError);
    } else {
      console.log('✅ Verifica completata con successo');
      console.log('📊 Dati nella tabella:', {
        total: verifyData?.length || 0,
        unread: verifyData?.filter(n => !n.read).length || 0,
        read: verifyData?.filter(n => n.read).length || 0
      });
      
      if (verifyData && verifyData.length > 0) {
        console.log('📝 Prima notifica:', verifyData[0]);
      }
    }

    console.log('🎉 Tabella admin_notifications creata e popolata con successo!');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

createAdminNotificationsTable();
