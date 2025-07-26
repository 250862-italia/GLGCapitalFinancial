// Unified Logout Manager - Fix for all logout buttons
import { cleanupOnLogout } from './csrf-client';

export interface LogoutOptions {
  redirectTo?: string;
  clearAdminData?: boolean;
  clearUserData?: boolean;
  showConfirmation?: boolean;
}

export class LogoutManager {
  private static instance: LogoutManager;

  private constructor() {}

  static getInstance(): LogoutManager {
    if (!LogoutManager.instance) {
      LogoutManager.instance = new LogoutManager();
    }
    return LogoutManager.instance;
  }

  /**
   * Perform a complete logout for regular users
   */
  async logoutUser(options: LogoutOptions = {}): Promise<boolean> {
    const {
      redirectTo = '/login',
      clearUserData = true,
      showConfirmation = false
    } = options;

    try {
      console.log('🔄 LogoutManager: Starting user logout...');

      // Show confirmation if requested
      if (showConfirmation) {
        const confirmed = window.confirm('Sei sicuro di voler effettuare il logout?');
        if (!confirmed) {
          console.log('❌ LogoutManager: User cancelled logout');
          return false;
        }
      }

      // Get CSRF token first
      const csrfResponse = await fetch('/api/csrf', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!csrfResponse.ok) {
        console.warn('⚠️ LogoutManager: Failed to get CSRF token, proceeding anyway');
      }

      let csrfToken = 'fallback-token';
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        csrfToken = csrfData.token;
      }

      // Call logout API
      const logoutResponse = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });

      if (logoutResponse.ok) {
        console.log('✅ LogoutManager: Server logout successful');
      } else {
        console.warn('⚠️ LogoutManager: Server logout failed, proceeding with client cleanup');
      }

      // Clear client-side data
      if (clearUserData) {
        this.clearUserData();
      }

      // Clear CSRF tokens
      cleanupOnLogout();

      console.log('✅ LogoutManager: User logout completed');
      
      // Redirect
      this.redirect(redirectTo);
      
      return true;

    } catch (error) {
      console.error('❌ LogoutManager: Error during user logout:', error);
      
      // Even if there's an error, clear local data and redirect
      if (clearUserData) {
        this.clearUserData();
      }
      cleanupOnLogout();
      this.redirect(redirectTo);
      
      return false;
    }
  }

  /**
   * Perform a complete logout for admin users
   */
  async logoutAdmin(options: LogoutOptions = {}): Promise<boolean> {
    const {
      redirectTo = '/',
      clearAdminData = true,
      showConfirmation = false
    } = options;

    try {
      console.log('🔄 LogoutManager: Starting admin logout...');

      // Show confirmation if requested
      if (showConfirmation) {
        const confirmed = window.confirm('Sei sicuro di voler effettuare il logout dall\'admin?');
        if (!confirmed) {
          console.log('❌ LogoutManager: Admin cancelled logout');
          return false;
        }
      }

      // Clear admin data first
      if (clearAdminData) {
        this.clearAdminData();
      }

      // Also clear user data to be safe
      this.clearUserData();

      // Clear CSRF tokens
      cleanupOnLogout();

      console.log('✅ LogoutManager: Admin logout completed');
      
      // Redirect
      this.redirect(redirectTo);
      
      return true;

    } catch (error) {
      console.error('❌ LogoutManager: Error during admin logout:', error);
      
      // Even if there's an error, clear data and redirect
      if (clearAdminData) {
        this.clearAdminData();
      }
      this.clearUserData();
      cleanupOnLogout();
      this.redirect(redirectTo);
      
      return false;
    }
  }

  /**
   * Clear all user-related data from localStorage
   */
  private clearUserData(): void {
    console.log('🧹 LogoutManager: Clearing user data...');
    
    const itemsToRemove = [
      'user',
      'auth_token',
      'token',
      'session',
      'csrf_token',
      'profile',
      'user_profile'
    ];

    itemsToRemove.forEach(item => {
      try {
        localStorage.removeItem(item);
        console.log(`✅ Removed: ${item}`);
      } catch (error) {
        console.warn(`⚠️ Failed to remove ${item}:`, error);
      }
    });
  }

  /**
   * Clear all admin-related data from localStorage
   */
  private clearAdminData(): void {
    console.log('🧹 LogoutManager: Clearing admin data...');
    
    const itemsToRemove = [
      'admin_user',
      'admin_token',
      'admin_session'
    ];

    itemsToRemove.forEach(item => {
      try {
        localStorage.removeItem(item);
        console.log(`✅ Removed: ${item}`);
      } catch (error) {
        console.warn(`⚠️ Failed to remove ${item}:`, error);
      }
    });
  }

  /**
   * Clear all cookies
   */
  private clearCookies(): void {
    console.log('🍪 LogoutManager: Clearing cookies...');
    
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-auth-token',
      'supabase-auth-token',
      'supabase-access-token',
      'supabase-refresh-token',
      'auth-token',
      'admin-token',
      'csrf-token'
    ];

    cookiesToClear.forEach(cookieName => {
      try {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`✅ Cleared cookie: ${cookieName}`);
      } catch (error) {
        console.warn(`⚠️ Failed to clear cookie ${cookieName}:`, error);
      }
    });
  }

  /**
   * Perform redirect with fallback
   */
  private redirect(url: string): void {
    console.log(`🔄 LogoutManager: Redirecting to ${url}`);
    
    try {
      // Try using Next.js router if available
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = url;
      } else {
        // Fallback
        window.location.replace(url);
      }
    } catch (error) {
      console.error('❌ LogoutManager: Redirect failed:', error);
      // Ultimate fallback
      window.location.href = url;
    }
  }

  /**
   * Force logout - clears everything and redirects
   */
  forceLogout(redirectTo: string = '/'): void {
    console.log('🚨 LogoutManager: Force logout initiated');
    
    try {
      // Clear everything
      this.clearUserData();
      this.clearAdminData();
      this.clearCookies();
      cleanupOnLogout();
      
      // Force redirect
      window.location.href = redirectTo;
    } catch (error) {
      console.error('❌ LogoutManager: Force logout failed:', error);
      // Ultimate fallback
      window.location.href = redirectTo;
    }
  }
}

// Export singleton instance
export const logoutManager = LogoutManager.getInstance();

// Export convenience functions
export const logoutUser = (options?: LogoutOptions) => logoutManager.logoutUser(options);
export const logoutAdmin = (options?: LogoutOptions) => logoutManager.logoutAdmin(options);
export const forceLogout = (redirectTo?: string) => logoutManager.forceLogout(redirectTo); 