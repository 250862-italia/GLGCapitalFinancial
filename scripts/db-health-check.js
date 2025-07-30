const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🏥 Database Health Check Tool');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Tabelle fondamentali da verificare
const CRITICAL_TABLES = [
  'profiles',
  'clients', 
  'investments',
  'packages',
  'payments',
  'notifications',
  'team_members',
  'audit_logs',
  'email_queue',
  'informational_requests',
  'kyc_requests',
  'analytics',
  'content',
  'partnerships',
  'notes'
];

// Relazioni chiave da verificare
const CRITICAL_RELATIONS = [
  { table: 'clients', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'investments', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'investments', foreignKey: 'client_id', references: 'clients.id' },
  { table: 'investments', foreignKey: 'package_id', references: 'packages.id' },
  { table: 'payments', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'payments', foreignKey: 'investment_id', references: 'investments.id' },
  { table: 'notifications', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'team_members', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'audit_logs', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'email_queue', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'informational_requests', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'kyc_requests', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'analytics', foreignKey: 'user_id', references: 'profiles.id' },
  { table: 'content', foreignKey: 'author_id', references: 'profiles.id' }
];

async function checkTableHealth(tableName) {
  try {
    console.log(`\n🔍 Checking table: ${tableName}`);
    
    // Test 1: Verifica esistenza tabella
    const { data: tableData, error: tableError } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log(`❌ Table ${tableName} error:`, tableError.message);
      return { exists: false, error: tableError.message };
    }
    
    console.log(`✅ Table ${tableName} exists`);
    
    // Test 2: Verifica accesso ai dati
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.log(`⚠️ Table ${tableName} data access error:`, sampleError.message);
      return { exists: true, accessible: false, error: sampleError.message };
    }
    
    console.log(`✅ Table ${tableName} accessible (${sampleData.length} sample records)`);
    
    // Test 3: Verifica struttura colonne
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: tableName })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    if (!columnsError && columns) {
      console.log(`✅ Table ${tableName} structure verified`);
    }
    
    return { exists: true, accessible: true, sampleCount: sampleData.length };
    
  } catch (error) {
    console.log(`❌ Table ${tableName} check failed:`, error.message);
    return { exists: false, error: error.message };
  }
}

async function checkRelationHealth(relation) {
  try {
    console.log(`\n🔗 Checking relation: ${relation.table}.${relation.foreignKey} -> ${relation.references}`);
    
    // Test foreign key constraint
    const { data, error } = await supabase
      .from(relation.table)
      .select(`${relation.foreignKey}`)
      .not(relation.foreignKey, 'is', null)
      .limit(1);
    
    if (error) {
      console.log(`❌ Relation ${relation.table}.${relation.foreignKey} error:`, error.message);
      return { valid: false, error: error.message };
    }
    
    console.log(`✅ Relation ${relation.table}.${relation.foreignKey} valid`);
    return { valid: true };
    
  } catch (error) {
    console.log(`❌ Relation ${relation.table}.${relation.foreignKey} check failed:`, error.message);
    return { valid: false, error: error.message };
  }
}

async function checkDatabaseConnection() {
  try {
    console.log('\n🌐 Testing database connection...');
    
    // Test connessione base
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (error) {
    console.log('❌ Database connection test failed:', error.message);
    return false;
  }
}

async function checkAuthentication() {
  try {
    console.log('\n🔐 Testing authentication...');
    
    // Test con credenziali note
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@glgcapital.com',
      password: 'TestPassword123!'
    });
    
    if (authError) {
      console.log('❌ Authentication test failed:', authError.message);
      return false;
    }
    
    console.log('✅ Authentication successful');
    return true;
    
  } catch (error) {
    console.log('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function generateHealthReport() {
  console.log('\n📊 Generating Health Report...');
  console.log('='.repeat(50));
  
  const report = {
    timestamp: new Date().toISOString(),
    database: {
      connection: false,
      authentication: false
    },
    tables: {},
    relations: {},
    summary: {
      totalTables: CRITICAL_TABLES.length,
      healthyTables: 0,
      totalRelations: CRITICAL_RELATIONS.length,
      healthyRelations: 0,
      overallHealth: 'UNKNOWN'
    }
  };
  
  // Test connessione database
  report.database.connection = await checkDatabaseConnection();
  report.database.authentication = await checkAuthentication();
  
  // Test tabelle
  for (const table of CRITICAL_TABLES) {
    const tableHealth = await checkTableHealth(table);
    report.tables[table] = tableHealth;
    
    if (tableHealth.exists && tableHealth.accessible) {
      report.summary.healthyTables++;
    }
  }
  
  // Test relazioni
  for (const relation of CRITICAL_RELATIONS) {
    const relationHealth = await checkRelationHealth(relation);
    report.relations[`${relation.table}.${relation.foreignKey}`] = relationHealth;
    
    if (relationHealth.valid) {
      report.summary.healthyRelations++;
    }
  }
  
  // Calcola salute generale
  const tableHealthPercentage = (report.summary.healthyTables / report.summary.totalTables) * 100;
  const relationHealthPercentage = (report.summary.healthyRelations / report.summary.totalRelations) * 100;
  
  if (report.database.connection && report.database.authentication && 
      tableHealthPercentage >= 90 && relationHealthPercentage >= 90) {
    report.summary.overallHealth = 'EXCELLENT';
  } else if (report.database.connection && tableHealthPercentage >= 70) {
    report.summary.overallHealth = 'GOOD';
  } else if (report.database.connection) {
    report.summary.overallHealth = 'POOR';
  } else {
    report.summary.overallHealth = 'CRITICAL';
  }
  
  return report;
}

async function main() {
  try {
    const report = await generateHealthReport();
    
    console.log('\n📋 HEALTH CHECK REPORT');
    console.log('='.repeat(50));
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Overall Health: ${report.summary.overallHealth}`);
    console.log(`Database Connection: ${report.database.connection ? '✅' : '❌'}`);
    console.log(`Authentication: ${report.database.authentication ? '✅' : '❌'}`);
    console.log(`Tables Health: ${report.summary.healthyTables}/${report.summary.totalTables}`);
    console.log(`Relations Health: ${report.summary.healthyRelations}/${report.summary.totalRelations}`);
    
    console.log('\n📊 DETAILED RESULTS:');
    console.log('='.repeat(50));
    
    // Mostra risultati tabelle
    console.log('\n📋 TABLES:');
    Object.entries(report.tables).forEach(([table, health]) => {
      const status = health.exists && health.accessible ? '✅' : '❌';
      console.log(`${status} ${table}: ${health.error || 'OK'}`);
    });
    
    // Mostra risultati relazioni
    console.log('\n🔗 RELATIONS:');
    Object.entries(report.relations).forEach(([relation, health]) => {
      const status = health.valid ? '✅' : '❌';
      console.log(`${status} ${relation}: ${health.error || 'OK'}`);
    });
    
    // Raccomandazioni
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(50));
    
    if (report.summary.overallHealth === 'EXCELLENT') {
      console.log('🎉 Database is in excellent health!');
    } else if (report.summary.overallHealth === 'GOOD') {
      console.log('✅ Database is generally healthy with minor issues.');
    } else if (report.summary.overallHealth === 'POOR') {
      console.log('⚠️ Database has significant issues that need attention.');
    } else {
      console.log('🚨 Database has critical issues requiring immediate attention!');
    }
    
    // Salva report in file
    const fs = require('fs');
    fs.writeFileSync('db-health-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to: db-health-report.json');
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

main().catch(console.error); 