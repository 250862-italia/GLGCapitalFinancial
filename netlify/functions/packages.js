const { mockPackages, getMockPackages, addMockPackage, updateMockPackage, deleteMockPackage } = require('../../lib/mock-data');

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
        // GET - Lista tutti i packages
        const packages = getMockPackages();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(packages)
        };

      case 'POST':
        // POST - Crea nuovo package
        const newPackage = JSON.parse(event.body);
        const createdPackage = addMockPackage(newPackage);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(createdPackage)
        };

      case 'PUT':
        // PUT - Aggiorna package esistente
        const updateData = JSON.parse(event.body);
        const updatedPackage = updateMockPackage(updateData.id, updateData);
        if (updatedPackage) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(updatedPackage)
          };
        } else {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Package not found' })
          };
        }

      case 'DELETE':
        // DELETE - Elimina package
        const deleteData = JSON.parse(event.body);
        const deleted = deleteMockPackage(deleteData.id);
        if (deleted) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Package deleted successfully' })
          };
        } else {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Package not found' })
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
    console.error('Packages API Error:', error);
    
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