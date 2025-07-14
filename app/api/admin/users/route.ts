import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Fetch users from Supabase Auth and join with client profiles
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get client profiles for all users
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return NextResponse.json({ error: clientsError.message }, { status: 500 });
    }

    // Combine user data with client profiles
    const usersWithProfiles = users.users.map(user => {
      const clientProfile = clients?.find(client => client.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.role || 'user',
        profile: clientProfile || null
      };
    });

    return NextResponse.json(usersWithProfiles);
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add other handlers (POST, PUT, DELETE) as needed, using only Supabase 