/**
 * Mock Authentication Service
 * For testing purposes - simulates backend API responses
 * Replace with real authService in production
 */

import type { AuthApiResponse, RefreshTokenResponse, User } from '../types/auth'
import { jwtDecode } from 'jwt-decode'

/**
 * Mock implementation for development/testing
 * This simulates API responses without a real backend
 */
class MockAuthService {
  /**
   * Simulate Google OAuth login
   */
  async loginWithGoogle(credential: string): Promise<AuthApiResponse> {
    // Simulate network delay
    await this.simulateNetworkDelay()

    try {
      // Decode Google JWT to get user info
      const decoded = jwtDecode<{
        email: string
        name: string
        picture?: string
        given_name?: string
        family_name?: string
        email_verified?: boolean
        locale?: string
        sub: string
      }>(credential)

      // Create mock user
      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        givenName: decoded.given_name,
        familyName: decoded.family_name,
        locale: decoded.locale,
        emailVerified: decoded.email_verified || false,
      }

      // Create mock tokens
      const now = Date.now()
      const tokens = {
        accessToken: `mock_access_token_${now}`,
        refreshToken: `mock_refresh_token_${now}`,
        idToken: credential,
        expiresAt: now + 3600000, // 1 hour from now
      }

      console.log('Mock login successful:', user)

      return { user, tokens }
    } catch (error) {
      console.error('Mock login failed:', error)
      throw new Error('Failed to decode Google credential')
    }
  }

  /**
   * Simulate token refresh
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    await this.simulateNetworkDelay()

    console.log('Mock token refresh:', refreshToken)

    const now = Date.now()
    return {
      accessToken: `mock_access_token_refreshed_${now}`,
      expiresAt: now + 3600000, // 1 hour from now
    }
  }

  /**
   * Simulate logout
   */
  async logout(accessToken: string): Promise<void> {
    await this.simulateNetworkDelay()
    console.log('Mock logout:', accessToken)
  }

  /**
   * Simulate token verification
   */
  async verifyToken(accessToken: string): Promise<User> {
    await this.simulateNetworkDelay()

    console.log('Mock token verification:', accessToken)

    // Return mock user
    return {
      id: 'mock_user_id',
      email: 'user@example.com',
      name: 'Mock User',
      picture: 'https://via.placeholder.com/150',
      emailVerified: true,
    }
  }

  /**
   * Simulate network delay (100-500ms)
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 400 + 100
    return new Promise((resolve) => setTimeout(resolve, delay))
  }

  /**
   * Create authenticated fetch (mock version)
   */
  createAuthenticatedFetch(getAccessToken: () => string | null) {
    return async (url: string, _options: RequestInit = {}): Promise<Response> => {
      const token = getAccessToken()
      console.log('Mock authenticated fetch:', url, token)

      // Return mock response
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
}

// Export mock instance
export const mockAuthService = new MockAuthService()

// For testing purposes
export { MockAuthService }
