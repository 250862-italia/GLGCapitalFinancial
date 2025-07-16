// Stress Testing System
// Tests system performance under load

interface StressTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  delayBetweenRequests: number; // milliseconds
  endpoints: string[];
  timeout: number; // milliseconds
}

interface StressTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  errors: string[];
  startTime: number;
  endTime: number;
  duration: number;
}

interface RequestResult {
  success: boolean;
  responseTime: number;
  statusCode: number;
  error?: string;
}

export class StressTester {
  private static async makeRequest(url: string, method: string = 'GET', body?: any): Promise<RequestResult> {
    const startTime = Date.now();
    
    try {
      const options: RequestInit = {
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
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        responseTime,
        statusCode: 0,
        error: error.message,
      };
    }
  }

  private static async simulateUser(
    userId: number,
    config: StressTestConfig,
    baseUrl: string
  ): Promise<RequestResult[]> {
    const results: RequestResult[] = [];
    
    for (let i = 0; i < config.requestsPerUser; i++) {
      // Randomly select an endpoint
      const endpoint = config.endpoints[Math.floor(Math.random() * config.endpoints.length)];
      const url = `${baseUrl}${endpoint}`;
      
      // Simulate different types of requests
      let method = 'GET';
      let body: any = undefined;
      
      if (endpoint.includes('/register')) {
        method = 'POST';
        body = {
          email: `stress-test-${userId}-${i}@example.com`,
          firstName: `User${userId}`,
          lastName: `Test${i}`,
          country: 'Italy',
          password: 'Test123!'
        };
      } else if (endpoint.includes('/login')) {
        method = 'POST';
        body = {
          email: `test${userId}@example.com`,
          password: 'Test123!'
        };
      }
      
      const result = await this.makeRequest(url, method, body);
      results.push(result);
      
      // Add delay between requests
      if (i < config.requestsPerUser - 1) {
        await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
      }
    }
    
    return results;
  }

  static async runStressTest(
    baseUrl: string = 'http://localhost:3000',
    config: Partial<StressTestConfig> = {}
  ): Promise<StressTestResult> {
    const defaultConfig: StressTestConfig = {
      concurrentUsers: 20,
      requestsPerUser: 5,
      delayBetweenRequests: 100,
      endpoints: [
        '/',
        '/register',
        '/login',
        '/api/auth/register',
        '/api/auth/login',
        '/dashboard',
        '/investments'
      ],
      timeout: 30000
    };
    
    const finalConfig = { ...defaultConfig, ...config };
    const startTime = Date.now();
    const allResults: RequestResult[] = [];
    const errors: string[] = [];
    
    console.log(`🚀 Starting stress test with ${finalConfig.concurrentUsers} concurrent users...`);
    console.log(`📊 Each user will make ${finalConfig.requestsPerUser} requests`);
    console.log(`⏱️  Delay between requests: ${finalConfig.delayBetweenRequests}ms`);
    
    // Create concurrent user simulations
    const userPromises = Array.from({ length: finalConfig.concurrentUsers }, (_, i) =>
      this.simulateUser(i + 1, finalConfig, baseUrl)
    );
    
    // Wait for all users to complete with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Stress test timeout')), finalConfig.timeout);
    });
    
    try {
      const userResults = await Promise.race([
        Promise.all(userPromises),
        timeoutPromise
      ]);
      
      // Collect all results
      userResults.forEach(results => {
        allResults.push(...results);
      });
      
    } catch (error: any) {
      errors.push(`Stress test failed: ${error.message}`);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Calculate statistics
    const successfulRequests = allResults.filter(r => r.success).length;
    const failedRequests = allResults.filter(r => !r.success).length;
    const responseTimes = allResults.map(r => r.responseTime);
    
    const result: StressTestResult = {
      totalRequests: allResults.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      errors: [
        ...errors,
        ...allResults.filter(r => !r.success).map(r => r.error || `HTTP ${r.statusCode}`)
      ],
      startTime,
      endTime,
      duration
    };
    
    return result;
  }

  static async runQuickTest(baseUrl: string = 'http://localhost:3000'): Promise<StressTestResult> {
    return this.runStressTest(baseUrl, {
      concurrentUsers: 5,
      requestsPerUser: 3,
      delayBetweenRequests: 200,
      timeout: 15000
    });
  }

  static async runHeavyTest(baseUrl: string = 'http://localhost:3000'): Promise<StressTestResult> {
    return this.runStressTest(baseUrl, {
      concurrentUsers: 50,
      requestsPerUser: 10,
      delayBetweenRequests: 50,
      timeout: 60000
    });
  }

  static printResults(result: StressTestResult): void {
    console.log('\n📊 STRESS TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${result.duration}ms`);
    console.log(`📈 Total Requests: ${result.totalRequests}`);
    console.log(`✅ Successful: ${result.successfulRequests}`);
    console.log(`❌ Failed: ${result.failedRequests}`);
    console.log(`📊 Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
    console.log(`⚡ Average Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Min Response Time: ${result.minResponseTime}ms`);
    console.log(`🐌 Max Response Time: ${result.maxResponseTime}ms`);
    console.log(`📈 Requests/Second: ${(result.totalRequests / (result.duration / 1000)).toFixed(2)}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      const errorCounts = result.errors.reduce((acc, error) => {
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`  ${error}: ${count} times`);
      });
    }
    
    // Performance assessment
    const successRate = (result.successfulRequests / result.totalRequests) * 100;
    const avgResponseTime = result.averageResponseTime;
    const requestsPerSecond = result.totalRequests / (result.duration / 1000);
    
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

  static async testSpecificEndpoints(
    baseUrl: string,
    endpoints: Array<{ url: string; method: string; body?: any }>
  ): Promise<RequestResult[]> {
    const results: RequestResult[] = [];
    
    for (const endpoint of endpoints) {
      const url = `${baseUrl}${endpoint.url}`;
      const result = await this.makeRequest(url, endpoint.method, endpoint.body);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
} 