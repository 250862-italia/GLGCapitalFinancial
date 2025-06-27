"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Package {
  id: string;
  name: string;
  description: string;
  minInvestment: number;
  maxInvestment: number;
  expectedROI: number;
  duration: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  category: string;
  status: 'Active' | 'Fundraising' | 'Closed';
  createdAt: string;
}

const initialPackages: Package[] = [
  {
    id: '1',
    name: 'Conservative Growth',
    description: 'Balanced portfolio focused on capital preservation with moderate growth potential',
    minInvestment: 10000,
    maxInvestment: 100000,
    expectedROI: 8.5,
    duration: 12,
    riskLevel: 'Low',
    category: 'Conservative',
    status: 'Active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Aggressive Growth',
    description: 'High-growth portfolio focused on emerging markets and innovative technologies',
    minInvestment: 25000,
    maxInvestment: 500000,
    expectedROI: 18.2,
    duration: 24,
    riskLevel: 'High',
    category: 'Growth',
    status: 'Active',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'ESG Sustainable',
    description: 'Sustainable investments with ESG criteria and positive environmental impact',
    minInvestment: 15000,
    maxInvestment: 200000,
    expectedROI: 12.8,
    duration: 18,
    riskLevel: 'Medium',
    category: 'ESG',
    status: 'Active',
    createdAt: '2024-02-01'
  }
];

interface PackageContextType {
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export function PackageProvider({ children }: { children: ReactNode }) {
  // Carica i dati dal localStorage o usa i dati iniziali
  const [packages, setPackages] = useState<Package[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('packages');
      return saved ? JSON.parse(saved) : initialPackages;
    }
    return initialPackages;
  });

  // Salva i dati nel localStorage ogni volta che cambiano
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('packages', JSON.stringify(packages));
    }
  }, [packages]);

  return (
    <PackageContext.Provider value={{ packages, setPackages }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const ctx = useContext(PackageContext);
  if (!ctx) throw new Error('usePackages must be used within a PackageProvider');
  return ctx;
} 