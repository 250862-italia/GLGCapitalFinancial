// Mock data per Netlify Functions (ES modules)
const mockClients = [
  {
    id: '1',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@glgcapital.com',
    phone: '+39 333 0000000',
    company: 'GLG Capital Group',
    position: 'Administrator',
    date_of_birth: '1990-01-01',
    nationality: 'Italiana',
    address: 'Via Roma 1',
    city: 'Milano',
    country: 'Italia',
    postal_code: '20100',
    iban: 'IT60X0542811101000000000001',
    bic: 'CRPPIT2P',
    account_holder: 'Admin User',
    usdt_wallet: '0x0000000000000000000000000000000000000000',
    status: 'active',
    risk_profile: 'moderate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Funzioni CRUD per clients
const getMockClients = () => [...mockClients];

const addMockClient = (client) => {
  const newClient = {
    ...client,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockClients.unshift(newClient);
  return newClient;
};

const updateMockClient = (id, updates) => {
  const index = mockClients.findIndex(client => client.id === id);
  if (index === -1) return null;
  
  mockClients[index] = {
    ...mockClients[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockClients[index];
};

const deleteMockClient = (id) => {
  const index = mockClients.findIndex(client => client.id === id);
  if (index === -1) return false;
  
  mockClients.splice(index, 1);
  return true;
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verifica token admin
    const adminToken = event.headers['x-admin-token'];
    if (!adminToken || adminToken !== 'admin_test_token_123') {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - Admin token required' })
      };
    }

    switch (event.httpMethod) {
      case 'GET':
        // GET - Lista tutti i clients
        const clients = getMockClients();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(clients)
        };

      case 'POST':
        // POST - Crea nuovo client
        const newClient = JSON.parse(event.body);
        const createdClient = addMockClient(newClient);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(createdClient)
        };

      case 'PUT':
        // PUT - Aggiorna client esistente
        const updateData = JSON.parse(event.body);
        const updatedClient = updateMockClient(updateData.id, updateData);
        if (updatedClient) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(updatedClient)
          };
        } else {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Client not found' })
          };
        }

      case 'DELETE':
        // DELETE - Elimina client
        const deleteData = JSON.parse(event.body);
        const deleted = deleteMockClient(deleteData.id);
        if (deleted) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Client deleted successfully' })
          };
        } else {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Client not found' })
          };
        }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Clients API Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
}; 