import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: lista o dettaglio investimento
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    // Dettaglio
    const { data, error } = await supabase.from('investments').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } else {
    // Lista
    const { data, error } = await supabase.from('investments').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }
}

// POST: crea nuovo investimento
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clientId, packageId, amount, currency, startDate, endDate, status, totalReturns, dailyReturns, paymentMethod, notes } = body;
  const { data, error } = await supabase.from('investments').insert([
    { clientId, packageId, amount, currency, startDate, endDate, status, totalReturns, dailyReturns, paymentMethod, notes }
  ]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// PUT: aggiorna investimento
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data, error } = await supabase.from('investments').update(fields).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE: elimina investimento
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabase.from('investments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
} 