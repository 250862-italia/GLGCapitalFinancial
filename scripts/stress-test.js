#!/usr/bin/env node

// Stress Test Script
// Run with: node scripts/stress-test.js

const { StressTester } = require('../lib/stress-tester.ts');

async function runStressTests() {
  console.log('🚀 GLG Capital Group - Stress Testing Suite');
  console.log('='.repeat(60));
  
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  
  try {
    // Quick test first
    console.log('\n📊 Running Quick Test (5 users, 3 requests each)...');
    const quickResult = await StressTester.runQuickTest(baseUrl);
    StressTester.printResults(quickResult);
    
    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Standard test
    console.log('\n📊 Running Standard Test (20 users, 5 requests each)...');
    const standardResult = await StressTester.runStressTest(baseUrl);
    StressTester.printResults(standardResult);
    
    // Wait a bit before heavy test
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Heavy test (optional)
    if (process.argv.includes('--heavy')) {
      console.log('\n📊 Running Heavy Test (50 users, 10 requests each)...');
      const heavyResult = await StressTester.runHeavyTest(baseUrl);
      StressTester.printResults(heavyResult);
    }
    
    // Test specific endpoints
    console.log('\n📊 Testing Specific Endpoints...');
    const endpointResults = await StressTester.testSpecificEndpoints(baseUrl, [
      { url: '/', method: 'GET' },
      { url: '/register', method: 'GET' },
      { url: '/login', method: 'GET' },
      { url: '/dashboard', method: 'GET' },
      { url: '/api/auth/register', method: 'POST', body: {
        email: 'endpoint-test@example.com',
        firstName: 'Endpoint',
        lastName: 'Test',
        country: 'Italy',
        password: 'Test123!'
      }},
      { url: '/api/auth/login', method: 'POST', body: {
        email: 'test@example.com',
        password: 'Test123!'
      }}
    ]);
    
    console.log('\n📊 ENDPOINT TEST RESULTS:');
    endpointResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} Endpoint ${index + 1}: ${result.statusCode} (${result.responseTime}ms)`);
    });
    
  } catch (error) {
    console.error('❌ Stress test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runStressTests().then(() => {
  console.log('\n🎉 Stress testing completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Stress testing failed:', error);
  process.exit(1);
}); 