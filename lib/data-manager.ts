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
  contact_email: string;
  contact_phone: string;
  partnership_type: 'strategic' | 'financial' | 'operational';
  status: 'active' | 'inactive' | 'pending';
  start_date: string;
  end_date?: string;
  terms: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  date: string;
  total_investments: number;
  total_amount: number;
  total_returns: number;
  active_clients: number;
  new_clients: number;
  top_performing_package: string;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

// Dati temporanei per quando il database non è disponibile
const TEMP_PACKAGES: Package[] = [
  {
    id: '1',
    name: 'Pacchetto Starter',
    description: 'Pacchetto iniziale per nuovi investitori',
    min_investment: 1000,
    max_investment: 10000,
    expected_return: 5.0,
    duration_months: 12,
    risk_level: 'low',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_investors: 0,
    total_amount: 0
  },
  {
    id: '2',
    name: 'Equity Pledge Premium',
    description: 'Pacchetto di investimento premium con rendimenti garantiti e rischio controllato',
    min_investment: 10000,
    max_investment: 1000000,
    expected_return: 8.5,
    duration_months: 24,
    risk_level: 'low',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_investors: 0,
    total_amount: 0
  },
  {
    id: '3',
    name: 'Growth Portfolio Plus',
    description: 'Portafoglio di crescita con focus su tecnologie innovative e mercati emergenti',
    min_investment: 25000,
    max_investment: 500000,
    expected_return: 12.0,
    duration_months: 36,
    risk_level: 'medium',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_investors: 0,
    total_amount: 0
  },
  {
    id: '4',
    name: 'Real Estate Investment Trust',
    description: 'Investimento immobiliare con rendimenti stabili e beni tangibili',
    min_investment: 50000,
    max_investment: 2000000,
    expected_return: 6.8,
    duration_months: 60,
    risk_level: 'low',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_investors: 0,
    total_amount: 0
  },
  {
    id: '5',
    name: 'High Yield Bonds Portfolio',
    description: 'Portafoglio obbligazionario ad alto rendimento per investitori esperti',
    min_investment: 15000,
    max_investment: 300000,
    expected_return: 9.2,
    duration_months: 48,
    risk_level: 'high',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_investors: 0,
    total_amount: 0
  },
  {
    id: '6',
    name: 'Sustainable Growth Fund',
    description: 'Fondo di investimento sostenibile con focus su ESG e impatto sociale',
    min_investment: 20000,
    max_investment: 400000,
    expected_return: 10.5,
    duration_months: 30,
    risk_level: 'medium',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_investors: 0,
    total_amount: 0
  }
];

// Funzione per verificare la connessione al database
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// ===== CLIENT CRUD OPERATIONS =====

export async function getClients(): Promise<Client[]> {
  try {
    // Verifica prima la connessione
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, usando dati temporanei per clienti');
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error in getClients:', error);
    console.log('Ritorno array vuoto per clienti');
    return [];
  }
}

export async function getClient(id: string): Promise<Client | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, impossibile recuperare cliente specifico');
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in getClient:', error);
    return null;
  }
}

export async function createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile creare cliente');
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert([{
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error in createClient:', error);
    throw new Error('Impossibile creare il cliente nel database');
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile aggiornare cliente');
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in updateClient:', error);
    return null;
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile eliminare cliente');
    }

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error in deleteClient:', error);
    return false;
  }
}

// ===== PACKAGE CRUD OPERATIONS =====

export async function getPackages(): Promise<Package[]> {
  try {
    // Verifica prima la connessione
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, usando dati temporanei per pacchetti');
      return TEMP_PACKAGES;
    }

    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching packages:', error);
      console.log('Ritorno dati temporanei per pacchetti');
      return TEMP_PACKAGES;
    }

    return data || TEMP_PACKAGES;
  } catch (error) {
    console.error('Database error in getPackages:', error);
    console.log('Ritorno dati temporanei per pacchetti');
    return TEMP_PACKAGES;
  }
}

export async function getPackage(id: string): Promise<Package | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, cercando nei dati temporanei');
      return TEMP_PACKAGES.find(pkg => pkg.id === id) || null;
    }

    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching package:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in getPackage:', error);
    return TEMP_PACKAGES.find(pkg => pkg.id === id) || null;
  }
}

export async function createPackage(packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Promise<Package> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile creare pacchetto');
    }

    const { data, error } = await supabaseAdmin
      .from('packages')
      .insert([{
        ...packageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating package:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error in createPackage:', error);
    throw new Error('Impossibile creare il pacchetto nel database');
  }
}

export async function updatePackage(id: string, updates: Partial<Package>): Promise<Package | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile aggiornare pacchetto');
    }

    const { data, error } = await supabaseAdmin
      .from('packages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating package:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in updatePackage:', error);
    return null;
  }
}

export async function deletePackage(id: string): Promise<boolean> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile eliminare pacchetto');
    }

    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting package:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error in deletePackage:', error);
    return false;
  }
}

// ===== INVESTMENT CRUD OPERATIONS =====

export async function getInvestments(): Promise<Investment[]> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, usando array vuoto per investimenti');
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investments:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error in getInvestments:', error);
    return [];
  }
}

