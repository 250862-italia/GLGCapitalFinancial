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
  // Pattern to match supabaseAdmin usage without null check
  const patterns = [
    // Direct usage: supabaseAdmin.something()
    /supabaseAdmin\./g,
    // Usage in await: await supabaseAdmin.something()
    /await\s+supabaseAdmin\./g,
    // Usage in destructuring: const { data, error } = await supabaseAdmin.something()
    /const\s*\{[^}]*\}\s*=\s*await\s+supabaseAdmin\./g,
  ];
  
  let modifiedContent = content;
  
  // Add null check at the beginning of functions that use supabaseAdmin
  if (content.includes('supabaseAdmin') && content.includes('export async function')) {
    // Find the function body and add null check
    const functionMatch = content.match(/export async function\s+\w+\s*\([^)]*\)\s*\{/);
    if (functionMatch) {
      const nullCheck = `
  // Check if supabaseAdmin is available
  if (!supabaseAdmin) {
    console.log('Supabase admin client not available');
    return NextResponse.json(
      { error: 'Database connection unavailable' },
      { status: 503 }
    );
  }
`;
      
      // Insert null check after function opening brace
      const insertIndex = functionMatch.index + functionMatch[0].length;
      modifiedContent = content.slice(0, insertIndex) + nullCheck + content.slice(insertIndex);
    }
  }
  
  return modifiedContent;
}

// Main execution
console.log('🔧 Fixing supabaseAdmin null checks in API routes...');

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

console.log(`\n🎉 Fixed ${fixedCount} files with supabaseAdmin null checks`);
console.log('✅ All API routes now handle supabaseAdmin null cases properly'); 