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

export function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data
      // In production, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setPackages(mockPackages);
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
        id: Date.now().toString()
      };
      setPackages(prev => [...prev, newPackage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create package');
    }
  };

  const updatePackage = async (id: string, pkg: Partial<InvestmentPackage>) => {
    try {
      setPackages(prev => prev.map(p => p.id === id ? { ...p, ...pkg } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package');
    }
  };

  const deletePackage = async (id: string) => {
    try {
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete package');
    }
  };

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
    deletePackage
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