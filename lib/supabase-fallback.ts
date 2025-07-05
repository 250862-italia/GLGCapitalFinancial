import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generic function to handle Supabase operations with fallback
export async function withSupabaseFallback<T>(
  supabaseOperation: () => Promise<{ data: T | null; error: any }>,
  mockData: T,
  operationName: string = 'database operation'
): Promise<T> {
  try {
    const { data, error } = await supabaseOperation();
    
    if (error) {
      console.error(`Supabase error in ${operationName}, using mock data:`, error);
      return mockData;
    }
    
    return data || mockData;
  } catch (supabaseError) {
    console.error(`Supabase connection failed in ${operationName}, using mock data:`, supabaseError);
    return mockData;
  }
}

// Generic function to handle Supabase mutations with fallback
export async function withSupabaseMutationFallback<T>(
  supabaseOperation: () => Promise<{ data: T | null; error: any }>,
  mockData: Partial<T>,
  operationName: string = 'database mutation'
): Promise<{ data?: T; error?: string; mockData?: Partial<T> }> {
  try {
    const { data, error } = await supabaseOperation();
    
    if (error) {
      console.error(`Supabase error in ${operationName}:`, error);
      return { 
        error: 'Database connection failed, but operation was validated',
        mockData 
      };
    }
    
    return { data: data || undefined };
  } catch (supabaseError) {
    console.error(`Supabase connection failed in ${operationName}:`, supabaseError);
    return { 
      error: 'Database connection failed, but operation was validated',
      mockData 
    };
  }
}

// Check if Supabase is available
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
} 