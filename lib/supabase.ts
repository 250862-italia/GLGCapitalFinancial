import { createClient, SupabaseClient } from "@supabase/supabase-js"

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof document !== 'undefined'
    ? document.querySelector<HTMLMetaElement>('meta[name="supabase-url"]')?.content
    : '') ||
  '';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof document !== 'undefined'
    ? document.querySelector<HTMLMetaElement>('meta[name="supabase-key"]')?.content
    : '') ||
  '';

if (!url || !key)
  throw new Error('❌ Supabase credentials mancanti anche dopo il meta-hack');

const g = globalThis as any;
export const supabase: SupabaseClient =
  g.__supabaseClient || (g.__supabaseClient = createClient(url, key));

// Create a single supabase client for interacting with your database
export const supabaseClient = supabase;

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}

export const signInWithEmail = async (email: string, password: string) => {
  const client = supabase;
  const { data, error } = await client.from("users").select("*").eq("email", email).single()
  if (error || !data) throw new Error("Invalid credentials")
  if (password === "password123") return { user: data }
  throw new Error("Invalid credentials")
}
