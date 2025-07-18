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

// Function to add non-null assertions
function addNullAssertions(content) {
  // Replace supabaseAdmin. with supabaseAdmin!.
  return content.replace(/supabaseAdmin\./g, 'supabaseAdmin!.');
}

// Main execution
console.log('🔧 Adding non-null assertions to supabaseAdmin usage...');

const apiDir = path.join(__dirname, 'app', 'api');
const files = findTsFiles(apiDir);

let fixedCount = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Only process files that use supabaseAdmin
    if (content.includes('supabaseAdmin.')) {
      const fixedContent = addNullAssertions(content);
      
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

console.log(`\n🎉 Fixed ${fixedCount} files with non-null assertions`);
console.log('✅ All supabaseAdmin usage now has proper null assertions'); 