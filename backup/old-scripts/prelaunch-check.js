const https = require('https');
const http = require('http');
const { exec } = require('child_process');

// URLS TO TEST
const BASE_URL = "https://glgcapitalgroup.com";
const API_ENDPOINTS = [
  "/api/test-register",
  "/api/login",
  "/api/products"
];

// Check favicon
function checkFavicon() {
  console.log("🔍 Checking favicon.ico...");
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}/favicon.ico`, (res) => {
      if (res.statusCode === 200) {
        console.log("✅ Favicon is present.");
        resolve();
      } else {
        console.error(`❌ Favicon missing! Status code: ${res.statusCode}`);
        reject();
      }
    }).on('error', (e) => reject(e));
  });
}

// Check SSL certificate
function checkSSL() {
  console.log("🔐 Checking SSL certificate...");
  return new Promise((resolve, reject) => {
    exec(`echo | openssl s_client -connect ${BASE_URL.replace('https://', '')}:443 -servername ${BASE_URL.replace('https://', '')} 2>/dev/null | openssl x509 -noout -dates`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ SSL check failed: ${stderr}`);
        reject(error);
      } else {
        console.log(`✅ SSL certificate details:\n${stdout}`);
        resolve();
      }
    });
  });
}

// Check API endpoints
function checkAPIs() {
  console.log("🔍 Checking API endpoints...");
  return Promise.all(API_ENDPOINTS.map((endpoint) => {
    return new Promise((resolve, reject) => {
      https.get(`${BASE_URL}${endpoint}`, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ API ${endpoint} responded with ${res.statusCode}`);
          resolve();
        } else {
          console.error(`❌ API ${endpoint} failed with status ${res.statusCode}`);
          reject();
        }
      }).on('error', (e) => reject(e));
    });
  }));
}

// Start full check
(async () => {
  try {
    console.log(`🚀 Starting pre-launch checks for ${BASE_URL}\n`);
    await checkFavicon();
    await checkSSL();
    await checkAPIs();
    console.log("\n🎉 All checks passed. Ready to go live!");
  } catch (error) {
    console.error("\n🚨 Pre-launch check failed. Fix the issues before going live.");
    process.exit(1);
  }
})(); 