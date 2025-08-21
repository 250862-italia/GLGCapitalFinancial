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
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Recupera i dati del cliente dal localStorage
      const clientUser = localStorage.getItem('clientUser');
      if (!clientUser) {
        setError('Utente non autenticato');
        setLoading(false);
        return;
      }

      const user = JSON.parse(clientUser);
      
      // Recupera le transazioni del cliente
      const response = await fetch(`/api/client/transactions?clientEmail=${user.email}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTransactions(result.data.transactions);
          setStats({
            total: result.data.total,
            totalAmount: result.data.totalAmount
          });
          setError(null);
        } else {
          setError(result.message || 'Errore nel caricamento delle transazioni');
        }
      } else {
        setError('Errore nel caricamento delle transazioni');
      }
    } catch (error) {
      console.error('Errore nel fetch delle transazioni:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Caricamento transazioni...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Errore nel caricamento</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/client/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Torna alla Dashboard
              </Link>
              <div className="h-px w-8 bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">💳 Le Mie Transazioni</h1>
                <p className="text-gray-600 mt-1">Monitora tutte le tue attività finanziarie</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Statistiche Riepilogo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
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
                <DollarSign className="h-6 w-6 text-green-600" />
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
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Commissioni</p>
                <p className="text-2xl font-bold text-gray-900">€{totalFees.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista Transazioni */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cronologia Transazioni</h2>
            <p className="text-sm text-gray-600">Ultime {transactions.length} transazioni</p>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna transazione</h3>
              <p className="text-gray-500">Non hai ancora effettuato transazioni. Inizia a investire per vedere la tua cronologia.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                            {getTypeText(transaction.type)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(transaction.date).toLocaleDateString('it-IT')}
                          </span>
                          <span>Rif: {transaction.reference}</span>
                          {transaction.fees && (
                            <span>Commissioni: €{transaction.fees}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'return' ? 'text-green-600' :
                        transaction.type === 'fee' ? 'text-red-600' :
                        'text-gray-900'
                      }`}>
                        {transaction.type === 'return' ? '+' : ''}€{transaction.amount.toLocaleString()}
                      </div>
                      {transaction.net_amount && transaction.net_amount !== transaction.amount && (
                        <div className="text-sm text-gray-500">
                          Netto: €{transaction.net_amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pulsante Aggiorna */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchTransactions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Aggiorna Transazioni
          </button>
        </div>
      </div>
    </div>
  );
}
