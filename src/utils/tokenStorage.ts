/**
 * Token Storage Utility
 * Secure token management with encryption consideration
 */

import type { AuthTokens } from '../types/auth'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  ID_TOKEN: 'auth_id_token',
  EXPIRES_AT: 'auth_expires_at',
  USER: 'auth_user',
} as const

/**
 * Token Storage Manager
 * Handles secure storage and retrieval of authentication tokens
 */
export class TokenStorage {
  private static instance: TokenStorage
  private storage: Storage

  private constructor() {
    // Use localStorage for persistent sessions
    // For more security, consider sessionStorage or encrypted storage
    this.storage = localStorage
  }

  static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage()
    }
    return TokenStorage.instance
  }

  /**
   * Save authentication tokens
   */
  setTokens(tokens: AuthTokens): void {
    try {
      this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
      this.storage.setItem(STORAGE_KEYS.EXPIRES_AT, tokens.expiresAt.toString())

      if (tokens.refreshToken) {
        this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
      }

      if (tokens.idToken) {
        this.storage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.idToken)
      }
    } catch (error) {
      console.error('Failed to save tokens:', error)
      throw new Error('Token storage failed')
    }
  }

  /**
   * Get stored authentication tokens
   */
  getTokens(): AuthTokens | null {
    try {
      const accessToken = this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const expiresAt = this.storage.getItem(STORAGE_KEYS.EXPIRES_AT)

      if (!accessToken || !expiresAt) {
        return null
      }

      return {
        accessToken,
        refreshToken: this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || undefined,
        idToken: this.storage.getItem(STORAGE_KEYS.ID_TOKEN) || undefined,
        expiresAt: parseInt(expiresAt, 10),
      }
    } catch (error) {
      console.error('Failed to retrieve tokens:', error)
      return null
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiresAt = this.storage.getItem(STORAGE_KEYS.EXPIRES_AT)
    if (!expiresAt) return true

    const expirationTime = parseInt(expiresAt, 10)
    const currentTime = Date.now()

    // Consider token expired 5 minutes before actual expiration
    const bufferTime = 5 * 60 * 1000
    return currentTime >= expirationTime - bufferTime
  }

  /**
   * Update access token (for token refresh)
   */
  updateAccessToken(accessToken: string, expiresAt: number): void {
    this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    this.storage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString())
  }

  /**
   * Save user data
   */
  setUser(user: unknown): void {
    try {
      this.storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  /**
   * Get user data
   */
  getUser<T>(): T | null {
    try {
      const userData = this.storage.getItem(STORAGE_KEYS.USER)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Failed to retrieve user:', error)
      return null
    }
  }

  /**
   * Clear all authentication data
   */
  clear(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.storage.removeItem(key)
    })
  }

  /**
   * Check if user is authenticated
   */
  hasValidSession(): boolean {
    const tokens = this.getTokens()
    return tokens !== null && !this.isTokenExpired()
  }
}

// Export singleton instance
export const tokenStorage = TokenStorage.getInstance()
