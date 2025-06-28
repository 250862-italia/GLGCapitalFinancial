import { NextRequest, NextResponse } from 'next/server';
import { localAuthService } from '../../../../../lib/auth-local';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name, role } = body;

    // Validate input
    if (!userId || !email || !name || !role) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Validate role
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'Invalid role. Must be admin or superadmin'
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

    // Check if email is already taken by another user
    const userWithEmail = await localAuthService.getUserByEmail(email);
    if (userWithEmail && userWithEmail.id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Email is already taken by another user'
      }, { status: 400 });
    }

    // Update user
    const result = await localAuthService.updateAdminUser(userId, email, name, role);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        user: result.user
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to update admin user'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 