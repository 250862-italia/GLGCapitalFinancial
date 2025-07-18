import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateNoteRequest, UpdateNoteRequest } from '@/types/note';
import { mockNotes } from '@/lib/fallback-data';

// GET /api/notes - Get all notes
export async function GET() {
  try {
    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Using offline data due to Supabase error');
      // Return mock data when Supabase returns an error
      return NextResponse.json(mockNotes);
    }

    return NextResponse.json(notes);
  } catch (error) {
    console.log('Using offline data due to exception');
    // Return mock data when Supabase is not available
    return NextResponse.json(mockNotes);
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const body: CreateNoteRequest = await request.json();
    
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert([{ title: body.title.trim() }])
      .select()
      .single();

    if (error) {
      console.log('Using offline data due to Supabase error');
      // In offline mode, create a mock note
      const newNote = {
        id: Date.now(),
        title: body.title.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return NextResponse.json(newNote, { status: 201 });
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.log('Using offline data due to exception');
    // In offline mode, create a mock note
    try {
      const body: CreateNoteRequest = await request.json();
      const newNote = {
        id: Date.now(),
        title: body.title.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return NextResponse.json(newNote, { status: 201 });
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }
} 