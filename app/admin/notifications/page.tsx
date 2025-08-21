'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, FileText, TrendingUp, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'investment' | 'document' | 'support' | 'system';
  title: string;
  message: string;
  client_name?: string;
  client_email?: string;
  amount?: number;
  package_name?: string;
  status: 'unread' | 'read';
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'investment' | 'document' | 'support' | 'system'>('all');

  useEffect(() => {
    fetchNotifications();
    // Aggiorna le notifiche ogni 30 secondi
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/notifications?status=${filter}&type=${typeFilter}`);
      
      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data.notifications);
        setError(null);
      } else {
        setError('Errore nel caricamento delle notifiche');
      }
    } catch (error) {
      console.error('Errore nel fetch delle notifiche:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'read' })
      });

      if (response.ok) {
        // Aggiorna lo stato locale
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, status: 'read' } : n)
        );
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento della notifica:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'document':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'support':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'unread') {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Ora';
    } else if (diffInHours < 24) {
      return `${diffInHours}h fa`;
    } else {
      return date.toLocaleDateString('it-IT');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Caricamento notifiche...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifiche</h1>
              <p className="text-gray-600">Gestisci le notifiche del sistema</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.status === 'unread').length}
                </div>
                <div className="text-sm text-gray-500">Non lette</div>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tutte</option>
                <option value="unread">Non lette</option>
                <option value="read">Lette</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="investment">Investimenti</option>
                <option value="document">Documenti</option>
                <option value="support">Supporto</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            <button
              onClick={fetchNotifications}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Aggiorna
            </button>
          </div>
        </div>

        {/* Lista Notifiche */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna notifica</h3>
              <p className="text-gray-500">Non ci sono notifiche da visualizzare</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                  notification.status === 'unread' ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {notification.type}
                        </span>
                        {notification.status === 'unread' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Nuova
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      
                      {/* Dettagli aggiuntivi */}
                      {notification.client_name && (
                        <div className="text-sm text-gray-500 space-y-1">
                          <div><strong>Cliente:</strong> {notification.client_name}</div>
                          {notification.client_email && <div><strong>Email:</strong> {notification.client_email}</div>}
                          {notification.amount && <div><strong>Importo:</strong> €{notification.amount.toLocaleString()}</div>}
                          {notification.package_name && <div><strong>Pacchetto:</strong> {notification.package_name}</div>}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(notification.status)}
                          <span>{notification.status === 'unread' ? 'Non letta' : 'Letta'}</span>
                        </span>
                        <span>{formatDate(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Segna come letta
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
