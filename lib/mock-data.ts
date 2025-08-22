// Mock data functions for admin dashboard when database is unavailable

// Mock Partnerships
let mockPartnerships = [
  {
    id: '1',
    name: 'Strategic Partnership A',
    description: 'Long-term strategic partnership for market expansion',
    status: 'active',
    start_date: '2024-01-15',
    end_date: '2025-01-15',
    value: 500000,
    partner_type: 'corporate',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Technology Alliance B',
    description: 'Technology partnership for digital transformation',
    status: 'pending',
    start_date: '2024-03-01',
    end_date: '2025-03-01',
    value: 300000,
    partner_type: 'technology',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z'
  }
];

export function getMockPartnerships() {
  return mockPartnerships;
}

export function addMockPartnership(data: any) {
  const newPartnership = {
    id: Date.now().toString(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockPartnerships.push(newPartnership);
  return newPartnership;
}

export function updateMockPartnership(id: string, data: any) {
  const index = mockPartnerships.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  mockPartnerships[index] = {
    ...mockPartnerships[index],
    ...data,
    updated_at: new Date().toISOString()
  };
  return mockPartnerships[index];
}

export function deleteMockPartnership(id: string) {
  const index = mockPartnerships.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  mockPartnerships.splice(index, 1);
  return true;
}

// Mock Team
let mockTeam = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@glgcapital.com',
    role: 'senior_analyst',
    department: 'investment',
    status: 'active',
    hire_date: '2023-01-15',
    salary: 85000,
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@glgcapital.com',
    role: 'portfolio_manager',
    department: 'portfolio',
    status: 'active',
    hire_date: '2023-03-01',
    salary: 95000,
    created_at: '2023-03-01T10:00:00Z',
    updated_at: '2023-03-01T10:00:00Z'
  }
];

export function getMockTeam() {
  return mockTeam;
}

export function addMockTeam(data: any) {
  const newMember = {
    id: Date.now().toString(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockTeam.push(newMember);
  return newMember;
}

export function updateMockTeam(id: string, data: any) {
  const index = mockTeam.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  mockTeam[index] = {
    ...mockTeam[index],
    ...data,
    updated_at: new Date().toISOString()
  };
  return mockTeam[index];
}

export function deleteMockTeam(id: string) {
  const index = mockTeam.findIndex(m => m.id === id);
  if (index === -1) return false;
  
  mockTeam.splice(index, 1);
  return true;
}

// Mock Payments
let mockPayments = [
  {
    id: '1',
    client_id: 'client-001',
    amount: 5000,
    currency: 'USD',
    payment_method: 'bank_transfer',
    status: 'completed',
    transaction_date: '2024-01-15',
    description: 'Investment package payment',
    reference: 'INV-001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    client_id: 'client-002',
    amount: 3000,
    currency: 'USD',
    payment_method: 'credit_card',
    status: 'pending',
    transaction_date: '2024-01-20',
    description: 'Service fee payment',
    reference: 'SRV-001',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

export function getMockPayments() {
  return mockPayments;
}

export function addMockPayment(data: any) {
  const newPayment = {
    id: Date.now().toString(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockPayments.push(newPayment);
  return newPayment;
}

export function updateMockPayment(id: string, data: any) {
  const index = mockPayments.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  mockPayments[index] = {
    ...mockPayments[index],
    ...data,
    updated_at: new Date().toISOString()
  };
  return mockPayments[index];
}

export function deleteMockPayment(id: string) {
  const index = mockPayments.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  mockPayments.splice(index, 1);
  return true;
}
