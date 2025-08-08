import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getPartnerships, createPartnership, updatePartnership, deletePartnership } from '@/lib/data-manager';
import { getMockPartnerships, addMockPartnership, updateMockPartnership, deleteMockPartnership } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const partnerships = await getPartnerships();
      return NextResponse.json({ success: true, data: partnerships });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const mockPartnerships = getMockPartnerships();
      return NextResponse.json({ success: true, data: mockPartnerships });
    }
  } catch (error) {
    console.error('GET /api/admin/partnerships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partnershipData = await request.json();
    
    try {
      const newPartnership = await createPartnership(partnershipData);
      if (!newPartnership) {
        throw new Error('Database create failed');
      }
      return NextResponse.json({ success: true, data: newPartnership });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const newPartnership = addMockPartnership(partnershipData);
      return NextResponse.json({ success: true, data: newPartnership });
    }
  } catch (error) {
    console.error('POST /api/admin/partnerships error:', error);
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
      const updatedPartnership = await updatePartnership(id, updateData);
      if (!updatedPartnership) {
        throw new Error('Database update failed');
      }
      return NextResponse.json({ success: true, data: updatedPartnership });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const updatedPartnership = updateMockPartnership(id, updateData);
      if (!updatedPartnership) {
        return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedPartnership });
    }
  } catch (error) {
    console.error('PUT /api/admin/partnerships error:', error);
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
      const success = await deletePartnership(id);
      if (!success) {
        throw new Error('Database delete failed');
      }
      return NextResponse.json({ success: true, message: 'Partnership deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const success = deleteMockPartnership(id);
      if (!success) {
        return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Partnership deleted successfully' });
    }
  } catch (error) {
    console.error('DELETE /api/admin/partnerships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 