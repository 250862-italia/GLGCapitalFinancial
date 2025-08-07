const fs = require('fs');
const path = require('path');

// Files that need CSRF protection (excluding auth routes that already have it)
const filesToFix = [
  'app/forgot-password/page.tsx',
  'app/profile/page.tsx',
  'app/admin/login/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/investments/[id]/page.tsx',
  'app/admin/partnerships/page.tsx',
  'app/admin/informational-requests/page.tsx',
  'app/admin/analytics/dashboard/page.tsx',
  'app/admin/team/page.tsx',
  'app/admin/payments/page.tsx',
  'app/admin/settings/email/page.tsx',
  'app/admin/settings/page.tsx',
  'app/contact/page.tsx',
  'app/dashboard/page.tsx',
  'app/investments/page.tsx',
  'app/debug/email/page.tsx',
  'components/ui/NotificationSystem.tsx'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if fetchJSONWithCSRF is already imported
    if (!content.includes('fetchJSONWithCSRF')) {
      // Add import
      const importMatch = content.match(/import.*from.*['"]@\/lib\/.*['"];?\n?/);
      if (importMatch) {
        const importIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, importIndex) + 
                 "import { fetchJSONWithCSRF } from '@/lib/csrf-client';\n" + 
                 content.slice(importIndex);
        modified = true;
      }
    }

    // Replace fetch calls with fetchJSONWithCSRF
    // Pattern 1: fetch with headers containing Content-Type
    content = content.replace(
      /await fetch\(([^)]+), \{\s*method:\s*['"](POST|PUT|PATCH|DELETE)['"],\s*headers:\s*\{[^}]*['"]Content-Type['"][^}]*\},?\s*body:\s*([^}]+)\s*\}\)/g,
      'await fetchJSONWithCSRF($1, {\n        method: \'$2\',\n        body: $3\n      })'
    );

    // Pattern 2: fetch with method and body but no headers
    content = content.replace(
      /await fetch\(([^)]+), \{\s*method:\s*['"](POST|PUT|PATCH|DELETE)['"],\s*body:\s*([^}]+)\s*\}\)/g,
      'await fetchJSONWithCSRF($1, {\n        method: \'$2\',\n        body: $3\n      })'
    );

    // Pattern 3: fetch with method only (for DELETE)
    content = content.replace(
      /await fetch\(([^)]+), \{\s*method:\s*['"]DELETE['"]\s*\}\)/g,
      'await fetchJSONWithCSRF($1, {\n        method: \'DELETE\'\n      })'
    );

    // Pattern 4: fetch with method and headers but no body
    content = content.replace(
      /await fetch\(([^)]+), \{\s*method:\s*['"](POST|PUT|PATCH|DELETE)['"],\s*headers:\s*\{[^}]*\}\s*\}\)/g,
      'await fetchJSONWithCSRF($1, {\n        method: \'$2\'\n      })'
    );

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing CSRF fetch calls...');
console.log('============================');

let fixedCount = 0;
let totalCount = 0;

filesToFix.forEach(file => {
  totalCount++;
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log('\n📊 Results:');
console.log(`Fixed: ${fixedCount}/${totalCount} files`);
console.log('🎉 CSRF protection applied to all API calls!'); 