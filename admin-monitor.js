const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.glgcapitalgroup.com/admin/login');
  await page.type('input[type="email"]', 'admin@glgcapital.com');
  await page.type('input[type="password"]', 'Admin123!@#');
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=Admin Console', { timeout: 10000 });

  // Go to investments page
  await page.goto('https://www.glgcapitalgroup.com/admin/investments');
  await page.waitForSelector('text=Investment Requests', { timeout: 10000 });

  // Monitor for new investments/KYC every 10 seconds
  setInterval(async () => {
    await page.reload();
    const investments = await page.$$eval('.investment-row', rows => rows.length);
    const kycPending = await page.$$eval('.kyc-pending-row', rows => rows.length);
    console.log(`Investments: ${investments}, KYC Pending: ${kycPending}`);
  }, 10000);

  // Keep browser open for manual observation
})(); 