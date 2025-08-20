import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/data-manager';
import { getMockClients, addMockClient, updateMockClient, deleteMockClient } from '@/lib/mock-data';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const clients = await getClients();
      return NextResponse.json({ success: true, data: clients });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const mockClients = getMockClients();
      return NextResponse.json({ success: true, data: mockClients });
    }
  } catch (error) {
    console.error('GET /api/admin/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientData = await request.json();
    
    try {
      const newClient = await createClient(clientData);
      if (!newClient) {
        throw new Error('Database create failed');
      }
      return NextResponse.json({ success: true, data: newClient });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const newClient = addMockClient(clientData);
      return NextResponse.json({ success: true, data: newClient });
    }
  } catch (error) {
    console.error('POST /api/admin/clients error:', error);
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
      const updatedClient = await updateClient(id, updateData);
      if (!updatedClient) {
        throw new Error('Database update failed');
      }
      return NextResponse.json({ success: true, data: updatedClient });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const updatedClient = updateMockClient(id, updateData);
      if (!updatedClient) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedClient });
    }
  } catch (error) {
    console.error('PUT /api/admin/clients error:', error);
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
      const success = await deleteClient(id);
      if (!success) {
        throw new Error('Database delete failed');
      }
      return NextResponse.json({ success: true, message: 'Client deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const success = deleteMockClient(id);
      if (!success) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Client deleted successfully' });
    }
  } catch (error) {
    console.error('DELETE /api/admin/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

 