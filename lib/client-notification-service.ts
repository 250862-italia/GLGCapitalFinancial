// Servizio per inviare notifiche automatiche all'admin per attività client

interface ClientActivity {
  type: 'login' | 'register' | 'investment' | 'profile_update';
  clientId: string;
  clientEmail: string;
  clientName: string;
  timestamp: Date;
  details?: any;
}

class ClientNotificationService {
  private static instance: ClientNotificationService;
  private adminNotificationsUrl = '/api/admin/notifications';

  private constructor() {}

  public static getInstance(): ClientNotificationService {
    if (!ClientNotificationService.instance) {
      ClientNotificationService.instance = new ClientNotificationService();
    }
    return ClientNotificationService.instance;
  }

  // Invia notifica di login client
  async notifyClientLogin(clientId: string, clientEmail: string, clientName: string) {
    try {
      const notification = {
        type: 'client_login' as const,
        title: 'Nuovo Login Cliente',
        message: `Il cliente ${clientName} (${clientEmail}) ha effettuato l'accesso`,
        data: {
          clientId,
          clientEmail,
          clientName,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendAdminNotification(notification);
      console.log('✅ Notifica login client inviata all\'admin');
    } catch (error) {
      console.error('❌ Errore nell\'invio notifica login client:', error);
    }
  }

  // Invia notifica di registrazione client
  async notifyClientRegister(clientId: string, clientEmail: string, clientName: string) {
    try {
      const notification = {
        type: 'client_register' as const,
        title: 'Nuova Registrazione Cliente',
        message: `Nuovo cliente registrato: ${clientName} (${clientEmail})`,
        data: {
          clientId,
          clientEmail,
          clientName,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendAdminNotification(notification);
      console.log('✅ Notifica registrazione client inviata all\'admin');
    } catch (error) {
      console.error('❌ Errore nell\'invio notifica registrazione client:', error);
    }
  }

  // Invia notifica di investimento client
  async notifyClientInvestment(clientId: string, clientEmail: string, clientName: string, investmentDetails: any) {
    try {
      const notification = {
        type: 'investment_request' as const,
        title: 'Nuovo Investimento Cliente',
        message: `Il cliente ${clientName} ha richiesto un nuovo investimento`,
        data: {
          clientId,
          clientEmail,
          clientName,
          investmentDetails,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendAdminNotification(notification);
      console.log('✅ Notifica investimento client inviata all\'admin');
    } catch (error) {
      console.error('❌ Errore nell\'invio notifica investimento client:', error);
    }
  }

  // Invia notifica di aggiornamento profilo client
  async notifyClientProfileUpdate(clientId: string, clientEmail: string, clientName: string, updateDetails: any) {
    try {
      const notification = {
        type: 'client_update' as const,
        title: 'Aggiornamento Profilo Cliente',
        message: `Il cliente ${clientName} ha aggiornato il suo profilo`,
        data: {
          clientId,
          clientEmail,
          clientName,
          updateDetails,
          timestamp: new Date().toISOString()
        }
      };

      await this.sendAdminNotification(notification);
      console.log('✅ Notifica aggiornamento profilo client inviata all\'admin');
    } catch (error) {
      console.error('❌ Errore nell\'invio notifica aggiornamento profilo client:', error);
    }
  }

  // Metodo privato per inviare notifiche all'admin
  private async sendAdminNotification(notification: any) {
    try {
      // Prova a inviare tramite API
      const response = await fetch(this.adminNotificationsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'system-notification' // Token speciale per notifiche di sistema
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore nell\'invio notifica admin:', error);
      
      // Fallback: salva in localStorage per notifiche offline
      this.saveOfflineNotification(notification);
    }
  }

  // Salva notifica offline se l'API non è disponibile
  private saveOfflineNotification(notification: any) {
    try {
      const offlineNotifications = JSON.parse(localStorage.getItem('offlineAdminNotifications') || '[]');
      offlineNotifications.push({
        ...notification,
        offline: true,
        savedAt: new Date().toISOString()
      });
      
      localStorage.setItem('offlineAdminNotifications', JSON.stringify(offlineNotifications));
      console.log('💾 Notifica salvata offline per invio successivo');
    } catch (error) {
      console.error('❌ Errore nel salvataggio notifica offline:', error);
    }
  }

  // Invia notifiche offline salvate quando l'API è di nuovo disponibile
  async sendOfflineNotifications() {
    try {
      const offlineNotifications = JSON.parse(localStorage.getItem('offlineAdminNotifications') || '[]');
      
      if (offlineNotifications.length === 0) return;

      console.log(`📤 Invio ${offlineNotifications.length} notifiche offline...`);

      for (const notification of offlineNotifications) {
        try {
          await this.sendAdminNotification(notification);
          console.log('✅ Notifica offline inviata con successo');
        } catch (error) {
          console.error('❌ Errore nell\'invio notifica offline:', error);
          break; // Se fallisce, non provare con le altre
        }
      }

      // Rimuovi le notifiche inviate con successo
      localStorage.removeItem('offlineAdminNotifications');
      console.log('✅ Tutte le notifiche offline sono state inviate');
    } catch (error) {
      console.error('❌ Errore nell\'invio notifiche offline:', error);
    }
  }
}

// Esporta l'istanza singleton
export const clientNotificationService = ClientNotificationService.getInstance();

// Funzioni helper per uso diretto
export const notifyClientLogin = (clientId: string, clientEmail: string, clientName: string) =>
  clientNotificationService.notifyClientLogin(clientId, clientEmail, clientName);

export const notifyClientRegister = (clientId: string, clientEmail: string, clientName: string) =>
  clientNotificationService.notifyClientRegister(clientId, clientEmail, clientName);

export const notifyClientInvestment = (clientId: string, clientEmail: string, clientName: string, investmentDetails: any) =>
  clientNotificationService.notifyClientInvestment(clientId, clientEmail, clientName, investmentDetails);

export const notifyClientProfileUpdate = (clientId: string, clientEmail: string, clientName: string, updateDetails: any) =>
  clientNotificationService.notifyClientProfileUpdate(clientId, clientEmail, clientName, updateDetails);
