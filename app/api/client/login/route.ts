import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// JWT Secret (in produzione dovrebbe essere in variabili d'ambiente)
const JWT_SECRET = 'glg-capital-client-secret-2024';

// TODO: In produzione, verificare le credenziali nel database
// Per ora simuliamo un utente di test
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  id: '1',
  firstName: 'Test',
  lastName: 'User'
};

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

    // TODO: In produzione, verificare le credenziali nel database
    // Per ora accettiamo solo l'utente di test
    if (email === TEST_USER.email && password === TEST_USER.password) {
      // Generate JWT token
      const token = sign(
        { 
          userId: TEST_USER.id,
          email: TEST_USER.email,
          role: 'client',
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Login effettuato con successo',
        token,
        user: {
          id: TEST_USER.id,
          email: TEST_USER.email,
          firstName: TEST_USER.firstName,
          lastName: TEST_USER.lastName,
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
