import { NextRequest, NextResponse } from 'next/server';
import { localAuthService } from '../../../../../lib/auth-local';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, role } = body;

    // Validate input
    if (!email || !name || !password || !role) {
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

    // Check if user already exists
    const existingUser = await localAuthService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 400 });
    }

    // Create new admin user
    const result = await localAuthService.createAdminUser(email, password, name, role);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        user: result.user
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to create admin user'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 