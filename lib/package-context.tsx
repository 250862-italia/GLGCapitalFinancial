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
  price?: number;
  daily_return?: number;
  currency?: string;
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
  lastUpdated: Date | null;
}

const defaultContext: PackageContextType = {
  packages: [],
  loading: false,
  error: null,
  selectedPackage: null,
  setSelectedPackage: () => { console.warn('setSelectedPackage called outside PackageProvider'); },
  setPackages: () => { console.warn('setPackages called outside PackageProvider'); },
  fetchPackages: async () => { console.warn('fetchPackages called outside PackageProvider'); },
  createPackage: async () => { console.warn('createPackage called outside PackageProvider'); },
  updatePackage: async () => { console.warn('updatePackage called outside PackageProvider'); },
  deletePackage: async () => { console.warn('deletePackage called outside PackageProvider'); },
  saveToStorage: () => { console.warn('saveToStorage called outside PackageProvider'); },
  lastUpdated: null,
};
const PackageContext = createContext<PackageContextType>(defaultContext);

// Mock data for offline mode
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
    createdAt: '2024-01-15',
    price: 1000,
    daily_return: 0.015,
    currency: 'USD'
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
    createdAt: '2024-01-20',
    price: 5000,
    daily_return: 0.022,
    currency: 'USD'
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
    createdAt: '2024-02-01',
    price: 10000,
    daily_return: 0.034,
    currency: 'USD'
  }
];

const STORAGE_KEY = 'glg-investment-packages';

// Function to transform database package to InvestmentPackage
function transformPackage(dbPackage: any): InvestmentPackage {
  return {
    id: dbPackage.id,
    name: dbPackage.name,
    description: dbPackage.description || '',
    minInvestment: dbPackage.min_investment || dbPackage.minAmount || 1000,
    maxInvestment: dbPackage.max_investment || dbPackage.maxAmount || 50000,
    expectedReturn: dbPackage.expectedReturn || dbPackage.daily_return || 5.0,
    duration: dbPackage.duration || 12,
    riskLevel: dbPackage.riskLevel || 'medium',
    category: dbPackage.category || 'General',
    isActive: dbPackage.is_active !== undefined ? dbPackage.is_active : true,
    features: dbPackage.features || [],
    terms: dbPackage.terms || '',
    status: dbPackage.status || 'Active',
    createdAt: dbPackage.created_at || new Date().toISOString(),
    price: dbPackage.price,
    daily_return: dbPackage.daily_return,
    currency: dbPackage.currency || 'USD'
  };
}

export function PackageProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch packages from Supabase
  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('Supabase connection failed, using offline mode');
        // Use mock data in offline mode
        setPackages(mockPackages);
        return;
      }
      
      // Transform database packages to InvestmentPackage format
      const transformedPackages = (data || []).map(transformPackage);
      setPackages(transformedPackages);
      setLastUpdated(new Date());
      
      // Save to localStorage for offline access
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transformedPackages));
      
    } catch (err: any) {
      console.log('Error fetching packages, using offline mode:', err);
      setPackages(mockPackages);
      setLastUpdated(new Date());
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
        .insert([{
          name: pkg.name,
          description: pkg.description,
          min_investment: pkg.minInvestment,
          max_investment: pkg.maxInvestment,
          daily_return: pkg.expectedReturn,
          duration: pkg.duration,
          category: pkg.category,
          is_active: pkg.isActive,
          currency: pkg.currency || 'USD',
          price: pkg.price || pkg.minInvestment
        }])
        .select();
      
      if (error) throw error;
      
      const newPackage = transformPackage(data?.[0]);
      setPackages(prev => [newPackage, ...prev]);
      
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
        .update({
          name: pkg.name,
          description: pkg.description,
          min_investment: pkg.minInvestment,
          max_investment: pkg.maxInvestment,
          daily_return: pkg.expectedReturn,
          duration: pkg.duration,
          category: pkg.category,
          is_active: pkg.isActive,
          currency: pkg.currency,
          price: pkg.price
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      const updatedPackage = transformPackage(data?.[0]);
      setPackages(prev => prev.map(p => p.id === id ? updatedPackage : p));
      
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

  // Save packages to localStorage
  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
  };

  // On mount, fetch packages and activate realtime
  useEffect(() => {
    fetchPackages();
    
    // Try to set up realtime subscription
    try {
      const subscription = supabase
        .channel('public:packages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, (payload) => {
          console.log('Realtime package update:', payload);
          // Refresh packages when changes occur
          fetchPackages();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    } catch (error) {
      console.log('Realtime subscription failed, continuing without realtime updates');
    }
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
    saveToStorage,
    lastUpdated
  };

  return (
    <PackageContext.Provider value={value}>
      {children}
      {showToast && (
        <Toast
          message={error || 'Operation completed successfully'}
          type={error ? 'error' : 'success'}
          onClose={() => setShowToast(false)}
        />
      )}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackages must be used within a PackageProvider');
  }
  return context;
} 