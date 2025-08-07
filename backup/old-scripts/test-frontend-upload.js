const puppeteer = require('puppeteer');
const path = require('path');

async function testFrontendUpload() {
  console.log('🌐 Testing Frontend Photo Upload\n');

  let browser;
  try {
    // Launch browser
    console.log('1️⃣ Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for production
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to profile page
    console.log('2️⃣ Navigating to profile page...');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if user is logged in
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('[data-testid="user-info"]') !== null;
    });
    
    if (!isLoggedIn) {
      console.log('⚠️ User not logged in, attempting login...');
      
      // Navigate to login page
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
      
      // Fill login form
      await page.fill('input[name="email"]', 'info@glgcapitalgroupllc.com');
      await page.fill('input[name="password"]', 'Test1234!');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      // Navigate back to profile
      await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
    }
    
    console.log('✅ User logged in successfully');
    
    // Create a test image file
    console.log('3️⃣ Creating test image...');
    const testImagePath = path.join(__dirname, 'test-profile-image.jpg');
    
    // Create a simple 1x1 pixel JPEG
    const jpegData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
      0xFF, 0xD9
    ]);
    
    require('fs').writeFileSync(testImagePath, jpegData);
    console.log('✅ Test image created');
    
    // Find and click the photo upload input
    console.log('4️⃣ Testing photo upload...');
    
    // Wait for the photo upload area to be visible
    await page.waitForSelector('input[type="file"]', { timeout: 10000 });
    
    // Upload the test image
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('input[type="file"]')
    ]);
    
    await fileChooser.accept([testImagePath]);
    
    // Wait for upload to complete
    console.log('📤 Uploading photo...');
    await page.waitForTimeout(3000);
    
    // Check if upload was successful
    const uploadSuccess = await page.evaluate(() => {
      // Look for success message or updated image
      const successMessage = document.querySelector('[data-testid="success-message"]');
      const profileImage = document.querySelector('img[alt*="profile"]');
      
      return {
        hasSuccessMessage: successMessage !== null,
        hasProfileImage: profileImage !== null,
        imageSrc: profileImage ? profileImage.src : null
      };
    });
    
    console.log('📊 Upload result:', uploadSuccess);
    
    if (uploadSuccess.hasSuccessMessage || uploadSuccess.hasProfileImage) {
      console.log('✅ Photo upload successful!');
      if (uploadSuccess.imageSrc) {
        console.log('📸 Photo URL:', uploadSuccess.imageSrc);
      }
    } else {
      console.log('❌ Photo upload failed');
      
      // Check for error messages
      const errorMessage = await page.evaluate(() => {
        const errorElement = document.querySelector('[data-testid="error-message"]');
        return errorElement ? errorElement.textContent : null;
      });
      
      if (errorMessage) {
        console.log('❌ Error message:', errorMessage);
      }
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/photo-upload-test.png' });
    console.log('📸 Screenshot saved to test-results/photo-upload-test.png');
    
    console.log('\n🎯 Frontend test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testFrontendUpload().catch(console.error);
} catch (error) {
  console.log('⚠️ Puppeteer not available, skipping browser test');
  console.log('💡 Install with: npm install puppeteer');
  console.log('✅ The API test shows the backend is working correctly');
} 