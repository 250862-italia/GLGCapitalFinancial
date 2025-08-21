import { useState, useEffect, useCallback } from 'react';

interface AdminNotification {
  id: string;
  type: 'package_update' | 'package_create' | 'package_delete' | 'investment_request' | 'client_update';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Carica le notifiche
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.log('❌ Admin token non disponibile per notifiche');
        return;
      }

      const response = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const notificationsWithDates = data.notifications.map((notif: any) => ({
            ...notif,
            timestamp: new Date(notif.timestamp)
          }));
          
          setNotifications(notificationsWithDates);
          setUnreadCount(notificationsWithDates.filter((n: AdminNotification) => !n.read).length);
        }
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento notifiche:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marca notifica come letta
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) return;

      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Errore nel marcare notifica come letta:', error);
    }
  }, []);

  // Marca tutte le notifiche come lette
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) return;

      const response = await fetch('/api/admin/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Errore nel marcare tutte le notifiche come lette:', error);
    }
  }, []);

  // Elimina notifica
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) return;

      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('❌ Errore nell\'eliminazione notifica:', error);
    }
  }, [notifications]);

  // Carica notifiche all'avvio e ogni 30 secondi
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
