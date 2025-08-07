import { Client, Package } from './data-manager';

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

// Funzioni per gestire i dati mock
export const getMockClients = (): Client[] => {
  return [...mockClients];
};

export const getMockPackages = (): Package[] => {
  return [...mockPackages];
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