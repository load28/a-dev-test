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

/**
 * Session Management Types
 */

export interface SessionDevice {
  id: string
  userAgent: string
  browser: string
  os: string
  device: string
  ip: string
  lastActivity: number
  createdAt: number
  isCurrent: boolean
}

export interface Session {
  id: string
  userId: string
  deviceId: string
  device: SessionDevice
  createdAt: number
  lastActivity: number
  expiresAt: number
  isActive: boolean
}

export interface SessionCreateRequest {
  userId: string
  userAgent: string
  ip: string
}

export interface SessionListResponse {
  sessions: Session[]
  currentSessionId: string
  totalSessions: number
}

export interface SessionConfig {
  maxConcurrentSessions: number // 동시 세션 제한
  sessionTimeout: number // 세션 타임아웃 (ms)
  activityTimeout: number // 비활동 타임아웃 (ms)
  extendOnActivity: boolean // 활동 시 세션 연장 여부
}

export interface SessionStats {
  activeSessions: number
  totalDevices: number
  oldestSession: number
  newestSession: number
}
