// Setup Testing Framework per GLG Capital Financial
// Configurazione Jest e utilities per i test

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills per Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock per Next.js
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock per Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      then: jest.fn(),
    })),
    functions: {
      invoke: jest.fn(),
    },
  },
  getSupabaseAdmin: jest.fn(),
}));

// Mock per localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock per sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock per fetch
global.fetch = jest.fn();

// Mock per console methods in test
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console errors and warnings in tests unless explicitly needed
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Test utilities
export const testUtils = {
  // Mock user data
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
  },

  // Mock admin user data
  mockAdmin: {
    id: 'test-admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
  },

  // Mock client data
  mockClient: {
    id: 'test-client-id',
    user_id: 'test-user-id',
    profile_id: 'test-profile-id',
    first_name: 'Test',
    last_name: 'Client',
    email: 'client@example.com',
    status: 'active' as const,
    risk_profile: 'moderate' as const,
    total_invested: 10000,
  },

  // Mock investment package
  mockPackage: {
    id: 'test-package-id',
    name: 'Test Package',
    description: 'Test investment package',
    type: 'premium',
    min_investment: 1000,
    max_investment: 50000,
    expected_return: 2.5,
    duration_months: 12,
    risk_level: 'medium' as const,
    status: 'active' as const,
  },

  // Mock investment
  mockInvestment: {
    id: 'test-investment-id',
    user_id: 'test-user-id',
    client_id: 'test-client-id',
    package_id: 'test-package-id',
    amount: 5000,
    status: 'active' as const,
    expected_return: 2.5,
    total_returns: 125,
    daily_returns: 4.17,
    monthly_returns: 125,
  },

  // Helper per creare mock response
  createMockResponse: (data: any, status: number = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }),

  // Helper per creare mock error response
  createMockErrorResponse: (error: string, status: number = 400) => ({
    ok: false,
    status,
    json: async () => ({ error }),
    text: async () => JSON.stringify({ error }),
  }),

  // Helper per aspettare
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper per mock fetch
  mockFetch: (response: any, status: number = 200) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      testUtils.createMockResponse(response, status)
    );
  },

  // Helper per mock fetch error
  mockFetchError: (error: string, status: number = 400) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      testUtils.createMockErrorResponse(error, status)
    );
  },

  // Helper per mock localStorage
  mockLocalStorage: (key: string, value: any) => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(value));
  },

  // Helper per mock sessionStorage
  mockSessionStorage: (key: string, value: any) => {
    sessionStorageMock.getItem.mockReturnValueOnce(JSON.stringify(value));
  },

  // Helper per creare mock Supabase response
  mockSupabaseResponse: (data: any, error: any = null) => ({
    data,
    error,
  }),

  // Helper per creare mock Supabase error
  mockSupabaseError: (message: string, code?: string) => ({
    data: null,
    error: {
      message,
      code,
    },
  }),
};

// Custom matchers per Jest
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidAmount(received: number) {
    const pass = typeof received === 'number' && received > 0 && isFinite(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid amount`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid amount`,
        pass: false,
      };
    }
  },
});

// Extend global types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toBeValidUUID(): R;
      toBeValidAmount(): R;
    }
  }
}

// Export test utilities
export default testUtils; 