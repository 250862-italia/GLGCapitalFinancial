import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = supabaseAdmin;

export async function POST(request: NextRequest) {
  try {
    console.log('Creating KYC records table...');
    
    // Create the table using raw SQL
    const { error: createTableError } = await supabase
      .from('clients')
      .select('id')
      .limit(1)
      .then(() => {
        // If we can query clients table, try to create kyc_records
        return supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS kyc_records (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
              document_type VARCHAR(50) NOT NULL,
              document_number VARCHAR(255),
              document_image_url TEXT,
              status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
              notes TEXT,
              verified_at TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });
      });

    if (createTableError) {
      console.error('Failed to create table with RPC:', createTableError);
      
      // Try alternative approach - insert a test record to trigger table creation
      try {
        const { error: testError } = await supabase
          .from('kyc_records')
          .insert({
            client_id: '00000000-0000-0000-0000-000000000000',
            document_type: 'TEST',
            document_number: 'TEST',
            status: 'pending'
          });
        
        if (testError && testError.message?.includes('relation "kyc_records" does not exist')) {
          return NextResponse.json({
            success: false,
            error: 'KYC table does not exist and cannot be created automatically',
            suggestion: 'Please run the setup-kyc-table.sql script manually in your database'
          });
        }
      } catch (testInsertError) {
        console.error('Test insert failed:', testInsertError);
      }
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_kyc_records_client_id ON kyc_records(client_id);
        CREATE INDEX IF NOT EXISTS idx_kyc_records_document_type ON kyc_records(document_type);
        CREATE INDEX IF NOT EXISTS idx_kyc_records_status ON kyc_records(status);
      `
    });

    if (indexError) {
      console.error('Failed to create indexes:', indexError);
    }

    // Test if table was created successfully
    const { data: testData, error: testError } = await supabase
      .from('kyc_records')
      .select('id')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Table creation failed',
        details: testError.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'KYC records table created successfully',
      tableExists: true
    });

  } catch (error) {
    console.error('Create KYC table error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create KYC table',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if table exists
    const { data: testData, error: testError } = await supabase
      .from('kyc_records')
      .select('id')
      .limit(1);

    if (testError && testError.message?.includes('relation "kyc_records" does not exist')) {
      return NextResponse.json({
        exists: false,
        error: testError.message
      });
    }

    // Get table info
    const { count, error: countError } = await supabase
      .from('kyc_records')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      exists: true,
      recordCount: count || 0
    });

  } catch (error) {
    console.error('Check KYC table error:', error);
    return NextResponse.json({
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 