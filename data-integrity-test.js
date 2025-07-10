const axios = require('axios');

const BASE = 'https://www.glgcapitalgroup.com';
const REGISTER = '/api/test-register';
const KYC = '/api/kyc/submit';
const INVEST = '/api/investments';

async function main() {
  let users = [];
  for (let i = 0; i < 100; i++) {
    const email = `dummy${i}@example.com`;
    // Register user
    const regRes = await axios.post(BASE + REGISTER, {
      first_name: 'Dummy',
      last_name: `User${i}`,
      email,
      phone: '+1234567890',
      password: 'Test1234!'
    });
    const user = regRes.data.user || regRes.data.data;
    users.push(user);
    // Submit KYC
    await axios.post(BASE + KYC, {
      userId: user.id,
      personalInfo: {
        first_name: 'Dummy',
        last_name: `User${i}`,
        date_of_birth: '1990-01-01',
        nationality: 'Testland',
        address: '123 Main St',
        city: 'Testville',
        country: 'Testland',
        phone: '+1234567890',
        email,
        id_document: 'dummy-doc-url'
      },
      financialProfile: {
        employment_status: 'employed',
        annual_income: '50000',
        source_of_funds: 'salary',
        investment_experience: 'beginner',
        risk_tolerance: 'medium',
        investment_goals: ['Wealth Building']
      },
      documents: {
        id_document: 'dummy-doc-url'
      },
      verification: {}
    });
    // Make investment
    await axios.post(BASE + INVEST, {
      client_id: user.id,
      package_id: 'REPLACE_WITH_PACKAGE_ID',
      amount: 1000,
      currency: 'USD',
      start_date: '2024-07-01',
      end_date: '2025-07-01',
      status: 'pending',
      total_returns: 0,
      daily_returns: 0,
      payment_method: 'credit_card',
      notes: 'Automated test investment'
    });
    console.log(`Created and tested user ${email}`);
  }
  // Optionally, add DB/API checks for duplicates/missing records here
}

main().catch(e => console.error(e.response?.data || e.message)); 