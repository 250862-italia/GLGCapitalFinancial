import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '@/lib/data-manager';
import { getMockInvestments, addMockInvestment, updateMockInvestment, deleteMockInvestment } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const investments = await getInvestments();
      return NextResponse.json({ success: true, data: investments });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const mockInvestments = getMockInvestments();
      return NextResponse.json({ success: true, data: mockInvestments });
    }
  } catch (error) {
    console.error('GET /api/admin/investments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const investmentData = await request.json();
    
    try {
      const newInvestment = await createInvestment(investmentData);
      if (!newInvestment) {
        throw new Error('Database create failed');
      }
      return NextResponse.json({ success: true, data: newInvestment });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const newInvestment = addMockInvestment(investmentData);
      return NextResponse.json({ success: true, data: newInvestment });
    }
  } catch (error) {
    console.error('POST /api/admin/investments error:', error);
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
      const updatedInvestment = await updateInvestment(id, updateData);
      if (!updatedInvestment) {
        throw new Error('Database update failed');
      }
      return NextResponse.json({ success: true, data: updatedInvestment });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const updatedInvestment = updateMockInvestment(id, updateData);
      if (!updatedInvestment) {
        return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedInvestment });
    }
  } catch (error) {
    console.error('PUT /api/admin/investments error:', error);
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
      const success = await deleteInvestment(id);
      if (!success) {
        throw new Error('Database delete failed');
      }
      return NextResponse.json({ success: true, message: 'Investment deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const success = deleteMockInvestment(id);
      if (!success) {
        return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Investment deleted successfully' });
    }
  } catch (error) {
    console.error('DELETE /api/admin/investments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 