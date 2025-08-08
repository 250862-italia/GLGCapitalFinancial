import { Client, Package, Investment, Payment, TeamMember, Partnership, Analytics } from './data-manager';

export const mockClients: Client[] = [
  {
    id: '1',
    first_name: 'Mario',
    last_name: 'Rossi',
    email: 'mario.rossi@email.com',
    phone: '+39 333 1234567',
    company: 'Tech Solutions SRL',
    position: 'CEO',
    date_of_birth: '1985-03-15',
    nationality: 'Italiana',
    address: 'Via Roma 123',
    city: 'Milano',
    country: 'Italia',
    postal_code: '20100',
    iban: 'IT60X0542811101000000123456',
    bic: 'CRPPIT2P',
    account_holder: 'Mario Rossi',
    usdt_wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    status: 'active',
    risk_profile: 'moderate',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    first_name: 'Giulia',
    last_name: 'Bianchi',
    email: 'giulia.bianchi@email.com',
    phone: '+39 333 9876543',
    company: 'Design Studio',
    position: 'Creative Director',
    date_of_birth: '1990-07-22',
    nationality: 'Italiana',
    address: 'Corso Italia 456',
    city: 'Roma',
    country: 'Italia',
    postal_code: '00100',
    iban: 'IT60X0542811101000000654321',
    bic: 'CRPPIT2P',
    account_holder: 'Giulia Bianchi',
    usdt_wallet: '0x8ba1f109551bD432803012645Hac136c772c3cb',
    status: 'active',
    risk_profile: 'low',
    created_at: '2024-01-16T14:30:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: '3',
    first_name: 'Luca',
    last_name: 'Verdi',
    email: 'luca.verdi@email.com',
    phone: '+39 333 5555555',
    company: 'Finance Corp',
    position: 'CFO',
    date_of_birth: '1982-11-08',
    nationality: 'Italiana',
    address: 'Piazza Navona 789',
    city: 'Roma',
    country: 'Italia',
    postal_code: '00186',
    iban: 'IT60X0542811101000000789012',
    bic: 'CRPPIT2P',
    account_holder: 'Luca Verdi',
    usdt_wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
    status: 'pending',
    risk_profile: 'high',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  }
];

export const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Pacchetto Conservativo',
    description: 'Investimento a basso rischio con rendimenti stabili',
    min_investment: 10000,
    max_investment: 100000,
    expected_return: 5.5,
    duration_months: 12,
    risk_level: 'low',
    status: 'active',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z'
  },
  {
    id: '2',
    name: 'Pacchetto Bilanciato',
    description: 'Investimento equilibrato con rischio moderato',
    min_investment: 25000,
    max_investment: 250000,
    expected_return: 8.2,
    duration_months: 18,
    risk_level: 'moderate',
    status: 'active',
    created_at: '2024-01-12T10:30:00Z',
    updated_at: '2024-01-12T10:30:00Z'
  },
  {
    id: '3',
    name: 'Pacchetto Aggressivo',
    description: 'Investimento ad alto rischio con potenziali rendimenti elevati',
    min_investment: 50000,
    max_investment: 500000,
    expected_return: 12.5,
    duration_months: 24,
    risk_level: 'high',
    status: 'active',
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-14T15:45:00Z'
  },
  {
    id: '4',
    name: 'Pacchetto Crypto',
    description: 'Investimento specializzato in criptovalute',
    min_investment: 15000,
    max_investment: 150000,
    expected_return: 15.0,
    duration_months: 36,
    risk_level: 'high',
    status: 'draft',
    created_at: '2024-01-16T11:20:00Z',
    updated_at: '2024-01-16T11:20:00Z'
  }
];

