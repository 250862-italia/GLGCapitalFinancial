"use client";
import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return new Response(JSON.stringify({
    success: false,
    message: '🚨 Profile updates are temporarily disabled'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
} 