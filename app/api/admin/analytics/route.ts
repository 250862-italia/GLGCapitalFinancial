import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getAnalytics, createAnalytics, updateAnalytics, deleteAnalytics } from '@/lib/data-manager';
import { getMockAnalytics, addMockAnalytics, updateMockAnalytics, deleteMockAnalytics } from '@/lib/mock-data';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const analytics = await getAnalytics();
      return NextResponse.json({ success: true, data: analytics });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const mockAnalytics = getMockAnalytics();
      return NextResponse.json({ success: true, data: mockAnalytics });
    }
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyticsData = await request.json();
    
    try {
      const newAnalytics = await createAnalytics(analyticsData);
      if (!newAnalytics) {
        throw new Error('Database create failed');
      }
      return NextResponse.json({ success: true, data: newAnalytics });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const newAnalytics = addMockAnalytics(analyticsData);
      return NextResponse.json({ success: true, data: newAnalytics });
    }
  } catch (error) {
    console.error('POST /api/admin/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updateData } = await request.json();
    
    try {
      const updatedAnalytics = await updateAnalytics(id, updateData);
      if (!updatedAnalytics) {
        throw new Error('Database update failed');
      }
      return NextResponse.json({ success: true, data: updatedAnalytics });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const updatedAnalytics = updateMockAnalytics(id, updateData);
      if (!updatedAnalytics) {
        return NextResponse.json({ error: 'Analytics not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedAnalytics });
    }
  } catch (error) {
    console.error('PUT /api/admin/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    
    try {
      const success = await deleteAnalytics(id);
      if (!success) {
        throw new Error('Database delete failed');
      }
      return NextResponse.json({ success: true, message: 'Analytics deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const success = deleteMockAnalytics(id);
      if (!success) {
        return NextResponse.json({ error: 'Analytics not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Analytics deleted successfully' });
    }
  } catch (error) {
    console.error('DELETE /api/admin/analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 