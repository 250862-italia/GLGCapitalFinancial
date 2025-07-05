import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabase';

export async function verifySuperAdmin(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No authorization token provided', status: 401 };
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return { error: 'Invalid token', status: 401 };
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return { error: 'User not found', status: 404 };
    }

    // Check if user is superadmin
    if (userData.role !== 'superadmin') {
      return { error: 'Access denied. Superadmin role required.', status: 403 };
    }

    return { user: userData, success: true };
  } catch (error) {
    console.error('Admin auth error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export function requireSuperAdmin(handler: Function) {
  return async (request: NextRequest) => {
    const authResult = await verifySuperAdmin(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    return handler(request, authResult.user);
  };
} 