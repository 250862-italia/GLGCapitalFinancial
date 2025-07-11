-- Create KYC records table if it doesn't exist
CREATE TABLE IF NOT EXISTS kyc_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(255),
    document_image_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review')),
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kyc_records_client_id ON kyc_records(client_id);
CREATE INDEX IF NOT EXISTS idx_kyc_records_document_type ON kyc_records(document_type);
CREATE INDEX IF NOT EXISTS idx_kyc_records_status ON kyc_records(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all KYC records
CREATE POLICY IF NOT EXISTS "Admins can view all KYC records" ON kyc_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = kyc_records.client_id
            AND c.user_id IN (
                SELECT user_id FROM admin_users
            )
        )
    );

-- Policy for users to see only their own KYC records
CREATE POLICY IF NOT EXISTS "Users can view their own KYC records" ON kyc_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = kyc_records.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Policy for users to insert their own KYC records
CREATE POLICY IF NOT EXISTS "Users can insert their own KYC records" ON kyc_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = kyc_records.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Policy for users to update their own KYC records
CREATE POLICY IF NOT EXISTS "Users can update their own KYC records" ON kyc_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clients c
            WHERE c.id = kyc_records.client_id
            AND c.user_id = auth.uid()
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kyc_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_kyc_records_updated_at
    BEFORE UPDATE ON kyc_records
    FOR EACH ROW
    EXECUTE FUNCTION update_kyc_records_updated_at(); 