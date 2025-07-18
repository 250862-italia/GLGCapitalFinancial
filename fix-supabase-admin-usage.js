const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix supabaseAdmin usage
function fixSupabaseAdminUsage(content) {
  // Replace supabaseAdmin with getSupabaseAdmin()
  let modifiedContent = content.replace(/supabaseAdmin\./g, 'getSupabaseAdmin().');
  
  // Add import for getSupabaseAdmin if not already present
  if (modifiedContent.includes('getSupabaseAdmin()') && !modifiedContent.includes('getSupabaseAdmin')) {
    modifiedContent = modifiedContent.replace(
      /import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]@\/lib\/supabase['"];?/,
      (match, imports) => {
        if (imports.includes('supabaseAdmin')) {
          return `import { ${imports.replace('supabaseAdmin', 'getSupabaseAdmin')} } from '@/lib/supabase';`;
        } else {
          return `import { ${imports}, getSupabaseAdmin } from '@/lib/supabase';`;
        }
      }
    );
  }
  
  return modifiedContent;
}

// Main execution
console.log('🔧 Replacing supabaseAdmin with getSupabaseAdmin() in API routes...');

const apiDir = path.join(__dirname, 'app', 'api');
const files = findTsFiles(apiDir);

let fixedCount = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Only process files that use supabaseAdmin
    if (content.includes('supabaseAdmin')) {
      const fixedContent = fixSupabaseAdminUsage(content);
      
      if (fixedContent !== content) {
        fs.writeFileSync(file, fixedContent, 'utf8');
        console.log(`✅ Fixed: ${path.relative(__dirname, file)}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with getSupabaseAdmin()`);
console.log('✅ All API routes now use the type-safe getSupabaseAdmin() function'); 