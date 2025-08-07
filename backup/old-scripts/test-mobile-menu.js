require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function testMobileMenu() {
  console.log('📱 Testing Mobile Menu Button');
  console.log('============================');
  
  const results = {
    navigation: { success: 0, total: 0, errors: [] },
    mobileButton: { success: 0, total: 0, errors: [] },
    menuItems: { success: 0, total: 0, errors: [] }
  };

  try {
    // 1. Test Navigation component accessibility
    console.log('\n1️⃣ Testing Navigation Component...');
    results.navigation.total++;
    
    const navigationResponse = await fetch(`${BASE_URL}/`);
    
    if (navigationResponse.ok) {
      results.navigation.success++;
      console.log('✅ Navigation component accessible');
      
      // Check if the page contains the mobile menu button
      const html = await navigationResponse.text();
      
      // Look for the mobile menu button by checking for button with lg:hidden class and SVG icon
      if (html.includes('lg:hidden') && html.includes('lucide-menu') && html.includes('aria-label="Toggle mobile menu"')) {
        results.mobileButton.success++;
        results.mobileButton.total++;
        console.log('✅ Mobile menu button found in HTML');
      } else {
        results.mobileButton.errors.push('Mobile menu button not found in HTML');
        results.mobileButton.total++;
        console.log('❌ Mobile menu button not found in HTML');
        
        // Debug: show what we found
        if (html.includes('lg:hidden')) {
          console.log('  - lg:hidden class found');
        }
        if (html.includes('lucide-menu')) {
          console.log('  - lucide-menu icon found');
        }
        if (html.includes('aria-label="Toggle mobile menu"')) {
          console.log('  - aria-label found');
        }
      }
      
      // Check for menu items
      const menuItems = ['About Us', 'Equity Pledge System', 'Contacts', 'Register', 'Admin Console'];
      let foundItems = 0;
      
      menuItems.forEach(item => {
        if (html.includes(item)) {
          foundItems++;
        }
      });
      
      if (foundItems >= 3) {
        results.menuItems.success++;
        results.menuItems.total++;
        console.log(`✅ Menu items found: ${foundItems}/${menuItems.length}`);
      } else {
        results.menuItems.errors.push(`Only ${foundItems} menu items found`);
        results.menuItems.total++;
        console.log(`❌ Only ${foundItems} menu items found`);
      }
      
    } else {
      results.navigation.errors.push(`Navigation page not accessible: ${navigationResponse.status}`);
      console.log('❌ Navigation page not accessible');
    }

    // 2. Test mobile-specific CSS classes
    console.log('\n2️⃣ Testing Mobile CSS Classes...');
    
    const cssClasses = ['lg:hidden', 'sm:block', 'lg:flex'];
    let foundClasses = 0;
    
    cssClasses.forEach(className => {
      if (html.includes(className)) {
        foundClasses++;
      }
    });
    
    if (foundClasses >= 2) {
      console.log(`✅ Mobile CSS classes found: ${foundClasses}/${cssClasses.length}`);
    } else {
      console.log(`⚠️ Limited mobile CSS classes found: ${foundClasses}/${cssClasses.length}`);
    }

    // 3. Test responsive behavior indicators
    console.log('\n3️⃣ Testing Responsive Behavior...');
    
    const responsiveIndicators = [
      'display: block',
      'display: none',
      'lg:flex',
      'lg:hidden'
    ];
    
    let responsiveScore = 0;
    responsiveIndicators.forEach(indicator => {
      if (html.includes(indicator)) {
        responsiveScore++;
      }
    });
    
    if (responsiveScore >= 3) {
      console.log(`✅ Responsive behavior indicators found: ${responsiveScore}/${responsiveIndicators.length}`);
    } else {
      console.log(`⚠️ Limited responsive behavior indicators: ${responsiveScore}/${responsiveIndicators.length}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  // Report results
  console.log('\n📊 TEST RESULTS');
  console.log('===============');
  console.log(`Navigation: ${results.navigation.success}/${results.navigation.total}`);
  console.log(`Mobile Button: ${results.mobileButton.success}/${results.mobileButton.total}`);
  console.log(`Menu Items: ${results.menuItems.success}/${results.menuItems.total}`);

  if (results.navigation.errors.length > 0) {
    console.log('\n❌ Navigation Errors:', results.navigation.errors);
  }
  if (results.mobileButton.errors.length > 0) {
    console.log('\n❌ Mobile Button Errors:', results.mobileButton.errors);
  }
  if (results.menuItems.errors.length > 0) {
    console.log('\n❌ Menu Items Errors:', results.menuItems.errors);
  }

  const totalTests = results.navigation.total + results.mobileButton.total + results.menuItems.total;
  const totalSuccess = results.navigation.success + results.mobileButton.success + results.menuItems.success;

  console.log(`\n🎯 Overall: ${totalSuccess}/${totalTests} tests passed`);

  if (totalSuccess === totalTests) {
    console.log('🎉 ALL MOBILE MENU TESTS PASSED! Mobile navigation is working correctly!');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }

  return totalSuccess === totalTests;
}

// Run the test
if (require.main === module) {
  testMobileMenu()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testMobileMenu }; 