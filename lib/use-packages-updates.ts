import { useState, useEffect } from 'react';

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

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/packages');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPackages(data.packages || []);
          setLastUpdate(new Date());
          setError(null);
        } else {
          setError(data.message || 'Errore nel caricamento dei pacchetti');
        }
      } else {
        setError('Errore nel caricamento dei pacchetti');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  // Polling per aggiornamenti ogni 5 secondi
  useEffect(() => {
    fetchPackages();
    
    const interval = setInterval(fetchPackages, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Funzione per forzare un aggiornamento immediato
  const refreshPackages = () => {
    fetchPackages();
  };

  return {
    packages,
    loading,
    error,
    lastUpdate,
    refreshPackages
  };
}
