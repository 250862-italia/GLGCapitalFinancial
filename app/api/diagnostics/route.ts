import { NextRequest, NextResponse } from 'next/server';

// Sostituisci con l'URL della tua Edge Function su Supabase
const EDGE_FUNCTION_URL = 'https://<TUO_PROJECT>.functions.supabase.co/diagnostics';

export async function GET(req: NextRequest) {
  const table = req.nextUrl.searchParams.get('table');
  if (!table) {
    return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}?table=${encodeURIComponent(table)}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 