// Test script for Return to Dashboard button
console.log('🧪 Testing Return to Dashboard Button');

// Function to check if button exists and is clickable
function testReturnButton() {
  console.log('🔍 Looking for Return to Dashboard button...');
  
  // Look for the button by its text content
  const buttons = Array.from(document.querySelectorAll('button'));
  const returnButton = buttons.find(button => 
    button.textContent.includes('Return to Dashboard') || 
    button.textContent.includes('Dashboard')
  );
  
  if (returnButton) {
    console.log('✅ Return to Dashboard button found!');
    console.log('📍 Button element:', returnButton);
    console.log('🎨 Button styles:', window.getComputedStyle(returnButton));
    
    // Check if button is visible and clickable
    const rect = returnButton.getBoundingClientRect();
    console.log('📐 Button position:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
    });
    
    // Check pointer events
    const pointerEvents = window.getComputedStyle(returnButton).pointerEvents;
    console.log('👆 Pointer events:', pointerEvents);
    
    // Check z-index
    const zIndex = window.getComputedStyle(returnButton).zIndex;
    console.log('📌 Z-index:', zIndex);
    
    // Test click functionality
    console.log('🖱️ Testing click functionality...');
    returnButton.click();
    console.log('✅ Click event triggered!');
    
    return true;
  } else {
    console.log('❌ Return to Dashboard button not found');
    
    // List all buttons on the page
    console.log('🔍 All buttons on page:');
    buttons.forEach((button, index) => {
      console.log(`${index + 1}. "${button.textContent.trim()}" - ${button.className || 'no class'}`);
    });
    
    return false;
  }
}

// Function to check if we're on an admin page
function checkAdminPage() {
  const currentPath = window.location.pathname;
  const isAdminPage = currentPath.startsWith('/admin') && currentPath !== '/admin' && currentPath !== '/admin/login';
  
  console.log('📍 Current path:', currentPath);
  console.log('🔍 Is admin page:', isAdminPage);
  
  if (isAdminPage) {
    console.log('✅ On admin page, testing button...');
    setTimeout(testReturnButton, 1000); // Wait for page to load
  } else {
    console.log('❌ Not on admin page, navigate to /admin/investments first');
  }
}

// Run the test
checkAdminPage();

// Also listen for clicks on any button for debugging
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    console.log('🖱️ Button clicked:', e.target.textContent.trim());
  }
});

console.log('🧪 Test script loaded. Navigate to an admin page to test the button.'); 