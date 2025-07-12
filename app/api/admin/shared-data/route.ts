import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Shared data types
interface SharedData {
  id: string;
  type: 'investment_update' | 'system_announcement' | 'market_data' | 'user_status' | 'payment_status';
  title: string;
  content: any;
  target_users?: string[]; // Specific user IDs or 'all' for everyone
  priority: 'low' | 'medium' | 'high' | 'critical';
  expires_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// GET - Retrieve shared data for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user role to determine access level
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRole = user.user.user_metadata?.role || 'user';
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    // Build query
    let query = supabase
      .from('shared_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by type if specified
    if (type) {
      query = query.eq('type', type);
    }

    // Apply user-specific filters
    if (!isAdmin) {
      // Regular users can only see data targeted to them or to all users
      query = query.or(`target_users.cs.{${userId}},target_users.cs.{all}`);
    }

    // Filter out expired data
    query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    const { data: sharedData, error } = await query;

    if (error) {
      console.error('Error fetching shared data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shared data' },
        { status: 500 }
      );
    }

    return NextResponse.json(sharedData || []);
  } catch (error) {
    console.error('Error in shared data GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new shared data (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, type, title, content, targetUsers, priority, expiresAt, metadata } = body;

    if (!adminId || !type || !title || !content) {
      return NextResponse.json(
        { error: 'Admin ID, type, title, and content are required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(adminId);
    if (adminError || !adminUser.user) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const adminRole = adminUser.user.user_metadata?.role;
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Create shared data record
    const { data: sharedData, error } = await supabase
      .from('shared_data')
      .insert({
        type,
        title,
        content,
        target_users: targetUsers || ['all'],
        priority: priority || 'medium',
        expires_at: expiresAt,
        metadata: metadata || {},
        created_by: adminId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shared data:', error);
      return NextResponse.json(
        { error: 'Failed to create shared data' },
        { status: 500 }
      );
    }

    // Send real-time notification to affected users
    await sendSharedDataNotification(sharedData);

    return NextResponse.json({
      success: true,
      data: sharedData,
      message: 'Shared data created successfully'
    });

  } catch (error) {
    console.error('Error in shared data POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update shared data (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, dataId, updates } = body;

    if (!adminId || !dataId || !updates) {
      return NextResponse.json(
        { error: 'Admin ID, data ID, and updates are required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(adminId);
    if (adminError || !adminUser.user) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const adminRole = adminUser.user.user_metadata?.role;
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Update shared data
    const { data: updatedData, error } = await supabase
      .from('shared_data')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', dataId)
      .select()
      .single();

    if (error) {
      console.error('Error updating shared data:', error);
      return NextResponse.json(
        { error: 'Failed to update shared data' },
        { status: 500 }
      );
    }

    // Send real-time notification about the update
    await sendSharedDataNotification(updatedData, 'update');

    return NextResponse.json({
      success: true,
      data: updatedData,
      message: 'Shared data updated successfully'
    });

  } catch (error) {
    console.error('Error in shared data PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete shared data (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, dataId } = body;

    if (!adminId || !dataId) {
      return NextResponse.json(
        { error: 'Admin ID and data ID are required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const { data: adminUser, error: adminError } = await supabase.auth.admin.getUserById(adminId);
    if (adminError || !adminUser.user) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const adminRole = adminUser.user.user_metadata?.role;
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete shared data
    const { error } = await supabase
      .from('shared_data')
      .delete()
      .eq('id', dataId);

    if (error) {
      console.error('Error deleting shared data:', error);
      return NextResponse.json(
        { error: 'Failed to delete shared data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shared data deleted successfully'
    });

  } catch (error) {
    console.error('Error in shared data DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send real-time notifications
async function sendSharedDataNotification(sharedData: any, action: 'create' | 'update' = 'create') {
  try {
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'resend',
      apiKey: process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@glgcapitalgroupllc.com'
    };

    // Get target users
    const targetUsers = sharedData.target_users || ['all'];
    let usersToNotify: any[] = [];

    if (targetUsers.includes('all')) {
      // Get all active users
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      usersToNotify = allUsers.users.filter(user => 
        user.user_metadata?.role === 'user' && user.email_confirmed_at
      );
    } else {
      // Get specific users
      const { data: specificUsers } = await supabase.auth.admin.listUsers();
      usersToNotify = specificUsers.users.filter(user => 
        targetUsers.includes(user.id) && user.email_confirmed_at
      );
    }

    // Send notifications to each user
    for (const user of usersToNotify) {
      // Create notification record
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'shared_data',
          title: sharedData.title,
          message: `New ${sharedData.type} from GLG Capital Group`,
          status: 'sent',
          metadata: {
            shared_data_id: sharedData.id,
            type: sharedData.type,
            priority: sharedData.priority,
            action: action
          }
        });

      // Send email notification for high priority items
      if (sharedData.priority === 'high' || sharedData.priority === 'critical') {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: ${sharedData.priority === 'critical' ? '#dc2626' : '#d97706'}; color: white; padding: 20px; text-align: center; border-radius: 8px;">
              <h2 style="margin: 0;">${sharedData.title}</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Priority: ${sharedData.priority.toUpperCase()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                ${typeof sharedData.content === 'string' ? sharedData.content : JSON.stringify(sharedData.content, null, 2)}
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This is an automated notification from GLG Capital Group. Please log into your dashboard for more details.
              </p>
            </div>
          </div>
        `;

        if (emailConfig.apiKey) {
          if (emailConfig.service === 'resend') {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${emailConfig.apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: emailConfig.fromEmail,
                to: [user.email!],
                subject: `[${sharedData.priority.toUpperCase()}] ${sharedData.title}`,
                html: emailHtml,
              }),
            });
          } else if (emailConfig.service === 'sendgrid') {
            await fetch('https://api.sendgrid.com/v3/mail/send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${emailConfig.apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                personalizations: [{ to: [{ email: user.email! }] }],
                from: { email: emailConfig.fromEmail },
                subject: `[${sharedData.priority.toUpperCase()}] ${sharedData.title}`,
                content: [{ type: 'text/html', value: emailHtml }],
              }),
            });
          }
        }
      }
    }

    console.log(`Shared data notification sent to ${usersToNotify.length} users`);
  } catch (error) {
    console.error('Error sending shared data notification:', error);
  }
} 