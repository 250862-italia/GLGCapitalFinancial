import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase-checkpoints';

// Wrapper per chiamate Supabase sicure
export async function safeSupabaseCall<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: any }> {
  try {
    const client = await getSupabaseClient();
    const result = await operation(client);
    return { data: result, error: null };
  } catch (error) {
    console.log('⚠️ Supabase call failed:', error);
    
    // Se è un errore di rete, restituisci il fallback
    if (error instanceof Error && (
      error.message.includes('fetch failed') ||
      error.message.includes('TypeError: fetch failed') ||
      error.message.includes('Network error')
    )) {
      console.log('⚠️ Network error detected, using fallback');
      return { data: fallback || null, error: 'NETWORK_ERROR' };
    }
    
    return { data: null, error };
  }
}

// Wrapper specifico per query di database
export async function safeDatabaseQuery<T>(
  table: string,
  query: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  fallback?: T
): Promise<{ data: T | null; error: any }> {
  try {
    const client = await getSupabaseClient();
    const result = await query(client);
    
    if (result.error) {
      console.log(`⚠️ Database query error for ${table}:`, result.error);
      
      // Se è un errore di rete, restituisci il fallback
      if (result.error.message && (
        result.error.message.includes('fetch failed') ||
        result.error.message.includes('TypeError: fetch failed') ||
        result.error.message.includes('Network error')
      )) {
        console.log(`⚠️ Network error for ${table}, using fallback`);
        return { data: fallback || null, error: 'NETWORK_ERROR' };
      }
    }
    
    return result;
  } catch (error) {
    console.log(`⚠️ Database query exception for ${table}:`, error);
    
    if (error instanceof Error && (
      error.message.includes('fetch failed') ||
      error.message.includes('TypeError: fetch failed') ||
      error.message.includes('Network error')
    )) {
      console.log(`⚠️ Network error for ${table}, using fallback`);
      return { data: fallback || null, error: 'NETWORK_ERROR' };
    }
    
    return { data: null, error };
  }
}

// Wrapper per autenticazione
export async function safeAuthCall<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: any }> {
  try {
    const client = await getSupabaseClient();
    const result = await operation(client);
    return { data: result, error: null };
  } catch (error) {
    console.log('⚠️ Auth call failed:', error);
    
    if (error instanceof Error && (
      error.message.includes('fetch failed') ||
      error.message.includes('TypeError: fetch failed') ||
      error.message.includes('Network error')
    )) {
      console.log('⚠️ Network error in auth, using fallback');
      return { data: fallback || null, error: 'NETWORK_ERROR' };
    }
    
    return { data: null, error };
  }
} 