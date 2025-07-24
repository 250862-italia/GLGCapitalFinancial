// Script per creare il bucket di storage per le foto profilo
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.log('Assicurati che .env.local contenga:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createStorageBucket() {
  console.log('🔧 Creazione bucket di storage...');
  
  try {
    // Crea il bucket profile-photos
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('profile-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket profile-photos già esistente');
      } else {
        console.error('❌ Errore creazione bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Bucket profile-photos creato con successo');
    }

    // Crea il bucket kyc-documents
    const { data: kycBucketData, error: kycBucketError } = await supabase.storage
      .createBucket('kyc-documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        fileSizeLimit: 10485760 // 10MB
      });

    if (kycBucketError) {
      if (kycBucketError.message.includes('already exists')) {
        console.log('✅ Bucket kyc-documents già esistente');
      } else {
        console.error('❌ Errore creazione bucket KYC:', kycBucketError);
        return;
      }
    } else {
      console.log('✅ Bucket kyc-documents creato con successo');
    }

    console.log('🎉 Tutti i bucket di storage sono pronti!');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

createStorageBucket(); 