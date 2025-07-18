"use client";

import { useState, useEffect } from 'react';
import { useRealtime } from '@/hooks/use-realtime';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  userId?: string;
  userRole?: 'user' | 'admin' | 'superadmin';
  showDetails?: boolean;
}

export default function ConnectionStatus({ 
  userId, 
  userRole = 'user',
  showDetails = false 
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    isConnected: realtimeConnected, 
    connectionStatus,
    requestNotificationPermission 
  } = useRealtime({
    userId,
    userRole,
    enableNotifications: true,
    enableInvestments: true
  });

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry connection
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const getStatusColor = () => {
    if (!isOnline) return '#dc2626'; // Red
    if (!realtimeConnected) return '#ea580c'; // Orange
    return '#16a34a'; // Green
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!realtimeConnected) return 'Connecting...';
    return 'Connected';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff size={16} />;
    if (!realtimeConnected) return <RefreshCw size={16} className="animate-spin" />;
    return <Wifi size={16} />;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      background: isOnline && realtimeConnected ? '#f0fdf4' : '#fef3c7',
      border: `1px solid ${getStatusColor()}`,
      fontSize: '14px',
      color: getStatusColor()
    }}>
      {getStatusIcon()}
      <span style={{ fontWeight: '500' }}>
        {getStatusText()}
      </span>
      
      {showDetails && (
        <div style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>
          • {connectionStatus.subscriptions} subs
          • {connectionStatus.events} events
        </div>
      )}
      
      {(!isOnline || !realtimeConnected) && (
        <button
          onClick={handleRetry}
          style={{
            marginLeft: '8px',
            padding: '4px 8px',
            borderRadius: '4px',
            border: 'none',
            background: getStatusColor(),
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
      
      {isOnline && realtimeConnected && (
        <CheckCircle size={16} style={{ marginLeft: '4px' }} />
      )}
      
      {(!isOnline || !realtimeConnected) && (
        <AlertCircle size={16} style={{ marginLeft: '4px' }} />
      )}
    </div>
  );
} 