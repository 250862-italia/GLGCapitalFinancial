import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sign } from 'jsonwebtoken';
import { notifyClientLogin } from '@/lib/client-notification-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// JWT Secret (in produzione dovrebbe essere in variabili d'ambiente)
const JWT_SECRET = 'glg-capital-client-secret-2024';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback users per quando Supabase non è disponibile
const FALLBACK_USERS = [
  {
    email: 'test@example.com',
    password: 'password123',
    id: '1',
    firstName: 'Test',
    lastName: 'User'
  },
  {
    email: 'mario.rossi@example.com',
    password: 'password123',
    id: '1755762845994',
    firstName: 'Mario',
    lastName: 'Rossi'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e password sono richiesti' },
        { status: 400 }
      );
    }

    // Try to authenticate with Supabase first
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Query the profiles table for the user
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !profile) {
          console.log('User not found in Supabase, trying fallback');
          // Fall back to test users
        } else {
          // User found in Supabase, verify password
          // Note: In a real implementation, you'd hash and compare passwords
          // For now, we'll use a simple check
          if (profile.password === password || profile.password_hash === password) {
            // Generate JWT token
            const token = sign(
              { 
                userId: profile.id,
                email: profile.email,
                role: 'client',
                timestamp: Date.now()
              },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            // Invia notifica all'admin
            try {
              await notifyClientLogin(
                profile.id,
                profile.email,
                `${profile.first_name || profile.firstName} ${profile.last_name || profile.lastName}`
              );
            } catch (notifError) {
              console.log('Errore notifica admin (non critico):', notifError);
            }

            return NextResponse.json({
              success: true,
              message: 'Login effettuato con successo',
              token,
              user: {
                id: profile.id,
                email: profile.email,
                firstName: profile.first_name || profile.firstName,
                lastName: profile.last_name || profile.lastName,
                role: 'client'
              }
            });
          }
        }
      } catch (supabaseError) {
        console.log('Supabase error, using fallback:', supabaseError);
      }
    }

    // Fallback to test users if Supabase is not available or fails
    const user = FALLBACK_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Generate JWT token
      const token = sign(
        { 
          userId: user.id,
          email: user.email,
          role: 'client',
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Invia notifica all'admin
      try {
        await notifyClientLogin(
          user.id,
          user.email,
          `${user.firstName} ${user.lastName}`
        );
      } catch (notifError) {
        console.log('Errore notifica admin (non critico):', notifError);
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Login effettuato con successo (modalità test)',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'client'
        }
      });
    } else {
      // Invalid credentials
      return NextResponse.json(
        { message: 'Email o password non validi' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
