import { NextRequest, NextResponse } from 'next/server'
import { localAuthService } from '@/lib/auth-local'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Use local auth service instead of Supabase
    const result = await localAuthService.register(email, password, name)

    if (result.success) {
      console.log('✅ User registered successfully:', result.user?.email)
      return NextResponse.json(
        { 
          message: 'User created successfully',
          user: {
            id: result.user?.id,
            email: result.user?.email,
            name: result.user?.name,
            role: result.user?.role
          }
        },
        { status: 201 }
      )
    } else {
      console.log('❌ Registration failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to create user' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 