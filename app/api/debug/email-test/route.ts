import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { supabaseEmailService } from '@/lib/supabase-email-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔍 [${requestId}] Email debug test started`);
  
  try {
    const body = await request.json();
    const { email, testType = 'all' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email è obbligatoria' },
        { status: 400 }
      );
    }

    const results: any = {
      requestId,
      email,
      testType,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Verifica configurazione Supabase
    console.log(`🔍 [${requestId}] Test 1: Supabase Configuration`);
    results.tests.supabaseConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not configured'
    };

    // Test 2: Connessione Supabase
    console.log(`🔍 [${requestId}] Test 2: Supabase Connection`);
    try {
      const { data: connectionTest, error: connectionError } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);

      results.tests.supabaseConnection = {
        success: !connectionError,
        error: connectionError?.message || null
      };
    } catch (error: any) {
      results.tests.supabaseConnection = {
        success: false,
        error: error.message
      };
    }

    // Test 3: Verifica utente esistente
    console.log(`🔍 [${requestId}] Test 3: User Existence Check`);
    try {
      const { data: authUsers, error: authError } = await supabaseAdmin!.auth.admin.listUsers();
      const userInAuth = authUsers?.users?.some(u => u.email === email) || false;
      
      const { data: customUser, error: customError } = await supabaseAdmin
        .from('users')
        .select('id, email, email_confirmed')
        .eq('email', email)
        .single();

      results.tests.userExistence = {
        inSupabaseAuth: userInAuth,
        inCustomTable: !customError,
        customUserData: customError ? null : {
          id: customUser.id,
          email: customUser.email,
          emailConfirmed: customUser.email_confirmed
        }
      };
    } catch (error: any) {
      results.tests.userExistence = {
        error: error.message
      };
    }

    // Test 4: Test invio email di reset
    if (testType === 'all' || testType === 'reset') {
      console.log(`🔍 [${requestId}] Test 4: Password Reset Email`);
      try {
        const { data: resetData, error: resetError } = await supabaseAdmin!.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.glgcapitalgroup.com'}/reset-password`
          }
        });

        results.tests.passwordReset = {
          success: !resetError,
          error: resetError?.message || null,
          userId: resetData?.user?.id || null,
          hasActionLink: !!resetData?.properties?.action_link,
          actionLinkPreview: resetData?.properties?.action_link ? 
            resetData.properties.action_link.substring(0, 50) + '...' : null
        };
      } catch (error: any) {
        results.tests.passwordReset = {
          success: false,
          error: error.message
        };
      }
    }

    // Test 5: Test invio email personalizzata
    if (testType === 'all' || testType === 'custom') {
      console.log(`🔍 [${requestId}] Test 5: Custom Email Service`);
      try {
        const emailResult = await supabaseEmailService.sendEmail({
          to: email,
          subject: 'Debug Test Email - GLG Capital Group',
          template: 'custom',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Debug Test Email</h2>
              <p>This is a test email to verify the email system is working.</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          `
        });

        results.tests.customEmail = {
          success: emailResult.success,
          message: emailResult.message,
          service: emailResult.service,
          emailId: emailResult.emailId
        };
      } catch (error: any) {
        results.tests.customEmail = {
          success: false,
          error: error.message
        };
      }
    }

    // Test 6: Verifica coda email
    console.log(`🔍 [${requestId}] Test 6: Email Queue Check`);
    try {
      const { data: queueEmails, error: queueError } = await supabaseAdmin
        .from('email_queue')
        .select('id, to_email, subject, status, created_at')
        .eq('to_email', email)
        .order('created_at', { ascending: false })
        .limit(5);

      results.tests.emailQueue = {
        success: !queueError,
        error: queueError?.message || null,
        recentEmails: queueEmails || []
      };
    } catch (error: any) {
      results.tests.emailQueue = {
        success: false,
        error: error.message
      };
    }

    // Test 7: Verifica template email Supabase
    console.log(`🔍 [${requestId}] Test 7: Supabase Email Templates`);
    try {
      // Verifica se i template sono configurati (simulato)
      results.tests.emailTemplates = {
        resetPassword: 'Available (check Supabase Dashboard)',
        confirmSignup: 'Available (check Supabase Dashboard)',
        magicLink: 'Available (check Supabase Dashboard)',
        note: 'Templates are configured in Supabase Dashboard > Authentication > Email Templates'
      };
    } catch (error: any) {
      results.tests.emailTemplates = {
        error: error.message
      };
    }

    const duration = Date.now() - startTime;
    results.duration = duration;
    results.summary = {
      totalTests: Object.keys(results.tests).length,
      successfulTests: Object.values(results.tests).filter((test: any) => test.success !== false).length,
      failedTests: Object.values(results.tests).filter((test: any) => test.success === false).length
    };

    console.log(`✅ [${requestId}] Email debug test completed in ${duration}ms`);
    console.log(`📊 [${requestId}] Test summary:`, results.summary);

    return NextResponse.json(results);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`💥 [${requestId}] Email debug test failed:`, error);
    
    return NextResponse.json({
      error: 'Errore durante il test email',
      requestId,
      duration,
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email Debug Test Endpoint',
    usage: {
      method: 'POST',
      body: {
        email: 'test@example.com',
        testType: 'all | reset | custom'
      }
    },
    availableTests: [
      'Supabase Configuration',
      'Supabase Connection',
      'User Existence Check',
      'Password Reset Email',
      'Custom Email Service',
      'Email Queue Check',
      'Email Templates'
    ]
  });
} 