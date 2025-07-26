// Test script for all logout buttons
console.log('🧪 Testing all logout buttons...');

// Test 1: Check if logout manager is available
console.log('\n📋 Test 1: Logout Manager Availability');
try {
  const { logoutManager, logoutUser, logoutAdmin, forceLogout } = require('./lib/logout-manager');
  console.log('✅ Logout manager imported successfully');
  console.log('✅ logoutUser function available:', typeof logoutUser === 'function');
  console.log('✅ logoutAdmin function available:', typeof logoutAdmin === 'function');
  console.log('✅ forceLogout function available:', typeof forceLogout === 'function');
} catch (error) {
  console.error('❌ Failed to import logout manager:', error);
}

// Test 2: Check localStorage state
console.log('\n📋 Test 2: LocalStorage State');
const localStorageItems = [
  'user',
  'auth_token',
  'token',
  'session',
  'csrf_token',
  'profile',
  'user_profile',
  'admin_user',
  'admin_token',
  'admin_session'
];

localStorageItems.forEach(item => {
  const value = localStorage.getItem(item);
  if (value) {
    console.log(`⚠️  Found: ${item} = ${value.substring(0, 50)}...`);
  } else {
    console.log(`✅ Not found: ${item}`);
  }
});

// Test 3: Test CSRF token generation
console.log('\n📋 Test 3: CSRF Token Generation');
fetch('/api/csrf', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => {
  console.log('📡 CSRF Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ CSRF token generated:', data.token ? 'Success' : 'Failed');
  console.log('📊 Token:', data.token ? data.token.substring(0, 20) + '...' : 'None');
})
.catch(error => {
  console.error('❌ CSRF token generation failed:', error);
});

// Test 4: Test logout API
console.log('\n📋 Test 4: Logout API');
fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': 'test-token'
  }
})
.then(response => {
  console.log('📡 Logout API Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Logout API response:', data);
})
.catch(error => {
  console.error('❌ Logout API failed:', error);
});

// Test 5: Check all logout buttons in DOM
console.log('\n📋 Test 5: Logout Buttons in DOM');
const logoutButtons = document.querySelectorAll('button');
let logoutButtonCount = 0;

logoutButtons.forEach((button, index) => {
  const text = button.textContent?.toLowerCase() || '';
  const hasLogoutText = text.includes('logout') || text.includes('log out');
  const hasLogoutIcon = button.querySelector('svg') || button.innerHTML.includes('LogOut');
  
  if (hasLogoutText || hasLogoutIcon) {
    logoutButtonCount++;
    console.log(`🔘 Logout button ${logoutButtonCount}:`, {
      text: button.textContent?.trim(),
      hasIcon: !!button.querySelector('svg'),
      disabled: button.disabled,
      onClick: !!button.onclick
    });
  }
});

console.log(`📊 Total logout buttons found: ${logoutButtonCount}`);

// Test 6: Simulate logout button clicks
console.log('\n📋 Test 6: Simulate Logout Button Clicks');
if (logoutButtonCount > 0) {
  console.log('🔄 Simulating logout button clicks...');
  
  logoutButtons.forEach((button, index) => {
    const text = button.textContent?.toLowerCase() || '';
    const hasLogoutText = text.includes('logout') || text.includes('log out');
    const hasLogoutIcon = button.querySelector('svg') || button.innerHTML.includes('LogOut');
    
    if (hasLogoutText || hasLogoutIcon) {
      console.log(`🔄 Testing logout button ${index + 1}...`);
      
      // Store original onclick
      const originalOnClick = button.onclick;
      
      // Add test onclick
      button.onclick = (e) => {
        console.log(`✅ Logout button ${index + 1} clicked!`);
        console.log('📊 Button details:', {
          text: button.textContent?.trim(),
          disabled: button.disabled,
          hasOriginalHandler: !!originalOnClick
        });
        
        // Call original handler if it exists
        if (originalOnClick) {
          originalOnClick.call(button, e);
        }
      };
      
      // Simulate click
      setTimeout(() => {
        button.click();
      }, 1000 + (index * 500));
    }
  });
}

console.log('\n🎯 Logout Button Test Complete!');
console.log('📋 Check the console for detailed results.');
console.log('🔄 If you see any errors, the logout buttons may need fixing.'); 