import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_KEY,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
} 