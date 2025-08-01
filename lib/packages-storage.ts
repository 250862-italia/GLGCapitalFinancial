// Sistema di storage locale per i pacchetti
export interface Package {
  id: string;
  name: string;
  description: string;
  min_investment: number;
  max_investment: number;
  duration_months: number;
  expected_return: number;
  status: string;
  type?: string;
  risk_level?: string;
  created_at?: string;
  updated_at?: string;
}

// Dati di fallback iniziali
const INITIAL_PACKAGES: Package[] = [
  {
    id: '1',
    name: 'Pacchetto Real Estate',
    description: 'Investimenti immobiliari sicuri con rendimenti garantiti',
    min_investment: 10000,
    max_investment: 50000,
    duration_months: 18,
    expected_return: 10.5,
    status: 'active',
    type: 'conservative',
    risk_level: 'low',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Pacchetto Tech Growth',
    description: 'Investimenti in startup tecnologiche ad alto potenziale',
    min_investment: 15000,
    max_investment: 75000,
    duration_months: 24,
    expected_return: 18.0,
    status: 'active',
    type: 'aggressive',
    risk_level: 'high',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Pacchetto Green Energy',
    description: 'Investimenti in energie rinnovabili e sostenibilità',
    min_investment: 8000,
    max_investment: 40000,
    duration_months: 30,
    expected_return: 12.5,
    status: 'active',
    type: 'balanced',
    risk_level: 'medium',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Pacchetto Starter',
    description: 'Pacchetto ideale per iniziare con investimenti sicuri',
    min_investment: 1000,
    max_investment: 5000,
    duration_months: 12,
    expected_return: 8.5,
    status: 'active',
    type: 'conservative',
    risk_level: 'low',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Pacchetto Growth',
    description: 'Pacchetto per crescita moderata con rischio bilanciato',
    min_investment: 5000,
    max_investment: 25000,
    duration_months: 24,
    expected_return: 12.0,
    status: 'active',
    type: 'balanced',
    risk_level: 'medium',
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Pacchetto Premium',
    description: 'Pacchetto avanzato per investitori esperti',
    min_investment: 25000,
    max_investment: 100000,
    duration_months: 36,
    expected_return: 15.5,
    status: 'active',
    type: 'aggressive',
    risk_level: 'high',
    created_at: new Date().toISOString()
  }
];

class PackagesStorage {
  private storageKey = 'glg_packages';
  private packages: Package[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Carica i pacchetti dal localStorage
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.packages = JSON.parse(stored);
        } else {
          // Prima volta: usa i dati iniziali
          this.packages = [...INITIAL_PACKAGES];
          this.saveToStorage();
        }
      } else {
        // Server-side: usa i dati iniziali
        this.packages = [...INITIAL_PACKAGES];
      }
    } catch (error) {
      console.error('Error loading packages from storage:', error);
      this.packages = [...INITIAL_PACKAGES];
    }
  }

  // Salva i pacchetti nel localStorage
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.packages));
      }
    } catch (error) {
      console.error('Error saving packages to storage:', error);
    }
  }

  // Ottieni tutti i pacchetti
  getAll(): Package[] {
    return [...this.packages];
  }

  // Ottieni un pacchetto per ID
  getById(id: string): Package | null {
    return this.packages.find(pkg => pkg.id === id) || null;
  }

  // Crea un nuovo pacchetto
  create(packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Package {
    const newPackage: Package = {
      ...packageData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.packages.unshift(newPackage); // Aggiungi all'inizio
    this.saveToStorage();
    
    console.log('✅ Package created locally:', newPackage.name);
    return newPackage;
  }

  // Aggiorna un pacchetto esistente
  update(id: string, packageData: Partial<Package>): Package | null {
    const index = this.packages.findIndex(pkg => pkg.id === id);
    
    if (index === -1) {
      console.error('❌ Package not found for update:', id);
      return null;
    }

    const updatedPackage: Package = {
      ...this.packages[index],
      ...packageData,
      id, // Mantieni l'ID originale
      updated_at: new Date().toISOString()
    };

    this.packages[index] = updatedPackage;
    this.saveToStorage();
    
    console.log('✅ Package updated locally:', updatedPackage.name);
    return updatedPackage;
  }

  // Elimina un pacchetto
  delete(id: string): boolean {
    const index = this.packages.findIndex(pkg => pkg.id === id);
    
    if (index === -1) {
      console.error('❌ Package not found for deletion:', id);
      return false;
    }

    const deletedPackage = this.packages[index];
    this.packages.splice(index, 1);
    this.saveToStorage();
    
    console.log('✅ Package deleted locally:', deletedPackage.name);
    return true;
  }

  // Sincronizza con dati esterni (es. Supabase)
  syncWithExternalData(externalPackages: Package[]): void {
    if (externalPackages.length > 0) {
      // Se ci sono dati esterni, sostituisci tutto
      this.packages = externalPackages.map(pkg => ({
        ...pkg,
        updated_at: pkg.updated_at || new Date().toISOString()
      }));
      this.saveToStorage();
      console.log('✅ Synced with external data:', externalPackages.length, 'packages');
    }
  }

  // Reset ai dati iniziali
  reset(): void {
    this.packages = [...INITIAL_PACKAGES];
    this.saveToStorage();
    console.log('✅ Packages reset to initial data');
  }

  // Ottieni statistiche
  getStats(): { total: number; active: number; inactive: number } {
    const total = this.packages.length;
    const active = this.packages.filter(pkg => pkg.status === 'active').length;
    const inactive = total - active;

    return { total, active, inactive };
  }

  // Cerca pacchetti
  search(query: string): Package[] {
    const lowerQuery = query.toLowerCase();
    return this.packages.filter(pkg => 
      pkg.name.toLowerCase().includes(lowerQuery) ||
      pkg.description.toLowerCase().includes(lowerQuery) ||
      pkg.type?.toLowerCase().includes(lowerQuery) ||
      pkg.risk_level?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filtra per tipo
  filterByType(type: string): Package[] {
    return this.packages.filter(pkg => pkg.type === type);
  }

  // Filtra per stato
  filterByStatus(status: string): Package[] {
    return this.packages.filter(pkg => pkg.status === status);
  }
}

// Istanza singleton
export const packagesStorage = new PackagesStorage();

// Funzioni di utilità
export const getPackages = () => packagesStorage.getAll();
export const getPackageById = (id: string) => packagesStorage.getById(id);
export const createPackage = (data: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => packagesStorage.create(data);
export const updatePackage = (id: string, data: Partial<Package>) => packagesStorage.update(id, data);
export const deletePackage = (id: string) => packagesStorage.delete(id);
export const syncPackages = (externalPackages: Package[]) => packagesStorage.syncWithExternalData(externalPackages);
export const resetPackages = () => packagesStorage.reset();
export const getPackagesStats = () => packagesStorage.getStats();
export const searchPackages = (query: string) => packagesStorage.search(query);
export const filterPackagesByType = (type: string) => packagesStorage.filterByType(type);
export const filterPackagesByStatus = (status: string) => packagesStorage.filterByStatus(status); 