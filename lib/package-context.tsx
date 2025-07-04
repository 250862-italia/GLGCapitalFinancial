"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Toast from "../components/ui/Toast";
import { supabase } from "./supabase";

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

const defaultContext: PackageContextType = {
  packages: [],
  loading: false,
  error: null,
  selectedPackage: null,
  setSelectedPackage: () => { console.warn('setSelectedPackage chiamato fuori da PackageProvider'); },
  setPackages: () => { console.warn('setPackages chiamato fuori da PackageProvider'); },
  fetchPackages: async () => { console.warn('fetchPackages chiamato fuori da PackageProvider'); },
  createPackage: async () => { console.warn('createPackage chiamato fuori da PackageProvider'); },
  updatePackage: async () => { console.warn('updatePackage chiamato fuori da PackageProvider'); },
  deletePackage: async () => { console.warn('deletePackage chiamato fuori da PackageProvider'); },
  saveToStorage: () => { console.warn('saveToStorage chiamato fuori da PackageProvider'); },
};
const PackageContext = createContext<PackageContextType>(defaultContext);

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
  const [showToast, setShowToast] = useState(false);

  // Fetch packages from Supabase
  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPackages(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  // Create package in Supabase
  const createPackage = async (pkg: Omit<InvestmentPackage, 'id'>) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([{ ...pkg }])
        .select();
      if (error) throw error;
      setPackages(prev => [ ...(data || []), ...prev ]);
    } catch (err: any) {
      console.error('CREATE PACKAGE ERROR:', err);
      setError(err.message || 'Failed to create package');
      throw err;
    }
  };

  // Update package in Supabase
  const updatePackage = async (id: string, pkg: Partial<InvestmentPackage>) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('packages')
        .update({ ...pkg })
        .eq('id', id)
        .select();
      if (error) throw error;
      setPackages(prev => prev.map(p => p.id === id ? { ...p, ...pkg } : p));
    } catch (err: any) {
      setError(err.message || 'Failed to update package');
      throw err;
    }
  };

  // Delete package in Supabase
  const deletePackage = async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete package');
      throw err;
    }
  };

  // On mount, fetch packages e attiva realtime
  useEffect(() => {
    fetchPackages();
    // Realtime subscription con log di debug
    const subscription = supabase
      .channel('public:packages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, (payload) => {
        console.log('Realtime update:', payload);
        fetchPackages();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
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
    saveToStorage: () => {}, // deprecato
  };

  return (
    <PackageContext.Provider value={value}>
      {children}
      <Toast
        message="Pacchetti aggiornati in background"
        visible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </PackageContext.Provider>
  );
}

export function usePackages() {
  return useContext(PackageContext);
} 