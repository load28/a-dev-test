/**
 * Authentication Configuration
 * Centralized configuration for authentication system
 */

// Toggle between mock and real API
export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || true

// Google OAuth Client ID
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

// Token refresh buffer time (in milliseconds)
// Tokens will be refreshed this many milliseconds before expiration
export const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes

// Session timeout (in milliseconds)
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

// Enable debug logging
export const DEBUG_AUTH = import.meta.env.DEV
