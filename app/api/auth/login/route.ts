import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getLocalDatabase } from '@/lib/local-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      
      // Find user by email
      const user = await db.getUserByEmail(email);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Get client data
      const client = await db.getClientByUserId(user.id);

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        client: client ? {
          id: client.id,
          company_name: client.company_name,
          country: client.country
        } : null
      });
    } else {
      // Hardcoded admin login fallback
      if (email === 'admin@glgcapital.com' && password === 'Admin123!@#') {
        return NextResponse.json({
          success: true,
          message: 'Admin login successful',
          user: {
            id: 'admin_001',
            email: 'admin@glgcapital.com',
            first_name: 'Admin',
            last_name: 'GLG Capital',
            role: 'admin'
          }
        });
      }

      // Mock user login for testing
      if (email === 'user@example.com' && password === 'password123') {
        return NextResponse.json({
          success: true,
          message: 'User login successful (mock)',
          user: {
            id: 'mock_user_001',
            email: 'user@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'user'
          }
        });
      }

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 