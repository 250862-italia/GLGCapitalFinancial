"use client";

import React, { useState, useEffect } from 'react';

export const dynamic = "force-dynamic";
import { supabase } from '@/lib/supabase';

export interface Investment {
  id: string;
  user_id: string;
  package_id: string;
  packageName: string;
  amount: number;
  dailyReturn: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'cancelled';
  totalEarned: number;
  dailyEarnings: number;
  monthlyEarnings: number;
  remainingDays: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPackage {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyReturn: number;
  duration: number;
  features: string[];
  available: boolean;
  popular?: boolean;
}

export default function InvestmentManager() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewInvestment, setShowNewInvestment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch investments from Supabase
  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          packages:package_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch investments: ${error.message}`);
      }

      const transformedInvestments = (data || []).map((investment: any) => ({
        id: investment.id,
        user_id: investment.user_id,
        package_id: investment.package_id,
        packageName: investment.packages?.name || 'Unknown Package',
        amount: investment.amount,
        dailyReturn: investment.daily_return,
        duration: investment.duration,
        startDate: investment.start_date,
        endDate: investment.end_date,
        status: investment.status,
        totalEarned: investment.total_earned || 0,
        dailyEarnings: investment.daily_earnings || 0,
        monthlyEarnings: investment.monthly_earnings || 0,
        remainingDays: investment.remaining_days || 0,
        created_at: investment.created_at,
        updated_at: investment.updated_at
      }));

      setInvestments(transformedInvestments);
    } catch (err: any) {
      console.error('Error fetching investments:', err);
      setError(err.message || 'Failed to fetch investments');
    }
  };

  // Fetch packages from Supabase
  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }

      const transformedPackages = (data || []).map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        minAmount: pkg.min_investment,
        maxAmount: pkg.max_investment,
        dailyReturn: pkg.daily_return,
        duration: pkg.duration,
        features: pkg.features || [],
        available: pkg.is_active,
        popular: pkg.popular || false
      }));

      setPackages(transformedPackages);
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      setError(err.message || 'Failed to fetch packages');
    }
  };

  // Create new investment
  const createInvestment = async (investmentData: {
    package_id: string;
    amount: number;
    user_id: string;
  }) => {
    try {
      const packageData = packages.find(p => p.id === investmentData.package_id);
      if (!packageData) {
        throw new Error('Package not found');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + packageData.duration);

      const { data, error } = await supabase
        .from('investments')
        .insert([{
          user_id: investmentData.user_id,
          package_id: investmentData.package_id,
          amount: investmentData.amount,
          daily_return: packageData.dailyReturn,
          duration: packageData.duration,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          total_earned: 0,
          daily_earnings: (investmentData.amount * packageData.dailyReturn) / 100,
          monthly_earnings: (investmentData.amount * packageData.dailyReturn * 30) / 100,
          remaining_days: packageData.duration
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create investment: ${error.message}`);
      }

      // Refresh investments list
      await fetchInvestments();
      setShowNewInvestment(false);
    } catch (err: any) {
      console.error('Error creating investment:', err);
      setError(err.message || 'Failed to create investment');
    }
  };

  // Update investment
  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update investment: ${error.message}`);
      }

      // Refresh investments list
      await fetchInvestments();
    } catch (err: any) {
      console.error('Error updating investment:', err);
      setError(err.message || 'Failed to update investment');
    }
  };

  // Delete investment
  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete investment: ${error.message}`);
      }

      // Refresh investments list
      await fetchInvestments();
    } catch (err: any) {
      console.error('Error deleting investment:', err);
      setError(err.message || 'Failed to delete investment');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchInvestments(), fetchPackages()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const filteredInvestments = investments.filter(investment => {
    const matchesFilter = selectedFilter === 'all' || investment.status === selectedFilter;
    const matchesSearch = investment.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Investment Manager</h1>
        <button
          onClick={() => setShowNewInvestment(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Investment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Investments</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvestments.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {investment.packageName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(investment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {investment.dailyReturn}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {investment.duration} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      investment.status === 'active' ? 'bg-green-100 text-green-800' :
                      investment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      investment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {investment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(investment.totalEarned)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => updateInvestment(investment.id, { status: 'completed' })}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => deleteInvestment(investment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvestments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No investments found</p>
          </div>
        )}
      </div>

      {/* New Investment Modal */}
      {showNewInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Investment</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createInvestment({
                package_id: formData.get('package_id') as string,
                amount: parseFloat(formData.get('amount') as string),
                user_id: formData.get('user_id') as string
              });
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package
                </label>
                <select
                  name="package_id"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatCurrency(pkg.minAmount)} to {formatCurrency(pkg.maxAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  name="user_id"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewInvestment(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 