import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCSRFToken, validateCSRFToken } from '@/lib/csrf';
import { 
  validateInput, 
  VALIDATION_SCHEMAS, 
  sanitizeInput,
  performanceMonitor
} from '@/lib/api-optimizer';
import { verifyAdmin } from '@/lib/admin-auth';
import { getInvestmentsWithFallback } from '@/lib/supabase-fallback';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = performanceMonitor.start('get_investments');
  
  try {
    console.log('🔍 Admin investments API called');
    console.log('🔍 Verifying admin authentication...');
    
    // Verifica autenticazione admin
    const authResult = await verifyAdmin(request);
    console.log('🔍 Auth result:', authResult);
    
    if (!authResult.success) {
      console.log('❌ Auth failed:', authResult.error);
      performanceMonitor.end('get_investments', startTime);
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authResult.error
      }, { status: 401 });
    }
    
    console.log('✅ Admin authentication successful');
    
    // Usa il nuovo sistema di fallback
    const investments = await getInvestmentsWithFallback();
    
    performanceMonitor.end('get_investments', startTime);
    
    return NextResponse.json({
      success: true,
      data: investments,
      message: 'Investments retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching investments:', error);
    performanceMonitor.end('get_investments', startTime);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch investments',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { investment_id, status, notes } = body;

    if (!investment_id || !status) {
      return NextResponse.json(
        { error: 'Investment ID and status are required' },
        { status: 400 }
      );
    }

    // Update investment status in Supabase
    const { data: updatedInvestment, error } = await supabaseAdmin
      .from('investments')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', investment_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!updatedInvestment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Send notification to user - simplified for now
    console.log(`Investment status updated for user ${updatedInvestment.user_id}: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Investment status updated successfully',
      data: updatedInvestment
    });

  } catch (error) {
    console.error('Error updating investment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 