// Gestione dati offline condivisi tra register e login
export interface OfflineUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  country: string;
  kyc_status?: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineClient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  status: string;
  client_code?: string;
  risk_profile?: string;
  total_invested?: number;
  created_at: string;
  updated_at: string;
}

// Array condivisi per i dati offline
export let offlineUsers: OfflineUser[] = [];
export let offlineProfiles: OfflineProfile[] = [];
export let offlineClients: OfflineClient[] = [];

// Funzioni per gestire i dati offline
export const offlineDataManager = {
  // Aggiungi utente offline
  addOfflineUser: (user: OfflineUser) => {
    offlineUsers.push(user);
    console.log('✅ Offline user added:', user.email);
  },

  // Aggiungi profilo offline
  addOfflineProfile: (profile: OfflineProfile) => {
    offlineProfiles.push(profile);
    console.log('✅ Offline profile added for:', profile.email);
  },

  // Aggiungi cliente offline
  addOfflineClient: (client: OfflineClient) => {
    offlineClients.push(client);
    console.log('✅ Offline client added for user:', client.user_id);
  },

  // Trova utente offline per email
  findOfflineUser: (email: string): OfflineUser | undefined => {
    return offlineUsers.find(u => u.email === email);
  },

  // Trova profilo offline per ID utente
  findOfflineProfile: (userId: string): OfflineProfile | undefined => {
    return offlineProfiles.find(p => p.id === userId);
  },

  // Trova cliente offline per ID utente
  findOfflineClient: (userId: string): OfflineClient | undefined => {
    return offlineClients.find(c => c.user_id === userId);
  },

  // Verifica credenziali offline
  validateOfflineCredentials: (email: string, password: string): boolean => {
    const user = offlineUsers.find(u => u.email === email);
    if (!user) return false;
    
    // Password semplificate per modalità offline
    return password === 'TestPassword123!' || password === 'test123';
  },

  // Ottieni tutti i dati offline per debug
  getAllOfflineData: () => {
    return {
      users: offlineUsers,
      profiles: offlineProfiles,
      clients: offlineClients
    };
  },

  // Pulisci dati offline (per testing)
  clearOfflineData: () => {
    offlineUsers = [];
    offlineProfiles = [];
    offlineClients = [];
    console.log('🧹 Offline data cleared');
  },

  // Dashboard overview per analytics
  getDashboardOverview: () => {
    const totalUsers = offlineUsers.length;
    const activeUsers = offlineUsers.filter(u => u.is_active).length;
    const totalInvestments = offlineClients.reduce((sum, client) => sum + (client.total_invested || 0), 0);
    const totalRevenue = totalInvestments * 0.1; // 10% revenue assumption

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalInvestments,
        totalRevenue,
        userGrowth: 12.5,
        revenueGrowth: 8.3
      },
      recentActivity: offlineClients.slice(-5).map(client => ({
        id: client.id,
        type: 'client_registration',
        description: `New client: ${client.first_name} ${client.last_name}`,
        timestamp: new Date(client.created_at),
        severity: 'low' as const
      })),
      topClients: offlineClients.slice(-3)
    };
  },

  // Analytics data
  getAnalytics: () => {
    return {
      userMetrics: {
        newUsers: offlineUsers.length,
        verifiedUsers: offlineUsers.filter(u => u.email_verified).length,
        blockedUsers: 0
      },
      investmentMetrics: {
        totalAmount: offlineClients.reduce((sum, client) => sum + (client.total_invested || 0), 0),
        averageInvestment: offlineClients.length > 0 ? 
          offlineClients.reduce((sum, client) => sum + (client.total_invested || 0), 0) / offlineClients.length : 0,
        successfulTransactions: offlineClients.length,
        failedTransactions: 0
      },
      securityMetrics: {
        securityAlerts: 0,
        suspiciousActivities: 0,
        blockedIPs: 0,
        failedLogins: 0
      },
      chartData: {
        userGrowth: [
          { date: new Date().toISOString().split('T')[0], users: offlineUsers.length }
        ],
        revenue: [
          { date: new Date().toISOString().split('T')[0], revenue: offlineClients.reduce((sum, client) => sum + (client.total_invested || 0), 0) * 0.1 }
        ],
        investments: [
          { date: new Date().toISOString().split('T')[0], amount: offlineClients.reduce((sum, client) => sum + (client.total_invested || 0), 0) }
        ]
      }
    };
  }
}; 