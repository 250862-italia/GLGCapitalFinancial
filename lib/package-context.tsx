"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  expectedReturn: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  isActive: boolean;
  features: string[];
  terms: string;
  status: 'Active' | 'Fundraising' | 'Closed';
  createdAt: string;
}

interface PackageContextType {
  packages: InvestmentPackage[];
  loading: boolean;
  error: string | null;
  selectedPackage: InvestmentPackage | null;
  setSelectedPackage: (pkg: InvestmentPackage | null) => void;
  setPackages: React.Dispatch<React.SetStateAction<InvestmentPackage[]>>;
  fetchPackages: () => Promise<void>;
  createPackage: (pkg: Omit<InvestmentPackage, 'id'>) => Promise<void>;
  updatePackage: (id: string, pkg: Partial<InvestmentPackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  saveToStorage: () => void;
}

const PackageContext = createContext<PackageContextType | null>(null);

// Mock data for development
const mockPackages: InvestmentPackage[] = [
  {
    id: '1',
    name: 'Conservative Growth',
    description: 'Low-risk investment focused on stable returns',
    minInvestment: 1000,
    maxInvestment: 50000,
    expectedReturn: 5.5,
    duration: 12,
    riskLevel: 'low',
    category: 'Conservative',
    isActive: true,
    features: ['Diversified portfolio', 'Monthly reports', 'Capital protection'],
    terms: 'Minimum 12-month commitment',
    status: 'Active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Balanced Portfolio',
    description: 'Moderate risk with balanced growth potential',
    minInvestment: 5000,
    maxInvestment: 100000,
    expectedReturn: 8.2,
    duration: 18,
    riskLevel: 'medium',
    category: 'Balanced',
    isActive: true,
    features: ['Mixed asset allocation', 'Quarterly rebalancing', 'Professional management'],
    terms: 'Minimum 18-month commitment',
    status: 'Active',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Aggressive Growth',
    description: 'High-risk, high-reward investment strategy',
    minInvestment: 10000,
    maxInvestment: 500000,
    expectedReturn: 12.5,
    duration: 24,
    riskLevel: 'high',
    category: 'Aggressive',
    isActive: true,
    features: ['Growth-focused assets', 'Active management', 'Higher potential returns'],
    terms: 'Minimum 24-month commitment',
    status: 'Active',
    createdAt: '2024-02-01'
  }
];

const STORAGE_KEY = 'glg-investment-packages';

export function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);

  // Load packages from localStorage
  const loadFromStorage = (): InvestmentPackage[] => {
    if (typeof window === 'undefined') return mockPackages;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : mockPackages;
      }
    } catch (err) {
      console.error('Error loading packages from storage:', err);
    }
    return mockPackages;
  };

  // Save packages to localStorage
  const saveToStorage = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
      console.log('Packages saved to localStorage:', packages);
    } catch (err) {
      console.error('Error saving packages to storage:', err);
      setError('Failed to save packages to storage');
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load from localStorage or use mock data
      const loadedPackages = loadFromStorage();
      setPackages(loadedPackages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (pkg: Omit<InvestmentPackage, 'id'>) => {
    try {
      const newPackage: InvestmentPackage = {
        ...pkg,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().slice(0, 10)
      };
      const updatedPackages = [...packages, newPackage];
      setPackages(updatedPackages);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPackages));
      }
      
      console.log('Package created and saved:', newPackage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create package');
      throw err;
    }
  };

  const updatePackage = async (id: string, pkg: Partial<InvestmentPackage>) => {
    try {
      const updatedPackages = packages.map(p => p.id === id ? { ...p, ...pkg } : p);
      setPackages(updatedPackages);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPackages));
      }
      
      console.log('Package updated and saved:', pkg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package');
      throw err;
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const updatedPackages = packages.filter(p => p.id !== id);
      setPackages(updatedPackages);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPackages));
      }
      
      console.log('Package deleted and saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete package');
      throw err;
    }
  };

  // Auto-save when packages change
  useEffect(() => {
    if (packages.length > 0) {
      saveToStorage();
    }
  }, [packages]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const value: PackageContextType = {
    packages,
    loading,
    error,
    selectedPackage,
    setSelectedPackage,
    setPackages,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    saveToStorage
  };

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const ctx = useContext(PackageContext);
  if (!ctx) throw new Error('usePackages must be used within a PackageProvider');
  return ctx;
} 