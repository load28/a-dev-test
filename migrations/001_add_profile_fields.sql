-- Migration: Add profile fields to users table
-- Description: Adds nickname, profile_image_url, and password_updated_at columns

-- Add nickname column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);

-- Add profile_image_url column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);

-- Add password_updated_at column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP;

-- Add index on nickname for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- Add comments for documentation
COMMENT ON COLUMN users.nickname IS 'User display name/nickname';
COMMENT ON COLUMN users.profile_image_url IS 'URL to user profile image';
COMMENT ON COLUMN users.password_updated_at IS 'Timestamp of last password update';
