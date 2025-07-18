#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 GLG Capital Financial - Environment Setup');
console.log('============================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file already exists');
  console.log('📝 Current configuration:');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        console.log(`   ${key}`);
      }
    }
  });
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Creating .env.local with development defaults...\n');
  
  const defaultEnv = `# Development Environment Configuration
# Supabase Configuration (using local development defaults)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Development Configuration
NODE_ENV=development

# Note: For production, replace the Supabase URLs and keys with your actual project values
# You can get these from your Supabase project dashboard
`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ .env.local created with development defaults');
}

console.log('\n📋 Next Steps:');
console.log('1. For development: The current setup uses Supabase local development');
console.log('2. For production: Update the Supabase URLs and keys in .env.local');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. If you need a local Supabase instance, run "npx supabase start"');

console.log('\n🔗 Useful Links:');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Supabase Local Development: https://supabase.com/docs/guides/cli');
console.log('- Environment Variables Guide: https://nextjs.org/docs/basic-features/environment-variables');

console.log('\n✨ Setup complete!'); 