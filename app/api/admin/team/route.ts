import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getMockData } from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let query = supabaseAdmin
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (department && department !== 'all') {
      query = query.eq('department', department);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.log('Supabase error, using fallback data:', error.message);
      return NextResponse.json(getMockData('team'));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in team GET:', error);
    console.log('Using fallback data due to exception');
    return NextResponse.json(getMockData('team'));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      role, 
      department, 
      status, 
      permissions, 
      avatar_url, 
      bio, 
      skills 
    } = body;

    // Validation
    if (!name || !email || !role || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['admin', 'manager', 'analyst', 'support'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (!['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const insertData: any = {
      name,
      email,
      phone,
      role,
      department,
      status,
      permissions: permissions || [],
      avatar_url,
      bio,
      skills: skills || [],
      join_date: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating team member:', error);
      return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in team POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      email, 
      phone, 
      role, 
      department, 
      status, 
      permissions, 
      avatar_url, 
      bio, 
      skills 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Team member ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (status) updateData.status = status;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in team PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Team member ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member:', error);
      return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error in team DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 