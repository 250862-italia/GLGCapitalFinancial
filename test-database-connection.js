const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please check your .env.local file has:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...\n');

    try {
        // Test 1: Basic connection
        console.log('1. Testing basic connection...');
        const { data, error } = await supabase.from('analytics').select('count').limit(1);
        
        if (error) {
            console.error('❌ Connection failed:', error.message);
            return false;
        }
        console.log('✅ Connection successful\n');

        // Test 2: Check if tables exist
        console.log('2. Checking if required tables exist...');
        const tables = [
            'analytics', 'content_categories', 'content_tags', 'content_articles',
            'team_departments', 'team_roles', 'team_members',
            'partnership_types', 'partnership_statuses', 'partnerships',
            'settings', 'payments', 'informational_requests'
        ];

        for (const table of tables) {
            try {
                const { error } = await supabase.from(table).select('*').limit(1);
                if (error) {
                    console.log(`❌ Table ${table}: ${error.message}`);
                } else {
                    console.log(`✅ Table ${table}: exists`);
                }
            } catch (err) {
                console.log(`❌ Table ${table}: ${err.message}`);
            }
        }
        console.log('');

        // Test 3: Check if default data exists
        console.log('3. Checking default data...');
        const { data: analyticsData, error: analyticsError } = await supabase
            .from('analytics')
            .select('*')
            .limit(5);

        if (analyticsError) {
            console.log('❌ Analytics data check failed:', analyticsError.message);
        } else {
            console.log(`✅ Analytics table has ${analyticsData.length} records`);
        }

        const { data: settingsData, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .limit(5);

        if (settingsError) {
            console.log('❌ Settings data check failed:', settingsError.message);
        } else {
            console.log(`✅ Settings table has ${settingsData.length} records`);
        }
        console.log('');

        // Test 4: Test storage buckets
        console.log('4. Checking storage buckets...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.log('❌ Storage buckets check failed:', bucketsError.message);
        } else {
            const requiredBuckets = ['kyc-documents', 'profile-photos', 'partnership-documents'];
            for (const bucket of requiredBuckets) {
                const exists = buckets.some(b => b.name === bucket);
                if (exists) {
                    console.log(`✅ Bucket ${bucket}: exists`);
                } else {
                    console.log(`❌ Bucket ${bucket}: missing`);
                }
            }
        }
        console.log('');

        console.log('🎉 Database connection test completed!');
        return true;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

async function createTestUser() {
    console.log('👤 Creating test user...\n');

    try {
        // Create a test user
        const { data: user, error: userError } = await supabase.auth.admin.createUser({
            email: 'test@glgcapitalgroup.com',
            password: 'TestPassword123!',
            email_confirm: true,
            user_metadata: {
                role: 'client',
                first_name: 'Test',
                last_name: 'User'
            }
        });

        if (userError) {
            console.error('❌ Failed to create test user:', userError.message);
            return null;
        }

        console.log('✅ Test user created:', user.user.email);

        // Create client profile
        const { error: profileError } = await supabase
            .from('clients')
            .insert({
                user_id: user.user.id,
                first_name: 'Test',
                last_name: 'User',
                email: 'test@glgcapitalgroup.com',
                phone: '+1234567890',
                date_of_birth: '1990-01-01',
                nationality: 'Italian',
                address: 'Test Address',
                city: 'Test City',
                postal_code: '12345',
                country: 'Italy',
                tax_id: 'TEST123456789',
                employment_status: 'employed',
                annual_income: 50000,
                investment_experience: 'beginner',
                risk_tolerance: 'moderate',
                investment_goals: 'growth',
                source_of_funds: 'salary',
                status: 'active'
            });

        if (profileError) {
            console.log('⚠️  Client profile creation failed:', profileError.message);
        } else {
            console.log('✅ Client profile created');
        }

        return user.user;

    } catch (error) {
        console.error('❌ Test user creation failed:', error.message);
        return null;
    }
}

async function testEndToEndFlow() {
    console.log('🔄 Testing end-to-end flow...\n');

    try {
        // Test 1: Login
        console.log('1. Testing login...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@glgcapitalgroup.com',
            password: 'TestPassword123!'
        });

        if (authError) {
            console.log('❌ Login failed:', authError.message);
            return false;
        }
        console.log('✅ Login successful');

        // Test 2: Fetch user profile
        console.log('2. Testing profile fetch...');
        const { data: profile, error: profileError } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        if (profileError) {
            console.log('❌ Profile fetch failed:', profileError.message);
        } else {
            console.log('✅ Profile fetch successful');
        }

        // Test 3: Create informational request
        console.log('3. Testing informational request...');
        const { error: requestError } = await supabase
            .from('informational_requests')
            .insert({
                user_id: authData.user.id,
                name: 'Test User',
                email: 'test@glgcapitalgroup.com',
                phone: '+1234567890',
                message: 'This is a test request for documentation.',
                status: 'pending'
            });

        if (requestError) {
            console.log('❌ Informational request failed:', requestError.message);
        } else {
            console.log('✅ Informational request created');
        }

        // Test 4: Create payment record
        console.log('4. Testing payment creation...');
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: authData.user.id,
                amount: 1000.00,
                currency: 'EUR',
                payment_method: 'bank_transfer',
                status: 'pending',
                description: 'Test investment payment'
            });

        if (paymentError) {
            console.log('❌ Payment creation failed:', paymentError.message);
        } else {
            console.log('✅ Payment record created');
        }

        console.log('\n🎉 End-to-end flow test completed!');
        return true;

    } catch (error) {
        console.error('❌ End-to-end test failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting GLG Dashboard Database Tests\n');
    console.log('=====================================\n');

    // Test 1: Database connection
    const connectionOk = await testDatabaseConnection();
    if (!connectionOk) {
        console.log('\n❌ Database connection failed. Please check your setup.');
        process.exit(1);
    }

    // Test 2: Create test user
    const testUser = await createTestUser();
    if (!testUser) {
        console.log('\n⚠️  Test user creation failed, but continuing with other tests.');
    }

    // Test 3: End-to-end flow
    if (testUser) {
        await testEndToEndFlow();
    }

    console.log('\n=====================================');
    console.log('✅ All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Check the test results above');
    console.log('2. If any tests failed, run the setup-complete-database.sql script in Supabase');
    console.log('3. Test the application manually in the browser');
    console.log('4. Contact support if issues persist');
}

main().catch(console.error); 