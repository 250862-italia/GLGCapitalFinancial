// Clear localStorage script for testing
console.log('🧹 Clearing localStorage...');

// Clear all localStorage data
localStorage.clear();

console.log('✅ localStorage cleared successfully!');
console.log('📊 Current localStorage state:', Object.keys(localStorage));

// Test package context initialization
console.log('🔄 Testing package context...');
console.log('📦 Packages in localStorage:', localStorage.getItem('packages'));

// Navigate to registration page
console.log('🚀 Ready to test registration page!');
console.log('📍 Visit: http://localhost:3000/iscriviti');

// Optional: Auto-navigate (uncomment if needed)
// window.location.href = '/iscriviti';
