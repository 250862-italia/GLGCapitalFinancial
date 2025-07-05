const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupKYCStorage() {
  console.log('🚀 Setting up KYC Document Storage...\n');

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

    // Create kyc_records table if it doesn't exist
    console.log('\n📝 Creating kyc_records table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS kyc_records (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          "clientId" UUID REFERENCES clients(id) ON DELETE CASCADE,
          "documentType" VARCHAR(50) NOT NULL CHECK ("documentType" IN ('PERSONAL_INFO', 'PROOF_OF_ADDRESS', 'BANK_STATEMENT', 'ID_DOCUMENT')),
          "documentNumber" VARCHAR(255),
          "documentImageUrl" TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          notes TEXT,
          "verifiedAt" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.log('⚠️  kyc_records table:', tableError.message);
    } else {
      console.log('✅ kyc_records table created');
    }

    // Create index for better performance
    console.log('\n📊 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_kyc_records_client_id ON kyc_records("clientId");
        CREATE INDEX IF NOT EXISTS idx_kyc_records_document_type ON kyc_records("documentType");
        CREATE INDEX IF NOT EXISTS idx_kyc_records_status ON kyc_records(status);
        CREATE INDEX IF NOT EXISTS idx_kyc_records_created_at ON kyc_records("createdAt");
      `
    });

    if (indexError) {
      console.log('⚠️  Indexes:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }

    console.log('\n🎉 KYC Storage setup completed successfully!');
    console.log('');
    console.log('📋 Storage details:');
    console.log('   Bucket: kyc-documents');
    console.log('   Public: true');
    console.log('   File size limit: 10MB');
    console.log('   Allowed types: images, PDFs');
    console.log('');
    console.log('📋 Database details:');
    console.log('   Table: kyc_records');
    console.log('   Document types: PERSONAL_INFO, PROOF_OF_ADDRESS, BANK_STATEMENT, ID_DOCUMENT');
    console.log('   Status: pending, approved, rejected');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupKYCStorage(); 