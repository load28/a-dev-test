/**
 * Authentication Types
 * Enterprise-grade type definitions for authentication system
 */

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  givenName?: string
  familyName?: string
  locale?: string
  emailVerified: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  idToken?: string
  expiresAt: number
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextValue extends AuthState {
  login: (credential: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

export interface GoogleAuthResponse {
  credential: string
  clientId: string
  select_by: string
}

export interface AuthApiResponse {
  user: User
  tokens: AuthTokens
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresAt: number
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_FAILED = 'REFRESH_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AuthError extends Error {
  code: AuthErrorCode

  constructor(message: string, code: AuthErrorCode = AuthErrorCode.UNKNOWN_ERROR) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}
