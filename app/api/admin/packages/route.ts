import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getPackages, createPackage, updatePackage, deletePackage } from '@/lib/data-manager';
import { getMockPackages, addMockPackage, updateMockPackage, deleteMockPackage } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const packages = await getPackages();
      return NextResponse.json({ success: true, data: packages });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const mockPackages = getMockPackages();
      return NextResponse.json({ success: true, data: mockPackages });
    }
  } catch (error) {
    console.error('GET /api/admin/packages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packageData = await request.json();
    
    try {
      const newPackage = await createPackage(packageData);
      if (!newPackage) {
        throw new Error('Database create failed');
      }
      return NextResponse.json({ success: true, data: newPackage });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const newPackage = addMockPackage(packageData);
      return NextResponse.json({ success: true, data: newPackage });
    }
  } catch (error) {
    console.error('POST /api/admin/packages error:', error);
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
      const updatedPackage = await updatePackage(id, updateData);
      if (!updatedPackage) {
        throw new Error('Database update failed');
      }
      return NextResponse.json({ success: true, data: updatedPackage });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const updatedPackage = updateMockPackage(id, updateData);
      if (!updatedPackage) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedPackage });
    }
  } catch (error) {
    console.error('PUT /api/admin/packages error:', error);
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
      const success = await deletePackage(id);
      if (!success) {
        throw new Error('Database delete failed');
      }
      return NextResponse.json({ success: true, message: 'Package deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const success = deleteMockPackage(id);
      if (!success) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Package deleted successfully' });
    }
  } catch (error) {
    console.error('DELETE /api/admin/packages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

 