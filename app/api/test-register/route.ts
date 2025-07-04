import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, password } = body

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate successful registration with test user data
    const testUser = {
      id: `test-${Date.now()}`,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'user',
      is_active: true
    };

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata con successo (test)',
      user_id: testUser.id,
      client_id: `client-${Date.now()}`,
      user: testUser,
      password: password // Include password for auto-login
    })

  } catch (error) {
    console.error('Test registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 