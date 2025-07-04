import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin' | 'superadmin';
  kyc_completed: boolean;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  first_name?: string;
  last_name?: string;
  terms_accepted: boolean;
  marketing_consent: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existingUser) {
        return { success: false, message: 'User already exists with this email' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: data.email.toLowerCase(),
          password_hash: hashedPassword,
          name: data.name,
          first_name: data.first_name || data.name.split(' ')[0],
          last_name: data.last_name || data.name.split(' ').slice(1).join(' '),
          role: 'user',
          kyc_completed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return { success: false, message: 'Failed to create user' };
      }

      return { 
        success: true, 
        message: 'User registered successfully',
        user: newUser
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  static async login(data: LoginData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email.toLowerCase())
        .single();

      if (error || !user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid credentials' };
      }

      return { 
        success: true, 
        message: 'Login successful',
        user: user
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        kyc_completed: user.kyc_completed,
        created_at: user.created_at
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  static async updateKycStatus(userId: string, kycData: any): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          kyc_completed: true,
          kyc_data: kycData
        })
        .eq('id', userId);

      if (error) {
        return { success: false, message: 'Failed to update KYC status' };
      }

      return { success: true, message: 'KYC status updated successfully' };
    } catch (error) {
      console.error('KYC update error:', error);
      return { success: false, message: 'KYC update failed' };
    }
  }

  static isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
  }
} 