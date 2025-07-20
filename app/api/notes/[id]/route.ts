import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { UpdateNoteRequest } from '@/types/note';
import { mockNotes } from '@/lib/fallback-data';
import { validateCSRFToken } from '@/lib/csrf';

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      console.error('Error fetching note:', error);
      return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.log('Using offline data due to exception');
    // Return mock note from offline data
    const id = parseInt(params.id);
    const mockNote = mockNotes.find(note => note.id === id);
    if (mockNote) {
      return NextResponse.json(mockNote);
    } else {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
  }
}

// PUT /api/notes/[id] - Update a specific note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    const body: UpdateNoteRequest = await request.json();
    
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .update({ title: body.title.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      console.error('Error updating note:', error);
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.log('Using offline data due to exception');
    // In fallback mode, return updated mock note
    const id = parseInt(params.id);
    const body: UpdateNoteRequest = await request.json();
    const mockNote = mockNotes.find(note => note.id === id);
    if (mockNote) {
      const updatedNote = {
        ...mockNote,
        title: body.title || mockNote.title,
        updated_at: new Date().toISOString()
      };
      return NextResponse.json(updatedNote);
    } else {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
  }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.log('Using offline data due to exception');
    // In fallback mode, simulate successful deletion
    const id = parseInt(params.id);
    const mockNote = mockNotes.find(note => note.id === id);
    if (mockNote) {
      return NextResponse.json({ message: 'Note deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
  }
} 