import { useEffect, useRef, useState } from 'react';

const WEBSOCKET_URL = process.env.NODE_ENV === 'development'
  ? 'ws://localhost:3001'
  : 'wss://glgcapitalfinancial.vercel.app';

export interface WebSocketMessage {
  type: 'notification' | 'update' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
}

export default function useWebSocket(token: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const connect = () => {
    if (!token) {
      console.log('🔒 No token provided, skipping WebSocket connection');
      return;
    }

    const socketUrl = `${WEBSOCKET_URL}?token=${token}`;
    console.log('🔌 Connecting to WebSocket:', socketUrl);

    wsRef.current = new WebSocket(socketUrl);

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 WebSocket message:', data);
        
        // Aggiungi il messaggio alla lista
        setMessages(prev => [...prev, data]);
        
        // Mostra notifica se è un alert
        if (data.type === 'alert') {
          showNotification(data.title, data.message);
        }
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current.onclose = () => {
      console.warn('🔌 WebSocket disconnected');
      setIsConnected(false);
      scheduleReconnect();
    };
  };

  const scheduleReconnect = () => {
    if (reconnectInterval.current) return;
    reconnectInterval.current = setTimeout(() => {
      console.log('🔄 Attempting WebSocket reconnect...');
      reconnectInterval.current = null;
      connect();
    }, 3000);
  };

  const showNotification = (title: string, message: string) => {
    // Mostra notifica browser se supportato
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
    
    // Fallback: alert
    console.log(`🔔 ${title}: ${message}`);
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectInterval.current) clearTimeout(reconnectInterval.current);
    };
  }, [token]);

  return {
    isConnected,
    messages,
    sendMessage,
    clearMessages
  };
} 