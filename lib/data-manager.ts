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
  max_investment: number | null;
  expected_return: number;
  duration_months: number;
  risk_level: 'low' | 'moderate' | 'high';
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  total_investors: number;
  total_amount: number;
}

export interface Investment {
  id: string;
  client_id: string;
  package_id: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  expected_return: number;
  actual_return?: number;
  total_returns: number;
  daily_returns: number;
  monthly_returns: number;
  fees_paid: number;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  investment_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transaction_id?: string;
  payment_date: string;
  processed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions?: any;
  created_at: string;
  updated_at: string;
}

export interface Partnership {
  id: string;
  name: string;
  description: string;
  contact_person: string;
  email: string;
  phone: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  partnership_type: string;
  start_date: string;
  end_date?: string;
  terms: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  period: string;
  category: string;
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

export const createInvestment = async (investmentData: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<Investment | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('investments')
      .insert({
        ...investmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating investment:', error);
    return null;
  }
};

export const updateInvestment = async (id: string, investmentData: Partial<Investment>): Promise<Investment | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('investments')
      .update({
        ...investmentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating investment:', error);
    return null;
  }
};

export const deleteInvestment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('investments')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting investment:', error);
    return false;
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

// Payment Management
export const getPayments = async (): Promise<Payment[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        ...paymentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment:', error);
    return null;
  }
};

export const updatePayment = async (id: string, paymentData: Partial<Payment>): Promise<Payment | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        ...paymentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payment:', error);
    return null;
  }
};

export const deletePayment = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting payment:', error);
    return false;
  }
};

// Team Member Management
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

export const createTeamMember = async (teamMemberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert({
        ...teamMemberData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating team member:', error);
    return null;
  }
};

export const updateTeamMember = async (id: string, teamMemberData: Partial<TeamMember>): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({
        ...teamMemberData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating team member:', error);
    return null;
  }
};

export const deleteTeamMember = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting team member:', error);
    return false;
  }
};

// Partnership Management
export const getPartnerships = async (): Promise<Partnership[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return [];
  }
};

export const createPartnership = async (partnershipData: Omit<Partnership, 'id' | 'created_at' | 'updated_at'>): Promise<Partnership | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .insert({
        ...partnershipData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating partnership:', error);
    return null;
  }
};

export const updatePartnership = async (id: string, partnershipData: Partial<Partnership>): Promise<Partnership | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .update({
        ...partnershipData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating partnership:', error);
    return null;
  }
};

export const deletePartnership = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('partnerships')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting partnership:', error);
    return false;
  }
};

// Analytics Management
export const getAnalytics = async (): Promise<Analytics[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }
};

export const createAnalytics = async (analyticsData: Omit<Analytics, 'id' | 'created_at' | 'updated_at'>): Promise<Analytics | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .insert({
        ...analyticsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating analytics:', error);
    return null;
  }
};

export const updateAnalytics = async (id: string, analyticsData: Partial<Analytics>): Promise<Analytics | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('analytics')
      .update({
        ...analyticsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating analytics:', error);
    return null;
  }
};

export const deleteAnalytics = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('analytics')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting analytics:', error);
    return false;
  }
}; 

// Team Management
export const getTeam = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

export const createTeam = async (teamData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert({
        ...teamData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating team member:', error);
    return null;
  }
};

export const updateTeam = async (id: string, teamData: Partial<TeamMember>): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({
        ...teamData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating team member:', error);
    return null;
  }
};

export const deleteTeam = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id);
    
    return !error;
  } catch (error) {
    console.error('Error deleting team member:', error);
    return false;
  }
}; 

// Recupera un cliente specifico per ID
export async function getClient(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore nel recupero cliente:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Errore nella connessione al database:', error);
    return null;
  }
} 

// Recupera un pacchetto specifico per ID
export async function getPackage(id: string): Promise<Package | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore nel recupero pacchetto:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Errore nella connessione al database:', error);
    return null;
  }
} 