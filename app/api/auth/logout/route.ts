import { NextRequest, NextResponse } from 'next/server'
import { sessionManager } from '@/lib/session-manager'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request body or token
    const body = await request.json()
    const userId = body.userId // You might need to extract this from the token instead
    
    // Remove all sessions for the user
    if (userId) {
      sessionManager.removeUserSessions(userId)
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
} 