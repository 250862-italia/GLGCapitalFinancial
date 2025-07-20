import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { realtimeManager } from '@/lib/realtime-manager';
import { verifyAdmin } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { 
      userId, 
      userName, 
      userEmail, 
      packageName, 
      amount, 
      expectedReturn, 
      duration,
      investmentId 
    } = body;

    if (!userId || !userName || !packageName || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get all admin users
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('role', 'admin')
      .or('role.eq.superadmin');

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
      return NextResponse.json(
        { error: 'Failed to fetch admin users' },
        { status: 500 }
      );
    }

    // Create notification for each admin
    const notificationPromises = adminUsers?.map(async (admin) => {
      const notification = {
        user_id: admin.id,
        type: 'investment_request',
        title: 'New Investment Request',
        message: `${userName} (${userEmail}) has requested to invest $${amount.toLocaleString()} in the ${packageName} package.`,
        status: 'unread',
        priority: 'high',
        metadata: {
          investment_id: investmentId,
          client_user_id: userId,
          client_name: userName,
          client_email: userEmail,
          package_name: packageName,
          amount: amount,
          expected_return: expectedReturn,
          duration: duration,
          timestamp: new Date().toISOString()
        }
      };

      // Insert notification in database
      const { error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert(notification);

      if (insertError) {
        console.error(`Error creating notification for admin ${admin.id}:`, insertError);
        return null;
      }

      // Send real-time event
      await realtimeManager.sendEvent({
        type: 'investment',
        userId: admin.id,
        priority: 'high',
        data: {
          investment_id: investmentId,
          client_user_id: userId,
          client_name: userName,
          client_email: userEmail,
          package_name: packageName,
          amount: amount,
          expected_return: expectedReturn,
          duration: duration,
          action: 'new_request'
        }
      });

      return notification;
    }) || [];

    await Promise.all(notificationPromises);

    // Also create a system-wide notification for all admins
    const systemNotification = {
      type: 'investment_request',
      title: 'New Investment Request',
      message: `${userName} (${userEmail}) has submitted a new investment request for $${amount.toLocaleString()}`,
      priority: 'high',
      data: {
        investment_id: investmentId,
        client_user_id: userId,
        client_name: userName,
        client_email: userEmail,
        package_name: packageName,
        amount: amount,
        expected_return: expectedReturn,
        duration: duration,
        action: 'new_request',
        admin_action_required: true
      }
    };

    // Broadcast to all admin users
    adminUsers?.forEach(admin => {
      realtimeManager.sendEvent({
        ...systemNotification,
        userId: admin.id
      });
    });

    console.log(`✅ Investment notification sent to ${adminUsers?.length || 0} admin users`);

    return NextResponse.json({
      success: true,
      message: 'Investment notification sent to all admin users',
      adminCount: adminUsers?.length || 0
    });

  } catch (error) {
    console.error('Error sending investment notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 