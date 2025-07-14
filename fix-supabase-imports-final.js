const fs = require('fs');
const path = require('path');

const files = [
  'app/api/admin/clients/route.ts',
  'app/api/admin/analytics/dashboard/route.ts',
  'app/api/admin/informational-requests/route.ts',
  'app/api/admin/shared-data/route.ts',
  'app/api/admin/partnerships/statuses/route.ts',
  'app/api/admin/partnerships/types/route.ts',
  'app/api/admin/settings/route.ts',
  'app/api/admin/content/route.ts',
  'app/api/investments/[id]/route.ts',
  'app/api/admin/team/departments/route.ts',
  'app/api/admin/content/tags/route.ts',
  'app/api/admin/content/categories/route.ts',
  'app/api/investments/route.ts',
  'app/api/admin/users/delete/route.ts',
  'app/api/admin/users/update/route.ts',
  'app/api/admin/users/create/route.ts',
  'app/api/admin/reload-schema/route.ts',
  'app/api/admin/users/change-password/route.ts',
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/@\/lib\/supabaseAdmin/g, '@/lib/supabase');
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✔️  Fixed import in: ${file}`);
}
console.log('✅ Tutti gli import di supabaseAdmin sono stati corretti in supabase.'); 