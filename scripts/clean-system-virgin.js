const fs = require('fs');
const path = require('path');

console.log('🧹 PULIZIA COMPLETA SISTEMA - RENDIAMO VERGINE');
console.log('================================================\n');

// Funzione per pulire i dati mock
function cleanMockData() {
  console.log('📋 Pulizia dati mock...');
  
  try {
    // Reset mock data to minimal virgin state
    const virginMockData = `
import { Client, Package, Investment, Payment, TeamMember, Partnership, Analytics } from './data-manager';

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

export const mockPackages: Package[] = [
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
    updated_at: new Date().toISOString()
  }
];

export const mockInvestments: Investment[] = [];
export const mockPayments: Payment[] = [];
export const mockTeamMembers: TeamMember[] = [];
export const mockPartnerships: Partnership[] = [];
export const mockAnalytics: Analytics[] = [];

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
`;

    // Scrivi i dati vergini
    fs.writeFileSync(path.join(__dirname, '../lib/mock-data-virgin.ts'), virginMockData);
    console.log('✅ Dati mock vergini creati in lib/mock-data-virgin.ts');
    
    return true;
  } catch (error) {
    console.error('❌ Errore creazione dati mock vergini:', error);
    return false;
  }
}

// Funzione per pulire i file temporanei
function cleanTemporaryFiles() {
  console.log('🗑️ Pulizia file temporanei...');
  
  const tempFiles = [
    'scripts/test-mock-crud.js',
    'scripts/simple-crud-test.js',
    'scripts/test-crud-operations.js'
  ];
  
  let cleaned = 0;
  tempFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Rimosso: ${file}`);
        cleaned++;
      } catch (error) {
        console.log(`⚠️ Non rimosso: ${file} (${error.message})`);
      }
    }
  });
  
  console.log(`✅ File temporanei puliti: ${cleaned}/${tempFiles.length}`);
  return cleaned;
}

// Funzione per creare sistema vergine
function createVirginSystem() {
  console.log('🌟 Creazione sistema vergine...');
  
  try {
    // Crea file di configurazione vergine
    const virginConfig = `
# GLG Capital Financial - Sistema Vergine
# Configurazione pulita per nuovo inizio

## 🎯 Stato Sistema
- Status: VIRGIN
- Data Creazione: ${new Date().toISOString()}
- Versione: 1.0.0

## 📋 Entità Base
- Clients: 1 (Admin User)
- Packages: 1 (Pacchetto Starter)
- Investments: 0
- Payments: 0
- Team Members: 0
- Partnerships: 0
- Analytics: 0

## 🚀 Prossimi Passi
1. Configurare database Supabase
2. Aggiungere dati reali
3. Testare operazioni CRUD
4. Deploy in produzione

## 📊 Struttura CRUD
- CREATE: ✅ Implementato
- READ: ✅ Implementato
- UPDATE: ✅ Implementato
- DELETE: ✅ Implementato

## 🌐 URLs
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: /api/admin/*

## 🔐 Credenziali Admin
- Email: admin@glgcapital.com
- Password: GLGAdmin2024!
`;

    fs.writeFileSync(path.join(__dirname, '../SYSTEM_VIRGIN.md'), virginConfig);
    console.log('✅ File di configurazione vergine creato: SYSTEM_VIRGIN.md');
    
    return true;
  } catch (error) {
    console.error('❌ Errore creazione sistema vergine:', error);
    return false;
  }
}

// Funzione per pulire la cache
function cleanCache() {
  console.log('🧹 Pulizia cache...');
  
  const cacheDirs = [
    '.next',
    'node_modules/.cache',
    'coverage',
    'test-results'
  ];
  
  let cleaned = 0;
  cacheDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Rimosso: ${dir}`);
        cleaned++;
      } catch (error) {
        console.log(`⚠️ Non rimosso: ${dir} (${error.message})`);
      }
    }
  });
  
  console.log(`✅ Cache pulita: ${cleaned}/${cacheDirs.length}`);
  return cleaned;
}

// Funzione principale di pulizia
function cleanSystem() {
  console.log('🚀 INIZIO PULIZIA COMPLETA SISTEMA...\n');
  
  const results = {
    mockData: false,
    tempFiles: 0,
    virginSystem: false,
    cache: 0
  };
  
  try {
    // 1. Pulizia dati mock
    results.mockData = cleanMockData();
    
    // 2. Pulizia file temporanei
    results.tempFiles = cleanTemporaryFiles();
    
    // 3. Creazione sistema vergine
    results.virginSystem = createVirginSystem();
    
    // 4. Pulizia cache
    results.cache = cleanCache();
    
    // Risultati finali
    console.log('\n🎯 RISULTATI PULIZIA COMPLETA');
    console.log('================================');
    console.log(`✅ Dati Mock Vergini: ${results.mockData ? 'Creati' : 'Fallito'}`);
    console.log(`✅ File Temporanei: ${results.tempFiles} rimossi`);
    console.log(`✅ Sistema Vergine: ${results.virginSystem ? 'Creato' : 'Fallito'}`);
    console.log(`✅ Cache Pulita: ${results.cache} directory rimosse`);
    
    if (results.mockData && results.virginSystem) {
      console.log('\n🎉 SISTEMA COMPLETAMENTE PULITO E VERGINE!');
      console.log('✅ Pronto per nuovo inizio');
      console.log('✅ Dati base configurati');
      console.log('✅ Struttura CRUD mantenuta');
      console.log('✅ Cache pulita');
    } else {
      console.log('\n⚠️ Pulizia parziale completata');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    return null;
  }
}

// Esegui pulizia se chiamato direttamente
if (require.main === module) {
  cleanSystem();
}

module.exports = { cleanSystem }; 