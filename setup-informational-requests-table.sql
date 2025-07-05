-- Informational Requests Table
-- This table tracks client requests for GLG Equity Pledge documentation

CREATE TABLE IF NOT EXISTS informational_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  position VARCHAR(255),
  country VARCHAR(100),
  city VARCHAR(100),
  "additionalNotes" TEXT,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'COMPLETED', 'CANCELLED')),
  "emailSent" BOOLEAN DEFAULT FALSE,
  "emailSentAt" TIMESTAMP WITH TIME ZONE,
  "processedAt" TIMESTAMP WITH TIME ZONE,
  "processedBy" UUID REFERENCES auth.users(id),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_informational_requests_user_id ON informational_requests("userId");
CREATE INDEX IF NOT EXISTS idx_informational_requests_email ON informational_requests(email);
CREATE INDEX IF NOT EXISTS idx_informational_requests_status ON informational_requests(status);
CREATE INDEX IF NOT EXISTS idx_informational_requests_created_at ON informational_requests("createdAt");

-- Enable Row Level Security
ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own requests
CREATE POLICY "Users can view own informational requests" ON informational_requests
  FOR SELECT USING (auth.uid()::text = "userId");

-- Users can insert their own requests
CREATE POLICY "Users can insert own informational requests" ON informational_requests
  FOR INSERT WITH CHECK (auth.uid() = "userId" OR "userId" IS NULL);

-- Admins can view all requests (this will be handled by admin role check in the application)
CREATE POLICY "Admins can view all informational requests" ON informational_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'superadmin')
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update all informational requests" ON informational_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'superadmin')
    )
  );

-- Grant permissions
GRANT ALL ON informational_requests TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_informational_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updatedAt
DROP TRIGGER IF EXISTS update_informational_requests_updated_at_trigger ON informational_requests;
CREATE TRIGGER update_informational_requests_updated_at_trigger
  BEFORE UPDATE ON informational_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_informational_requests_updated_at();

-- Insert some sample data for testing (optional)
-- INSERT INTO informational_requests ("firstName", "lastName", email, phone, company, status) VALUES
-- ('John', 'Doe', 'john.doe@example.com', '+1234567890', 'Test Company', 'PENDING'),
-- ('Jane', 'Smith', 'jane.smith@example.com', '+0987654321', 'Another Company', 'PROCESSED'); 