const puppeteer = require('puppeteer');

async function testAdminAccess() {
  let browser;
  try {
    console.log('🔐 TESTING ADMIN ACCESS...\n');

    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // 1. Test admin login page
    console.log('📋 STEP 1: Testing admin login page...');
    
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForSelector('input[type="email"]');
    
    console.log('✅ Admin login page loaded');
    
    // 2. Fill login form
    console.log('📋 STEP 2: Filling login form...');
    
    await page.type('input[type="email"]', 'admin@glgcapital.com');
    await page.type('input[type="password"]', 'GLGAdmin2024!');
    
    console.log('✅ Login form filled');
    
    // 3. Submit login
    console.log('📋 STEP 3: Submitting login...');
    
    await page.click('button[type="submit"]');
    
    // 4. Wait for redirect to admin dashboard
    console.log('📋 STEP 4: Waiting for redirect...');
    
    await page.waitForNavigation({ timeout: 10000 });
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
      console.log('✅ Successfully logged in to admin dashboard!');
      
      // 5. Test admin dashboard content
      console.log('📋 STEP 5: Testing admin dashboard content...');
      
      await page.waitForTimeout(2000); // Wait for page to load
      
      // Check if dashboard content is visible
      const dashboardContent = await page.evaluate(() => {
        const content = document.body.innerText;
        return {
          hasStats: content.includes('Total Visitors') || content.includes('Active Clients'),
          hasNavigation: content.includes('Overview') || content.includes('Clients'),
          hasLogout: content.includes('Logout') || content.includes('Log Out')
        };
      });
      
      console.log('📊 Dashboard content check:', dashboardContent);
      
      if (dashboardContent.hasStats || dashboardContent.hasNavigation) {
        console.log('✅ Admin dashboard is working correctly!');
      } else {
        console.log('⚠️ Dashboard content may not be fully loaded');
      }
      
      // 6. Test navigation to other admin pages
      console.log('📋 STEP 6: Testing admin navigation...');
      
      // Test clients page
      try {
        await page.goto('http://localhost:3000/admin/clients');
        await page.waitForTimeout(2000);
        console.log('✅ Admin clients page accessible');
      } catch (error) {
        console.log('❌ Admin clients page error:', error.message);
      }
      
      // Test investments page
      try {
        await page.goto('http://localhost:3000/admin/investments');
        await page.waitForTimeout(2000);
        console.log('✅ Admin investments page accessible');
      } catch (error) {
        console.log('❌ Admin investments page error:', error.message);
      }
      
    } else {
      console.log('❌ Login failed or redirected to wrong page');
      
      // Check for error messages
      const errorText = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .error, .Error');
        return Array.from(errorElements).map(el => el.textContent).join(' ');
      });
      
      if (errorText) {
        console.log('❌ Error message found:', errorText);
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('\n🏁 Admin access test completed!');
  }
}

// Run the test
testAdminAccess(); 