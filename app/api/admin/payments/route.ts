import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getPayments, createPayment, updatePayment, deletePayment } from '@/lib/data-manager';
import { getMockPayments, addMockPayment, updateMockPayment, deleteMockPayment } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const payments = await getPayments();
      return NextResponse.json({ success: true, data: payments });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const mockPayments = getMockPayments();
      return NextResponse.json({ success: true, data: mockPayments });
    }
  } catch (error) {
    console.error('GET /api/admin/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentData = await request.json();
    
    try {
      const newPayment = await createPayment(paymentData);
      if (!newPayment) {
        throw new Error('Database create failed');
      }
      return NextResponse.json({ success: true, data: newPayment });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const newPayment = addMockPayment(paymentData);
      return NextResponse.json({ success: true, data: newPayment });
    }
  } catch (error) {
    console.error('POST /api/admin/payments error:', error);
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
      const updatedPayment = await updatePayment(id, updateData);
      if (!updatedPayment) {
        throw new Error('Database update failed');
      }
      return NextResponse.json({ success: true, data: updatedPayment });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const updatedPayment = updateMockPayment(id, updateData);
      if (!updatedPayment) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedPayment });
    }
  } catch (error) {
    console.error('PUT /api/admin/payments error:', error);
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
      const success = await deletePayment(id);
      if (!success) {
        throw new Error('Database delete failed');
      }
      return NextResponse.json({ success: true, message: 'Payment deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const success = deleteMockPayment(id);
      if (!success) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Payment deleted successfully' });
    }
  } catch (error) {
    console.error('DELETE /api/admin/payments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 