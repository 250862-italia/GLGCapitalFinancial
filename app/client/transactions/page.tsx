'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'investment' | 'withdrawal' | 'deposit' | 'fee' | 'return';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  date: string;
  reference?: string;
  fees?: number;
  net_amount?: number;
}

export default function ClientTransactions() {
  const transactions = [
    {
      id: '1',
      type: 'investment' as const,
      amount: 5000,
      currency: 'EUR',
      status: 'completed' as const,
      description: 'Investimento in Pacchetto Premium',
      date: '2024-01-15',
      reference: 'INV-001',
      fees: 25,
      net_amount: 4975
    },
    {
      id: '2',
      type: 'return' as const,
      amount: 125,
      currency: 'EUR',
      status: 'completed' as const,
      description: 'Rendimento mensile investimento',
      date: '2024-01-10',
      reference: 'RET-001'
    },
    {
      id: '3',
      type: 'withdrawal' as const,
      amount: 1000,
      currency: 'EUR',
      status: 'pending' as const,
      description: 'Prelievo parziale investimento',
      date: '2024-01-08',
      reference: 'WTH-001',
      fees: 10,
      net_amount: 990
    },
    {
      id: '4',
      type: 'deposit' as const,
      amount: 2500,
      currency: 'EUR',
      status: 'completed' as const,
      description: 'Deposito aggiuntivo',
      date: '2024-01-05',
      reference: 'DEP-001'
    },
    {
      id: '5',
      type: 'fee' as const,
      amount: 15,
      currency: 'EUR',
      status: 'completed' as const,
      description: 'Commissione di gestione',
      date: '2024-01-01',
      reference: 'FEE-001'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'investment': return 'bg-blue-100 text-blue-800';
      case 'withdrawal': return 'bg-red-100 text-red-800';
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'return': return 'bg-emerald-100 text-emerald-800';
      case 'fee': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'investment': return 'Investimento';
      case 'withdrawal': return 'Prelievo';
      case 'deposit': return 'Deposito';
      case 'return': return 'Rendimento';
      case 'fee': return 'Commissione';
      default: return 'Sconosciuto';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completata';
      case 'pending': return 'In Elaborazione';
      case 'failed': return 'Fallita';
      case 'cancelled': return 'Annullata';
      default: return 'Sconosciuto';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investment': return '📈';
      case 'withdrawal': return '💸';
      case 'deposit': return '💰';
      case 'return': return '🎯';
      case 'fee': return '💳';
      default: return '📊';
    }
  };

  const totalInvested = transactions
    .filter(t => t.type === 'investment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReturns = transactions
    .filter(t => t.type === 'return' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFees = transactions
    .filter(t => t.type === 'fee' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">💳 Le Mie Transazioni</h1>
        <p className="text-gray-600">Pagina transazioni funzionante!</p>
        <p className="text-gray-600">Totale investito: €{totalInvested.toLocaleString()}</p>
        <p className="text-gray-600">Rendimenti: €{totalReturns.toLocaleString()}</p>
        <p className="text-gray-600">Commissioni: €{totalFees.toLocaleString()}</p>
      </div>
    </div>
  );
}
