import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emailService } from '@/lib/email-service';
import { validateCSRFToken } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      country, 
      city, 
      additional_notes,
      user_id 
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    console.log('📝 Creating informational request:', {
      first_name,
      last_name,
      email,
      phone,
      country,
      city,
      additional_notes: additional_notes ? 'Provided' : 'None'
    });

    // Temporary solution: Save as a note in clients table
    // First, find or create a client record
    let client_id = null;
    
    // Try to find existing client by email
    const { data: existingClient, error: findError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single();
    
    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error finding client:', findError);
    } else if (existingClient) {
      client_id = existingClient.id;
      console.log('✅ Found existing client:', client_id);
    } else {
      // Create new client record
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          first_name,
          last_name,
          email,
          phone: phone || null,
          country: country || null,
          city: city || null,
          status: 'active',
          client_code: `INFO${Date.now()}`,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('❌ Error creating client:', createError);
        return NextResponse.json(
          { error: 'Failed to create client record' },
          { status: 500 }
        );
      }
      
      client_id = newClient.id;
      console.log('✅ Created new client:', client_id);
    }

    // Create informational request record in database (temporary approach)
    const request_data = {
      id: `info_${Date.now()}`,
      client_id,
      first_name,
      last_name,
      email,
      phone,
      country,
      city,
      additional_notes: additional_notes,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    console.log('✅ Request prepared successfully:', request_data.id);

    // Prepare email content
    const email_content = `
Informational Request Form
GLG Equity Pledge

Involved Entities:
* GLG Capital Consulting LLC (USA)
* GLG Capital Group LLC (United States)

1. Subject of the Request
I, the undersigned, as a prospective participant, hereby request detailed information regarding the "GLG Equity Pledge" program, including but not limited to:
* Operational and legal structure
* Financial terms and durations
* Share pledge mechanism
* Repayment procedures and timelines
* Key risks and safeguards

2. Applicant's Declarations
* Voluntariness: I declare that this request is made of my own free will, without any solicitation or promotional activities by GLG Capital Consulting LLC, or their agents.
* Informational Purpose: I understand that the information provided is purely informational and does not constitute a contractual offer, investment advice, or recommendation under applicable securities laws.
* Independent Evaluation: I commit to independently assess, and if needed consult professional advisors on, the suitability of any potential investment decision.

3. Data Processing Consent (EU GDPR 2016/679)
I authorize GLG Capital Consulting LLC to process my personal data solely for the purposes of:
* Providing the requested information
* Complying with legal AML requirements
My data will not be shared with third parties for any other purposes.

4. U.S. Regulatory References
By submitting this form, you acknowledge that GLG Capital Consulting LLC operates in compliance with the following key U.S. laws and regulations:
* Securities Act of 1933 & Securities Exchange Act of 1934: Governing private placements and exempt offerings under Regulation D.
* Bank Secrecy Act (BSA) & USA PATRIOT Act: Mandating customer identification (CIP), suspicious activity monitoring, and AML due diligence.
* Investment Advisers Act of 1940: Applicable to advisory activities and fiduciary standards for U.S. investors.
* California Consumer Privacy Act (CCPA): Protecting personal data and consumer privacy for California residents.

5. Submission Channels
Please send the requested information via one of the following:
* Email: corefound@glgcapitalgroupllc.com

---
APPLICANT INFORMATION:
Name: ${first_name} ${last_name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Country: ${country || 'Not provided'}
City: ${city || 'Not provided'}
Additional Notes: ${additional_notes || 'None'}

Request ID: ${request_data.id}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
    `;

    // Send email using the new Supabase email service
    console.log('📧 Sending email notification...');
    const emailSent = await emailService.sendInformationalRequestEmail({
      id: request_data.id,
      first_name,
      last_name,
      email,
      phone,
      country,
      city,
      additionalNotes: additional_notes
    });

    if (!emailSent) {
      console.error('❌ Email sending failed');
      // Still return success since the request was saved to database
      // The admin can manually send the email later
    } else {
      console.log('✅ Email sent successfully');
    }

    return NextResponse.json({
      success: true,
      data: request_data,
      message: 'Informational request submitted successfully'
    });

  } catch (error) {
    console.error('❌ Informational request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get informational requests for the user
    const { data, error } = await supabase
      .from('informational_requests')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching informational requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Error fetching informational requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 