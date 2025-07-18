// Offline Data System for GLG Capital Financial
// Used when Supabase is unavailable

export interface OfflineUser {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  is_active: boolean;
  email_verified: boolean;
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
  company: string;
  position: string;
  date_of_birth: string;
  nationality: string;
  profile_photo: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  iban: string;
  bic: string;
  account_holder: string;
  usdt_wallet: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface OfflineInvestment {
  id: string;
  client_id: string;
  package_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  expected_return: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineAnalytics {
  id: string;
  metric: string;
  value: number;
  change_percentage: number;
  period: 'daily' | 'weekly' | 'monthly';
  category: string;
  description: string;
  created_at: string;
}

export interface OfflinePackage {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  expected_return: number;
  duration_months: number;
  risk_level: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfflineTeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock Data
export const offlineData = {
  users: [
    {
      id: '1',
      email: 'admin@glgcapital.com',
      role: 'superadmin' as const,
      is_active: true,
      email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      email: 'manager@glgcapital.com',
      role: 'admin' as const,
      is_active: true,
      email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      email: 'client1@example.com',
      role: 'user' as const,
      is_active: true,
      email_verified: true,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ] as OfflineUser[],

  clients: [
    {
      id: '1',
      user_id: '3',
      first_name: 'Mario',
      last_name: 'Rossi',
      email: 'client1@example.com',
      phone: '+39 123 456 7890',
      company: 'Tech Solutions Ltd',
      position: 'CEO',
      date_of_birth: '1985-03-15',
      nationality: 'Italian',
      profile_photo: '',
      address: 'Via Roma 123',
      city: 'Milano',
      country: 'Italy',
      postal_code: '20100',
      iban: 'IT60X0542811101000000123456',
      bic: 'UNCRITMMXXX',
      account_holder: 'Mario Rossi',
      usdt_wallet: 'TQn9Y2khDD95J42FQtQTdwVVRqQqCqXqXq',
      status: 'active' as const,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      user_id: '4',
      first_name: 'Giulia',
      last_name: 'Bianchi',
      email: 'client2@example.com',
      phone: '+39 987 654 3210',
      company: 'Finance Corp',
      position: 'CFO',
      date_of_birth: '1990-07-22',
      nationality: 'Italian',
      profile_photo: '',
      address: 'Corso Italia 456',
      city: 'Roma',
      country: 'Italy',
      postal_code: '00100',
      iban: 'IT60X0542811101000000654321',
      bic: 'UNCRITMMXXX',
      account_holder: 'Giulia Bianchi',
      usdt_wallet: 'TQn9Y2khDD95J42FQtQTdwVVRqQqCqXqXq',
      status: 'active' as const,
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    }
  ] as OfflineClient[],

  investments: [
    {
      id: '1',
      client_id: '1',
      package_id: '1',
      amount: 50000,
      currency: 'EUR',
      status: 'active' as const,
      expected_return: 8.5,
      start_date: '2024-01-15T00:00:00Z',
      end_date: '2024-07-15T00:00:00Z',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      client_id: '2',
      package_id: '2',
      amount: 75000,
      currency: 'EUR',
      status: 'active' as const,
      expected_return: 12.0,
      start_date: '2024-01-20T00:00:00Z',
      end_date: '2024-10-20T00:00:00Z',
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z'
    }
  ] as OfflineInvestment[],

  analytics: [
    {
      id: '1',
      metric: 'Total Users',
      value: 1247,
      change_percentage: 12.5,
      period: 'monthly' as const,
      category: 'users',
      description: 'Total registered users',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      metric: 'Active Users',
      value: 892,
      change_percentage: 8.3,
      period: 'monthly' as const,
      category: 'users',
      description: 'Users active in last 30 days',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      metric: 'Total Investments',
      value: 4560000,
      change_percentage: 15.7,
      period: 'monthly' as const,
      category: 'investments',
      description: 'Total investment amount in EUR',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      metric: 'Total Revenue',
      value: 456000,
      change_percentage: 18.2,
      period: 'monthly' as const,
      category: 'revenue',
      description: 'Total revenue generated',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      metric: 'User Growth',
      value: 12.5,
      change_percentage: 2.1,
      period: 'monthly' as const,
      category: 'growth',
      description: 'Monthly user growth rate',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      metric: 'Revenue Growth',
      value: 8.3,
      change_percentage: 1.5,
      period: 'monthly' as const,
      category: 'growth',
      description: 'Monthly revenue growth rate',
      created_at: '2024-01-01T00:00:00Z'
    }
  ] as OfflineAnalytics[],

  packages: [
    {
      id: '1',
      name: 'Conservative Growth',
      description: 'Low-risk investment with steady returns',
      min_amount: 10000,
      max_amount: 100000,
      expected_return: 6.5,
      duration_months: 12,
      risk_level: 'low' as const,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Balanced Portfolio',
      description: 'Medium-risk investment with good returns',
      min_amount: 25000,
      max_amount: 250000,
      expected_return: 10.0,
      duration_months: 18,
      risk_level: 'medium' as const,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Aggressive Growth',
      description: 'High-risk investment with maximum returns',
      min_amount: 50000,
      max_amount: 500000,
      expected_return: 15.0,
      duration_months: 24,
      risk_level: 'high' as const,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ] as OfflinePackage[],

  team: [
    {
      id: '1',
      first_name: 'Alessandro',
      last_name: 'Ferrari',
      email: 'alessandro.ferrari@glgcapital.com',
      role: 'CEO',
      department: 'Executive',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      first_name: 'Sofia',
      last_name: 'Marino',
      email: 'sofia.marino@glgcapital.com',
      role: 'CFO',
      department: 'Finance',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      first_name: 'Marco',
      last_name: 'Conti',
      email: 'marco.conti@glgcapital.com',
      role: 'CTO',
      department: 'Technology',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ] as OfflineTeamMember[]
};

// Helper functions for offline data management
export class OfflineDataManager {
  private static instance: OfflineDataManager;
  private data = { ...offlineData };

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  // User management
  getUsers(): OfflineUser[] {
    return this.data.users;
  }

  getUserById(id: string): OfflineUser | null {
    return this.data.users.find(user => user.id === id) || null;
  }

  getUserByEmail(email: string): OfflineUser | null {
    return this.data.users.find(user => user.email === email) || null;
  }

  createUser(userData: Omit<OfflineUser, 'id' | 'created_at' | 'updated_at'>): OfflineUser {
    const newUser: OfflineUser = {
      ...userData,
      id: (this.data.users.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    return newUser;
  }

  // Client management
  getClients(): OfflineClient[] {
    return this.data.clients;
  }

  getClientById(id: string): OfflineClient | null {
    return this.data.clients.find(client => client.id === id) || null;
  }

  getClientByUserId(userId: string): OfflineClient | null {
    return this.data.clients.find(client => client.user_id === userId) || null;
  }

  createClient(clientData: Omit<OfflineClient, 'id' | 'created_at' | 'updated_at'>): OfflineClient {
    const newClient: OfflineClient = {
      ...clientData,
      id: (this.data.clients.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.clients.push(newClient);
    return newClient;
  }

  // Investment management
  getInvestments(): OfflineInvestment[] {
    return this.data.investments;
  }

  getInvestmentById(id: string): OfflineInvestment | null {
    return this.data.investments.find(investment => investment.id === id) || null;
  }

  getInvestmentsByClientId(clientId: string): OfflineInvestment[] {
    return this.data.investments.filter(investment => investment.client_id === clientId);
  }

  createInvestment(investmentData: Omit<OfflineInvestment, 'id' | 'created_at' | 'updated_at'>): OfflineInvestment {
    const newInvestment: OfflineInvestment = {
      ...investmentData,
      id: (this.data.investments.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.investments.push(newInvestment);
    return newInvestment;
  }

  // Analytics management
  getAnalytics(): OfflineAnalytics[] {
    return this.data.analytics;
  }

  getAnalyticsByCategory(category: string): OfflineAnalytics[] {
    return this.data.analytics.filter(analytics => analytics.category === category);
  }

  // Package management
  getPackages(): OfflinePackage[] {
    return this.data.packages;
  }

  getPackageById(id: string): OfflinePackage | null {
    return this.data.packages.find(pkg => pkg.id === id) || null;
  }

  // Team management
  getTeamMembers(): OfflineTeamMember[] {
    return this.data.team;
  }

  getTeamMemberById(id: string): OfflineTeamMember | null {
    return this.data.team.find(member => member.id === id) || null;
  }

  // Dashboard overview
  getDashboardOverview() {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter(user => user.is_active).length;
    const totalInvestments = this.data.investments.reduce((sum, inv) => sum + inv.amount, 0);
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
      recentActivity: this.data.investments.slice(-5),
      topClients: this.data.clients.slice(-3)
    };
  }
}

// Export singleton instance
export const offlineDataManager = OfflineDataManager.getInstance(); 