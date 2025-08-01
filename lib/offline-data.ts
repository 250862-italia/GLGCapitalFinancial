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
  }
}; 