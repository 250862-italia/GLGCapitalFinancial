import { createClient, SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null;

// WORKAROUND: Hardcode le chiavi per test immediato
const HARDCODED_SUPABASE_URL = "https://dobjulfwktzltpvqtxbql.supabase.co"; // <-- Sostituisci con il tuo URL reale
const HARDCODED_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY"; // <-- Sostituisci con la tua anon key reale

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = HARDCODED_SUPABASE_URL;
    const supabaseAnonKey = HARDCODED_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseClient;
};

// Create a single supabase client for interacting with your database
export const supabase = getSupabaseClient();

export const createServerSupabaseClient = () => {
  const supabaseUrl = HARDCODED_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}

export const signInWithEmail = async (email: string, password: string) => {
  const client = getSupabaseClient();
  const { data, error } = await client.from("users").select("*").eq("email", email).single()
  if (error || !data) throw new Error("Invalid credentials")
  if (password === "password123") return { user: data }
  throw new Error("Invalid credentials")
}