export const mockInvestments: Investment[] = [
  {
    id: '1',
    client_id: '1',
    package_id: '1',
    amount: 25000,
    status: 'active',
    start_date: '2024-01-20T10:00:00Z',
    end_date: '2025-01-20T10:00:00Z',
    expected_return: 5.5,
    actual_return: 5.2,
    total_returns: 1300,
    daily_returns: 3.56,
    monthly_returns: 108.33,
    fees_paid: 125,
    payment_method: 'bank_transfer',
    transaction_id: 'TXN001234',
    notes: 'Investimento conservativo per cliente premium',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    client_id: '2',
    package_id: '2',
    amount: 50000,
    status: 'active',
    start_date: '2024-01-25T14:30:00Z',
    end_date: '2025-07-25T14:30:00Z',
    expected_return: 8.2,
    actual_return: 8.5,
    total_returns: 4250,
    daily_returns: 11.64,
    monthly_returns: 354.17,
    fees_paid: 250,
    payment_method: 'crypto',
    transaction_id: 'TXN001235',
    notes: 'Investimento bilanciato con performance superiore alle aspettative',
    created_at: '2024-01-25T14:30:00Z',
    updated_at: '2024-01-25T14:30:00Z'
  },
  {
    id: '3',
    client_id: '3',
    package_id: '3',
    amount: 75000,
    status: 'pending',
    start_date: '2024-02-01T09:00:00Z',
    end_date: '2026-02-01T09:00:00Z',
    expected_return: 12.5,
    actual_return: null,
    total_returns: 0,
    daily_returns: 0,
    monthly_returns: 0,
    fees_paid: 0,
    payment_method: 'bank_transfer',
    transaction_id: 'TXN001236',
    notes: 'Investimento aggressivo in attesa di approvazione',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    user_id: '1',
    investment_id: '1',
    amount: 25000,
    currency: 'EUR',
    payment_method: 'bank_transfer',
    status: 'completed',
    transaction_id: 'TXN001234',
    payment_date: '2024-01-20T10:00:00Z',
    processed_date: '2024-01-20T10:05:00Z',
    notes: 'Pagamento completato con successo',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:05:00Z'
  },
  {
    id: '2',
    user_id: '2',
    investment_id: '2',
    amount: 50000,
    currency: 'USD',
    payment_method: 'crypto',
    status: 'completed',
    transaction_id: 'TXN001235',
    payment_date: '2024-01-25T14:30:00Z',
    processed_date: '2024-01-25T14:35:00Z',
    notes: 'Pagamento in criptovalute processato',
    created_at: '2024-01-25T14:30:00Z',
    updated_at: '2024-01-25T14:35:00Z'
  },
  {
    id: '3',
    user_id: '3',
    investment_id: '3',
    amount: 75000,
    currency: 'EUR',
    payment_method: 'bank_transfer',
    status: 'pending',
    transaction_id: 'TXN001236',
    payment_date: '2024-02-01T09:00:00Z',
    processed_date: null,
    notes: 'Pagamento in attesa di conferma',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z'
  }
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    user_id: 'admin-1',
    first_name: 'Marco',
    last_name: 'Admin',
    email: 'marco.admin@glgcapital.com',
    role: 'admin',
    department: 'Management',
    phone: '+39 333 1111111',
    hire_date: '2023-01-15',
    status: 'active',
    permissions: { can_manage_users: true, can_manage_investments: true },
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2023-01-15T08:00:00Z'
  },
  {
    id: '2',
    user_id: 'support-1',
    first_name: 'Anna',
    last_name: 'Support',
    email: 'anna.support@glgcapital.com',
    role: 'support',
    department: 'Customer Service',
    phone: '+39 333 2222222',
    hire_date: '2023-03-20',
    status: 'active',
    permissions: { can_view_clients: true, can_manage_support: true },
    created_at: '2023-03-20T09:00:00Z',
    updated_at: '2023-03-20T09:00:00Z'
  },
  {
    id: '3',
    user_id: 'analyst-1',
    first_name: 'Luca',
    last_name: 'Analyst',
    email: 'luca.analyst@glgcapital.com',
    role: 'analyst',
    department: 'Analytics',
    phone: '+39 333 3333333',
    hire_date: '2023-06-10',
    status: 'active',
    permissions: { can_view_analytics: true, can_generate_reports: true },
    created_at: '2023-06-10T10:00:00Z',
    updated_at: '2023-06-10T10:00:00Z'
  }
];

