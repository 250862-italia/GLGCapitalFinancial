import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get the informational request
    const { data: requestData, error: fetchError } = await supabase
      .from('informational_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      console.error('Error fetching request:', fetchError);
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Prepare email content
    const emailContent = `
Informational Request Form
GLG Equity Pledge

Involved Entities:
* GLG Capital Consulting LLC (USA)
* Magnificus Dominus Consulting Europe Srl (Italy)

1. Subject of the Request
I, the undersigned, as a prospective participant, hereby request detailed information regarding the "GLG Equity Pledge" program, including but not limited to:
* Operational and legal structure
* Financial terms and durations
* Share pledge mechanism
* Repayment procedures and timelines
* Key risks and safeguards

2. Applicant's Declarations
* Voluntariness: I declare that this request is made of my own free will, without any solicitation or promotional activities by GLG Capital Consulting LLC, Magnificus Dominus Consulting Europe Srl, or their agents.
* Informational Purpose: I understand that the information provided is purely informational and does not constitute a contractual offer, investment advice, or recommendation under applicable securities laws.
* Independent Evaluation: I commit to independently assess, and if needed consult professional advisors on, the suitability of any potential investment decision.

3. Data Processing Consent (EU GDPR 2016/679)
I authorize GLG Capital Consulting LLC and Magnificus Dominus Consulting Europe Srl to process my personal data solely for the purposes of:
* Providing the requested information
* Complying with legal AML/KYC requirements
My data will not be shared with third parties for any other purposes.

4. U.S. Regulatory References
By submitting this form, you acknowledge that GLG Capital Consulting LLC operates in compliance with the following key U.S. laws and regulations:
* Securities Act of 1933 & Securities Exchange Act of 1934: Governing private placements and exempt offerings under Regulation D.
* Bank Secrecy Act (BSA) & USA PATRIOT Act: Mandating customer identification (CIP), suspicious activity monitoring, and AML due diligence.
* Investment Advisers Act of 1940: Applicable to advisory activities and fiduciary standards for U.S. investors.
* California Consumer Privacy Act (CCPA): Protecting personal data and consumer privacy for California residents.

5. Submission Channels
Please send the requested information via one of the following:
* Email: corefound@glgcapitalconsulting.com

---
APPLICANT INFORMATION:
Name: ${requestData.firstName} ${requestData.lastName}
Email: ${requestData.email}
Phone: ${requestData.phone || 'Not provided'}
Company: ${requestData.company || 'Not provided'}
Position: ${requestData.position || 'Not provided'}
Country: ${requestData.country || 'Not provided'}
City: ${requestData.city || 'Not provided'}
Additional Notes: ${requestData.additionalNotes || 'None'}

Request ID: ${requestData.id}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

[This is a resend of the original request]
    `;

    // Send email using the existing email service
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'corefound@glgcapitalconsulting.com',
        subject: `[RESEND] Informational Request - ${requestData.firstName} ${requestData.lastName}`,
        text: emailContent,
        html: emailContent.replace(/\n/g, '<br>'),
        from: requestData.email
      })
    });

    if (!emailResponse.ok) {
      console.error('Email sending failed');
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update the request to mark email as sent
    const { error: updateError } = await supabase
      .from('informational_requests')
      .update({
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating email sent status:', updateError);
      // Still return success since email was sent
    }

    return NextResponse.json({
      success: true,
      message: 'Email resent successfully'
    });

  } catch (error) {
    console.error('Error resending email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 