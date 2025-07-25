import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test multiple tables to see which ones exist
    const tests = [
      { name: 'clients', query: supabase.from('clients').select('*').limit(1) },
      { name: 'profiles', query: supabase.from('profiles').select('*').limit(1) },
      { name: 'auth.users', query: supabase.auth.getUser() }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const { data, error } = await test.query;
        
        if (error) {
          results.push({
            table: test.name,
            status: 'error',
            message: error.message,
            code: error.code
          });
        } else {
          results.push({
            table: test.name,
            status: 'success',
            message: 'Table accessible',
            count: Array.isArray(data) ? data.length : 'N/A'
          });
        }
      } catch (err: any) {
        results.push({
          table: test.name,
          status: 'error',
          message: err.message,
          code: 'EXCEPTION'
        });
      }
    }

    // Check if at least one table is accessible
    const successfulTests = results.filter(r => r.status === 'success');
    
    if (successfulTests.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Connessione a Supabase riuscita',
        accessibleTables: successfulTests.map(t => t.table),
        allResults: results
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Nessuna tabella accessibile',
        results: results
      }, { status: 500 });
    }

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message,
      details: err.stack,
      hint: 'Controlla le variabili d\'ambiente e la connessione di rete',
      code: 'CONNECTION_ERROR'
    }, { status: 500 });
  }
} 