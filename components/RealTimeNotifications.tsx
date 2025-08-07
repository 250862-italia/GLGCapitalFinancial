'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Wifi, WifiOff, MessageSquare } from 'lucide-react';
import useWebSocket, { WebSocketMessage } from '@/lib/useWebSocket';

interface RealTimeNotificationsProps {
  token: string | null;
}

export default function RealTimeNotifications({ token }: RealTimeNotificationsProps) {
  const { isConnected, messages, sendMessage, clearMessages } = useWebSocket(token);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Richiedi permesso per le notifiche
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  };

  const getMessageIcon = (type: WebSocketMessage['type']) => {
    switch (type) {
      case 'alert':
        return '🔴';
      case 'notification':
        return '🔔';
      case 'update':
        return '🔄';
      case 'system':
        return '⚙️';
      default:
        return '📨';
    }
  };

  const getMessageColor = (type: WebSocketMessage['type']) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'notification':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'update':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'system':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Pulsante notifiche */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>

        {/* Status connessione */}
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connesso' : 'Disconnesso'}
          </span>
        </div>
      </div>

      {/* Pannello notifiche */}
      {showNotifications && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifiche Real-Time</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearMessages}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Pulisci
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {/* Permesso notifiche */}
            {notificationPermission === 'default' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  Abilita le notifiche per ricevere alert in tempo reale
                </p>
                <button
                  onClick={requestNotificationPermission}
                  className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Abilita Notifiche
                </button>
              </div>
            )}

            {/* Lista messaggi */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nessuna notifica</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getMessageIcon(message.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{message.title}</h4>
                        <p className="text-xs mt-1">{message.message}</p>
                        <p className="text-xs mt-2 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 