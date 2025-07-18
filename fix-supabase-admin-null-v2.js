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

// Function to add null check to a function
function addNullCheckToFunction(content, functionMatch) {
  const nullCheck = `
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 503 }
      );
    }
`;
  
  const insertIndex = functionMatch.index + functionMatch[0].length;
  return content.slice(0, insertIndex) + nullCheck + content.slice(insertIndex);
}

// Function to fix supabaseAdmin usage
function fixSupabaseAdminUsage(content) {
  let modifiedContent = content;
  
  // Find all export async function declarations that use supabaseAdmin
  const functionRegex = /export async function\s+\w+\s*\([^)]*\)\s*\{/g;
  let functionMatch;
  let offset = 0;
  
  while ((functionMatch = functionRegex.exec(content)) !== null) {
    // Get the function body
    const functionStart = functionMatch.index + functionMatch[0].length;
    const functionBody = content.slice(functionStart);
    
    // Check if this function uses supabaseAdmin
    if (functionBody.includes('supabaseAdmin')) {
      // Check if null check already exists
      const nullCheckPattern = /if\s*\(\s*!supabaseAdmin\s*\)/;
      if (!nullCheckPattern.test(functionBody)) {
        // Add null check
        const adjustedIndex = functionMatch.index + offset;
        const adjustedMatch = {
          index: adjustedIndex,
          length: functionMatch[0].length,
          [0]: functionMatch[0]
        };
        
        modifiedContent = addNullCheckToFunction(modifiedContent, adjustedMatch);
        offset += 4; // Account for the added lines
      }
    }
  }
  
  return modifiedContent;
}

// Main execution
console.log('🔧 Fixing supabaseAdmin null checks in API routes (v2)...');

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