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

    // Simulate successful registration
    return NextResponse.json({
      success: true,
      message: 'Registrazione completata con successo (test)',
      user_id: 'test-user-id',
      client_id: 'test-client-id'
    })

  } catch (error) {
    console.error('Test registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 