export const mockPartnerships: Partnership[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    description: 'Partnership strategica per soluzioni tecnologiche avanzate',
    contact_person: 'Giuseppe Rossi',
    email: 'g.rossi@techcorp.com',
    phone: '+39 333 4444444',
    website: 'https://techcorp.com',
    status: 'active',
    partnership_type: 'technology',
    start_date: '2023-09-01',
    end_date: '2025-09-01',
    terms: 'Partnership esclusiva per 2 anni con opzione di rinnovo',
    created_at: '2023-09-01T08:00:00Z',
    updated_at: '2023-09-01T08:00:00Z'
  },
  {
    id: '2',
    name: 'Finance Partners Ltd',
    description: 'Collaborazione per servizi finanziari specializzati',
    contact_person: 'Maria Bianchi',
    email: 'm.bianchi@financepartners.com',
    phone: '+39 333 5555555',
    website: 'https://financepartners.com',
    status: 'active',
    partnership_type: 'financial',
    start_date: '2023-11-15',
    end_date: '2024-11-15',
    terms: 'Partnership annuale con focus su investimenti sostenibili',
    created_at: '2023-11-15T10:00:00Z',
    updated_at: '2023-11-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Crypto Ventures',
    description: 'Partnership per investimenti in criptovalute',
    contact_person: 'Alessandro Verdi',
    email: 'a.verdi@cryptoventures.com',
    phone: '+39 333 6666666',
    website: 'https://cryptoventures.com',
    status: 'pending',
    partnership_type: 'crypto',
    start_date: '2024-01-01',
    end_date: null,
    terms: 'Partnership in fase di negoziazione per servizi crypto',
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z'
  }
];

export const mockAnalytics: Analytics[] = [
  {
    id: '1',
    metric_name: 'Total Revenue',
    metric_value: 456000,
    metric_unit: 'EUR',
    period: '2024-01',
    category: 'financial',
    created_at: '2024-01-31T23:59:59Z',
    updated_at: '2024-01-31T23:59:59Z'
  },
  {
    id: '2',
    metric_name: 'Active Users',
    metric_value: 892,
    metric_unit: 'users',
    period: '2024-01',
    category: 'user_engagement',
    created_at: '2024-01-31T23:59:59Z',
    updated_at: '2024-01-31T23:59:59Z'
  },
  {
    id: '3',
    metric_name: 'Investment Success Rate',
    metric_value: 94.2,
    metric_unit: 'percentage',
    period: '2024-01',
    category: 'performance',
    created_at: '2024-01-31T23:59:59Z',
    updated_at: '2024-01-31T23:59:59Z'
  },
  {
    id: '4',
    metric_name: 'Average Investment Amount',
    metric_value: 12500,
    metric_unit: 'EUR',
    period: '2024-01',
    category: 'financial',
    created_at: '2024-01-31T23:59:59Z',
    updated_at: '2024-01-31T23:59:59Z'
  },
  {
    id: '5',
    metric_name: 'Customer Satisfaction',
    metric_value: 4.8,
    metric_unit: 'rating',
    period: '2024-01',
    category: 'user_engagement',
    created_at: '2024-01-31T23:59:59Z',
    updated_at: '2024-01-31T23:59:59Z'
  }
];

// Funzioni per gestire i dati mock - Clients
export const getMockClients = (): Client[] => {
  return [...mockClients];
};

