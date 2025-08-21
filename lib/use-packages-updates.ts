import { useState, useEffect, useCallback } from 'react';

interface Package {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  expectedReturn: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
  status: 'active' | 'inactive';
  features: string[];
}

export function usePackagesUpdates() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Verifica connessione internet
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

  const fetchPackages = useCallback(async (isRetry = false) => {
    try {
      if (!isOnline) {
        setError('Nessuna connessione internet disponibile');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching packages from API...');
      const response = await fetch('/api/client/packages', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Packages data received:', data);
        
        if (data.success && data.packages) {
          setPackages(data.packages);
          setLastUpdate(new Date());
          setRetryCount(0);
          console.log('✅ Packages updated successfully:', data.packages.length);
        } else {
          throw new Error(data.message || 'Formato dati non valido');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        if (response.status === 500) {
          throw new Error('Errore del server - Database non disponibile');
        } else if (response.status === 404) {
          throw new Error('API non trovata');
        } else {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching packages:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Errore di connessione';
      
      if (isRetry && retryCount < 3) {
        console.log(`🔄 Retry attempt ${retryCount + 1}/3...`);
        setRetryCount(prev => prev + 1);
        setError(`Tentativo ${retryCount + 1}/3: ${errorMessage}`);
        
        // Retry dopo 2 secondi
        setTimeout(() => {
          fetchPackages(true);
        }, 2000);
        return;
      }
      
      setError(errorMessage);
      setRetryCount(0);
    } finally {
      setLoading(false);
    }
  }, [isOnline, retryCount]);

  // Polling per aggiornamenti ogni 10 secondi (ridotto da 5 per performance)
  useEffect(() => {
    console.log('🚀 Starting packages polling...');
    fetchPackages();
    
    const interval = setInterval(() => {
      console.log('🔄 Polling packages update...');
      fetchPackages();
    }, 10000);
    
    return () => {
      console.log('🛑 Stopping packages polling...');
      clearInterval(interval);
    };
  }, [fetchPackages]);

  // Funzione per forzare un aggiornamento immediato
  const refreshPackages = useCallback(() => {
    console.log('🔄 Manual refresh requested...');
    setRetryCount(0);
    fetchPackages();
  }, [fetchPackages]);

  // Funzione per riprovare in caso di errore
  const retryFetch = useCallback(() => {
    console.log('🔄 Manual retry requested...');
    setRetryCount(0);
    setError(null);
    fetchPackages(true);
  }, [fetchPackages]);

  return {
    packages,
    loading,
    error,
    lastUpdate,
    refreshPackages,
    retryFetch,
    retryCount,
    isOnline,
    hasError: !!error
  };
}
