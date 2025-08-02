// Client Supabase unificato - SINGLE SOURCE OF TRUTH
import { createClient } from '@supabase/supabase-js';

// Configurazione centralizzata
const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaeakwbpiqzhywhlqqse.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key'
};

// Client principale per operazioni utente
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'glg-capital-auth' // Chiave unica per evitare conflitti
    }
  }
);

// Client admin per operazioni server-side
export const supabaseAdmin = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Admin non persiste sessioni
      detectSessionInUrl: false
    }
  }
);

// Funzioni helper per compatibilità
export const createSupabaseClient = () => supabase;
export const createSupabaseAdminClient = () => supabaseAdmin;

// Funzione per ottenere il client appropriato
export function getSupabaseClient(isAdmin = false) {
  return isAdmin ? supabaseAdmin : supabase;
}

// Configurazione per health check
export const SUPABASE_HEALTH_CONFIG = {
  url: SUPABASE_CONFIG.url,
  timeout: 5000,
  retries: 3
};

console.log('🔧 Supabase client unificato configurato:', SUPABASE_CONFIG.url); 