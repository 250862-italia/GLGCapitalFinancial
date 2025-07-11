import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = supabaseAdmin;

export async function GET(request: NextRequest) {
  try {
    // Test if kyc_records table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('kyc_records')
      .select('id')
      .limit(1);

    if (tableError) {
      return NextResponse.json({
        exists: false,
        error: tableError.message,
        suggestion: 'Run the setup-kyc-table.sql script to create the table'
      });
    }

    // Test if we can insert a test record
    const testRecord = {
      client_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      document_type: 'TEST',
      document_number: 'TEST-001',
      status: 'pending',
      notes: 'Test record for table validation'
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('kyc_records')
      .insert(testRecord)
      .select();

    if (insertError) {
      return NextResponse.json({
        exists: true,
        insertable: false,
        error: insertError.message,
        suggestion: 'Check table schema and permissions'
      });
    }

    // Clean up test record
    if (insertTest && insertTest[0]) {
      await supabase
        .from('kyc_records')
        .delete()
        .eq('id', insertTest[0].id);
    }

    return NextResponse.json({
      exists: true,
      insertable: true,
      message: 'KYC records table is working correctly'
    });

  } catch (error) {
    console.error('KYC table check error:', error);
    return NextResponse.json({
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check database connection and permissions'
    }, { status: 500 });
  }
} 