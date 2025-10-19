-- ============================================================================
-- Authentication & Authorization Schema Migration
-- Version: 001
-- Description: Core tables for user authentication, roles, permissions,
--              sessions, refresh tokens, and audit logging
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ROLES TABLE
-- ============================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource, action)
);

-- ============================================================================
-- ROLE_PERMISSIONS TABLE (Many-to-Many Relationship)
-- ============================================================================
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,

    -- Password is stored as bcrypt hash (handled by application layer)
    password_hash VARCHAR(255) NOT NULL,

    -- Encrypted sensitive data (using pgcrypto)
    phone_number BYTEA, -- Encrypted phone number

    -- User status and verification
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,

    -- Security fields
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,

    -- Verification
    email_verified_at TIMESTAMP WITH TIME ZONE,
    verification_token VARCHAR(255),
    verification_token_expires_at TIMESTAMP WITH TIME ZONE,

    -- Password reset
    reset_password_token VARCHAR(255),
    reset_password_token_expires_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

-- ============================================================================
-- USER_ROLES TABLE (Many-to-Many Relationship)
-- ============================================================================
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session identification
    session_token VARCHAR(255) NOT NULL UNIQUE,

    -- Session metadata
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,

    -- Location data (optional)
    country VARCHAR(2),
    city VARCHAR(100),

    -- Session lifecycle
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason VARCHAR(255)
);

-- ============================================================================
-- REFRESH_TOKENS TABLE
-- ============================================================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,

    -- Token data
    token_hash VARCHAR(255) NOT NULL UNIQUE, -- Hashed token

    -- Token lifecycle
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason VARCHAR(255),

    -- Security tracking
    replaced_by UUID REFERENCES refresh_tokens(id),
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- AUDIT_LOGS TABLE
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Actor information
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_type VARCHAR(50), -- 'user', 'system', 'admin'

    -- Action details
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'password_change', 'role_assigned', etc.
    resource_type VARCHAR(100), -- 'user', 'role', 'permission', etc.
    resource_id UUID,

    -- Event metadata
    status VARCHAR(20) NOT NULL, -- 'success', 'failure', 'warning'
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    metadata JSONB, -- Additional structured data

    -- Request information
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_is_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_verification_token ON users(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX idx_users_reset_password_token ON users(reset_password_token) WHERE reset_password_token IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Sessions table indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_last_activity ON sessions(last_activity_at);
CREATE INDEX idx_sessions_active ON sessions(user_id, expires_at) WHERE revoked_at IS NULL;

-- Refresh tokens table indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_session_id ON refresh_tokens(session_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_active ON refresh_tokens(user_id, expires_at)
    WHERE revoked_at IS NULL AND used_at IS NULL;

-- Audit logs table indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Role and permissions indexes
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to roles table
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS FOR ENCRYPTION
-- ============================================================================

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_data(encrypted_data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSERT DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (name, description, is_system_role) VALUES
    ('admin', 'System administrator with full access', TRUE),
    ('user', 'Standard user with basic permissions', TRUE),
    ('moderator', 'Content moderator with elevated permissions', TRUE),
    ('guest', 'Guest user with limited access', TRUE);

-- ============================================================================
-- INSERT DEFAULT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (resource, action, description) VALUES
    -- User management
    ('users', 'create', 'Create new users'),
    ('users', 'read', 'View user information'),
    ('users', 'update', 'Update user information'),
    ('users', 'delete', 'Delete users'),
    ('users', 'list', 'List all users'),

    -- Role management
    ('roles', 'create', 'Create new roles'),
    ('roles', 'read', 'View role information'),
    ('roles', 'update', 'Update role information'),
    ('roles', 'delete', 'Delete roles'),
    ('roles', 'assign', 'Assign roles to users'),

    -- Permission management
    ('permissions', 'create', 'Create new permissions'),
    ('permissions', 'read', 'View permissions'),
    ('permissions', 'update', 'Update permissions'),
    ('permissions', 'delete', 'Delete permissions'),

    -- Audit logs
    ('audit_logs', 'read', 'View audit logs'),
    ('audit_logs', 'export', 'Export audit logs'),

    -- Session management
    ('sessions', 'read', 'View session information'),
    ('sessions', 'revoke', 'Revoke user sessions');

-- ============================================================================
-- ASSIGN DEFAULT PERMISSIONS TO ROLES
-- ============================================================================

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'admin'),
    id
FROM permissions;

-- User gets basic read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'user'),
    id
FROM permissions
WHERE action IN ('read') AND resource IN ('users', 'roles', 'permissions');

-- Moderator gets elevated permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'moderator'),
    id
FROM permissions
WHERE resource IN ('users', 'audit_logs', 'sessions')
    AND action IN ('read', 'update', 'list', 'revoke');

-- Guest gets minimal permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'guest'),
    id
FROM permissions
WHERE action = 'read' AND resource = 'users';

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Core user authentication and profile information';
COMMENT ON TABLE roles IS 'Role definitions for role-based access control';
COMMENT ON TABLE permissions IS 'Granular permissions for authorization';
COMMENT ON TABLE role_permissions IS 'Mapping between roles and their permissions';
COMMENT ON TABLE user_roles IS 'Mapping between users and their assigned roles';
COMMENT ON TABLE sessions IS 'Active user sessions with device and location tracking';
COMMENT ON TABLE refresh_tokens IS 'Refresh tokens for JWT token rotation';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for security and compliance';

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (application layer)';
COMMENT ON COLUMN users.phone_number IS 'Encrypted phone number using pgcrypto';
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for account lockout mechanism';
COMMENT ON COLUMN sessions.device_info IS 'JSONB field for flexible device metadata';
COMMENT ON COLUMN audit_logs.metadata IS 'JSONB field for additional event context';

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- 1. Password hashing should be done at application layer using bcrypt with salt rounds >= 12
-- 2. Session tokens and refresh tokens should be cryptographically secure random strings
-- 3. Store only hashed versions of tokens in the database
-- 4. Implement token rotation for refresh tokens
-- 5. Use the encryption functions for sensitive data like phone numbers
-- 6. Regularly clean up expired sessions and tokens
-- 7. Monitor audit_logs for suspicious activities
-- 8. Implement rate limiting at application layer to prevent brute force attacks
-- 9. Use prepared statements to prevent SQL injection
-- 10. Encrypt backups and use secure key management for encryption keys
