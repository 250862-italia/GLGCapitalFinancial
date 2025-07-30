import { useState, useEffect, useRef } from 'react';

// Hook per gestire lo stato in modo sicuro
export const useSafeState = <T>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetState = (value: T | ((prev: T) => T)) => {
    if (isMounted.current) {
      setState(value);
    }
  };

  return [state, safeSetState] as const;
};

// Hook per gestire il caricamento
export const useLoading = (initialLoading = false) => {
  const [loading, setLoading] = useSafeState(initialLoading);
  const [error, setError] = useSafeState<string | null>(null);

  const executeWithLoading = async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, executeWithLoading };
};

// Hook per gestire l'autenticazione
export const useAuth = () => {
  const [user, setUser] = useSafeState<any>(null);
  const [loading, setLoading] = useSafeState(true);
  const [error, setError] = useSafeState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Implementa la logica di login qui
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenziali non valide');
      }

      const data = await response.json();
      setUser(data.user);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore di login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore di logout';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, logout };
};

// Hook per gestire i dati del profilo
export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useSafeState<any>(null);
  const [loading, setLoading] = useSafeState(false);
  const [error, setError] = useSafeState<string | null>(null);

  const loadProfile = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento del profilo');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento del profilo';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del profilo');
      }

      const data = await response.json();
      setProfile(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'aggiornamento del profilo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, loadProfile, updateProfile };
};

// Hook per gestire gli investimenti
export const useInvestments = (userId?: string) => {
  const [investments, setInvestments] = useSafeState<any[]>([]);
  const [loading, setLoading] = useSafeState(false);
  const [error, setError] = useSafeState<string | null>(null);

  const loadInvestments = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/investments?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento degli investimenti');
      }

      const data = await response.json();
      setInvestments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento degli investimenti';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { investments, loading, error, loadInvestments };
};

// Hook per gestire i pacchetti di investimento
export const usePackages = () => {
  const [packages, setPackages] = useSafeState<any[]>([]);
  const [loading, setLoading] = useSafeState(false);
  const [error, setError] = useSafeState<string | null>(null);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/investments');
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento dei pacchetti');
      }

      const data = await response.json();
      setPackages(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento dei pacchetti';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { packages, loading, error, loadPackages };
}; 