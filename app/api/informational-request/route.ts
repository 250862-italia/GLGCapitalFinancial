import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, date, signature } = body;
  const { error } = await supabase.from('informational_requests').insert({
    name, email, date, signature, created_at: new Date().toISOString()
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
} 