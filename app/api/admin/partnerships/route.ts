import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const country = searchParams.get('country');
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let query = supabaseAdmin
      .from('partnerships')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (country && country !== 'all') {
      query = query.eq('country', country);
    }

    if (industry && industry !== 'all') {
      query = query.eq('industry', industry);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,country.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching partnerships:', error);
      return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in partnerships GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      type, 
      status, 
      startDate, 
      endDate, 
      value, 
      description, 
      contactPerson, 
      contactEmail, 
      contactPhone, 
      country, 
      industry, 
      benefits, 
      website, 
      logoUrl, 
      documents, 
      notes 
    } = body;

    // Validation
    if (!name || !type || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['strategic', 'financial', 'technology', 'distribution', 'research'].includes(type)) {
      return NextResponse.json({ error: 'Invalid partnership type' }, { status: 400 });
    }

    if (!['active', 'pending', 'expired', 'terminated'].includes(status)) {
      return NextResponse.json({ error: 'Invalid partnership status' }, { status: 400 });
    }

    const insertData: any = {
      name,
      type,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      value: value || 0,
      description,
      contact_person: contactPerson,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      country,
      industry,
      benefits: benefits || [],
      website,
      logo_url: logoUrl,
      documents: documents || [],
      notes
    };

    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating partnership:', error);
      return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in partnerships POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      type, 
      status, 
      startDate, 
      endDate, 
      value, 
      description, 
      contactPerson, 
      contactEmail, 
      contactPhone, 
      country, 
      industry, 
      benefits, 
      website, 
      logoUrl, 
      documents, 
      notes 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Partnership ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (value !== undefined) updateData.value = value;
    if (description !== undefined) updateData.description = description;
    if (contactPerson !== undefined) updateData.contact_person = contactPerson;
    if (contactEmail !== undefined) updateData.contact_email = contactEmail;
    if (contactPhone !== undefined) updateData.contact_phone = contactPhone;
    if (country !== undefined) updateData.country = country;
    if (industry !== undefined) updateData.industry = industry;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (website !== undefined) updateData.website = website;
    if (logoUrl !== undefined) updateData.logo_url = logoUrl;
    if (documents !== undefined) updateData.documents = documents;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('partnerships')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating partnership:', error);
      return NextResponse.json({ error: 'Failed to update partnership' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in partnerships PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Partnership ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('partnerships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting partnership:', error);
      return NextResponse.json({ error: 'Failed to delete partnership' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Partnership deleted successfully' });
  } catch (error) {
    console.error('Error in partnerships DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 