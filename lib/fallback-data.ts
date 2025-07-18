// Dati mock per il fallback quando Supabase non è disponibile

export const fallbackData = {
  users: [
    {
      id: '1',
      email: 'admin@glgcapital.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true,
      email_verified: true,
      last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      email: 'support@glgcapital.com',
      first_name: 'Support',
      last_name: 'Agent',
      role: 'support',
      is_active: true,
      email_verified: true,
      last_login: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      email_verified: true,
      last_login: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  analytics: {
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalInvestments: 4560000,
      totalRevenue: 456000,
      userGrowth: 12.5,
      revenueGrowth: 8.3
    },
    userMetrics: {
      newUsers: 45,
      verifiedUsers: 892,
      blockedUsers: 5
    },
    investmentMetrics: {
      totalAmount: 4560000,
      averageInvestment: 12500,
      successfulTransactions: 364,
      failedTransactions: 12
    },
    securityMetrics: {
      securityAlerts: 8,
      suspiciousActivities: 15,
      blockedIPs: 23,
      failedLogins: 156
    },
    recentActivity: [
      {
        id: '1',
        type: 'user_registration',
        description: 'New user registered: john.doe@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        severity: 'low'
      },
      {
        id: '2',
        type: 'investment',
        description: 'Large investment: $50,000 in Aggressive Growth package',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        severity: 'medium'
      },
      {
        id: '3',
        type: 'security_alert',
        description: 'Multiple failed login attempts detected from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        severity: 'high'
      }
    ],
    chartData: {
      userGrowth: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        users: Math.floor(Math.random() * 50) + 1200
      })),
      revenue: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 20000) + 400000
      })),
      investments: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 200000) + 4000000
      }))
    }
  },

  clients: [
    {
      id: '1',
      user_id: '3',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      country: 'United States',
      city: 'New York',
      status: 'active',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: '4',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      country: 'Canada',
      city: 'Toronto',
      status: 'active',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: '5',
      first_name: 'Marco',
      last_name: 'Rossi',
      email: 'marco.rossi@example.com',
      phone: '+39-333-123456',
      country: 'Italy',
      city: 'Milan',
      status: 'pending',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  investments: [
    {
      id: '1',
      user_id: '3',
      amount: 25000,
      currency: 'USD',
      status: 'active',
      investment_type: 'growth',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: '4',
      amount: 50000,
      currency: 'USD',
      status: 'active',
      investment_type: 'aggressive',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: '5',
      amount: 15000,
      currency: 'EUR',
      status: 'pending',
      investment_type: 'balanced',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],

  packages: [
    {
      id: '1',
      name: 'Pacchetto Starter',
      description: 'Perfetto per iniziare il tuo percorso di investimento',
      min_investment: 1000,
      max_investment: 5000,
      duration: 90,
      expected_return: 8.5,
      status: 'active',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Pacchetto Growth',
      description: 'Il nostro pacchetto più popolare',
      min_investment: 5000,
      max_investment: 25000,
      duration: 180,
      expected_return: 12.0,
      status: 'active',
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Pacchetto Premium',
      description: 'Per investitori esperti',
      min_investment: 25000,
      max_investment: 100000,
      duration: 365,
      expected_return: 15.5,
      status: 'active',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  team: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@glgcapital.com',
      phone: '+1-555-0001',
      role: 'admin',
      department: 'Management',
      status: 'active',
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Support Agent',
      email: 'support@glgcapital.com',
      phone: '+1-555-0002',
      role: 'support',
      department: 'Customer Service',
      status: 'active',
      created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  content: [
    {
      id: '1',
      title: 'Guida agli Investimenti',
      type: 'article',
      status: 'published',
      author: 'Admin User',
      content: 'Contenuto dell\'articolo...',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Novità del Mercato',
      type: 'news',
      status: 'published',
      author: 'Admin User',
      content: 'Contenuto delle novità...',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  partnerships: [
    {
      id: '1',
      name: 'Strategic Partner A',
      type: 'strategic',
      status: 'active',
      country: 'United States',
      industry: 'Technology',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Financial Partner B',
      type: 'financial',
      status: 'active',
      country: 'United Kingdom',
      industry: 'Finance',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  settings: {
    email_config: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: 'noreply@glgcapital.com'
    },
    app_config: {
      maintenance_mode: false,
      registration_enabled: true,
      max_investment: 1000000
    },
    security_config: {
      two_factor_enabled: true,
      session_timeout: 3600,
      max_login_attempts: 5
    }
  }
};

// Mock notes data for offline mode
export const mockNotes = [
  {
    id: 1,
    title: 'Today I created a Supabase project.',
    created_at: '2025-07-18T08:00:00.000Z',
    updated_at: '2025-07-18T08:00:00.000Z'
  },
  {
    id: 2,
    title: 'I added some data and queried it from Next.js.',
    created_at: '2025-07-18T08:30:00.000Z',
    updated_at: '2025-07-18T08:30:00.000Z'
  },
  {
    id: 3,
    title: 'It was awesome!',
    created_at: '2025-07-18T09:00:00.000Z',
    updated_at: '2025-07-18T09:00:00.000Z'
  }
];

// Funzione helper per ottenere dati mock con timestamp aggiornati
export function getMockData(key: keyof typeof fallbackData) {
  const data = fallbackData[key];
  
  // Se è un array, aggiorna i timestamp
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }
  
  return data;
} 