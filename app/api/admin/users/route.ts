import { NextRequest, NextResponse } from 'next/server';
import { localAuthService } from '../../../../lib/auth-local';

export async function GET(request: NextRequest) {
  try {
    // Get all users and filter only admin/superadmin
    const allUsers = await localAuthService.getAllUsers();
    const adminUsers = allUsers.filter(user => user.role === 'admin' || user.role === 'superadmin');

    return NextResponse.json({
      success: true,
      users: adminUsers
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin users'
    }, { status: 500 });
  }
} 