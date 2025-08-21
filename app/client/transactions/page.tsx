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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Implementare fetch da API reale
    // Per ora usa dati di esempio
    setTimeout(() => {
      setTransactions([
        {
          id: '1',
          type: 'investment',
          amount: 5000,
          currency: 'EUR',
          status: 'completed',
          description: 'Investimento in Pacchetto Premium',
          date: '2024-01-15',
          reference: 'INV-001',
          fees: 25,
          net_amount: 4975
        },
        {
          id: '2',
          type: 'return',
          amount: 125,
          currency: 'EUR',
          status: 'completed',
          description: 'Rendimento mensile investimento',
          date: '2024-01-10',
          reference: 'RET-001'
        },
        {
          id: '3',
          type: 'withdrawal',
          amount: 1000,
          currency: 'EUR',
          status: 'pending',
          description: 'Prelievo parziale investimento',
          date: '2024-01-08',
          reference: 'WTH-001',
          fees: 10,
          net_amount: 990
        },
        {
          id: '4',
          type: 'deposit',
          amount: 2500,
          currency: 'EUR',
          status: 'completed',
          description: 'Deposito aggiuntivo',
          date: '2024-01-05',
          reference: 'DEP-001'
        },
        {
          id: '5',
          type: 'fee',
          amount: 15,
          currency: 'EUR',
          status: 'completed',
          description: 'Commissione di gestione',
          date: '2024-01-01',
          reference: 'FEE-001'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const totalInvested = transactions
    .filter(t => t.type === 'investment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReturns = transactions
    .filter(t => t.type === 'return' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFees = transactions
    .filter(t => t.type === 'fee' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💳 Le Mie Transazioni</h1>
              <p className="text-gray-600 mt-1">Storico completo di tutte le tue transazioni finanziarie</p>
            </div>
            <Link 
              href="/client/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Torna alla Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Totale Investito</p>
                <p className="text-2xl font-bold text-gray-900">€{totalInvested.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <div className="text-2xl">🎯</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rendimenti Totali</p>
                <p className="text-2xl font-bold text-gray-900">€{totalReturns.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <div className="text-2xl">💳</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Commissioni Totali</p>
                <p className="text-2xl font-bold text-gray-900">€{totalFees.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="sr-only">Cerca transazioni</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="text-gray-400">🔍</div>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Cerca per descrizione o riferimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
                Tipo:
              </label>
              <select
                id="type-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tutti i Tipi</option>
                <option value="investment">Investimenti</option>
                <option value="withdrawal">Prelievi</option>
                <option value="deposit">Depositi</option>
                <option value="return">Rendimenti</option>
                <option value="fee">Commissioni</option>
              </select>

              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tutti gli Status</option>
                <option value="completed">Completate</option>
                <option value="pending">In Elaborazione</option>
                <option value="failed">Fallite</option>
                <option value="cancelled">Annullate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📋 Transazioni ({filteredTransactions.length})</h2>
            <p className="text-sm text-gray-600 mt-1">
              Mostra {filteredTransactions.length} di {transactions.length} transazioni totali
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">{transaction.description}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {getTypeText(transaction.type)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Data: {new Date(transaction.date).toLocaleDateString('it-IT')}</span>
                        {transaction.reference && (
                          <>
                            <span>•</span>
                            <span>Rif: {transaction.reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {transaction.type === 'withdrawal' || transaction.type === 'fee' ? '-' : '+'}€{transaction.amount.toLocaleString()}
                    </div>
                    {transaction.fees && (
                      <div className="text-sm text-gray-500">
                        Commissioni: €{transaction.fees}
                      </div>
                    )}
                    {transaction.net_amount && (
                      <div className="text-sm text-gray-600 font-medium">
                        Netto: €{transaction.net_amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna transazione trovata</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Prova a modificare i filtri di ricerca' 
                  : 'Non hai ancora effettuato transazioni'
                }
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-2xl">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informazioni sulle Transazioni</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• Le transazioni vengono elaborate entro 1-3 giorni lavorativi</p>
                <p>• I rendimenti vengono accreditati mensilmente sul tuo conto</p>
                <p>• Le commissioni vengono addebitate automaticamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