export const addMockClient = (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Client => {
  const newClient: Client = {
    ...client,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockClients.unshift(newClient);
  return newClient;
};

export const updateMockClient = (id: string, updates: Partial<Client>): Client | null => {
  const index = mockClients.findIndex(client => client.id === id);
  if (index === -1) return null;
  
  mockClients[index] = {
    ...mockClients[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockClients[index];
};

export const deleteMockClient = (id: string): boolean => {
  const index = mockClients.findIndex(client => client.id === id);
  if (index === -1) return false;
  
  mockClients.splice(index, 1);
  return true;
};

// Funzioni per gestire i dati mock - Packages
export const getMockPackages = (): Package[] => {
  return [...mockPackages];
};

export const addMockPackage = (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Package => {
  const newPackage: Package = {
    ...pkg,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockPackages.unshift(newPackage);
  return newPackage;
};

export const updateMockPackage = (id: string, updates: Partial<Package>): Package | null => {
  const index = mockPackages.findIndex(pkg => pkg.id === id);
  if (index === -1) return null;
  
  mockPackages[index] = {
    ...mockPackages[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockPackages[index];
};

export const deleteMockPackage = (id: string): boolean => {
  const index = mockPackages.findIndex(pkg => pkg.id === id);
  if (index === -1) return false;
  
  mockPackages.splice(index, 1);
  return true;
};

// Funzioni per gestire i dati mock - Investments
export const getMockInvestments = (): Investment[] => {
  return [...mockInvestments];
};

export const addMockInvestment = (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Investment => {
  const newInvestment: Investment = {
    ...investment,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockInvestments.unshift(newInvestment);
  return newInvestment;
};

export const updateMockInvestment = (id: string, updates: Partial<Investment>): Investment | null => {
  const index = mockInvestments.findIndex(investment => investment.id === id);
  if (index === -1) return null;
  
  mockInvestments[index] = {
    ...mockInvestments[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockInvestments[index];
};

export const deleteMockInvestment = (id: string): boolean => {
  const index = mockInvestments.findIndex(investment => investment.id === id);
  if (index === -1) return false;
  
  mockInvestments.splice(index, 1);
  return true;
};

// Funzioni per gestire i dati mock - Payments
export const getMockPayments = (): Payment[] => {
  return [...mockPayments];
};

export const addMockPayment = (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Payment => {
  const newPayment: Payment = {
    ...payment,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockPayments.unshift(newPayment);
  return newPayment;
};

export const updateMockPayment = (id: string, updates: Partial<Payment>): Payment | null => {
  const index = mockPayments.findIndex(payment => payment.id === id);
  if (index === -1) return null;
  
  mockPayments[index] = {
    ...mockPayments[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockPayments[index];
};

export const deleteMockPayment = (id: string): boolean => {
  const index = mockPayments.findIndex(payment => payment.id === id);
  if (index === -1) return false;
  
  mockPayments.splice(index, 1);
  return true;
};

// Funzioni per gestire i dati mock - Team Members
export const getMockTeamMembers = (): TeamMember[] => {
  return [...mockTeamMembers];
};

export const addMockTeamMember = (teamMember: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): TeamMember => {
  const newTeamMember: TeamMember = {
    ...teamMember,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockTeamMembers.unshift(newTeamMember);
  return newTeamMember;
};

export const updateMockTeamMember = (id: string, updates: Partial<TeamMember>): TeamMember | null => {
  const index = mockTeamMembers.findIndex(teamMember => teamMember.id === id);
  if (index === -1) return null;
  
  mockTeamMembers[index] = {
    ...mockTeamMembers[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockTeamMembers[index];
};

export const deleteMockTeamMember = (id: string): boolean => {
  const index = mockTeamMembers.findIndex(teamMember => teamMember.id === id);
  if (index === -1) return false;
  
  mockTeamMembers.splice(index, 1);
  return true;
};

// Funzioni per gestire i dati mock - Partnerships
export const getMockPartnerships = (): Partnership[] => {
  return [...mockPartnerships];
};

export const addMockPartnership = (partnership: Omit<Partnership, 'id' | 'created_at' | 'updated_at'>): Partnership => {
  const newPartnership: Partnership = {
    ...partnership,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockPartnerships.unshift(newPartnership);
  return newPartnership;
};

export const updateMockPartnership = (id: string, updates: Partial<Partnership>): Partnership | null => {
  const index = mockPartnerships.findIndex(partnership => partnership.id === id);
  if (index === -1) return null;
  
  mockPartnerships[index] = {
    ...mockPartnerships[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockPartnerships[index];
};

export const deleteMockPartnership = (id: string): boolean => {
  const index = mockPartnerships.findIndex(partnership => partnership.id === id);
  if (index === -1) return false;
  
  mockPartnerships.splice(index, 1);
  return true;
};

// Funzioni per gestire i dati mock - Analytics
export const getMockAnalytics = (): Analytics[] => {
  return [...mockAnalytics];
};

export const addMockAnalytics = (analytics: Omit<Analytics, 'id' | 'created_at' | 'updated_at'>): Analytics => {
  const newAnalytics: Analytics = {
    ...analytics,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockAnalytics.unshift(newAnalytics);
  return newAnalytics;
};

export const updateMockAnalytics = (id: string, updates: Partial<Analytics>): Analytics | null => {
  const index = mockAnalytics.findIndex(analytics => analytics.id === id);
  if (index === -1) return null;
  
  mockAnalytics[index] = {
    ...mockAnalytics[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockAnalytics[index];
};

export const deleteMockAnalytics = (id: string): boolean => {
  const index = mockAnalytics.findIndex(analytics => analytics.id === id);
  if (index === -1) return false;
  
  mockAnalytics.splice(index, 1);
  return true;
}; 