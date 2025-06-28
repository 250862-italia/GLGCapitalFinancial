import { NextRequest, NextResponse } from 'next/server';
import { localAuthService } from '../../../../../lib/auth-local';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'New password must be at least 8 characters long'
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

    // Verify current password
    if (!existingUser.password) {
      return NextResponse.json({
        success: false,
        error: 'User does not have a password set'
      }, { status: 400 });
    }
    const isCurrentPasswordValid = await localAuthService.verifyPassword(currentPassword, existingUser.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Current password is incorrect'
      }, { status: 400 });
    }

    // Change password
    const result = await localAuthService.changePassword(userId, newPassword);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to change password'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 