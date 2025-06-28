import { NextRequest, NextResponse } from 'next/server';
import { localAuthService } from '../../../../../lib/auth-local';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await localAuthService.getUserById(userId);
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Prevent deletion of superadmin users
    if (existingUser.role === 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete superadmin users'
      }, { status: 403 });
    }

    // Delete user
    const result = await localAuthService.deleteUser(userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Admin user deleted successfully'
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to delete admin user'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 