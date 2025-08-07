import { supabaseAdmin } from './admin-auth';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  date_of_birth: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  iban: string;
  bic: string;
  account_holder: string;
  usdt_wallet: string;
  status: 'active' | 'inactive' | 'pending';
  risk_profile: 'low' | 'moderate' | 'high';
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  min_investment: number;
  max_investment: number;
  expected_return: number;
  duration_months: number;
  risk_level: 'low' | 'moderate' | 'high';
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  client_id: string;
  package_id: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

// Client Management
export const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Clients loaded from database:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error; // Rilancia l'errore per far usare i mock data
  }
};

export const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating client:', error);
    return null;
  }
};

export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({
        ...clientData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
};

export const deleteClient = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
};

// Package Management
export const getPackages = async (): Promise<Package[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Packages loaded from database:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error; // Rilancia l'errore per far usare i mock data
  }
};

export const createPackage = async (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Promise<Package | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .insert({
        ...packageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating package:', error);
    return null;
  }
};

export const updatePackage = async (id: string, packageData: Partial<Package>): Promise<Package | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .update({
        ...packageData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating package:', error);
    return null;
  }
};

export const deletePackage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting package:', error);
    return false;
  }
};

// Investment Management
export const getInvestments = async (): Promise<Investment[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching investments:', error);
    return [];
  }
};

export const updateInvestmentStatus = async (id: string, status: Investment['status']): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('investments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error updating investment status:', error);
    return false;
  }
}; 