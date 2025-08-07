-- Create informational_requests table
CREATE TABLE IF NOT EXISTS informational_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    additional_notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_informational_requests_user_id ON informational_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_informational_requests_email ON informational_requests(email);
CREATE INDEX IF NOT EXISTS idx_informational_requests_status ON informational_requests(status);
CREATE INDEX IF NOT EXISTS idx_informational_requests_created_at ON informational_requests(created_at);

-- Enable RLS
ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own informational requests" ON informational_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own informational requests" ON informational_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all informational requests" ON informational_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_informational_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_informational_requests_updated_at
    BEFORE UPDATE ON informational_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_informational_requests_updated_at(); 