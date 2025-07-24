import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateCSRFToken } from '@/lib/csrf';
import { MemoryOptimizer } from '@/lib/memory-optimizer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configurazione file upload sicura
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const memoryOptimizer = MemoryOptimizer.getInstance();
  
  try {
    // Start operation protection
    memoryOptimizer.startOperation();
    
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    // Verifica content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data' },
        { status: 400 }
      );
    }

    // Parsing form data
    const formData = await request.formData();
    const user_id = formData.get('user_id') as string;
    const file = formData.get('photo') as File;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validazione tipo file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validazione dimensione file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Validazione nome file
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.php', '.js', '.exe', '.bat', '.cmd', '.sh'];
    const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasDangerousExtension) {
      return NextResponse.json(
        { error: 'Invalid file extension' },
        { status: 400 }
      );
    }

    // Genera nome file sicuro
    const fileExtension = file.name.split('.').pop();
    const safeFileName = `${user_id}_${Date.now()}.${fileExtension}`;

    // Upload file a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(safeFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Ottieni URL pubblico
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(safeFileName);

    // Aggiorna profilo utente con URL foto nella tabella clients
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        profile_photo: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      // Non fallire se l'aggiornamento del profilo fallisce
    }

    return NextResponse.json({
      success: true,
      photoUrl: urlData.publicUrl,
      photo_url: urlData.publicUrl, // Keep both for compatibility
      message: 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // End operation protection
    memoryOptimizer.endOperation();
  }
} 