#!/usr/bin/env node

/**
 * Script per configurare l'admin direttamente nel browser
 * Usage: node scripts/setup-admin-browser.js
 */

console.log('🔧 Setup Admin per Browser');
console.log('========================');
console.log('');

console.log('📋 ISTRUZIONI PER ACCEDERE COME ADMIN:');
console.log('');

console.log('1️⃣ Apri il browser e vai a: http://localhost:3000/admin/login');
console.log('');

console.log('2️⃣ Apri la Console del Browser (F12) e inserisci questo codice:');
console.log('');

const adminUser = {
  id: 'admin-test-' + Date.now(),
  email: 'admin@glg.com',
  role: 'admin',
  name: 'Admin GLG'
};

console.log('// Copia e incolla questo codice nella console del browser:');
console.log('');
console.log('localStorage.setItem("admin_user", JSON.stringify(' + JSON.stringify(adminUser) + '));');
console.log('localStorage.setItem("admin_token", "admin-test-token");');
console.log('window.location.href = "/admin";');
console.log('');

console.log('3️⃣ Oppure usa queste credenziali di test:');
console.log('   Email: admin@glg.com');
console.log('   Password: Admin123!');
console.log('');

console.log('4️⃣ Se il login non funziona, usa il metodo localStorage sopra');
console.log('');

console.log('🔗 Link diretti:');
console.log('   - Admin Dashboard: http://localhost:3000/admin');
console.log('   - Admin Clients: http://localhost:3000/admin/clients');
console.log('   - Admin Packages: http://localhost:3000/admin/packages');
console.log('');

console.log('✅ Dopo aver configurato localStorage, potrai accedere al pannello admin!'); 