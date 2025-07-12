import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Map the updates to match the database schema (camelCase)
    const updatesTyped: Record<string, any> = updates as Record<string, any>;
    const updatesForDb: Record<string, any> = {};
    
    // Map specific fields to match database schema
    const fieldMapping: Record<string, string> = {
      firstName: 'firstName',
      lastName: 'lastName',
      dateOfBirth: 'dateOfBirth',
      postalCode: 'postalCode',
      profilePhoto: 'profilePhoto',
      bankingDetails: 'bankingDetails',
      photoUrl: 'profilePhoto', // Map to profilePhoto in DB
      iban: 'iban',
      bic: 'bic',
      accountHolder: 'accountHolder',
      usdtWallet: 'usdtWallet'
    };

    for (const key in updatesTyped) {
      if (Object.prototype.hasOwnProperty.call(updatesTyped, key)) {
        // Use the specific mapping if it exists, otherwise keep the key as is
        const dbKey = fieldMapping[key] || key;
        updatesForDb[dbKey] = updatesTyped[key];
      }
    }

    // Add updated_at automatically
    updatesForDb.updated_at = new Date().toISOString();

    console.log('Updating profile with data:', updatesForDb);

    const { data, error } = await supabase
      .from('clients')
      .update(updatesForDb)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

 