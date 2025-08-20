import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Admin credentials (in produzione dovrebbero essere in database con hash)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'glgcapital2024'
};

// JWT Secret (in produzione dovrebbe essere in variabili d'ambiente)
const JWT_SECRET = 'glg-capital-admin-secret-2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username e password sono richiesti' },
        { status: 400 }
      );
    }

    // Check credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Generate JWT token
      const token = sign(
        { 
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
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
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          name: 'Administrator',
          email: 'admin@glgcapitalgroup.com'
        }
      });
    } else {
      // Invalid credentials
      return NextResponse.json(
        { message: 'Username o password non validi' },
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
