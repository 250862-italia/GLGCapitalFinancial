#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');

// Configurazione
const SITE_URL = process.env.SITE_URL || 'https://www.glgcapitalgroup.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dobjulfwktzltpvqtxbql.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class HealthChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {}
    };
  }

  async runAllChecks() {
    console.log('🔍 Starting comprehensive health check...\n');

    await Promise.all([
      this.checkWebsite(),
      this.checkSupabase(),
      this.checkAPIs(),
      this.checkPerformance(),
      this.checkSecurity(),
      this.checkDatabase()
    ]);

    this.generateReport();
    this.exitWithStatus();
  }

  async checkWebsite() {
    console.log('🌐 Checking website availability...');
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(`${SITE_URL}/api/health`);
      const loadTime = Date.now() - startTime;

      this.results.checks.website = {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        loadTime: loadTime,
        error: null
      };

      console.log(`✅ Website: ${response.status} (${loadTime}ms)`);
    } catch (error) {
      this.results.checks.website = {
        status: 'unhealthy',
        error: error.message
      };
      console.log(`❌ Website: ${error.message}`);
    }
  }

  async checkSupabase() {
    console.log('🗄️ Checking Supabase connection...');
    
    try {
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('clients')
        .select('count')
        .limit(1);
      
      const loadTime = Date.now() - startTime;

      if (error) {
        throw new Error(error.message);
      }

      this.results.checks.supabase = {
        status: 'healthy',
        loadTime: loadTime,
        error: null
      };

      console.log(`✅ Supabase: Connected (${loadTime}ms)`);
    } catch (error) {
      this.results.checks.supabase = {
        status: 'unhealthy',
        error: error.message
      };
      console.log(`❌ Supabase: ${error.message}`);
    }
  }

  async checkAPIs() {
    console.log('🔌 Checking API endpoints...');
    
    const apis = [
      '/api/auth/login',
      '/api/profile/create',
      '/api/admin/clients',
      '/api/investments'
    ];

    const apiResults = {};

    for (const api of apis) {
      try {
        const response = await this.makeRequest(`${SITE_URL}${api}`, 'POST', {});
        
        apiResults[api] = {
          status: response.status < 500 ? 'healthy' : 'unhealthy',
          statusCode: response.status,
          error: null
        };

        console.log(`✅ ${api}: ${response.status}`);
      } catch (error) {
        apiResults[api] = {
          status: 'unhealthy',
          error: error.message
        };
        console.log(`❌ ${api}: ${error.message}`);
      }
    }

    this.results.checks.apis = apiResults;
  }

  async checkPerformance() {
    console.log('⚡ Checking performance...');
    
    try {
      const startTime = Date.now();
      await this.makeRequest(SITE_URL);
      const loadTime = Date.now() - startTime;

      this.results.checks.performance = {
        status: loadTime < 3000 ? 'healthy' : 'warning',
        loadTime: loadTime,
        threshold: 3000,
        error: null
      };

      console.log(`✅ Performance: ${loadTime}ms (threshold: 3000ms)`);
    } catch (error) {
      this.results.checks.performance = {
        status: 'unhealthy',
        error: error.message
      };
      console.log(`❌ Performance: ${error.message}`);
    }
  }

  async checkSecurity() {
    console.log('🛡️ Checking security headers...');
    
    try {
      const response = await this.makeRequest(SITE_URL);
      const headers = response.headers;

      const securityHeaders = {
        'x-frame-options': headers['x-frame-options'],
        'x-content-type-options': headers['x-content-type-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'strict-transport-security': headers['strict-transport-security']
      };

      const missingHeaders = Object.entries(securityHeaders)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      this.results.checks.security = {
        status: missingHeaders.length === 0 ? 'healthy' : 'warning',
        headers: securityHeaders,
        missingHeaders: missingHeaders,
        error: null
      };

      if (missingHeaders.length === 0) {
        console.log('✅ Security: All headers present');
      } else {
        console.log(`⚠️ Security: Missing headers: ${missingHeaders.join(', ')}`);
      }
    } catch (error) {
      this.results.checks.security = {
        status: 'unhealthy',
        error: error.message
      };
      console.log(`❌ Security: ${error.message}`);
    }
  }

  async checkDatabase() {
    console.log('💾 Checking database integrity...');
    
    try {
      // Verifica struttura tabelle
      const tables = ['clients', 'users', 'investments', 'packages'];
      const tableResults = {};

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count')
            .limit(1);

          if (error) {
            tableResults[table] = { status: 'error', error: error.message };
          } else {
            tableResults[table] = { status: 'healthy', count: data?.length || 0 };
          }
        } catch (error) {
          tableResults[table] = { status: 'error', error: error.message };
        }
      }

      this.results.checks.database = {
        status: Object.values(tableResults).every(r => r.status === 'healthy') ? 'healthy' : 'warning',
        tables: tableResults,
        error: null
      };

      console.log('✅ Database: Structure verified');
    } catch (error) {
      this.results.checks.database = {
        status: 'unhealthy',
        error: error.message
      };
      console.log(`❌ Database: ${error.message}`);
    }
  }

  async makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'User-Agent': 'HealthChecker/1.0',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  generateReport() {
    console.log('\n📊 Health Check Report');
    console.log('='.repeat(50));

    // Calcola stato generale
    const allChecks = Object.values(this.results.checks);
    const unhealthyChecks = allChecks.filter(check => 
      check.status === 'unhealthy' || 
      (Array.isArray(check) && check.some(c => c.status === 'unhealthy'))
    );

    if (unhealthyChecks.length === 0) {
      this.results.overall = 'healthy';
      console.log('🎉 Overall Status: HEALTHY');
    } else {
      this.results.overall = 'unhealthy';
      console.log('⚠️ Overall Status: UNHEALTHY');
    }

    // Dettagli per ogni check
    Object.entries(this.results.checks).forEach(([name, check]) => {
      if (Array.isArray(check)) {
        console.log(`\n${name.toUpperCase()}:`);
        check.forEach((item, index) => {
          const status = item.status === 'healthy' ? '✅' : '❌';
          console.log(`  ${status} ${item.name || index}: ${item.status}`);
        });
      } else {
        const status = check.status === 'healthy' ? '✅' : '❌';
        console.log(`${status} ${name.toUpperCase()}: ${check.status}`);
        if (check.error) {
          console.log(`    Error: ${check.error}`);
        }
      }
    });

    console.log('\n' + '='.repeat(50));
  }

  exitWithStatus() {
    const exitCode = this.results.overall === 'healthy' ? 0 : 1;
    process.exit(exitCode);
  }
}

// Esegui health check
const healthChecker = new HealthChecker();
healthChecker.runAllChecks().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
}); 