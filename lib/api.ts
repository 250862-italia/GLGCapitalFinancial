import { createClient } from '@supabase/supabase-js';

// Tipi per la gestione degli errori
export interface ApiError {
  type: 'NETWORK' | 'AUTH' | 'VALIDATION' | 'SERVER' | 'UNKNOWN';
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility per gestire errori di rete
const isNetworkError = (error: any): boolean => {
  const networkErrors = [
    'fetch failed',
    'TypeError: fetch failed',
    'Network error',
    'ERR_NAME_NOT_RESOLVED',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED'
  ];
  
  return networkErrors.some(networkError => 
    error?.message?.includes(networkError) || 
    error?.toString().includes(networkError)
  );
};

// Gestione errori centralizzata
const handleApiError = (error: any, context: string): ApiError => {
  console.error(`🚨 API Error in ${context}:`, error);
  
  if (isNetworkError(error)) {
    return {
      type: 'NETWORK',
      message: 'Errore di connessione. Verifica la tua connessione internet.',
      code: 'NETWORK_ERROR',
      details: error
    };
  }
  
  if (error?.status === 401 || error?.code === 'invalid_credentials') {
    return {
      type: 'AUTH',
      message: 'Credenziali non valide. Riprova.',
      code: 'AUTH_ERROR',
      status: 401,
      details: error
    };
  }
  
  if (error?.status === 403) {
    return {
      type: 'AUTH',
      message: 'Accesso negato. Verifica i tuoi permessi.',
      code: 'FORBIDDEN',
      status: 403,
      details: error
    };
  }
  
  if (error?.status === 404) {
    return {
      type: 'SERVER',
      message: 'Risorsa non trovata.',
      code: 'NOT_FOUND',
      status: 404,
      details: error
    };
  }
  
  if (error?.status >= 500) {
    return {
      type: 'SERVER',
      message: 'Errore del server. Riprova più tardi.',
      code: 'SERVER_ERROR',
      status: error.status,
      details: error
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: 'Errore imprevisto. Riprova.',
    code: 'UNKNOWN_ERROR',
    details: error
  };
};

// Wrapper per chiamate fetch con gestione errori
export const apiCall = async <T>(
  url: string,
  options: RequestInit = {},
  context: string = 'API Call'
): Promise<ApiResponse<T>> => {
  try {
    console.log(`🌐 API Call [${context}]:`, url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || `HTTP ${response.status}`,
        details: errorData
      };
    }
    
    const data = await response.json();
    console.log(`✅ API Call [${context}] success:`, data);
    
    return {
      data,
      error: null,
      success: true
    };
    
  } catch (error) {
    const apiError = handleApiError(error, context);
    return {
      data: null,
      error: apiError,
      success: false
    };
  }
};

// Wrapper per chiamate Supabase con gestione errori
export const supabaseCall = async <T>(
  operation: (client: typeof supabase) => Promise<{ data: T | null; error: any }>,
  context: string = 'Supabase Call'
): Promise<ApiResponse<T>> => {
  try {
    console.log(`🔍 Supabase Call [${context}]: Starting`);
    
    const result = await operation(supabase);
    
    if (result.error) {
      throw result.error;
    }
    
    console.log(`✅ Supabase Call [${context}] success:`, result.data);
    
    return {
      data: result.data,
      error: null,
      success: true
    };
    
  } catch (error) {
    const apiError = handleApiError(error, context);
    return {
      data: null,
      error: apiError,
      success: false
    };
  }
};

// API endpoints specifici
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client.auth.signInWithPassword({ email, password }),
      'Login'
    );
  },
  
  // Logout
  logout: async (): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client.auth.signOut(),
      'Logout'
    );
  },
  
  // Reset password
  resetPassword: async (email: string): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client.auth.resetPasswordForEmail(email),
      'Reset Password'
    );
  },
  
  // Get current user
  getCurrentUser: async (): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client.auth.getUser(),
      'Get Current User'
    );
  }
};

export const profileAPI = {
  // Get user profile
  getProfile: async (userId: string): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      'Get Profile'
    );
  },
  
  // Update profile
  updateProfile: async (userId: string, updates: any): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single(),
      'Update Profile'
    );
  }
};

export const clientAPI = {
  // Get client data
  getClient: async (userId: string): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single(),
      'Get Client'
    );
  },
  
  // Update client data
  updateClient: async (userId: string, updates: any): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client
        .from('clients')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single(),
      'Update Client'
    );
  }
};

export const investmentAPI = {
  // Get investments
  getInvestments: async (userId: string): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client
        .from('investments')
        .select('*')
        .eq('user_id', userId),
      'Get Investments'
    );
  },
  
  // Get packages
  getPackages: async (): Promise<ApiResponse> => {
    return supabaseCall(
      (client) => client
        .from('packages')
        .select('*')
        .eq('status', 'active'),
      'Get Packages'
    );
  }
};

// Utility per serializzare errori per React
export const serializeError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.type && error?.message) return `${error.type}: ${error.message}`;
  return JSON.stringify(error, null, 2);
};

// Hook per gestire lo stato di caricamento
export const useApiState = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<ApiError | null>(null);
  
  const executeApiCall = async <T>(
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      
      if (!result.success) {
        setError(result.error);
        return null;
      }
      
      return result.data;
    } catch (err) {
      const apiError = handleApiError(err, 'useApiState');
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, error, executeApiCall };
}; 