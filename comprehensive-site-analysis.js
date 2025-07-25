require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = 'http://localhost:3001';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json().catch(() => ({}));
    return { response, data, error: null };
  } catch (error) {
    return { response: null, data: null, error: error.message };
  }
}

async function comprehensiveAnalysis() {
  console.log('🔍 COMPREHENSIVE SITE ANALYSIS\n');
  console.log('=' .repeat(50));
  
  const issues = [];
  const warnings = [];
  const successes = [];

  // 1. Environment Check
  console.log('\n1️⃣ ENVIRONMENT CHECK');
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    issues.push('❌ Missing Supabase environment variables');
    console.log('❌ Missing Supabase environment variables');
  } else {
    successes.push('✅ Supabase environment variables found');
    console.log('✅ Supabase environment variables found');
  }

  // 2. Server Connectivity
  console.log('\n2️⃣ SERVER CONNECTIVITY');
  const { response: healthResponse, error: healthError } = await makeRequest(`${BASE_URL}/api/health`);
  
  if (healthError) {
    issues.push(`❌ Server not responding: ${healthError}`);
    console.log(`❌ Server not responding: ${healthError}`);
  } else if (healthResponse.status !== 200) {
    issues.push(`❌ Health check failed: ${healthResponse.status}`);
    console.log(`❌ Health check failed: ${healthResponse.status}`);
  } else {
    successes.push('✅ Server is running and healthy');
    console.log('✅ Server is running and healthy');
  }

  // 3. CSRF Token System
  console.log('\n3️⃣ CSRF TOKEN SYSTEM');
  const { response: csrfResponse, data: csrfData, error: csrfError } = await makeRequest(`${BASE_URL}/api/csrf`);
  
  if (csrfError) {
    issues.push(`❌ CSRF API error: ${csrfError}`);
    console.log(`❌ CSRF API error: ${csrfError}`);
  } else if (csrfResponse.status !== 200) {
    issues.push(`❌ CSRF API failed: ${csrfResponse.status}`);
    console.log(`❌ CSRF API failed: ${csrfResponse.status}`);
  } else if (!csrfData.token) {
    issues.push('❌ CSRF token not generated');
    console.log('❌ CSRF token not generated');
  } else {
    successes.push('✅ CSRF token system working');
    console.log('✅ CSRF token system working');
  }

  // 4. Database Connection
  console.log('\n4️⃣ DATABASE CONNECTION');
  const { response: dbResponse, data: dbData, error: dbError } = await makeRequest(`${BASE_URL}/api/test-supabase`);
  
  if (dbError) {
    issues.push(`❌ Database connection error: ${dbError}`);
    console.log(`❌ Database connection error: ${dbError}`);
  } else if (dbResponse.status !== 200) {
    issues.push(`❌ Database test failed: ${dbResponse.status}`);
    console.log(`❌ Database test failed: ${dbResponse.status}`);
  } else {
    successes.push('✅ Database connection working');
    console.log('✅ Database connection working');
  }

  // 5. AUTHENTICATION SYSTEM
  console.log('\n5️⃣ AUTHENTICATION SYSTEM');
  const testEmail = `test_analysis_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let loginResponse = null; // Declare outside the if block
  
  // Get a fresh CSRF token for authentication tests
  const { response: authCsrfResponse, data: authCsrfData, error: authCsrfError } = await makeRequest(`${BASE_URL}/api/csrf`);
  
  if (authCsrfError || !authCsrfData?.token) {
    issues.push('❌ Cannot get CSRF token for authentication tests');
    console.log('❌ Cannot get CSRF token for authentication tests');
  } else {
    // Registration test
    const { response: regResponse, data: regData, error: regError } = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': authCsrfData.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'Analysis',
        country: 'Italy'
      })
    });

    if (regError) {
      issues.push(`❌ Registration API error: ${regError}`);
      console.log(`❌ Registration API error: ${regError}`);
    } else if (regResponse.status !== 200) {
      issues.push(`❌ Registration failed: ${regResponse.status} - ${JSON.stringify(regData)}`);
      console.log(`❌ Registration failed: ${regResponse.status} - ${JSON.stringify(regData)}`);
    } else {
      successes.push('✅ Registration system working');
      console.log('✅ Registration system working');
    }

    // Login test
    const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': authCsrfData.token
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    loginResponse = loginResult.response; // Assign to outer variable
    const { data: loginData, error: loginError } = loginResult;

    if (loginError) {
      issues.push(`❌ Login API error: ${loginError}`);
      console.log(`❌ Login API error: ${loginError}`);
    } else if (loginResponse.status !== 200) {
      issues.push(`❌ Login failed: ${loginResponse.status} - ${JSON.stringify(loginData)}`);
      console.log(`❌ Login failed: ${loginResponse.status} - ${JSON.stringify(loginData)}`);
    } else {
      successes.push('✅ Login system working');
      console.log('✅ Login system working');
    }
  }

  // 6. Page Accessibility (without auth)
  console.log('\n6️⃣ PAGE ACCESSIBILITY (PUBLIC)');
  const publicPages = [
    '/',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/equity-pledge',
    '/landing'
  ];

  for (const page of publicPages) {
    const { response: pageResponse, error: pageError } = await makeRequest(`${BASE_URL}${page}`);
    
    if (pageError) {
      issues.push(`❌ Page ${page} not accessible: ${pageError}`);
      console.log(`❌ Page ${page} not accessible: ${pageError}`);
    } else if (pageResponse.status !== 200) {
      issues.push(`❌ Page ${page} failed: ${pageResponse.status}`);
      console.log(`❌ Page ${page} failed: ${pageResponse.status}`);
    } else {
      successes.push(`✅ Page ${page} accessible`);
      console.log(`✅ Page ${page} accessible`);
    }
  }

  // 7. Protected Pages (with auth)
  console.log('\n7️⃣ PROTECTED PAGES (WITH AUTH)');
  const protectedPages = [
    '/profile',
    '/dashboard',
    '/dashboard/investments',
    '/investments',
    '/notes'
  ];

  for (const page of protectedPages) {
    const { response: pageResponse, error: pageError } = await makeRequest(`${BASE_URL}${page}`, {
      headers: {
        'Cookie': loginResponse?.headers?.get('set-cookie') || ''
      }
    });
    
    if (pageError) {
      warnings.push(`⚠️ Protected page ${page} error: ${pageError}`);
      console.log(`⚠️ Protected page ${page} error: ${pageError}`);
    } else if (pageResponse.status === 401 || pageResponse.status === 403) {
      successes.push(`✅ Page ${page} properly protected`);
      console.log(`✅ Page ${page} properly protected`);
    } else if (pageResponse.status !== 200) {
      warnings.push(`⚠️ Protected page ${page} unexpected status: ${pageResponse.status}`);
      console.log(`⚠️ Protected page ${page} unexpected status: ${pageResponse.status}`);
    } else {
      successes.push(`✅ Protected page ${page} accessible with auth`);
      console.log(`✅ Protected page ${page} accessible with auth`);
    }
  }

  // 8. API Endpoints
  console.log('\n8️⃣ API ENDPOINTS');
  const apiEndpoints = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/csrf', method: 'GET' },
    { path: '/api/test-supabase', method: 'GET' },
    { path: '/api/auth/register', method: 'POST', body: { email: 'test@example.com', password: 'test123', firstName: 'Test', lastName: 'User', country: 'Italy' } },
    { path: '/api/auth/login', method: 'POST', body: { email: 'test@example.com', password: 'test123' } },
    { path: '/api/auth/check', method: 'GET' },
    { path: '/api/profile/update', method: 'POST', body: { user_id: '00000000-0000-0000-0000-000000000000', first_name: 'Test' } },
    { path: '/api/profile/upload-photo', method: 'POST', body: { user_id: '00000000-0000-0000-0000-000000000000' } },
    { path: '/api/investments', method: 'GET' },
    { path: '/api/notes', method: 'GET' }
  ];

  for (const endpoint of apiEndpoints) {
    const options = {
      method: endpoint.method,
      headers: {}
    };
    
    // Only add CSRF token for POST requests that need it
    if (endpoint.method === 'POST' && csrfData?.token) {
      options.headers['X-CSRF-Token'] = csrfData.token;
    }
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const { response: apiResponse, error: apiError } = await makeRequest(`${BASE_URL}${endpoint.path}`, options);
    
    if (apiError) {
      issues.push(`❌ API ${endpoint.path} error: ${apiError}`);
      console.log(`❌ API ${endpoint.path} error: ${apiError}`);
    } else if (apiResponse.status >= 500) {
      issues.push(`❌ API ${endpoint.path} server error: ${apiResponse.status}`);
      console.log(`❌ API ${endpoint.path} server error: ${apiResponse.status}`);
    } else if (apiResponse.status >= 400) {
      warnings.push(`⚠️ API ${endpoint.path} client error: ${apiResponse.status}`);
      console.log(`⚠️ API ${endpoint.path} client error: ${apiResponse.status}`);
    } else {
      successes.push(`✅ API ${endpoint.path} working`);
      console.log(`✅ API ${endpoint.path} working`);
    }
  }

  // 9. File System Check
  console.log('\n9️⃣ FILE SYSTEM CHECK');
  const criticalFiles = [
    'app/layout.tsx',
    'app/page.tsx',
    'app/profile/page.tsx',
    'app/dashboard/page.tsx',
    'app/api/auth/login/route.ts',
    'app/api/auth/register/route.ts',
    'lib/supabase.ts',
    'lib/csrf-client.ts',
    'lib/safe-router.ts',
    'hooks/use-auth.ts',
    'components/Navigation.tsx',
    'components/Footer.tsx'
  ];

  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      successes.push(`✅ File ${file} exists`);
      console.log(`✅ File ${file} exists`);
    } else {
      issues.push(`❌ Critical file missing: ${file}`);
      console.log(`❌ Critical file missing: ${file}`);
    }
  }

  // 10. Build Issues Check
  console.log('\n🔟 BUILD ISSUES CHECK');
  const buildFiles = [
    '.next',
    'node_modules',
    'package.json',
    'next.config.js',
    'tsconfig.json'
  ];

  for (const file of buildFiles) {
    if (fs.existsSync(file)) {
      successes.push(`✅ Build file ${file} exists`);
      console.log(`✅ Build file ${file} exists`);
    } else {
      issues.push(`❌ Build file missing: ${file}`);
      console.log(`❌ Build file missing: ${file}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 ANALYSIS SUMMARY');
  console.log('='.repeat(50));
  
  console.log(`\n✅ SUCCESSES: ${successes.length}`);
  console.log(`⚠️ WARNINGS: ${warnings.length}`);
  console.log(`❌ ISSUES: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    warnings.forEach(warning => console.log(`  ${warning}`));
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (issues.length === 0 && warnings.length === 0) {
    console.log('  ✅ Site is working correctly!');
  } else {
    if (issues.length > 0) {
      console.log('  🔧 Fix critical issues first');
    }
    if (warnings.length > 0) {
      console.log('  ⚠️ Address warnings for better stability');
    }
    console.log('  📝 Check server logs for more details');
    console.log('  🔄 Restart server if needed');
  }
  
  console.log('\n' + '='.repeat(50));
}

comprehensiveAnalysis().catch(console.error); 