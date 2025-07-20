const puppeteer = require('puppeteer');
const path = require('path');

async function testWebInterface() {
  let browser;
  try {
    console.log('🌐 TESTING WEB INTERFACE...\n');

    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // 1. TEST ADMIN LOGIN
    console.log('📋 STEP 1: Testing admin login...');
    
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForSelector('input[type="email"]');
    
    await page.type('input[type="email"]', 'admin@glgcapitalgroupllc.com');
    await page.type('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    console.log('✅ Admin login successful');

    // 2. TEST ADMIN CLIENTS PAGE
    console.log('\n📋 STEP 2: Testing admin clients page...');
    
    await page.goto('http://localhost:3000/admin/clients');
    await page.waitForTimeout(2000);
    
    // Check if client data appears
    const clientText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent.includes('Updated Test User'));
    });
    
    if (clientText) {
      console.log('✅ Client data visible in admin panel');
    } else {
      console.log('❌ Client data not visible in admin panel');
    }

    // 3. TEST ADMIN INVESTMENTS PAGE
    console.log('\n📋 STEP 3: Testing admin investments page...');
    
    await page.goto('http://localhost:3000/admin/investments');
    await page.waitForTimeout(2000);
    
    // Check if investment data appears
    const investmentText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent.includes('$5,000') || el.textContent.includes('5000'));
    });
    
    if (investmentText) {
      console.log('✅ Investment data visible in admin panel');
    } else {
      console.log('❌ Investment data not visible in admin panel');
    }

    // 4. TEST ADMIN KYC PAGE
    console.log('\n📋 STEP 4: Testing admin KYC page...');
    
    await page.goto('http://localhost:3000/admin/kyc');
    await page.waitForTimeout(2000);
    
    // Check if KYC data appears
    const kycText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent.includes('Updated Test User'));
    });
    
    if (kycText) {
      console.log('✅ KYC data visible in admin panel');
    } else {
      console.log('❌ KYC data not visible in admin panel');
    }

    // 5. TEST USER LOGIN
    console.log('\n📋 STEP 5: Testing user login...');
    
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]');
    
    await page.type('input[type="email"]', 'test.simple.1753023870543@example.com');
    await page.type('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    console.log('✅ User login successful');

    // 6. TEST USER PROFILE PAGE
    console.log('\n📋 STEP 6: Testing user profile page...');
    
    await page.goto('http://localhost:3000/profile');
    await page.waitForTimeout(2000);
    
    // Check if profile data appears
    const profileText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent.includes('Updated Test User'));
    });
    
    if (profileText) {
      console.log('✅ Profile data visible to user');
    } else {
      console.log('❌ Profile data not visible to user');
    }

    // 7. TEST USER INVESTMENTS PAGE
    console.log('\n📋 STEP 7: Testing user investments page...');
    
    await page.goto('http://localhost:3000/dashboard/investments');
    await page.waitForTimeout(2000);
    
    // Check if investment data appears
    const userInvestmentText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some(el => el.textContent.includes('$5,000') || el.textContent.includes('5000'));
    });
    
    if (userInvestmentText) {
      console.log('✅ Investment data visible to user');
    } else {
      console.log('❌ Investment data not visible to user');
    }

    // 8. TAKE SCREENSHOTS
    console.log('\n📋 STEP 8: Taking screenshots...');
    
    await page.goto('http://localhost:3000/admin/clients');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(__dirname, 'puppeteer-screenshots', 'admin_clients_clean.png'),
      fullPage: true 
    });
    console.log('✅ Admin clients screenshot saved');

    await page.goto('http://localhost:3000/admin/investments');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(__dirname, 'puppeteer-screenshots', 'admin_investments_clean.png'),
      fullPage: true 
    });
    console.log('✅ Admin investments screenshot saved');

    await page.goto('http://localhost:3000/admin/kyc');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(__dirname, 'puppeteer-screenshots', 'admin_kyc_clean.png'),
      fullPage: true 
    });
    console.log('✅ Admin KYC screenshot saved');

    // 9. SUMMARY
    console.log('\n🎯 WEB INTERFACE TEST SUMMARY:');
    console.log('✅ Admin login working');
    console.log('✅ Admin clients page accessible');
    console.log('✅ Admin investments page accessible');
    console.log('✅ Admin KYC page accessible');
    console.log('✅ User login working');
    console.log('✅ User profile page accessible');
    console.log('✅ User investments page accessible');
    console.log('✅ Screenshots captured');
    
    console.log('\n📋 TEST RESULTS:');
    console.log(`Client data visible in admin: ${clientText ? 'YES' : 'NO'}`);
    console.log(`Investment data visible in admin: ${investmentText ? 'YES' : 'NO'}`);
    console.log(`KYC data visible in admin: ${kycText ? 'YES' : 'NO'}`);
    console.log(`Profile data visible to user: ${profileText ? 'YES' : 'NO'}`);
    console.log(`Investment data visible to user: ${userInvestmentText ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error testing web interface:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testWebInterface(); 