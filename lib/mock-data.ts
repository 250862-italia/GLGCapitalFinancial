
import { Client, Package, Investment, Payment, TeamMember, Partnership, Analytics } from './data-manager';

// Array mock persistenti (non vengono resettati ad ogni richiesta)
let mockPackages: Package[] = [
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
  }
];

let mockInvestments: Investment[] = [];
let mockPayments: Payment[] = [];
let mockTeamMembers: TeamMember[] = [];
let mockPartnerships: Partnership[] = [];
let mockAnalytics: Analytics[] = [];

// Dati mock vergini - solo struttura base
export const mockClients: Client[] = [
  {
    id: '1',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@glgcapital.com',
    phone: '+39 333 0000000',
    company: 'GLG Capital Group',
    position: 'Administrator',
    date_of_birth: '1990-01-01',
    nationality: 'Italiana',
    address: 'Via Roma 1',
    city: 'Milano',
    country: 'Italia',
    postal_code: '20100',
    iban: 'IT60X0542811101000000000001',
    bic: 'CRPPIT2P',
    account_holder: 'Admin User',
    usdt_wallet: '0x0000000000000000000000000000000000000000',
    status: 'active',
    risk_profile: 'moderate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Funzioni CRUD base per tutti i mock data
export const getMockClients = (): Client[] => [...mockClients];
export const getMockPackages = (): Package[] => [...mockPackages];
export const getMockInvestments = (): Investment[] => [...mockInvestments];
export const getMockPayments = (): Payment[] => [...mockPayments];
export const getMockTeamMembers = (): TeamMember[] => [...mockTeamMembers];
export const getMockPartnerships = (): Partnership[] => [...mockPartnerships];
export const getMockAnalytics = (): Analytics[] => [...mockAnalytics];

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
  console.log('addMockPackage chiamata con:', pkg);
  console.log('mockPackages prima:', mockPackages);
  
  const newPackage: Package = {
    ...pkg,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('newPackage creato:', newPackage);
  
  mockPackages.unshift(newPackage);
  
  console.log('mockPackages dopo:', mockPackages);
  console.log('mockPackages.length:', mockPackages.length);
  
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

// Funzioni per altre entità (struttura base)
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

// Team Management Mock Functions
export const getMockTeam = (): TeamMember[] => [...mockTeamMembers];

export const addMockTeam = (teamMember: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): TeamMember => {
  const newTeamMember: TeamMember = {
    ...teamMember,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockTeamMembers.unshift(newTeamMember);
  return newTeamMember;
};

export const updateMockTeam = (id: string, updates: Partial<TeamMember>): TeamMember | null => {
  const index = mockTeamMembers.findIndex(member => member.id === id);
  if (index === -1) return null;
  
  mockTeamMembers[index] = {
    ...mockTeamMembers[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockTeamMembers[index];
};

export const deleteMockTeam = (id: string): boolean => {
  const index = mockTeamMembers.findIndex(member => member.id === id);
  if (index === -1) return false;
  
  mockTeamMembers.splice(index, 1);
  return true;
};

// Recupera un cliente specifico per ID
export function getMockClient(id: string): Client | null {
  return mockClients.find(client => client.id === id) || null;
}

// Recupera un pacchetto specifico per ID
export function getMockPackage(id: string): Package | null {
  return mockPackages.find(pkg => pkg.id === id) || null;
}
