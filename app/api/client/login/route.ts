import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// JWT Secret (in produzione dovrebbe essere in variabili d'ambiente)
const JWT_SECRET = 'glg-capital-client-secret-2024';

// TODO: In produzione, verificare le credenziali nel database
// Per ora simuliamo alcuni utenti di test
const TEST_USERS = [
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

    // TODO: In produzione, verificare le credenziali nel database
    // Per ora accettiamo solo gli utenti di test
    const user = TEST_USERS.find(u => u.email === email && u.password === password);
    
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

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Login effettuato con successo',
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
