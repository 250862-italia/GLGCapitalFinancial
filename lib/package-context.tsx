"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

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
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  price: number;
  daily_return: number;
  currency: string;
}

interface PackageContextType {
  packages: InvestmentPackage[];
  loading: boolean;
  error: string | null;
  selectedPackage: InvestmentPackage | null;
  showToast: boolean;
  lastUpdated: Date | null;
  fetchPackages: () => Promise<void>;
  selectPackage: (pkg: InvestmentPackage) => void;
  clearSelection: () => void;
  setShowToast: (show: boolean) => void;
  createPackage: (pkg: Omit<InvestmentPackage, 'id' | 'createdAt'>) => Promise<void>;
  updatePackage: (id: string, updates: Partial<InvestmentPackage>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

// Transform database package to InvestmentPackage format
const transformPackage = (dbPackage: any): InvestmentPackage => ({
  id: dbPackage.id,
  name: dbPackage.name,
  description: dbPackage.description,
  minInvestment: dbPackage.min_investment,
  maxInvestment: dbPackage.max_investment,
  expectedReturn: dbPackage.expected_return,
  duration: dbPackage.duration,
  riskLevel: dbPackage.risk_level,
  category: dbPackage.category,
  isActive: dbPackage.is_active,
  features: dbPackage.features || [],
  terms: dbPackage.terms,
  status: dbPackage.status,
  createdAt: dbPackage.created_at,
  price: dbPackage.price,
  daily_return: dbPackage.daily_return,
  currency: dbPackage.currency
});

// Transform InvestmentPackage to database format
const transformToDb = (pkg: InvestmentPackage) => ({
  name: pkg.name,
  description: pkg.description,
  min_investment: pkg.minInvestment,
  max_investment: pkg.maxInvestment,
  expected_return: pkg.expectedReturn,
  duration: pkg.duration,
  risk_level: pkg.riskLevel,
  category: pkg.category,
  is_active: pkg.isActive,
  features: pkg.features,
  terms: pkg.terms,
  status: pkg.status,
  price: pkg.price,
  daily_return: pkg.daily_return,
  currency: pkg.currency
});

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
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }
      
      // Transform database packages to InvestmentPackage format
      const transformedPackages = (data || []).map(transformPackage);
      setPackages(transformedPackages);
      setLastUpdated(new Date());
      
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  // Create new package
  const createPackage = async (pkg: Omit<InvestmentPackage, 'id' | 'createdAt'>) => {
    try {
      const dbPackage = transformToDb(pkg as InvestmentPackage);
      const { data, error } = await supabase
        .from('packages')
        .insert([dbPackage])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create package: ${error.message}`);
      }

      const newPackage = transformPackage(data);
      setPackages(prev => [newPackage, ...prev]);
      setShowToast(true);
    } catch (err: any) {
      console.error('Error creating package:', err);
      setError(err.message || 'Failed to create package');
    }
  };

  // Update package
  const updatePackage = async (id: string, updates: Partial<InvestmentPackage>) => {
    try {
      const dbUpdates = transformToDb(updates as InvestmentPackage);
      const { data, error } = await supabase
        .from('packages')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update package: ${error.message}`);
      }

      const updatedPackage = transformPackage(data);
      setPackages(prev => prev.map(pkg => pkg.id === id ? updatedPackage : pkg));
      setShowToast(true);
    } catch (err: any) {
      console.error('Error updating package:', err);
      setError(err.message || 'Failed to update package');
    }
  };

  // Delete package
  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete package: ${error.message}`);
      }

      setPackages(prev => prev.filter(pkg => pkg.id !== id));
      setShowToast(true);
    } catch (err: any) {
      console.error('Error deleting package:', err);
      setError(err.message || 'Failed to delete package');
    }
  };

  const selectPackage = (pkg: InvestmentPackage) => {
    setSelectedPackage(pkg);
  };

  const clearSelection = () => {
    setSelectedPackage(null);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const value: PackageContextType = {
    packages,
    loading,
    error,
    selectedPackage,
    showToast,
    lastUpdated,
    fetchPackages,
    selectPackage,
    clearSelection,
    setShowToast,
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
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackages must be used within a PackageProvider');
  }
  return context;
} 