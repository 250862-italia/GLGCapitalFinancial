import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getLocalDatabase } from '@/lib/local-database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, password } = body;

    // Validation
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      
      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }

      // Create user
      const user = await db.createUser({
        email,
        password_hash: password,
        first_name,
        last_name,
        phone,
        role: 'user'
      });

      // Create client record
      await db.createClient({
        user_id: user.id,
        company_name: `${first_name} ${last_name}`,
        country: 'Italy'
      });

      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } else {
      // Use Supabase (fallback to mock data for now)
      console.log('Supabase not available, using mock registration');
      
      return NextResponse.json({
        success: true,
        message: 'User registered successfully (mock)',
        user: {
          id: 'mock_user_' + Date.now(),
          email,
          first_name,
          last_name,
          role: 'user'
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 