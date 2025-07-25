const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, 'app'); // Cambia se usi src/ invece di app/

function scanDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      const usesLink = /<Link\b/.test(content);
      const importsLink = /import\s+Link\s+from\s+['"]next\/link['"]/.test(content);

      if (usesLink && !importsLink) {
        console.log(`❌ Manca import <Link> in: ${fullPath}`);

        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('<Link')) {
            console.log(`  👉 Riga ${index + 1}: ${line.trim()}`);
          }
        });

        console.log('');
      }
    }
  }
}

console.log('🔍 Scansione dei file per <Link> senza import...');
scanDir(ROOT_DIR);
console.log('✅ Scansione completata.'); 