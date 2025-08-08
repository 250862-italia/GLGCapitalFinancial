const { createClient } = require('@supabase/supabase-js');

// Test CRUD operations for all entities
async function testCRUDOperations() {
  console.log('🧪 Testing Complete CRUD Operations');
  console.log('=====================================\n');

  const results = {
    clients: { create: false, read: false, update: false, delete: false },
    packages: { create: false, read: false, update: false, delete: false },
    investments: { create: false, read: false, update: false, delete: false },
    payments: { create: false, read: false, update: false, delete: false },
    teamMembers: { create: false, read: false, update: false, delete: false },
    partnerships: { create: false, read: false, update: false, delete: false },
    analytics: { create: false, read: false, update: false, delete: false }
  };

  try {
    // Test Clients CRUD
    console.log('📋 Testing Clients CRUD Operations...');
    await testEntityCRUD('clients', results.clients);
    
    // Test Packages CRUD
    console.log('\n📦 Testing Packages CRUD Operations...');
    await testEntityCRUD('packages', results.packages);
    
    // Test Investments CRUD
    console.log('\n💰 Testing Investments CRUD Operations...');
    await testEntityCRUD('investments', results.investments);
    
    // Test Payments CRUD
    console.log('\n💳 Testing Payments CRUD Operations...');
    await testEntityCRUD('payments', results.payments);
    
    // Test Team Members CRUD
    console.log('\n👥 Testing Team Members CRUD Operations...');
    await testEntityCRUD('team', results.teamMembers);
    
    // Test Partnerships CRUD
    console.log('\n🤝 Testing Partnerships CRUD Operations...');
    await testEntityCRUD('partnerships', results.partnerships);
    
    // Test Analytics CRUD
    console.log('\n📊 Testing Analytics CRUD Operations...');
    await testEntityCRUD('analytics', results.analytics);

    // Print final results
    console.log('\n🎯 CRUD Operations Test Results');
    console.log('================================');
    printResults(results);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testEntityCRUD(entityName, results) {
  const baseUrl = 'http://localhost:3000/api/admin';
  const adminToken = 'test-admin-token'; // In real scenario, get from login
  
  try {
    // Test CREATE
    console.log(`  ✅ Testing CREATE ${entityName}...`);
    const createData = getTestData(entityName, 'create');
    const createResponse = await fetch(`${baseUrl}/${entityName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      },
      body: JSON.stringify(createData)
    });
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      if (createResult.success && createResult.data) {
        results.create = true;
        console.log(`    ✅ CREATE ${entityName} successful`);
        
        const createdId = createResult.data.id;
        
        // Test READ
        console.log(`  ✅ Testing READ ${entityName}...`);
        const readResponse = await fetch(`${baseUrl}/${entityName}`, {
          headers: { 'x-admin-token': adminToken }
        });
        
        if (readResponse.ok) {
          const readResult = await readResponse.json();
          if (readResult.success && readResult.data && readResult.data.length > 0) {
            results.read = true;
            console.log(`    ✅ READ ${entityName} successful`);
            
            // Test UPDATE
            console.log(`  ✅ Testing UPDATE ${entityName}...`);
            const updateData = getTestData(entityName, 'update');
            const updateResponse = await fetch(`${baseUrl}/${entityName}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-token': adminToken
              },
              body: JSON.stringify({ id: createdId, ...updateData })
            });
            
            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              if (updateResult.success && updateResult.data) {
                results.update = true;
                console.log(`    ✅ UPDATE ${entityName} successful`);
                
                // Test DELETE
                console.log(`  ✅ Testing DELETE ${entityName}...`);
                const deleteResponse = await fetch(`${baseUrl}/${entityName}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-admin-token': adminToken
                  },
                  body: JSON.stringify({ id: createdId })
                });
                
                if (deleteResponse.ok) {
                  const deleteResult = await deleteResponse.json();
                  if (deleteResult.success) {
                    results.delete = true;
                    console.log(`    ✅ DELETE ${entityName} successful`);
                  } else {
                    console.log(`    ❌ DELETE ${entityName} failed:`, deleteResult.error);
                  }
                } else {
                  console.log(`    ❌ DELETE ${entityName} request failed:`, deleteResponse.status);
                }
              } else {
                console.log(`    ❌ UPDATE ${entityName} failed:`, updateResult.error);
              }
            } else {
              console.log(`    ❌ UPDATE ${entityName} request failed:`, updateResponse.status);
            }
          } else {
            console.log(`    ❌ READ ${entityName} failed:`, readResult.error);
          }
        } else {
          console.log(`    ❌ READ ${entityName} request failed:`, readResponse.status);
        }
      } else {
        console.log(`    ❌ CREATE ${entityName} failed:`, createResult.error);
      }
    } else {
      console.log(`    ❌ CREATE ${entityName} request failed:`, createResponse.status);
    }
  } catch (error) {
    console.log(`    ❌ ${entityName} CRUD test failed:`, error.message);
  }
}

function getTestData(entityName, operation) {
  const baseData = {
    clients: {
      create: {
        first_name: 'Test',
        last_name: 'Client',
        email: 'test.client@example.com',
        phone: '+39 333 1234567',
        company: 'Test Company',
        position: 'Manager',
        date_of_birth: '1990-01-01',
        nationality: 'Italiana',
        address: 'Via Test 123',
        city: 'Milano',
        country: 'Italia',
        postal_code: '20100',
        iban: 'IT60X0542811101000000123456',
        bic: 'CRPPIT2P',
        account_holder: 'Test Client',
        usdt_wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        status: 'active',
        risk_profile: 'moderate'
      },
      update: {
        first_name: 'Updated',
        last_name: 'Client',
        status: 'inactive'
      }
    },
    packages: {
      create: {
        name: 'Test Package',
        description: 'Test package description',
        min_investment: 1000,
        max_investment: 10000,
        expected_return: 5.0,
        duration_months: 12,
        risk_level: 'low',
        status: 'active'
      },
      update: {
        name: 'Updated Test Package',
        expected_return: 6.0
      }
    },
    investments: {
      create: {
        client_id: '1',
        package_id: '1',
        amount: 5000,
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        expected_return: 5.5,
        total_returns: 0,
        daily_returns: 0,
        monthly_returns: 0,
        fees_paid: 0,
        payment_method: 'bank_transfer',
        transaction_id: 'TXN_TEST_001',
        notes: 'Test investment'
      },
      update: {
        status: 'active',
        actual_return: 5.2
      }
    },
    payments: {
      create: {
        user_id: '1',
        investment_id: '1',
        amount: 5000,
        currency: 'EUR',
        payment_method: 'bank_transfer',
        status: 'pending',
        transaction_id: 'TXN_TEST_001',
        payment_date: new Date().toISOString(),
        notes: 'Test payment'
      },
      update: {
        status: 'completed',
        processed_date: new Date().toISOString()
      }
    },
    team: {
      create: {
        user_id: 'team-1',
        first_name: 'Test',
        last_name: 'Team Member',
        email: 'test.team@glgcapital.com',
        role: 'analyst',
        department: 'Analytics',
        phone: '+39 333 1111111',
        hire_date: '2024-01-01',
        status: 'active',
        permissions: { can_view_analytics: true }
      },
      update: {
        role: 'senior_analyst',
        status: 'active'
      }
    },
    partnerships: {
      create: {
        name: 'Test Partnership',
        description: 'Test partnership description',
        contact_person: 'Test Contact',
        email: 'test@partnership.com',
        phone: '+39 333 2222222',
        website: 'https://testpartnership.com',
        status: 'pending',
        partnership_type: 'technology',
        start_date: '2024-01-01',
        terms: 'Test partnership terms'
      },
      update: {
        status: 'active',
        description: 'Updated test partnership description'
      }
    },
    analytics: {
      create: {
        metric_name: 'Test Metric',
        metric_value: 100,
        metric_unit: 'units',
        period: '2024-01',
        category: 'test'
      },
      update: {
        metric_value: 150,
        metric_unit: 'updated_units'
      }
    }
  };

  return baseData[entityName]?.[operation] || {};
}

function printResults(results) {
  const entities = Object.keys(results);
  let totalTests = 0;
  let passedTests = 0;

  entities.forEach(entity => {
    const entityResults = results[entity];
    const operations = Object.keys(entityResults);
    const passed = operations.filter(op => entityResults[op]).length;
    const total = operations.length;
    
    totalTests += total;
    passedTests += passed;

    console.log(`${entity.charAt(0).toUpperCase() + entity.slice(1)}:`);
    operations.forEach(op => {
      const status = entityResults[op] ? '✅' : '❌';
      console.log(`  ${op.toUpperCase()}: ${status}`);
    });
    console.log(`  Score: ${passed}/${total}\n`);
  });

  console.log(`🎯 Overall Score: ${passedTests}/${totalTests}`);
  console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL CRUD OPERATIONS ARE WORKING PERFECTLY!');
  } else {
    console.log('\n⚠️  Some CRUD operations need attention.');
  }
}

// Run the test
if (require.main === module) {
  testCRUDOperations().catch(console.error);
}

module.exports = { testCRUDOperations }; 