-- Create CSRF tokens table for persistent token storage
CREATE TABLE IF NOT EXISTS csrf_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used BOOLEAN DEFAULT FALSE,
    use_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token ON csrf_tokens(token);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_created_at ON csrf_tokens(created_at);

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_csrf_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM csrf_tokens 
    WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically clean up expired tokens
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_csrf_tokens()
RETURNS trigger AS $$
BEGIN
    -- Clean up expired tokens every 100th insert
    IF (SELECT COUNT(*) FROM csrf_tokens) % 100 = 0 THEN
        PERFORM cleanup_expired_csrf_tokens();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS cleanup_csrf_tokens_trigger ON csrf_tokens;
CREATE TRIGGER cleanup_csrf_tokens_trigger
    AFTER INSERT ON csrf_tokens
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_expired_csrf_tokens();

-- Enable RLS (Row Level Security) for the table
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (CSRF tokens are not user-specific)
CREATE POLICY "Allow all operations on csrf_tokens" ON csrf_tokens
    FOR ALL USING (true);

-- Insert a test token for verification
INSERT INTO csrf_tokens (token, created_at, used, use_count) 
VALUES ('test-csrf-token-' || EXTRACT(EPOCH FROM NOW()), NOW(), false, 0)
ON CONFLICT (token) DO NOTHING;

-- Verify the table was created
SELECT 'CSRF tokens table created successfully' as status; 