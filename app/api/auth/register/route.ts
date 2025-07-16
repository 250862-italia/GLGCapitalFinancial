import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';
import { createHash } from 'crypto';
import { InputSanitizer } from '@/lib/input-sanitizer';
import { getCorsHeaders } from '@/lib/cors-config';
import { RateLimiter } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔔 API /api/auth/register chiamata');
  
  // Handle CORS
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    const body = await request.json();
    console.log('📥 Dati ricevuti:', { email: body.email, firstName: body.firstName, lastName: body.lastName, country: body.country });
    
    // Check rate limit
    const identifier = RateLimiter.getClientIdentifier(request);
    const rateLimitResult = RateLimiter.isRateLimited(identifier, 'register');
    
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Too many registration attempts.',
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429, 
          headers: {
            ...corsHeaders,
            ...RateLimiter.getRateLimitHeaders(identifier, 'register', false)
          }
        }
      );
    }
    
    // Sanitize and validate input data
    let sanitizedData;
    try {
      sanitizedData = InputSanitizer.sanitizeRegistrationData(body);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { email, password, firstName, lastName, country } = sanitizedData;

    // Test Supabase connection first
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.log('Supabase unavailable, using offline mode');
      
      // Generate mock user data
      const mockUserId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mockUser = {
        id: mockUserId,
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        role: 'user',
        is_active: true,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockClient = {
        id: `client-${mockUserId}`,
        user_id: mockUserId,
        first_name: firstName || '',
        last_name: lastName || '',
        country: country || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        user: mockUser,
        client: mockClient,
        message: 'Registrazione completata! (Modalità offline)',
        warning: 'Database non disponibile - modalità offline attiva'
      }, { headers: corsHeaders });
    }

    // Controlla se l'utente esiste già
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un account con questa email esiste già' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Genera un ID utente univoco
    const userId = crypto.randomUUID();

    // Hash della password
    const passwordHash = createHash('sha256').update(password).digest('hex');

    // Crea utente nella tabella users
    const { data: newUser, error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'user',
        password_hash: passwordHash,
        is_active: true,
        email_verified: true, // Confermato automaticamente
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userInsertError) {
      console.error('❌ Error creating user:', userInsertError);
      return NextResponse.json(
        { error: 'Errore nella creazione dell\'account (tabella users)' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('User created successfully with ID:', userId);

    // Crea profilo cliente
    const client = await createClientProfile(userId, firstName, lastName, country);

    return NextResponse.json({
      success: true,
      user: newUser,
      client,
      message: 'Registrazione completata! Puoi ora accedere al tuo account.'
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function createClientProfile(userId: string, firstName: string, lastName: string, country: string) {
  try {
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        country: country,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creating client profile:', clientError);
      return null;
    }

    return client;
  } catch (error) {
    console.error('Error in createClientProfile:', error);
    return null;
  }
} 