import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';

export async function GET(request: NextRequest) {
  try {
    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      const users = await db.getAllUsers();
      
      return NextResponse.json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }))
      });
    } else {
      // Mock data for when Supabase is not available
      const mockUsers = [
        {
          id: 'admin_001',
          email: 'admin@glgcapital.com',
          first_name: 'Admin',
          last_name: 'GLG Capital',
          phone: '+39 123 456 7890',
          role: 'admin',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'user_001',
          email: 'user@example.com',
          first_name: 'Test',
          last_name: 'User',
          phone: '+39 098 765 4321',
          role: 'user',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        },
        {
          id: 'user_002',
          email: 'client@example.com',
          first_name: 'Client',
          last_name: 'Example',
          phone: '+39 555 123 4567',
          role: 'user',
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z'
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockUsers
      });
    }

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 