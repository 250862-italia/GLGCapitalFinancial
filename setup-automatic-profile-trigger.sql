-- Automatic Profile Creation Trigger
-- This trigger automatically creates a client profile when a new user registers

-- Function to create client profile automatically
CREATE OR REPLACE FUNCTION create_client_profile_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new client profile for the new user
  INSERT INTO clients (
    "userId",
    email,
    "firstName",
    "lastName",
    phone,
    "dateOfBirth",
    nationality,
    address,
    city,
    "postalCode",
    country,
    "profilePhoto",
    "kycStatus",
    "createdAt",
    "updatedAt"
  ) VALUES (
    NEW.id,
    NEW.email,
    '',
    '',
    '',
    NULL,
    '',
    '',
    '',
    '',
    '',
    NULL,
    'PENDING',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS create_client_profile_after_user_insert ON auth.users;
CREATE TRIGGER create_client_profile_after_user_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_client_profile_trigger();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON kyc_records TO authenticated;

-- Enable RLS (Row Level Security) on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access their own profile
CREATE POLICY "Users can view own profile" ON clients
  FOR SELECT USING (auth.uid()::text = "userId");

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON clients
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Create policy to allow users to insert their own profile (for manual creation)
CREATE POLICY "Users can insert own profile" ON clients
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Enable RLS on kyc_records table
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access their own KYC records
CREATE POLICY "Users can view own KYC records" ON kyc_records
  FOR SELECT USING (
    "clientId" IN (
      SELECT id FROM clients WHERE "userId" = auth.uid()::text
    )
  );

-- Create policy to allow users to insert their own KYC records
CREATE POLICY "Users can insert own KYC records" ON kyc_records
  FOR INSERT WITH CHECK (
    "clientId" IN (
      SELECT id FROM clients WHERE "userId" = auth.uid()::text
    )
  );

-- Create policy to allow users to update their own KYC records
CREATE POLICY "Users can update own KYC records" ON kyc_records
  FOR UPDATE USING (
    "clientId" IN (
      SELECT id FROM clients WHERE "userId" = auth.uid()::text
    )
  );

-- Note: This trigger will only work for new user registrations
-- For existing users without profiles, they will need to be created manually
-- or through the API endpoints we created

-- To manually create profiles for existing users, run:
-- INSERT INTO clients ("userId", email, "firstName", "lastName", phone, "dateOfBirth", nationality, address, city, "postalCode", country, "profilePhoto", "kycStatus", "createdAt", "updatedAt")
-- SELECT id, email, '', '', '', NULL, '', '', '', '', '', NULL, 'PENDING', NOW(), NOW()
-- FROM auth.users
-- WHERE id NOT IN (SELECT "userId" FROM clients); 