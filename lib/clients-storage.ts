// Sistema di storage locale per i clienti
export interface Client {
  id: string;
  user_id: string;
  profile_id: string;
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
  client_code: string;
  status: string;
  risk_profile: string;
  investment_preferences: any;
  total_invested: number;
  created_at: string;
  updated_at: string;
}

// Dati di fallback iniziali
const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    user_id: 'user_1',
    profile_id: 'profile_1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    company: 'Tech Solutions Inc.',
    position: 'CEO',
    date_of_birth: '1985-03-15',
    nationality: 'United States',
    profile_photo: '',
    address: '123 Main Street',
    city: 'New York',
    country: 'United States',
    postal_code: '10001',
    iban: 'US12345678901234567890',
    bic: 'USABANK123',
    account_holder: 'John Doe',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI001',
    status: 'active',
    risk_profile: 'moderate',
    investment_preferences: { type: 'balanced', sectors: ['tech', 'finance'] },
    total_invested: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user_2',
    profile_id: 'profile_2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+0987654321',
    company: 'Global Investments Ltd.',
    position: 'CFO',
    date_of_birth: '1988-07-22',
    nationality: 'United Kingdom',
    profile_photo: '',
    address: '456 Business Avenue',
    city: 'London',
    country: 'United Kingdom',
    postal_code: 'SW1A 1AA',
    iban: 'GB12345678901234567890',
    bic: 'GBBANK123',
    account_holder: 'Jane Smith',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI002',
    status: 'active',
    risk_profile: 'conservative',
    investment_preferences: { type: 'conservative', sectors: ['real-estate', 'bonds'] },
    total_invested: 75000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user_3',
    profile_id: 'profile_3',
    first_name: 'Marco',
    last_name: 'Rossi',
    email: 'marco.rossi@example.com',
    phone: '+393334445556',
    company: 'Innovation Tech S.p.A.',
    position: 'CTO',
    date_of_birth: '1990-11-08',
    nationality: 'Italy',
    profile_photo: '',
    address: 'Via Roma 123',
    city: 'Milan',
    country: 'Italy',
    postal_code: '20100',
    iban: 'IT123456789012345678901234',
    bic: 'ITBANK123',
    account_holder: 'Marco Rossi',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI003',
    status: 'active',
    risk_profile: 'aggressive',
    investment_preferences: { type: 'aggressive', sectors: ['crypto', 'startups'] },
    total_invested: 100000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: 'user_4',
    profile_id: 'profile_4',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+14155552671',
    company: 'Green Energy Corp.',
    position: 'VP Operations',
    date_of_birth: '1987-04-12',
    nationality: 'Canada',
    profile_photo: '',
    address: '789 Green Street',
    city: 'Toronto',
    country: 'Canada',
    postal_code: 'M5V 3A8',
    iban: 'CA12345678901234567890',
    bic: 'CABANK123',
    account_holder: 'Sarah Johnson',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI004',
    status: 'pending',
    risk_profile: 'moderate',
    investment_preferences: { type: 'balanced', sectors: ['renewable-energy', 'sustainability'] },
    total_invested: 25000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    user_id: 'user_5',
    profile_id: 'profile_5',
    first_name: 'Hans',
    last_name: 'Mueller',
    email: 'hans.mueller@example.com',
    phone: '+49123456789',
    company: 'Precision Engineering GmbH',
    position: 'Managing Director',
    date_of_birth: '1983-09-30',
    nationality: 'Germany',
    profile_photo: '',
    address: 'Industriestrasse 456',
    city: 'Berlin',
    country: 'Germany',
    postal_code: '10115',
    iban: 'DE12345678901234567890',
    bic: 'DEBANK123',
    account_holder: 'Hans Mueller',
    usdt_wallet: 'TQn9Y2khDD8uRe5Bhc9RoQkubNxqeGNQ9L',
    client_code: 'CLI005',
    status: 'active',
    risk_profile: 'conservative',
    investment_preferences: { type: 'conservative', sectors: ['manufacturing', 'infrastructure'] },
    total_invested: 150000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

