// Local Authentication Service (Temporary)
// This replaces Supabase auth for testing when the database is not available

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  isVerified: boolean;
  password?: string; // Added for local auth
}

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

interface UserOperationResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class LocalAuthService {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, string> = new Map(); // sessionId -> userId

  constructor() {
    // Create default superadmin with secure password
    const superadmin: User = {
      id: 'superadmin-001',
      email: 'admin@glgcapitalgroupllc.com',
      name: 'Super Admin',
      role: 'superadmin',
      createdAt: new Date().toISOString(),
      isVerified: true,
      password: 'GLG2024!Admin' // Secure password for superadmin
    };
    this.users.set(superadmin.email, superadmin);

    // Create additional admin user
    const admin: User = {
      id: 'admin-001',
      email: 'manager@glgcapitalgroupllc.com',
      name: 'Admin Manager',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isVerified: true,
      password: 'GLG2024!Manager' // Secure password for admin
    };
    this.users.set(admin.email, admin);
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
        isVerified: false,
        password: password // Store password for local auth
      };

      this.users.set(email, user);

      console.log(`✅ User registered: ${email}`);
      
      return {
        success: true,
        user: { ...user, password: undefined } // Don't return password
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

      // Check password for admin/superadmin users
      if (user.role === 'admin' || user.role === 'superadmin') {
        if (user.password !== password) {
          return {
            success: false,
            error: 'Invalid credentials'
          };
        }
      } else {
        // For regular users, accept any password (demo mode)
        console.log('Demo mode: accepting any password for regular users');
      }

      const sessionId = `session-${Date.now()}`;
      this.sessions.set(sessionId, user.id);

      console.log(`✅ User logged in: ${email} (${user.role})`);
      
      return {
        success: true,
        user: { ...user, password: undefined } // Don't return password
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
    const user = this.users.get(email);
    return user ? { ...user } : null; // Return with password for internal operations
  }

  async getUserById(userId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return { ...user }; // Return with password for internal operations
      }
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).map(user => ({ ...user, password: undefined }));
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

  // New methods for admin user management
  async createAdminUser(email: string, password: string, name: string, role: 'admin' | 'superadmin'): Promise<UserOperationResponse> {
    try {
      // Check if user already exists
      if (this.users.has(email)) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create new admin user
      const user: User = {
        id: `admin-${Date.now()}`,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
        isVerified: true,
        password: password
      };

      this.users.set(email, user);

      console.log(`✅ Admin user created: ${email} (${role})`);
      
      return {
        success: true,
        user: { ...user, password: undefined }
      };
    } catch (error) {
      console.error('Create admin user error:', error);
      return {
        success: false,
        error: 'Failed to create admin user'
      };
    }
  }

  async updateAdminUser(userId: string, email: string, name: string, role: 'admin' | 'superadmin'): Promise<UserOperationResponse> {
    try {
      // Find user by ID
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Remove old email entry if email changed
      if (existingUser.email !== email) {
        this.users.delete(existingUser.email);
      }

      // Update user
      const updatedUser: User = {
        ...existingUser,
        email,
        name,
        role
      };

      this.users.set(email, updatedUser);

      console.log(`✅ Admin user updated: ${email} (${role})`);
      
      return {
        success: true,
        user: { ...updatedUser, password: undefined }
      };
    } catch (error) {
      console.error('Update admin user error:', error);
      return {
        success: false,
        error: 'Failed to update admin user'
      };
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<UserOperationResponse> {
    try {
      // Find user by ID
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Update password
      existingUser.password = newPassword;
      this.users.set(existingUser.email, existingUser);

      console.log(`✅ Password changed for user: ${existingUser.email}`);
      
      return {
        success: true,
        user: { ...existingUser, password: undefined }
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Failed to change password'
      };
    }
  }

  async deleteUser(userId: string): Promise<UserOperationResponse> {
    try {
      // Find user by ID
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Prevent deletion of superadmin users
      if (existingUser.role === 'superadmin') {
        return {
          success: false,
          error: 'Cannot delete superadmin users'
        };
      }

      // Remove user
      this.users.delete(existingUser.email);

      console.log(`✅ User deleted: ${existingUser.email}`);
      
      return {
        success: true,
        user: { ...existingUser, password: undefined }
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }

  async verifyPassword(inputPassword: string, storedPassword: string): Promise<boolean> {
    return inputPassword === storedPassword;
  }

  // Method to get admin credentials for display
  getAdminCredentials() {
    return {
      superadmin: {
        email: 'admin@glgcapitalgroupllc.com',
        password: 'GLG2024!Admin',
        role: 'superadmin'
      },
      admin: {
        email: 'manager@glgcapitalgroupllc.com',
        password: 'GLG2024!Manager',
        role: 'admin'
      }
    };
  }
}

export const localAuthService = new LocalAuthService(); 