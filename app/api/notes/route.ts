import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateNoteRequest, UpdateNoteRequest } from '@/types/note';
import { mockNotes } from '@/lib/fallback-data';

// Cache per le note (TTL: 5 minuti)
const CACHE_TTL = 5 * 60 * 1000;
let notesCache: any = null;
let cacheTimestamp = 0;

// GET /api/notes - Get all notes with caching
export async function GET() {
  try {
    // Controlla cache
    const now = Date.now();
    if (notesCache && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json(notesCache, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-TTL': `${Math.floor((CACHE_TTL - (now - cacheTimestamp)) / 1000)}s`
        }
      });
    }

    // Query ottimizzata con timeout
    const queryPromise = supabaseAdmin
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Limite per performance

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    );

    const { data: notes, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      console.log('Using offline data due to Supabase error:', error.message);
      // Aggiorna cache con dati offline
      notesCache = mockNotes;
      cacheTimestamp = now;
      return NextResponse.json(mockNotes, {
        headers: {
          'X-Cache': 'OFFLINE',
          'X-Status': 'offline'
        }
      });
    }

    // Aggiorna cache
    notesCache = notes;
    cacheTimestamp = now;

    return NextResponse.json(notes, {
      headers: {
        'X-Cache': 'MISS',
        'X-Status': 'online'
      }
    });

  } catch (error) {
    console.log('Using offline data due to exception:', error);
    // Aggiorna cache con dati offline
    notesCache = mockNotes;
    cacheTimestamp = Date.now();
    
    return NextResponse.json(mockNotes, {
      headers: {
        'X-Cache': 'OFFLINE',
        'X-Status': 'offline'
      }
    });
  }
}

// POST /api/notes - Create a new note with validation
export async function POST(request: NextRequest) {
  try {
    const body: CreateNoteRequest = await request.json();
    
    // Validazione robusta
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ 
        error: 'Title is required and must be a non-empty string' 
      }, { status: 400 });
    }

    // Sanitizzazione input
    const sanitizedTitle = body.title.trim().substring(0, 500); // Limite lunghezza

    // Query con retry logic
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const { data: note, error } = await supabaseAdmin
          .from('notes')
          .insert([{ 
            title: sanitizedTitle,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
          throw error;
        }

        // Invalida cache
        notesCache = null;
        cacheTimestamp = 0;

        return NextResponse.json(note, { 
          status: 201,
          headers: {
            'X-Status': 'online'
          }
        });

      } catch (retryError) {
        lastError = retryError;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Se tutti i retry falliscono, usa modalità offline
    console.log('Using offline data due to persistent Supabase error:', lastError);
    
    const newNote = {
      id: Date.now(),
      title: sanitizedTitle,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(newNote, { 
      status: 201,
      headers: {
        'X-Status': 'offline'
      }
    });

  } catch (error) {
    console.log('Using offline data due to exception:', error);
    
    try {
      const body: CreateNoteRequest = await request.json();
      const sanitizedTitle = body.title?.trim().substring(0, 500) || 'Untitled Note';
      
      const newNote = {
        id: Date.now(),
        title: sanitizedTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json(newNote, { 
        status: 201,
        headers: {
          'X-Status': 'offline'
        }
      });
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid request body' 
      }, { status: 400 });
    }
  }
} 