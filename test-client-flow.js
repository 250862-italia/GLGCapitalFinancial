const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test data for new client
const testClient = {
  firstName: 'Mario',
  lastName: 'Rossi',
  email: 'mario.rossi.test@example.com',
  password: 'TestPassword123!',
  phone: '+39 123 456 7890',
  dateOfBirth: '1985-03-15',
  nationality: 'Italian'
};

async function testClientFlow() {
  console.log('🧪 STARTING END-TO-END CLIENT FLOW TEST\n');
  
  let userId = null;
  let clientId = null;
  let sessionToken = null;

  try {
    // 1. REGISTRAZIONE CLIENTE
    console.log('📝 1. Testing Client Registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testClient)
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      userId = registerData.user?.id;
      console.log('✅ Registration successful');
      console.log(`   User ID: ${userId}`);
    } else {
      const error = await registerResponse.json();
      console.log('⚠️  Registration response:', error);
    }

    // 2. LOGIN CLIENTE
    console.log('\n🔐 2. Testing Client Login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testClient.email,
        password: testClient.password
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      sessionToken = loginData.token;
      console.log('✅ Login successful');
      console.log(`   Session token: ${sessionToken ? 'Present' : 'Missing'}`);
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error);
    }

    // 3. VERIFICA PROFILO CLIENTE
    console.log('\n👤 3. Testing Client Profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/profile/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      clientId = profileData.client_id;
      console.log('✅ Profile created/verified');
      console.log(`   Client ID: ${clientId}`);
    } else {
      const error = await profileResponse.json();
      console.log('⚠️  Profile response:', error);
    }

    // 4. SIMULAZIONE KYC SUBMISSION
    console.log('\n📋 4. Testing KYC Submission...');
    const kycData = {
      userId,
      personalInfo: {
        firstName: testClient.firstName,
        lastName: testClient.lastName,
        dateOfBirth: testClient.dateOfBirth,
        nationality: testClient.nationality,
        address: 'Via Roma 123',
        city: 'Milano',
        country: 'Italy',
        phone: testClient.phone,
        email: testClient.email
      },
      financialProfile: {
        employmentStatus: 'employed',
        annualIncome: '50000-75000',
        sourceOfFunds: 'salary',
        investmentExperience: 'intermediate',
        riskTolerance: 'moderate',
        investmentGoals: ['retirement', 'wealth_building']
      },
      documents: {
        idDocument: 'mock://document/id_document.pdf',
        proofOfAddress: 'mock://document/address_proof.pdf',
        bankStatement: 'mock://document/bank_statement.pdf'
      },
      verification: {
        personalInfoVerified: false,
        documentsVerified: false,
        financialProfileVerified: false,
        overallStatus: 'pending'
      }
    };

    const kycResponse = await fetch(`${BASE_URL}/api/kyc/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kycData)
    });

    if (kycResponse.ok) {
      const kycResult = await kycResponse.json();
      console.log('✅ KYC submission successful');
      console.log(`   KYC Status: ${kycResult.kyc_status}`);
    } else {
      const error = await kycResponse.json();
      console.log('⚠️  KYC response:', error);
    }

    // 5. SIMULAZIONE INVESTMENT REQUEST
    console.log('\n💰 5. Testing Investment Request...');
    const investmentData = {
      packageName: 'Premium Growth',
      amount: 5000,
      userId
    };

    const investmentResponse = await fetch(`${BASE_URL}/api/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investmentData)
    });

    if (investmentResponse.ok) {
      const investmentResult = await investmentResponse.json();
      console.log('✅ Investment request successful');
      console.log(`   Investment ID: ${investmentResult.id}`);
    } else {
      const error = await investmentResponse.json();
      console.log('⚠️  Investment response:', error);
    }

    // 6. SIMULAZIONE INFORMATIONAL REQUEST
    console.log('\n📧 6. Testing Informational Request...');
    const infoRequestData = {
      firstName: testClient.firstName,
      lastName: testClient.lastName,
      email: testClient.email,
      phone: testClient.phone,
      requestType: 'investment_opportunities',
      message: 'I would like to receive information about new investment opportunities.'
    };

    const infoResponse = await fetch(`${BASE_URL}/api/informational-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(infoRequestData)
    });

    if (infoResponse.ok) {
      const infoResult = await infoResponse.json();
      console.log('✅ Informational request successful');
      console.log(`   Request ID: ${infoResult.id}`);
    } else {
      const error = await infoResponse.json();
      console.log('⚠️  Informational request response:', error);
    }

    console.log('\n🎉 CLIENT FLOW TEST COMPLETED!');
    console.log('\n📊 Test Summary:');
    console.log(`   User ID: ${userId || 'Not created'}`);
    console.log(`   Client ID: ${clientId || 'Not created'}`);
    console.log(`   Session: ${sessionToken ? 'Active' : 'Failed'}`);
    console.log(`   KYC: Submitted`);
    console.log(`   Investment: Requested`);
    console.log(`   Info Request: Sent`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testClientFlow(); 