const fetch = require('node-fetch');

const BASE_URL = 'https://glgcapitalfinancial-8xdcmett9-250862-italias-projects.vercel.app';

async function testAdminAPI() {
  console.log('🧪 Testing Admin API endpoints...\n');

  const endpoints = [
    '/api/admin/analytics/dashboard',
    '/api/admin/clients',
    '/api/admin/investments',
    '/api/admin/settings',
    '/api/admin/team',
    '/api/admin/content',
    '/api/admin/partnerships'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${endpoint}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data type: ${typeof data}`);
        if (Array.isArray(data)) {
          console.log(`   Records: ${data.length}`);
        } else if (data && typeof data === 'object') {
          console.log(`   Keys: ${Object.keys(data).join(', ')}`);
        }
      } else {
        console.log(`❌ Error: ${endpoint}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Status Text: ${response.statusText}`);
        try {
          const errorData = await response.text();
          console.log(`   Error: ${errorData.substring(0, 200)}...`);
        } catch (e) {
          console.log(`   Error: Could not read error response`);
        }
      }
    } catch (error) {
      console.log(`💥 Exception: ${endpoint}`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('🏁 API testing completed!');
}

// Test anche le pagine admin
async function testAdminPages() {
  console.log('🌐 Testing Admin Pages...\n');

  const pages = [
    '/admin',
    '/admin/analytics/dashboard',
    '/admin/clients',
    '/admin/investments',
    '/admin/settings'
  ];

  for (const page of pages) {
    try {
      console.log(`📄 Testing page: ${page}`);
      const response = await fetch(`${BASE_URL}${page}`);
      
      if (response.ok) {
        const html = await response.text();
        console.log(`✅ Success: ${page}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Content length: ${html.length} characters`);
        console.log(`   Is HTML: ${html.includes('<!DOCTYPE html>') || html.includes('<html>')}`);
      } else {
        console.log(`❌ Error: ${page}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Status Text: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`💥 Exception: ${page}`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('🏁 Page testing completed!');
}

async function runTests() {
  console.log('🚀 Starting Admin System Tests...\n');
  
  await testAdminAPI();
  console.log('\n' + '='.repeat(50) + '\n');
  await testAdminPages();
  
  console.log('\n🎯 All tests completed!');
}

runTests().catch(console.error); 