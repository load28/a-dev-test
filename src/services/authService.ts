/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import type { AuthApiResponse, RefreshTokenResponse, User } from '../types/auth'
import { AuthError, AuthErrorCode } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * Authentication Service Class
 * Manages API communication for authentication
 */
class AuthService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Authenticate with Google OAuth credential
   */
  async loginWithGoogle(credential: string): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: AuthApiResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to authenticate with Google', AuthErrorCode.NETWORK_ERROR)
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: RefreshTokenResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to refresh token', AuthErrorCode.REFRESH_FAILED)
    }
  }

  /**
   * Logout user (revoke tokens)
   */
  async logout(accessToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok && response.status !== 401) {
        throw await this.handleErrorResponse(response)
      }
    } catch (error) {
      // Don't throw on logout errors - still clear local state
      console.warn('Logout API call failed:', error)
    }
  }

  /**
   * Verify token and get user info
   */
  async verifyToken(accessToken: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: { user: User } = await response.json()
      return data.user
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Failed to verify token', AuthErrorCode.UNAUTHORIZED)
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<AuthError> {
    let errorMessage = 'An error occurred'
    let errorCode = AuthErrorCode.UNKNOWN_ERROR

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    } catch {
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    }

    return new AuthError(errorMessage, errorCode)
  }

  /**
   * Map HTTP status codes to AuthErrorCode
   */
  private mapHttpStatusToErrorCode(status: number): AuthErrorCode {
    switch (status) {
      case 401:
        return AuthErrorCode.UNAUTHORIZED
      case 403:
        return AuthErrorCode.INVALID_CREDENTIALS
      case 419:
        return AuthErrorCode.TOKEN_EXPIRED
      default:
        return AuthErrorCode.UNKNOWN_ERROR
    }
  }

  /**
   * Create authenticated fetch with auto token injection
   */
  createAuthenticatedFetch(getAccessToken: () => string | null) {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = getAccessToken()

      if (!token) {
        throw new AuthError('No access token available', AuthErrorCode.UNAUTHORIZED)
      }

      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${token}`)

      return fetch(url, {
        ...options,
        headers,
      })
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

// For testing purposes or custom configurations
export { AuthService }
