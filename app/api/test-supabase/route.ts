import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Prova a leggere la prima riga dalla tabella 'users' o 'clients'
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Connessione a Supabase riuscita',
      data
    });
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