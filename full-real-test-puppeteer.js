// full-real-test-puppeteer.js
// Automates: 10 user registrations, KYC uploads, admin verification
// Usage: node full-real-test-puppeteer.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.glgcapitalgroup.com';
const ADMIN_EMAIL = 'admin@glgcapital.com';
const ADMIN_PASSWORD = 'Admin123!@#';
const SCREENSHOT_DIR = path.join(__dirname, 'puppeteer-screenshots');

const USERS = [
  { firstName: 'John', lastName: 'Carter', email: 'john.carter001@test.com', password: 'Test1234!' },
  { firstName: 'Emily', lastName: 'Johnson', email: 'emily.johnson002@test.com', password: 'Test1234!' },
  { firstName: 'Michael', lastName: 'Davis', email: 'michael.davis003@test.com', password: 'Test1234!' },
  { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams004@test.com', password: 'Test1234!' },
  { firstName: 'Daniel', lastName: 'Miller', email: 'daniel.miller005@test.com', password: 'Test1234!' },
  { firstName: 'Olivia', lastName: 'Brown', email: 'olivia.brown006@test.com', password: 'Test1234!' },
  { firstName: 'James', lastName: 'Wilson', email: 'james.wilson007@test.com', password: 'Test1234!' },
  { firstName: 'Sophia', lastName: 'Taylor', email: 'sophia.taylor008@test.com', password: 'Test1234!' },
  { firstName: 'William', lastName: 'Anderson', email: 'william.anderson009@test.com', password: 'Test1234!' },
  { firstName: 'Ava', lastName: 'Thomas', email: 'ava.thomas010@test.com', password: 'Test1234!' }
];

const DUMMY_FILES = [
  path.resolve('./dummy/front.jpg'),
  path.resolve('./dummy/back.jpg'),
  path.resolve('./dummy/selfie.jpg')
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR);
  }
}

async function registerAndKYC(page, user, idx) {
  // Registration
  await page.goto(`${BASE_URL}/iscriviti`, { waitUntil: 'networkidle2' });
  await page.type('#firstName', user.firstName);
  await page.type('#lastName', user.lastName);
  await page.type('#email', user.email);
  await page.type('#password', user.password);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/register_${idx + 1}.png` });

  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.type('#email', user.email);
  await page.type('#password', user.password);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/login_${idx + 1}.png` });

  // KYC Upload
  await page.goto(`${BASE_URL}/kyc`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#documentFront');
  await page.waitForSelector('#documentBack');
  await page.waitForSelector('#selfie');
  await page.$('#documentFront').then(input => input.uploadFile(DUMMY_FILES[0]));
  await page.$('#documentBack').then(input => input.uploadFile(DUMMY_FILES[1]));
  await page.$('#selfie').then(input => input.uploadFile(DUMMY_FILES[2]));
  await page.click('#submitKYC');
  await delay(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/kyc_${idx + 1}.png` });
}

async function adminVerify(page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.type('input[type="email"]', ADMIN_EMAIL);
  await page.type('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await delay(2000);
  await page.goto(`${BASE_URL}/admin/clients`);
  await delay(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/admin_clients.png` });
  await page.goto(`${BASE_URL}/admin/investments`);
  await delay(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/admin_investments.png` });
}

(async () => {
  await ensureScreenshotDir();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (let i = 0; i < USERS.length; i++) {
    const user = USERS[i];
    console.log(`🚀 Registering and KYC for ${user.firstName} ${user.lastName}`);
    try {
      await registerAndKYC(page, user, i);
      console.log(`✅ Registered and KYC complete: ${user.email}`);
    } catch (err) {
      console.error(`❌ Error for ${user.email}:`, err);
    }
  }

  // Admin verification
  try {
    await adminVerify(page);
  } catch (err) {
    console.error('Admin verification failed:', err);
  }

  await browser.close();
  console.log('Test complete. Screenshots saved to puppeteer-screenshots/.');
})(); 