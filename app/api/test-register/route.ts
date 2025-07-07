import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    // Validazione base
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Registra l'utente
    const result = await AuthService.register({
      email,
      password,
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      terms_accepted: true,
      marketing_consent: false
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    // Crea profilo cliente se non esiste già
    let client = null;
    if (result.user && result.user.id) {
      // Verifica se già esiste
      const { data: existing, error: checkError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', result.user.id)
        .single();
      if (!existing) {
        const { data: created, error: createError } = await supabase
          .from('clients')
          .insert({
            user_id: result.user.id,
            firstName,
            lastName,
            email,
            phone,
            status: 'active',
            kycStatus: 'pending',
            registrationDate: new Date().toISOString(),
            totalInvested: 0,
            currentBalance: 0,
            totalReturns: 0,
            activePackages: 0,
            riskProfile: 'conservative',
            investmentGoals: [],
            sourceOfFunds: 'other',
            preferredPaymentMethod: 'bank',
            marketingConsent: false,
            newsletterSubscription: false,
            twoFactorEnabled: false,
            failedLoginAttempts: 0,
            accountLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .select()
          .single();
        if (createError) {
          console.error('Client profile creation error:', createError);
        } else {
          client = created;
        }
      } else {
        client = existing;
      }
    }

    return NextResponse.json({ success: true, user: result.user, client });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
} 