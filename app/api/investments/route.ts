import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emailNotificationService } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

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
    // Lista con join su clients e packages
    const { data, error } = await supabase
      .from('investments')
      .select(`*, client:client_id (first_name, last_name, email), package:package_id (name)`) // join
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }
}

// POST: crea nuovo investimento
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { client_id, package_id, amount, currency, start_date, end_date, status, total_returns, daily_returns, payment_method, notes } = body;
  const { data, error } = await supabase.from('investments').insert([
    { client_id, package_id, amount, currency, start_date, end_date, status, total_returns, daily_returns, payment_method, notes }
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

  // Se lo stato è stato aggiornato, invia email al cliente
  if (fields.status === 'active' || fields.status === 'cancelled') {
    // Recupera dati cliente e pacchetto
    const { data: inv, error: errInv } = await supabase
      .from('investments')
      .select('*, client:client_id (first_name, last_name, email), package:package_id (name)')
      .eq('id', id)
      .single();
    if (!errInv && inv && inv.client && inv.package) {
      const userData = {
        first_name: inv.client.first_name?.split(' ')[0] || '',
        last_name: inv.client.last_name?.split(' ').join(' ') || '',
        email: inv.client.email,
        id: inv.client_id
      };
      const packageData = {
        name: inv.package.name
      };
      if (fields.status === 'active') {
        await emailNotificationService.sendEmail({
          to: userData.email,
          template: 'investment_confirmation',
          data: {
            name: userData.first_name,
            packageName: packageData.name,
            amount: inv.amount,
            transactionId: inv.id,
            date: new Date().toLocaleDateString(),
            portfolioUrl: 'https://glg-capital-financial.vercel.app/investments'
          }
        });
      } else if (fields.status === 'cancelled') {
        await emailNotificationService.sendEmail({
          to: userData.email,
          template: 'investment_rejected',
          data: {
            name: userData.first_name,
            packageName: packageData.name
          }
        });
      }
    }
  }

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