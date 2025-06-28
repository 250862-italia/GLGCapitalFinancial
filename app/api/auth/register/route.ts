import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      nationality,
      address,
      city,
      country,
      postalCode,
      idType,
      idNumber,
      idExpiry,
      occupation,
      annualIncome,
      sourceOfFunds,
      selectedPackage,
      investmentAmount,
      acceptTerms,
      acceptPrivacy,
      acceptMarketing
    } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!acceptTerms || !acceptPrivacy) {
      return NextResponse.json(
        { error: 'You must accept Terms and Conditions and Privacy Policy' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: 'client',
        status: 'pending_kyc',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create client profile
    const { error: profileError } = await supabase
      .from('client_profiles')
      .insert({
        user_id: user.id,
        date_of_birth: dateOfBirth,
        nationality,
        address,
        city,
        country,
        postal_code: postalCode,
        occupation,
        annual_income: annualIncome,
        source_of_funds: sourceOfFunds,
        kyc_status: 'pending',
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up user if profile creation fails
      await supabase.from('users').delete().eq('id', user.id)
      return NextResponse.json(
        { error: 'Failed to create client profile' },
        { status: 500 }
      )
    }

    // Create KYC record
    const { error: kycError } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: user.id,
        id_type: idType,
        id_number: idNumber,
        id_expiry: idExpiry,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })

    if (kycError) {
      console.error('KYC creation error:', kycError)
    }

    // Create investment record if package is selected
    if (selectedPackage && investmentAmount > 0) {
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          package_id: selectedPackage,
          amount: investmentAmount,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (investmentError) {
        console.error('Investment creation error:', investmentError)
      }
    }

    // Create terms acceptance record
    const { error: termsError } = await supabase
      .from('user_agreements')
      .insert({
        user_id: user.id,
        terms_accepted: acceptTerms,
        privacy_accepted: acceptPrivacy,
        marketing_accepted: acceptMarketing,
        accepted_at: new Date().toISOString()
      })

    if (termsError) {
      console.error('Terms acceptance error:', termsError)
    }

    // Send welcome email (you can implement this later)
    // await sendWelcomeEmail(email, firstName);

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 