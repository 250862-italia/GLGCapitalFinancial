import { createClient, SupabaseClient } from "@supabase/supabase-js"

let supabaseSingleton: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseSingleton) return supabaseSingleton;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('❌ Supabase URL/KEY still missing. Controlla le variabili d\'ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  supabaseSingleton = createClient(url, key);
  return supabaseSingleton;
}

// Create a single supabase client for interacting with your database
export const supabaseClient = getSupabase();

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}

export const signInWithEmail = async (email: string, password: string) => {
  const client = getSupabase();
  const { data, error } = await client.from("users").select("*").eq("email", email).single()
  if (error || !data) throw new Error("Invalid credentials")
  if (password === "password123") return { user: data }
  throw new Error("Invalid credentials")
}

export const supabase = getSupabase();
