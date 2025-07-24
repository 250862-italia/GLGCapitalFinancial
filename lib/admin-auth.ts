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

// Simple admin authentication for the current admin system
export async function verifyAdmin(request: NextRequest) {
  try {
    console.log('🔍 Verifying admin authentication...');
    
    // Get admin token from headers (sent by frontend)
    const adminToken = request.headers.get('x-admin-token') || 
                      request.headers.get('X-Admin-Token') ||
                      request.headers.get('authorization')?.replace('Bearer ', '');
    
    console.log('🔍 Admin token from request:', adminToken ? 'present' : 'missing');
    
    if (!adminToken) {
      console.log('❌ No admin token found');
      return { error: 'Admin token not found', status: 401 };
    }

    // Special token for system notifications
    if (adminToken === 'admin_system_notification') {
      console.log('✅ System notification token accepted');
      return { 
        user: { id: 'system', role: 'admin' }, 
        success: true 
      };
    }

    // For now, allow any admin token (we can add more validation later)
    // In a real system, you would verify the token against a database
    
    // Check if it's a valid admin token format
    if (adminToken.length < 10) {
      console.log('❌ Invalid admin token format');
      return { error: 'Invalid admin token', status: 401 };
    }

    console.log('✅ Admin token validated');
    return { 
      user: { id: 'admin', role: 'admin' }, 
      success: true 
    };
  } catch (error) {
    console.error('Admin auth error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest) => {
    const authResult = await verifyAdmin(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    return handler(request, authResult.user);
  };
} 