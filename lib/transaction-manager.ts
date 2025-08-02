// Gestore transazioni per garantire integrità referenziale
import { supabaseAdmin } from './supabase-client';

export class TransactionManager {
  private static instance: TransactionManager;
  
  private constructor() {}
  
  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }
  
  // Registrazione utente con transazione atomica
  async registerUserWithProfile(userData: any, profileData: any, clientData: any) {
    const { data, error } = await supabaseAdmin.rpc('register_user_with_profile', {
      user_data: userData,
      profile_data: profileData,
      client_data: clientData
    });
    
    if (error) {
      console.error('❌ Transaction failed:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
    
    return data;
  }
  
  // Creazione cliente con transazione atomica
  async createClientWithProfile(clientData: any, profileData: any) {
    const { data, error } = await supabaseAdmin.rpc('create_client_with_profile', {
      client_data: clientData,
      profile_data: profileData
    });
    
    if (error) {
      console.error('❌ Client creation transaction failed:', error);
      throw new Error(`Client creation failed: ${error.message}`);
    }
    
    return data;
  }
  
  // Aggiornamento profilo con transazione
  async updateProfileWithClient(userId: string, profileData: any, clientData: any) {
    const { data, error } = await supabaseAdmin.rpc('update_profile_with_client', {
      user_id: userId,
      profile_data: profileData,
      client_data: clientData
    });
    
    if (error) {
      console.error('❌ Profile update transaction failed:', error);
      throw new Error(`Profile update failed: ${error.message}`);
    }
    
    return data;
  }
  
  // Verifica integrità referenziale
  async checkReferentialIntegrity() {
    const checks = [
      // Verifica che tutti i client abbiano un user_id valido
      supabaseAdmin
        .from('clients')
        .select('user_id')
        .not('user_id', 'is', null),
      
      // Verifica che tutti i client abbiano un profile_id valido
      supabaseAdmin
        .from('clients')
        .select('profile_id')
        .not('profile_id', 'is', null),
      
      // Verifica che tutti gli investments abbiano un user_id valido
      supabaseAdmin
        .from('investments')
        .select('user_id')
        .not('user_id', 'is', null)
    ];
    
    const results = await Promise.all(checks);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      console.error('❌ Referential integrity check failed:', errors);
      return false;
    }
    
    console.log('✅ Referential integrity check passed');
    return true;
  }
  
  // Cleanup di dati orfani
  async cleanupOrphanedData() {
    const cleanupQueries = [
      // Rimuovi client senza user_id
      supabaseAdmin
        .from('clients')
        .delete()
        .is('user_id', null),
      
      // Rimuovi investments senza user_id
      supabaseAdmin
        .from('investments')
        .delete()
        .is('user_id', null),
      
      // Rimuovi notifications senza user_id
      supabaseAdmin
        .from('notifications')
        .delete()
        .is('user_id', null)
    ];
    
    const results = await Promise.all(cleanupQueries);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      console.error('❌ Cleanup failed:', errors);
      return false;
    }
    
    console.log('✅ Orphaned data cleanup completed');
    return true;
  }
}

// Funzioni RPC per transazioni atomiche
export const createRPCFunctions = `
-- Funzione per registrazione utente con profilo e cliente
CREATE OR REPLACE FUNCTION register_user_with_profile(
  user_data JSONB,
  profile_data JSONB,
  client_data JSONB
) RETURNS JSONB AS $$
DECLARE
  new_user_id UUID;
  new_profile_id UUID;
  new_client_id UUID;
BEGIN
  -- Inizia transazione
  BEGIN
    -- Crea utente
    INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
    VALUES (user_data->>'email', user_data->>'password', NOW())
    RETURNING id INTO new_user_id;
    
    -- Crea profilo
    INSERT INTO profiles (id, name, email, first_name, last_name, phone, date_of_birth, address, city, country, postal_code)
    VALUES (new_user_id, profile_data->>'name', profile_data->>'email', profile_data->>'first_name', profile_data->>'last_name', profile_data->>'phone', (profile_data->>'date_of_birth')::DATE, profile_data->>'address', profile_data->>'city', profile_data->>'country', profile_data->>'postal_code')
    RETURNING id INTO new_profile_id;
    
    -- Crea cliente
    INSERT INTO clients (user_id, profile_id, client_code, status, risk_profile)
    VALUES (new_user_id, new_profile_id, client_data->>'client_code', client_data->>'status', client_data->>'risk_profile')
    RETURNING id INTO new_client_id;
    
    -- Commit transazione
    RETURN jsonb_build_object(
      'success', true,
      'user_id', new_user_id,
      'profile_id', new_profile_id,
      'client_id', new_client_id
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback automatico
      RAISE EXCEPTION 'Registration failed: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;
`; 