// Local Authentication Service (Temporary)
// This replaces Supabase auth for testing when the database is not available

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  isVerified: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class LocalAuthService {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, string> = new Map(); // sessionId -> userId

  constructor() {
    // Create default superadmin
    const superadmin: User = {
      id: 'superadmin-001',
      email: 'admin@glgcapitalgroupllc.com',
      name: 'Super Admin',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    this.users.set(superadmin.email, superadmin);
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      if (this.users.has(email)) {
        return {
          success: false,
          error: 'User already exists'
        };
      }

      // Create new user
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString(),
        isVerified: false
      };

      this.users.set(email, user);

      console.log(`✅ User registered: ${email}`);
      
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = this.users.get(email);
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // For demo purposes, accept any password
      const sessionId = `session-${Date.now()}`;
      this.sessions.set(sessionId, user.id);

      console.log(`✅ User logged in: ${email}`);
      
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.get(email) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserRole(email: string, role: 'user' | 'admin' | 'superadmin'): Promise<boolean> {
    const user = this.users.get(email);
    if (user) {
      user.role = role;
      this.users.set(email, user);
      return true;
    }
    return false;
  }
}

export const localAuthService = new LocalAuthService(); 