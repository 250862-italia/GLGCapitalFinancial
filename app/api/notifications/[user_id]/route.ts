import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      const notifications = await db.getNotificationsByUserId(user_id);
      
      // Calculate unread count
      const unreadCount = notifications.filter(n => n.status === 'unread').length;

      return NextResponse.json({
        success: true,
        data: {
          notifications,
          unread_count: unreadCount
        }
      });
    } else {
      // Mock data for when Supabase is not available
      const mockNotifications = [
        {
          id: 'notif_001',
          user_id: user_id,
          type: 'investment_update',
          title: 'Investment Status Updated',
          message: 'Your investment has been approved',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        success: true,
        data: {
          notifications: mockNotifications,
          unread_count: 1
        }
      });
    }

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params;
    const body = await request.json();
    const { action, notification_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();

      if (action === 'mark_all_read') {
        await db.markAllNotificationsAsRead(user_id);
        return NextResponse.json({
          success: true,
          message: 'All notifications marked as read'
        });
      }

      if (action === 'mark_read' && notification_id) {
        await db.markNotificationAsRead(notification_id);
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read'
        });
      }
    } else {
      // Mock responses for when Supabase is not available
      if (action === 'mark_all_read') {
        return NextResponse.json({
          success: true,
          message: 'All notifications marked as read'
        });
      }

      if (action === 'mark_read' && notification_id) {
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read'
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 