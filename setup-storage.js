const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://dobjulfwktzltpvqtxbql.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...');

  try {
    // Create kyc-documents bucket
    console.log('📁 Creating kyc-documents bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('kyc-documents', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/*', 'application/pdf']
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ kyc-documents bucket already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ kyc-documents bucket created successfully');
    }

    console.log('🎉 Storage setup completed successfully!');
    console.log('');
    console.log('📋 Bucket details:');
    console.log('   Name: kyc-documents');
    console.log('   Public: true');
    console.log('   File size limit: 10MB');
    console.log('   Allowed types: images, PDFs');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupStorage(); 