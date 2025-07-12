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

    // Mappa i campi updates con logica migliorata per gestire i nomi delle colonne
    const updatesTyped: Record<string, any> = updates as Record<string, any>;
    const updatesSnakeCase: Record<string, any> = {};
    
    // Mappa specifica per i campi che potrebbero avere nomi diversi
    const fieldMapping: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      dateOfBirth: 'date_of_birth',
      postalCode: 'postal_code',
      profilePhoto: 'profile_photo',
      bankingDetails: 'banking_details',
      photoUrl: 'photo_url',
      iban: 'iban',
      bic: 'bic',
      accountHolder: 'account_holder',
      usdtWallet: 'usdt_wallet',

      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };

    for (const key in updatesTyped) {
      if (Object.prototype.hasOwnProperty.call(updatesTyped, key)) {
        // Usa la mappa specifica se esiste, altrimenti converte camelCase -> snake_case
        const snakeKey = fieldMapping[key] || key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updatesSnakeCase[snakeKey] = updatesTyped[key];
      }
    }

    // Aggiungi updated_at automaticamente
    updatesSnakeCase.updated_at = new Date().toISOString();

    console.log('Updating profile with data:', updatesSnakeCase);

    const { data, error } = await supabase
      .from('clients')
      .update(updatesSnakeCase)
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

 