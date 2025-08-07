#!/usr/bin/env node

// Simple Stress Test Script
// Tests basic endpoints with concurrent requests

async function makeRequest(url, method = 'GET', body = null) {
  const startTime = Date.now();
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    
    return {
      success: response.ok,
      responseTime,
      statusCode: response.status,
      url
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      responseTime,
      statusCode: 0,
      error: error.message,
      url
    };
  }
}

async function simulateUser(userId, baseUrl) {
  const results = [];
  
  // Test different endpoints
  const endpoints = [
    { url: '/', method: 'GET' },
    { url: '/register', method: 'GET' },
    { url: '/login', method: 'GET' },
    { 
      url: '/api/auth/register', 
      method: 'POST', 
      body: {
        email: `stress-test-${userId}@example.com`,
        firstName: `User${userId}`,
        lastName: 'Test',
        country: 'Italy',
        password: 'Test123!'
      }
    },
    { 
      url: '/api/auth/login', 
      method: 'POST', 
      body: {
        email: 'test@example.com',
        password: 'Test123!'
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint.url}`;
    const result = await makeRequest(url, endpoint.method, endpoint.body);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

async function runStressTest(baseUrl = 'http://localhost:3000', concurrentUsers = 5) {
  console.log(`🚀 Starting stress test with ${concurrentUsers} concurrent users...`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  
  const startTime = Date.now();
  const allResults = [];
  
  // Create concurrent user simulations
  const userPromises = Array.from({ length: concurrentUsers }, (_, i) =>
    simulateUser(i + 1, baseUrl)
  );
  
  try {
    const userResults = await Promise.all(userPromises);
    
    // Collect all results
    userResults.forEach(results => {
      allResults.push(...results);
    });
    
  } catch (error) {
    console.error('❌ Stress test failed:', error.message);
    return;
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Calculate statistics
  const successfulRequests = allResults.filter(r => r.success).length;
  const failedRequests = allResults.filter(r => !r.success).length;
  const responseTimes = allResults.map(r => r.responseTime);
  
  console.log('\n📊 STRESS TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📈 Total Requests: ${allResults.length}`);
  console.log(`✅ Successful: ${successfulRequests}`);
  console.log(`❌ Failed: ${failedRequests}`);
  console.log(`📊 Success Rate: ${((successfulRequests / allResults.length) * 100).toFixed(2)}%`);
  console.log(`⚡ Average Response Time: ${responseTimes.length > 0 ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2) : 0}ms`);
  console.log(`🚀 Min Response Time: ${responseTimes.length > 0 ? Math.min(...responseTimes) : 0}ms`);
  console.log(`🐌 Max Response Time: ${responseTimes.length > 0 ? Math.max(...responseTimes) : 0}ms`);
  console.log(`📈 Requests/Second: ${(allResults.length / (duration / 1000)).toFixed(2)}`);
  
  // Show endpoint-specific results
  console.log('\n📊 ENDPOINT RESULTS:');
  const endpointStats = {};
  allResults.forEach(result => {
    const endpoint = result.url.split('/').pop() || 'root';
    if (!endpointStats[endpoint]) {
      endpointStats[endpoint] = { success: 0, failed: 0, total: 0, avgTime: 0, times: [] };
    }
    endpointStats[endpoint].total++;
    endpointStats[endpoint].times.push(result.responseTime);
    if (result.success) {
      endpointStats[endpoint].success++;
    } else {
      endpointStats[endpoint].failed++;
    }
  });
  
  Object.entries(endpointStats).forEach(([endpoint, stats]) => {
    const avgTime = stats.times.length > 0 ? (stats.times.reduce((a, b) => a + b, 0) / stats.times.length).toFixed(2) : 0;
    const successRate = ((stats.success / stats.total) * 100).toFixed(2);
    console.log(`  ${endpoint}: ${successRate}% success, ${avgTime}ms avg`);
  });
  
  // Performance assessment
  const successRate = (successfulRequests / allResults.length) * 100;
  const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
  const requestsPerSecond = allResults.length / (duration / 1000);
  
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  if (successRate >= 95 && avgResponseTime < 1000 && requestsPerSecond >= 10) {
    console.log('🟢 EXCELLENT - System is performing well under load');
  } else if (successRate >= 90 && avgResponseTime < 2000 && requestsPerSecond >= 5) {
    console.log('🟡 GOOD - System is performing adequately');
  } else if (successRate >= 80 && avgResponseTime < 5000) {
    console.log('🟠 FAIR - System needs optimization');
  } else {
    console.log('🔴 POOR - System needs significant improvements');
  }
}

// Run the test
const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
const users = parseInt(process.argv[2]) || 5;

runStressTest(baseUrl, users).then(() => {
  console.log('\n🎉 Stress testing completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Stress testing failed:', error);
  process.exit(1);
}); 