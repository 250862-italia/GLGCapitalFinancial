// Gestione dati della sessione per le API
// Questo file mantiene i dati in memoria durante la sessione del server

import { Package } from './data-manager';

// Array temporaneo per mantenere i pacchetti creati durante la sessione
export let sessionPackages: Package[] = [
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

// Funzioni per gestire i pacchetti della sessione
export function addSessionPackage(pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Package {
  console.log('addSessionPackage chiamata con:', pkg);
  
  const newPackage: Package = {
    ...pkg,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('newPackage creato:', newPackage);
  
  sessionPackages.unshift(newPackage);
  console.log('Pacchetto aggiunto alla sessione, totale:', sessionPackages.length);
  return newPackage;
}

export function findSessionPackage(id: string): Package | null {
  return sessionPackages.find(pkg => pkg.id === id) || null;
}

export function updateSessionPackage(id: string, updates: Partial<Package>): Package | null {
  const index = sessionPackages.findIndex(pkg => pkg.id === id);
  if (index === -1) return null;
  
  sessionPackages[index] = {
    ...sessionPackages[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return sessionPackages[index];
}

export function deleteSessionPackage(id: string): boolean {
  const index = sessionPackages.findIndex(pkg => pkg.id === id);
  if (index === -1) return false;
  
  sessionPackages.splice(index, 1);
  return true;
}

export function getAllSessionPackages(): Package[] {
  return [...sessionPackages];
}

export function getSessionPackagesCount(): number {
  return sessionPackages.length;
}