class ClientsStorage {
  private storageKey = 'glg_clients';
  private clients: Client[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Carica i clienti dal localStorage
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.clients = JSON.parse(stored);
        } else {
          // Prima volta: usa i dati iniziali
          this.clients = [...INITIAL_CLIENTS];
          this.saveToStorage();
        }
      } else {
        // Server-side: usa i dati iniziali
        this.clients = [...INITIAL_CLIENTS];
      }
    } catch (error) {
      console.error('Error loading clients from storage:', error);
      this.clients = [...INITIAL_CLIENTS];
    }
  }

  // Salva i clienti nel localStorage
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.clients));
      }
    } catch (error) {
      console.error('Error saving clients to storage:', error);
    }
  }

  // Ottieni tutti i clienti
  getAll(): Client[] {
    return [...this.clients];
  }

  // Ottieni un cliente per ID
  getById(id: string): Client | null {
    return this.clients.find(client => client.id === id) || null;
  }

  // Crea un nuovo cliente
  create(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Client {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.clients.unshift(newClient); // Aggiungi all'inizio
    this.saveToStorage();
    
    console.log('✅ Client created locally:', newClient.first_name, newClient.last_name);
    return newClient;
  }

  // Aggiorna un cliente esistente
  update(id: string, clientData: Partial<Client>): Client | null {
    const index = this.clients.findIndex(client => client.id === id);
    
    if (index === -1) {
      console.error('❌ Client not found for update:', id);
      return null;
    }

    const updatedClient: Client = {
      ...this.clients[index],
      ...clientData,
      id, // Mantieni l'ID originale
      updated_at: new Date().toISOString()
    };

    this.clients[index] = updatedClient;
    this.saveToStorage();
    
    console.log('✅ Client updated locally:', updatedClient.first_name, updatedClient.last_name);
    return updatedClient;
  }

  // Elimina un cliente
  delete(id: string): boolean {
    const index = this.clients.findIndex(client => client.id === id);
    
    if (index === -1) {
      console.error('❌ Client not found for deletion:', id);
      return false;
    }

    const deletedClient = this.clients[index];
    this.clients.splice(index, 1);
    this.saveToStorage();
    
    console.log('✅ Client deleted locally:', deletedClient.first_name, deletedClient.last_name);
    return true;
  }

  // Sincronizza con dati esterni (es. Supabase)
  syncWithExternalData(externalClients: Client[]): void {
    if (externalClients.length > 0) {
      // Se ci sono dati esterni, sostituisci tutto
      this.clients = externalClients.map(client => ({
        ...client,
        updated_at: client.updated_at || new Date().toISOString()
      }));
      this.saveToStorage();
      console.log('✅ Synced with external data:', externalClients.length, 'clients');
    }
  }

  // Reset ai dati iniziali
  reset(): void {
    this.clients = [...INITIAL_CLIENTS];
    this.saveToStorage();
    console.log('✅ Clients reset to initial data');
  }

  // Ottieni statistiche
  getStats(): { total: number; active: number; pending: number; inactive: number } {
    const total = this.clients.length;
    const active = this.clients.filter(c => c.status === 'active').length;
    const pending = this.clients.filter(c => c.status === 'pending').length;
    const inactive = this.clients.filter(c => c.status === 'inactive').length;

    return { total, active, pending, inactive };
  }

  // Cerca clienti
  search(query: string): Client[] {
    const lowerQuery = query.toLowerCase();
    return this.clients.filter(client => 
      client.first_name.toLowerCase().includes(lowerQuery) ||
      client.last_name.toLowerCase().includes(lowerQuery) ||
      client.email.toLowerCase().includes(lowerQuery) ||
      client.company.toLowerCase().includes(lowerQuery) ||
      client.client_code.toLowerCase().includes(lowerQuery)
    );
  }

  // Filtra per stato
  filterByStatus(status: string): Client[] {
    if (status === 'all') return this.clients;
    return this.clients.filter(client => client.status === status);
  }

  // Filtra per profilo di rischio
  filterByRiskProfile(riskProfile: string): Client[] {
    return this.clients.filter(client => client.risk_profile === riskProfile);
  }

  // Genera codice cliente univoco
  generateClientCode(): string {
    const existingCodes = this.clients.map(c => c.client_code);
    let counter = this.clients.length + 1;
    let newCode = `CLI${counter.toString().padStart(3, '0')}`;
    
    while (existingCodes.includes(newCode)) {
      counter++;
      newCode = `CLI${counter.toString().padStart(3, '0')}`;
    }
    
    return newCode;
  }
}

// Istanza singleton
export const clientsStorage = new ClientsStorage();

// Funzioni di utilità
export const getClients = () => clientsStorage.getAll();
export const getClientById = (id: string) => clientsStorage.getById(id);
export const createClient = (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => clientsStorage.create(data);
export const updateClient = (id: string, data: Partial<Client>) => clientsStorage.update(id, data);
export const deleteClient = (id: string) => clientsStorage.delete(id);
export const syncClients = (externalClients: Client[]) => clientsStorage.syncWithExternalData(externalClients);
export const resetClients = () => clientsStorage.reset();
export const getClientsStats = () => clientsStorage.getStats();
export const searchClients = (query: string) => clientsStorage.search(query);
export const filterClientsByStatus = (status: string) => clientsStorage.filterByStatus(status);
export const filterClientsByRiskProfile = (riskProfile: string) => clientsStorage.filterByRiskProfile(riskProfile);
export const generateClientCode = () => clientsStorage.generateClientCode(); 