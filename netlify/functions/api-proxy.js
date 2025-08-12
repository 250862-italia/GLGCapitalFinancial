const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

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
    // Parse the URL
    const url = parse(event.path, true);
    
    // Check if it's an API route
    if (url.pathname.startsWith('/api/')) {
      // Forward to Next.js API routes
      const response = await new Promise((resolve, reject) => {
        const req = {
          url: event.path,
          method: event.httpMethod,
          headers: event.headers,
          body: event.body
        };

        const res = {
          statusCode: 200,
          headers: {},
          body: '',
          setHeader: (name, value) => {
            res.headers[name] = value;
          },
          end: (data) => {
            res.body = data;
            resolve(res);
          }
        };

        handle(req, res);
      });

      return {
        statusCode: response.statusCode || 200,
        headers: { ...headers, ...response.headers },
        body: response.body
      };
    }

    // For non-API routes, return 404
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'API route not found' })
    };

  } catch (error) {
    console.error('API Proxy Error:', error);
    
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