// Test script to verify admin header with return to dashboard button
console.log('🧪 Testing Admin Header with Return to Dashboard Button');

// Function to check if we're on an admin page
function checkAdminPage() {
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath.startsWith('/admin') && currentPath !== '/admin' && currentPath !== '/admin/login';
  
  console.log('📍 Current path:', currentPath);
  console.log('🔍 Is admin page:', isAdminPage);
  
  if (isAdminPage) {
    // Check if header exists
    const header = document.querySelector('div[style*="background: #1a2238"]');
    if (header) {
      console.log('✅ Admin header found');
      
      // Check if return button exists
      const returnButton = header.querySelector('button');
      if (returnButton) {
        console.log('✅ Return to Dashboard button found');
        console.log('📝 Button text:', returnButton.textContent);
        
        // Test button click
        console.log('🖱️ Testing button click...');
        returnButton.click();
        
        // Check if navigation worked
        setTimeout(() => {
          const newPath = window.location.pathname;
          console.log('📍 New path after click:', newPath);
          if (newPath === '/admin') {
            console.log('✅ Navigation to dashboard successful!');
          } else {
            console.log('❌ Navigation failed');
          }
        }, 1000);
        
      } else {
        console.log('❌ Return to Dashboard button not found');
      }
    } else {
      console.log('❌ Admin header not found');
    }
  } else {
    console.log('ℹ️ Not on an admin page, header should not be visible');
  }
}

// Run the test
checkAdminPage();

console.log('�� Test completed!'); 