const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = 'https://www.glgcapitalgroup.com';
const REGISTER_URL = BASE_URL + '/iscriviti';
const LOGIN_URL = BASE_URL + '/login';
const KYC_URL = BASE_URL + '/kyc';

const users = [
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
  path.join(__dirname, 'public', 'next.svg'),
  path.join(__dirname, 'public', 'vercel.svg'),
  path.join(__dirname, 'public', 'globe.svg')
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function registerAndKYC(page, user) {
  // Registration
  await page.goto(REGISTER_URL, { waitUntil: 'networkidle2' });
  await page.type('#nome', user.firstName);
  await page.type('#cognome', user.lastName);
  await page.type('#email', user.email);
  await page.type('#password', user.password);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  // Login
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
  await page.type('#email', user.email);
  await page.type('#password', user.password);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  // KYC Upload
  await page.goto(KYC_URL, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#documentFront');
  await page.waitForSelector('#documentBack');
  await page.waitForSelector('#selfie');
  await page.$('#documentFront').then(input => input.uploadFile(DUMMY_FILES[0]));
  await page.$('#documentBack').then(input => input.uploadFile(DUMMY_FILES[1]));
  await page.$('#selfie').then(input => input.uploadFile(DUMMY_FILES[2]));
  await page.click('#submitKYC');
  await delay(2000);
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  for (const user of users) {
    console.log(`🚀 Registering and KYC for ${user.firstName} ${user.lastName}`);
    try {
      await registerAndKYC(page, user);
      console.log(`✅ Registered and KYC complete: ${user.email}`);
    } catch (err) {
      console.error(`❌ Error for ${user.email}:`, err);
    }
  }
  await browser.close();
})(); 