export async function getInvestment(id: string): Promise<Investment | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, impossibile recuperare investimento specifico');
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('investments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching investment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in getInvestment:', error);
    return null;
  }
}

export async function createInvestment(investmentData: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<Investment> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile creare investimento');
    }

    const { data, error } = await supabaseAdmin
      .from('investments')
      .insert([{
        ...investmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating investment:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error in createInvestment:', error);
    throw new Error('Impossibile creare l\'investimento nel database');
  }
}

export async function updateInvestment(id: string, updates: Partial<Investment>): Promise<Investment | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile aggiornare investimento');
    }

    const { data, error } = await supabaseAdmin
      .from('investments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating investment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in updateInvestment:', error);
    return null;
  }
}

export async function deleteInvestment(id: string): Promise<boolean> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile eliminare investimento');
    }

    const { error } = await supabaseAdmin
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting investment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error in deleteInvestment:', error);
    return false;
  }
}

// ===== PAYMENT CRUD OPERATIONS =====

export async function getPayments(): Promise<Payment[]> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, usando array vuoto per pagamenti');
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error in getPayments:', error);
    return [];
  }
}

export async function getPayment(id: string): Promise<Payment | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, impossibile recuperare pagamento specifico');
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching payment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in getPayment:', error);
    return null;
  }
}

export async function createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile creare pagamento');
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([{
        ...paymentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error in createPayment:', error);
    throw new Error('Impossibile creare il pagamento nel database');
  }
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile aggiornare pagamento');
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in updatePayment:', error);
    return null;
  }
}

export async function deletePayment(id: string): Promise<boolean> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile eliminare pagamento');
    }

    const { error } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting payment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error in deletePayment:', error);
    return false;
  }
}

// ===== TEAM MEMBER CRUD OPERATIONS =====

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, usando array vuoto per team members');
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error in getTeamMembers:', error);
    return [];
  }
}

export async function getTeamMember(id: string): Promise<TeamMember | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, impossibile recuperare team member specifico');
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching team member:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in getTeamMember:', error);
    return null;
  }
}

export async function createTeamMember(memberData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile creare team member');
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert([{
        ...memberData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating team member:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error in createTeamMember:', error);
    throw new Error('Impossibile creare il membro del team nel database');
  }
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile aggiornare team member');
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in updateTeamMember:', error);
    return null;
  }
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile eliminare team member');
    }

    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error in deleteTeamMember:', error);
    return false;
  }
}

// ===== PARTNERSHIP CRUD OPERATIONS =====

export async function getPartnerships(): Promise<Partnership[]> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, usando array vuoto per partnership');
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partnerships:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error in getPartnerships:', error);
    return [];
  }
}

export async function getPartnership(id: string): Promise<Partnership | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, impossibile recuperare partnership specifica');
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching partnership:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in getPartnership:', error);
    return null;
  }
}

export async function createPartnership(partnershipData: Omit<Partnership, 'id' | 'created_at' | 'updated_at'>): Promise<Partnership> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile creare partnership');
    }

    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .insert([{
        ...partnershipData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating partnership:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error in createPartnership:', error);
    throw new Error('Impossibile creare la partnership nel database');
  }
}

export async function updatePartnership(id: string, updates: Partial<Partnership>): Promise<Partnership | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile aggiornare partnership');
    }

    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating partnership:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in updatePartnership:', error);
    return null;
  }
}

export async function deletePartnership(id: string): Promise<boolean> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile eliminare partnership');
    }

    const { error } = await supabaseAdmin
      .from('partnerships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting partnership:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error in deletePartnership:', error);
    return false;
  }
}

// ===== ANALYTICS CRUD OPERATIONS =====

export async function getAnalytics(): Promise<Analytics[]> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, usando array vuoto per analytics');
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('analytics')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error in getAnalytics:', error);
    return [];
  }
}

export async function getAnalyticsByDate(date: string): Promise<Analytics | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.log('Database non disponibile, impossibile recuperare analytics per data');
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('analytics')
      .select('*')
      .eq('date', date)
      .single();

    if (error) {
      console.error('Error fetching analytics by date:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in getAnalyticsByDate:', error);
    return null;
  }
}

export async function createAnalytics(analyticsData: Omit<Analytics, 'id' | 'created_at' | 'updated_at'>): Promise<Analytics> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile creare analytics');
    }

    const { data, error } = await supabaseAdmin
      .from('analytics')
      .insert([{
        ...analyticsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating analytics:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error in createAnalytics:', error);
    throw new Error('Impossibile creare le analytics nel database');
  }
}

export async function updateAnalytics(id: string, updates: Partial<Analytics>): Promise<Analytics | null> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile aggiornare analytics');
    }

    const { data, error } = await supabaseAdmin
      .from('analytics')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Database error in updateAnalytics:', error);
    return null;
  }
}

export async function deleteAnalytics(id: string): Promise<boolean> {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database non disponibile - impossibile eliminare analytics');
    }

    const { error } = await supabaseAdmin
      .from('analytics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting analytics:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database error in deleteAnalytics:', error);
    return false;
  }
} 