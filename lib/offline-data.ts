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

// Funzione per caricare dati dal file JSON
function loadOfflineData() {
  try {
    if (typeof window !== 'undefined') {
      // In browser, usa localStorage
      const stored = localStorage.getItem('offline_data');
      if (stored) {
        const data = JSON.parse(stored);
        return {
          users: data.users || [],
          profiles: data.profiles || [],
          clients: data.clients || []
        };
      }
    } else {
      // In Node.js, leggi dal file
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'lib', 'offline-data.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return {
          users: data.users || [],
          profiles: data.profiles || [],
          clients: data.clients || []
        };
      }
    }
  } catch (error) {
    console.error('Error loading offline data:', error);
  }
  
  // Fallback ai dati di default
  return {
    users: [
      {
        id: 'test-user-1',
        email: 'test@glgcapitalgroup.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        is_active: true,
        email_verified: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'test-user-2',
        email: 'admin@glgcapitalgroup.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        email_verified: true,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    profiles: [],
    clients: []
  };
}

// Carica dati offline
const offlineData = loadOfflineData();

// Array condivisi per i dati offline
export let offlineUsers: OfflineUser[] = offlineData.users;

export let offlineProfiles: OfflineProfile[] = offlineData.profiles;

export let offlineClients: OfflineClient[] = offlineData.clients;

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
    const validPasswords = [
      'TestPassword123!',
      'test123',
      'admin123',
      'password123',
      '123456'
    ];
    
    return validPasswords.includes(password);
  },

  // Ottieni tutti i dati offline per debug
  getAllOfflineData: () => {
    return {
      users: offlineUsers,
      profiles: offlineProfiles,
      clients: offlineClients
    };
  },

  // Pulisci tutti i dati offline
  clearOfflineData: () => {
    offlineUsers = [];
    offlineProfiles = [];
    offlineClients = [];
    console.log('🧹 All offline data cleared');
  },

  // Ottieni dashboard overview con dati offline
  getDashboardOverview: () => {
    const totalUsers = offlineUsers.length;
    const activeUsers = offlineUsers.filter(u => u.is_active).length;
    const totalInvestments = offlineClients.reduce((sum, c) => sum + (c.total_invested || 0), 0);
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
      recentActivity: offlineUsers.slice(-5).map(user => ({
        id: user.id,
        type: 'user_registration',
        description: `New user: ${user.first_name} ${user.last_name}`,
        timestamp: new Date(user.created_at),
        severity: 'low' as const
      })),
      topClients: offlineClients.slice(-3),
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
  },

  // Ottieni analytics con dati offline
  getAnalytics: () => {
    const totalUsers = offlineUsers.length;
    const activeUsers = offlineUsers.filter(u => u.is_active).length;
    const totalInvestments = offlineClients.reduce((sum, c) => sum + (c.total_invested || 0), 0);
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
      userMetrics: {
        newUsers: Math.floor(totalUsers * 0.1),
        verifiedUsers: activeUsers,
        blockedUsers: 0
      },
      investmentMetrics: {
        totalAmount: totalInvestments,
        averageInvestment: totalInvestments / Math.max(offlineClients.length, 1),
        successfulTransactions: Math.floor(totalInvestments / 1000),
        failedTransactions: 0
      },
      securityMetrics: {
        securityAlerts: 0,
        suspiciousActivities: 0,
        blockedIPs: 0,
        failedLogins: 0
      },
      recentActivity: offlineUsers.slice(-5).map(user => ({
        id: user.id,
        type: 'user_registration',
        description: `New user: ${user.first_name} ${user.last_name}`,
        timestamp: new Date(user.created_at),
        severity: 'low' as const
      })),
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
}; 