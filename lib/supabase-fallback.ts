// Sistema di fallback completo per modalità offline
import { createClient } from '@supabase/supabase-js';

// Dati di fallback per quando Supabase non è disponibile
const FALLBACK_DATA = {
  clients: [
    {
      id: 'client_1',
      user_id: 'user_1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      country: 'United States',
      city: 'New York',
      status: 'active',
      client_code: 'CLI001',
      risk_profile: 'moderate',
      total_invested: 50000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'client_2',
      user_id: 'user_2',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      country: 'United Kingdom',
      city: 'London',
      status: 'active',
      client_code: 'CLI002',
      risk_profile: 'conservative',
      total_invested: 75000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  investments: [
    {
      id: 'inv_1',
      client_id: 'client_1',
      amount: 25000,
      type: 'equity',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv_2',
      client_id: 'client_2',
      amount: 35000,
      type: 'bonds',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  payments: [
    {
      id: 'pay_1',
      client_id: 'client_1',
      amount: 25000,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pay_2',
      client_id: 'client_2',
      amount: 35000,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 'user_1',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user_2',
      email: 'jane.smith@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'user',
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Funzione per testare la connessione Supabase (sempre false in modalità offline)
export async function testSupabaseConnection(): Promise<boolean> {
  console.log('🔧 System running in offline mode - Supabase connection test disabled');
  return false; // Sempre false per forzare l'uso dei dati offline
}

// Wrapper per chiamate Supabase con fallback (sempre usa fallback)
export async function supabaseWithFallback<T>(
  operation: () => Promise<T>,
  fallbackData: T
): Promise<T> {
  console.log('🔧 Using fallback data - System running in offline mode');
  return fallbackData;
}

// Funzioni specifiche per ogni tabella
export async function getClientsWithFallback() {
  console.log('🔧 Returning fallback clients data');
  return FALLBACK_DATA.clients;
}

export async function getInvestmentsWithFallback() {
  console.log('🔧 Returning fallback investments data');
  return FALLBACK_DATA.investments;
}

export async function getPaymentsWithFallback() {
  console.log('🔧 Returning fallback payments data');
  return FALLBACK_DATA.payments;
}

export async function getUsersWithFallback() {
  console.log('🔧 Returning fallback users data');
  return FALLBACK_DATA.users;
}

// Dashboard overview con fallback
export async function getDashboardOverviewWithFallback() {
  const clients = FALLBACK_DATA.clients;
  const investments = FALLBACK_DATA.investments;
  const payments = FALLBACK_DATA.payments;
  
  const totalUsers = clients.length;
  const activeUsers = clients.filter(c => c.status === 'active').length;
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalRevenue = totalInvestments * 0.1;
  
  return {
    overview: {
      totalUsers,
      activeUsers,
      totalInvestments,
      totalRevenue,
      userGrowth: 12.5,
      revenueGrowth: 8.3
    },
    recentActivity: clients.slice(-5).map(client => ({
      id: client.id,
      type: 'client_registration',
      description: `New client: ${client.first_name} ${client.last_name}`,
      timestamp: new Date(client.created_at),
      severity: 'low' as const
    })),
    topClients: clients.slice(-3),
    chartData: {
      userGrowth: [
        { date: new Date().toISOString().split('T')[0], users: totalUsers }
      ],
      revenue: [
        { date: new Date().toISOString().split('T')[0], revenue: totalRevenue }
      ],
      investments: [
        { date: new Date().toISOString().split('T')[0], amount: totalInvestments }
      ]
    }
  };
} 