import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notification-service';

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

    const notifications = await notificationService.getUserNotifications(user_id);
    const unreadCount = await notificationService.getUnreadCount(user_id);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount
      }
    });

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

    if (action === 'mark_all_read') {
      await notificationService.markAllAsRead(user_id);
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    if (action === 'mark_read' && notification_id) {
      await notificationService.markAsRead(notification_id);
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
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