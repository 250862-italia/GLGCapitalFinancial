const fs = require('fs');
const path = require('path');

// Lista dei file da correggere
const filesToFix = [
  'app/api/investments/route.ts',
  'app/api/admin/team/roles/route.ts',
  'app/api/admin/partnerships/types/route.ts',
  'app/api/admin/partnerships/statuses/route.ts',
  'app/api/investments/[id]/route.ts',
  'app/api/admin/shared-data/route.ts',
  'app/api/admin/clients/route.ts',
  'app/api/admin/team/departments/route.ts',
  'app/api/admin/content/tags/route.ts',
  'app/api/admin/content/categories/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/admin/settings/route.ts'
];

function fixSupabaseImports(filePath) {
  try {
    console.log(`🔧 Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern 1: Sostituisci createClient import con supabaseAdmin import
    if (content.includes("import { createClient } from '@supabase/supabase-js';")) {
      content = content.replace(
        "import { createClient } from '@supabase/supabase-js';",
        "import { supabaseAdmin } from '@/lib/supabase';"
      );
      modified = true;
    }
    
    // Pattern 2: Rimuovi le variabili d'ambiente e la creazione del client
    const envPattern = /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL!;\s*const supabaseServiceKey = process\.env\.SUPABASE_SERVICE_ROLE_KEY!;\s*const supabase = createClient\(supabaseUrl, supabaseServiceKey\);/g;
    if (envPattern.test(content)) {
      content = content.replace(envPattern, '');
      modified = true;
    }
    
    // Pattern 3: Sostituisci tutte le occorrenze di 'supabase.' con 'supabaseAdmin.'
    if (content.includes('supabase.')) {
      content = content.replace(/supabase\./g, 'supabaseAdmin.');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No changes needed for ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 GLG Capital Financial - Fix Supabase Imports');
  console.log('===============================================');
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const filePath of filesToFix) {
    if (fs.existsSync(filePath)) {
      if (fixSupabaseImports(filePath)) {
        fixedCount++;
      } else {
        errorCount++;
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`   ✅ Files fixed: ${fixedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Supabase imports fixed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Commit the changes: git add . && git commit -m "🔧 Fix Supabase imports in API routes"');
    console.log('2. Push to GitHub: git push');
    console.log('3. Deploy to Vercel: npx vercel deploy');
  } else {
    console.log('\n⚠️  No files were modified. Check if the patterns match.');
  }
}

main(); 