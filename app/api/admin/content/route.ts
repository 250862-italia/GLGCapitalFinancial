import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    let query = supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (author) {
      query = query.ilike('author', `%${author}%`);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching content:', error);
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in content GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      type, 
      status, 
      author, 
      content, 
      tags, 
      featured_image_url, 
      meta_description, 
      seo_keywords 
    } = body;

    // Validation
    if (!title || !type || !status || !author || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['article', 'news', 'market', 'partnership'].includes(type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    if (!['published', 'draft', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const insertData: any = {
      title,
      type,
      status,
      author,
      content,
      tags: tags || [],
      featured_image_url,
      meta_description,
      seo_keywords
    };

    // Set publish_date if status is published
    if (status === 'published') {
      insertData.publish_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('content')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating content:', error);
      return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in content POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      title, 
      type, 
      status, 
      author, 
      content, 
      tags, 
      featured_image_url, 
      meta_description, 
      seo_keywords 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (author) updateData.author = author;
    if (content) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (seo_keywords !== undefined) updateData.seo_keywords = seo_keywords;

    // Set publish_date if status is being changed to published
    if (status === 'published') {
      updateData.publish_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in content PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error in content DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 