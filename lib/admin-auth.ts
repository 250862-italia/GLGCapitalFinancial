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
    
    // Get admin session from cookies or headers
    const adminSession = request.headers.get('x-admin-session') || 
                        request.cookies.get('admin_session')?.value;
    
    console.log('🔍 Admin session from request:', adminSession);
    
    if (!adminSession) {
      console.log('❌ No admin session found');
      return { error: 'Admin session not found', status: 401 };
    }

    // Special token for system notifications
    if (adminSession === 'admin_system_notification') {
      console.log('✅ System notification token accepted');
      return { 
        user: { id: 'system', role: 'admin' }, 
        success: true 
      };
    }

    // For now, allow any admin session (we can add more validation later)
    // In a real system, you would verify the session token against a database
    
    // Check if it's a valid admin session format
    if (!adminSession.includes('admin_')) {
      console.log('❌ Invalid admin session format');
      return { error: 'Invalid admin session', status: 401 };
    }

    // Extract admin ID from session
    const adminId = adminSession.split('_')[1];
    console.log('🔍 Extracted admin ID:', adminId);
    
    console.log('✅ Admin session validated');
    return { 
      user: { id: adminId, role: 'admin' }, 
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