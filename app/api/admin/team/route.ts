import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/data-manager';
import { getMockTeamMembers, addMockTeamMember, updateMockTeamMember, deleteMockTeamMember } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const teamMembers = await getTeamMembers();
      return NextResponse.json({ success: true, data: teamMembers });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const mockTeamMembers = getMockTeamMembers();
      return NextResponse.json({ success: true, data: mockTeamMembers });
    }
  } catch (error) {
    console.error('GET /api/admin/team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-admin-token');
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamMemberData = await request.json();
    
    try {
      const newTeamMember = await createTeamMember(teamMemberData);
      if (!newTeamMember) {
        throw new Error('Database create failed');
      }
      return NextResponse.json({ success: true, data: newTeamMember });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const newTeamMember = addMockTeamMember(teamMemberData);
      return NextResponse.json({ success: true, data: newTeamMember });
    }
  } catch (error) {
    console.error('POST /api/admin/team error:', error);
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
      const updatedTeamMember = await updateTeamMember(id, updateData);
      if (!updatedTeamMember) {
        throw new Error('Database update failed');
      }
      return NextResponse.json({ success: true, data: updatedTeamMember });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const updatedTeamMember = updateMockTeamMember(id, updateData);
      if (!updatedTeamMember) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedTeamMember });
    }
  } catch (error) {
    console.error('PUT /api/admin/team error:', error);
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
      const success = await deleteTeamMember(id);
      if (!success) {
        throw new Error('Database delete failed');
      }
      return NextResponse.json({ success: true, message: 'Team member deleted successfully' });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      const success = deleteMockTeamMember(id);
      if (!success) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Team member deleted successfully' });
    }
  } catch (error) {
    console.error('DELETE /api/admin/team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 