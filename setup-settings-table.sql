-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  general JSONB DEFAULT '{
    "siteName": "GLG Capital Group LLC",
    "siteDescription": "Innovative investment firm committed to providing tailored financial solutions",
    "maintenanceMode": false,
    "timezone": "America/New_York",
    "language": "en"
  }',
  security JSONB DEFAULT '{
    "twoFactorAuth": true,
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "passwordPolicy": "Strong",
    "sslEnabled": true
  }',
  email JSONB DEFAULT '{
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpUser": "noreply@glgcapitalgroupllc.com",
    "smtpSecure": true,
    "fromEmail": "noreply@glgcapitalgroupllc.com",
    "fromName": "GLG Capital Group"
  }',
  backup JSONB DEFAULT '{
    "autoBackup": true,
    "backupFrequency": "daily",
    "retentionDays": 30,
    "lastBackup": null,
    "nextBackup": null
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (id, general, security, email, backup)
VALUES (
  'default-settings',
  '{
    "siteName": "GLG Capital Group LLC",
    "siteDescription": "Innovative investment firm committed to providing tailored financial solutions",
    "maintenanceMode": false,
    "timezone": "America/New_York",
    "language": "en"
  }',
  '{
    "twoFactorAuth": true,
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "passwordPolicy": "Strong",
    "sslEnabled": true
  }',
  '{
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpUser": "noreply@glgcapitalgroupllc.com",
    "smtpSecure": true,
    "fromEmail": "noreply@glgcapitalgroupllc.com",
    "fromName": "GLG Capital Group"
  }',
  '{
    "autoBackup": true,
    "backupFrequency": "daily",
    "retentionDays": 30,
    "lastBackup": null,
    "nextBackup": null
  }'
) ON CONFLICT (id) DO NOTHING;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 