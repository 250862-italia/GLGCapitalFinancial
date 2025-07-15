import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function GET(request: NextRequest) {
  try {
    console.log('📧 Processing email queue...');
    
    // Recupera tutte le email in coda con status 'pending'
    const { data: emails, error } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error retrieving emails from queue:', error.message);
      return NextResponse.json(
        { error: 'Failed to retrieve emails from queue' },
        { status: 500 }
      );
    }

    if (!emails || emails.length === 0) {
      console.log('✅ No pending emails found');
      return NextResponse.json({
        success: true,
        message: 'No pending emails found',
        processed: 0
      });
    }

    console.log(`📧 Found ${emails.length} pending emails`);

    let processedCount = 0;
    let errorCount = 0;

    for (const email of emails) {
      console.log(`📧 Processing email to: ${email.to_email}`);
      
      try {
        await transporter.sendMail({
          from: email.from_email,
          to: email.to_email,
          subject: email.subject,
          text: email.text_content,
          html: email.html_content,
        });

        console.log(`✅ Email sent to ${email.to_email}`);
        
        // Aggiorna lo status a 'sent'
        const { error: updateError } = await supabaseAdmin
          .from('email_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        if (updateError) {
          console.error('❌ Error updating email status to sent:', updateError.message);
        } else {
          console.log(`✅ Status updated to sent for ${email.to_email}`);
          processedCount++;
        }

      } catch (err: any) {
        console.error(`❌ Error sending email to ${email.to_email}:`, err.message);
        
        // Aggiorna lo status a 'error'
        const { error: updateError } = await supabaseAdmin
          .from('email_queue')
          .update({ 
            status: 'error', 
            error_message: err.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        if (updateError) {
          console.error('❌ Error updating email status to error:', updateError.message);
        } else {
          console.log(`✅ Status updated to error for ${email.to_email}`);
          errorCount++;
        }
      }
    }

    console.log(`📧 Email queue processing completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: 'Email queue processed successfully',
      processed: processedCount,
      errors: errorCount,
      total: emails.length
    });

  } catch (error: any) {
    console.error('❌ Email queue processing error:', error.message);
    return NextResponse.json(
      { error: 'Failed to process email queue' },
      { status: 500 }
    );
  }
}

// POST method for manual processing
export async function POST(request: NextRequest) {
  return GET(request);
} 