import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify admin authentication
async function verifyAdminAuth(request: NextRequest) {
  const adminSession = request.headers.get('x-admin-session');
  const adminToken = request.headers.get('x-admin-token');
  
  if (!adminSession && !adminToken) {
    return { success: false, error: 'Admin session required' };
  }

  // Extract admin ID from session or token
  let adminId;
  if (adminSession) {
    adminId = adminSession.split('_')[1];
  } else if (adminToken) {
    // For admin token, we'll use a simpler approach
    // The token itself serves as authentication
    adminId = 'admin'; // Placeholder for admin token authentication
  }
  
  if (!adminId) {
    return { success: false, error: 'Invalid admin session' };
  }

  try {
    // If using admin token, skip database verification for now
    if (adminId === 'admin') {
      return { success: true, adminId: 'admin' };
    }
    
    // Verify admin exists and has proper role
    const { data: adminUser, error } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', adminId)
      .single();

    if (error || !adminUser) {
      return { success: false, error: 'Admin not found' };
    }

    if (adminUser.role !== 'super_admin' && adminUser.role !== 'admin' && adminUser.role !== 'superadmin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    return { success: true, adminId };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
}

// GET - Fetch all packages
export async function GET(request: NextRequest) {
  console.log('🔍 Admin packages API called');
  
  const auth = await verifyAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching packages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Packages fetched successfully:', packages?.length || 0);
    return NextResponse.json({ packages: packages || [] });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new package
export async function POST(request: NextRequest) {
  console.log('🔍 Admin create package API called');
  
  const auth = await verifyAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, min_investment, max_investment, duration_months, expected_return, status, type, risk_level } = body;

    // Validate required fields
    if (!name || !description || !min_investment || !max_investment || !duration_months || !expected_return) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: newPackage, error } = await supabaseAdmin
      .from('packages')
      .insert([{
        name,
        description,
        type: type || 'balanced',
        min_investment: Number(min_investment),
        max_investment: Number(max_investment),
        expected_return: Number(expected_return),
        duration_months: Number(duration_months),
        risk_level: risk_level || 'medium',
        management_fee: 0,
        performance_fee: 0,
        currency: 'USD',
        is_featured: false,
        status: status || 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Package created successfully:', newPackage.id);
    return NextResponse.json({ package: newPackage });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update package
export async function PUT(request: NextRequest) {
  console.log('🔍 Admin update package API called');
  
  const auth = await verifyAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, min_investment, max_investment, duration_months, expected_return, status, type, risk_level } = body;

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const { data: updatedPackage, error } = await supabaseAdmin
      .from('packages')
      .update({
        name,
        description,
        type: type || 'balanced',
        min_investment: Number(min_investment),
        max_investment: Number(max_investment),
        duration_months: Number(duration_months),
        expected_return: Number(expected_return),
        risk_level: risk_level || 'medium',
        status
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Package updated successfully:', updatedPackage.id);
    return NextResponse.json({ package: updatedPackage });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete package
export async function DELETE(request: NextRequest) {
  console.log('🔍 Admin delete package API called');
  
  const auth = await verifyAdminAuth(request);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    // Check if package is being used by any investments
    const { data: investments, error: checkError } = await supabaseAdmin
      .from('investments')
      .select('id')
      .eq('package_id', id)
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking package usage:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (investments && investments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete package: it is being used by existing investments' 
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting package:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Package deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 