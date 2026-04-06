-- Add TOTP fields to users table for Google Authenticator support
ALTER TABLE users
ADD COLUMN totp_secret VARCHAR(255),
ADD COLUMN totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN totp_setup_pending BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for TOTP lookups
CREATE INDEX idx_users_totp_enabled ON users(totp_enabled);

