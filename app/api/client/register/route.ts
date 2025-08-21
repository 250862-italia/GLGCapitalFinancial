import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, company, password } = body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'Nome, cognome, email e password sono richiesti' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Formato email non valido' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'La password deve essere di almeno 8 caratteri' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // TODO: In produzione, salvare nel database
    // Per ora simuliamo il salvataggio
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      phone: phone || '',
      company: company || '',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      status: 'pending_verification'
    };

    console.log('User registered:', { ...user, password: '[HIDDEN]' });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registrazione effettuata con successo',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
