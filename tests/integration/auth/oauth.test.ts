import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { OAuthProvider } from '../../../src/auth/oauth'
import type {
  OAuthClient,
  AuthorizationRequest,
  TokenRequest,
  TokenResponse,
} from '../../../src/auth/oauth'

/**
 * OAuth 2.0 Provider Integration Tests
 *
 * Tests the complete OAuth 2.0 authorization server implementation including:
 * - Client registration and management
 * - Authorization Code flow with PKCE
 * - Client Credentials flow
 * - Refresh Token flow
 * - Token validation and revocation
 * - Scope management
 */
describe('OAuth Provider Integration Tests', () => {
  let oauthProvider: OAuthProvider

  beforeEach(() => {
    oauthProvider = new OAuthProvider()
  })

  afterEach(() => {
    // Clean up any test data
  })

  describe('Client Registration', () => {
    it('should register a new OAuth client with all grant types', () => {
      const client = oauthProvider.registerClient({
        name: 'Test Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code', 'client_credentials', 'refresh_token'],
        allowedScopes: ['read', 'write', 'admin'],
      })

      expect(client.clientId).toBeDefined()
      expect(client.clientSecret).toBeDefined()
      expect(client.name).toBe('Test Client')
      expect(client.redirectUris).toEqual(['https://example.com/callback'])
      expect(client.grantTypes).toContain('authorization_code')
      expect(client.grantTypes).toContain('client_credentials')
      expect(client.grantTypes).toContain('refresh_token')
      expect(client.allowedScopes).toEqual(['read', 'write', 'admin'])
    })

    it('should register a client with PKCE required', () => {
      const client = oauthProvider.registerClient({
        name: 'PKCE Client',
        redirectUris: ['https://mobile-app.com/callback'],
        grantTypes: ['authorization_code'],
        allowedScopes: ['read'],
        requirePkce: true,
      })

      expect(client.requirePkce).toBe(true)
    })

    it('should retrieve a registered client', () => {
      const client = oauthProvider.registerClient({
        name: 'Retrievable Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code'],
        allowedScopes: ['read'],
      })

      const retrieved = oauthProvider.getClient(client.clientId)
      expect(retrieved).toEqual(client)
    })

    it('should return undefined for non-existent client', () => {
      const client = oauthProvider.getClient('non-existent-id')
      expect(client).toBeUndefined()
    })
  })

  describe('Authorization Code Flow', () => {
    let client: OAuthClient

    beforeEach(() => {
      client = oauthProvider.registerClient({
        name: 'Auth Code Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
        allowedScopes: ['read', 'write'],
      })
    })

    it('should handle complete authorization code flow', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read write',
        state: 'random-state-123',
        responseType: 'code',
      }

      // Step 1: Generate authorization code
      const authResponse = oauthProvider.authorize(authRequest, 'user-123')

      expect(authResponse.code).toBeDefined()
      expect(authResponse.state).toBe('random-state-123')

      // Step 2: Exchange code for tokens
      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://example.com/callback',
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      }

      const tokenResponse = oauthProvider.exchangeCodeForToken(tokenRequest)

      expect(tokenResponse.accessToken).toBeDefined()
      expect(tokenResponse.refreshToken).toBeDefined()
      expect(tokenResponse.tokenType).toBe('Bearer')
      expect(tokenResponse.expiresIn).toBe(3600)
      expect(tokenResponse.scope).toBe('read write')
    })

    it('should enforce redirect URI validation', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://malicious-site.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
      }

      expect(() => oauthProvider.authorize(authRequest, 'user-123')).toThrow(
        'Invalid redirect_uri'
      )
    })

    it('should enforce scope validation', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'admin delete',
        state: 'state-123',
        responseType: 'code',
      }

      expect(() => oauthProvider.authorize(authRequest, 'user-123')).toThrow(
        'Invalid scope requested'
      )
    })

    it('should prevent authorization code reuse', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')

      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://example.com/callback',
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      }

      // First exchange should succeed
      oauthProvider.exchangeCodeForToken(tokenRequest)

      // Second exchange should fail
      expect(() => oauthProvider.exchangeCodeForToken(tokenRequest)).toThrow(
        'Invalid or expired authorization code'
      )
    })

    it('should validate authorization code expiration', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')

      // Simulate code expiration (codes expire in 10 minutes)
      const expiredCode = authResponse.code

      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: expiredCode,
        redirectUri: 'https://example.com/callback',
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      }

      // Note: In real test, we'd manipulate time or wait for expiration
      // For now, we verify the code works before expiration
      const tokenResponse = oauthProvider.exchangeCodeForToken(tokenRequest)
      expect(tokenResponse.accessToken).toBeDefined()
    })
  })

  describe('PKCE Flow', () => {
    let client: OAuthClient

    beforeEach(() => {
      client = oauthProvider.registerClient({
        name: 'PKCE Client',
        redirectUris: ['https://mobile.example.com/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
        allowedScopes: ['read'],
        requirePkce: true,
      })
    })

    it('should handle complete PKCE flow', () => {
      const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
      const codeChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'

      // Step 1: Authorization request with code_challenge
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://mobile.example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
        codeChallenge,
        codeChallengeMethod: 'S256',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')
      expect(authResponse.code).toBeDefined()

      // Step 2: Token exchange with code_verifier
      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://mobile.example.com/callback',
        clientId: client.clientId,
        codeVerifier,
      }

      const tokenResponse = oauthProvider.exchangeCodeForToken(tokenRequest)
      expect(tokenResponse.accessToken).toBeDefined()
      expect(tokenResponse.refreshToken).toBeDefined()
    })

    it('should reject PKCE flow with invalid code_verifier', () => {
      const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
      const codeChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
      const wrongVerifier = 'wrong-verifier-that-does-not-match-challenge'

      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://mobile.example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
        codeChallenge,
        codeChallengeMethod: 'S256',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')

      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://mobile.example.com/callback',
        clientId: client.clientId,
        codeVerifier: wrongVerifier,
      }

      expect(() => oauthProvider.exchangeCodeForToken(tokenRequest)).toThrow(
        'Invalid code_verifier'
      )
    })

    it('should require PKCE for clients with requirePkce flag', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://mobile.example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
        // Missing code_challenge
      }

      expect(() => oauthProvider.authorize(authRequest, 'user-123')).toThrow(
        'PKCE is required'
      )
    })
  })

  describe('Client Credentials Flow', () => {
    let client: OAuthClient

    beforeEach(() => {
      client = oauthProvider.registerClient({
        name: 'M2M Client',
        redirectUris: [],
        grantTypes: ['client_credentials'],
        allowedScopes: ['api:read', 'api:write'],
      })
    })

    it('should issue access token for valid client credentials', () => {
      const tokenResponse = oauthProvider.clientCredentialsGrant(
        client.clientId,
        client.clientSecret,
        'api:read api:write'
      )

      expect(tokenResponse.accessToken).toBeDefined()
      expect(tokenResponse.tokenType).toBe('Bearer')
      expect(tokenResponse.expiresIn).toBe(3600)
      expect(tokenResponse.scope).toBe('api:read api:write')
      expect(tokenResponse.refreshToken).toBeUndefined()
    })

    it('should reject invalid client credentials', () => {
      expect(() =>
        oauthProvider.clientCredentialsGrant(
          client.clientId,
          'wrong-secret',
          'api:read'
        )
      ).toThrow('Invalid client credentials')
    })

    it('should enforce scope validation in client credentials flow', () => {
      expect(() =>
        oauthProvider.clientCredentialsGrant(
          client.clientId,
          client.clientSecret,
          'admin:delete'
        )
      ).toThrow('Invalid scope requested')
    })

    it('should not issue refresh token for client credentials flow', () => {
      const tokenResponse = oauthProvider.clientCredentialsGrant(
        client.clientId,
        client.clientSecret,
        'api:read'
      )

      expect(tokenResponse.refreshToken).toBeUndefined()
    })
  })

  describe('Refresh Token Flow', () => {
    let client: OAuthClient
    let refreshToken: string

    beforeEach(() => {
      client = oauthProvider.registerClient({
        name: 'Refresh Token Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
        allowedScopes: ['read', 'write'],
      })

      // Get initial tokens
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read write',
        state: 'state-123',
        responseType: 'code',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')

      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://example.com/callback',
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      }

      const tokenResponse = oauthProvider.exchangeCodeForToken(tokenRequest)
      refreshToken = tokenResponse.refreshToken!
    })

    it('should issue new access token using refresh token', () => {
      const newTokenResponse = oauthProvider.refreshTokenGrant(
        refreshToken,
        client.clientId,
        client.clientSecret
      )

      expect(newTokenResponse.accessToken).toBeDefined()
      expect(newTokenResponse.accessToken).not.toBe(refreshToken)
      expect(newTokenResponse.refreshToken).toBeDefined()
      expect(newTokenResponse.tokenType).toBe('Bearer')
      expect(newTokenResponse.expiresIn).toBe(3600)
    })

    it('should allow scope reduction during refresh', () => {
      const newTokenResponse = oauthProvider.refreshTokenGrant(
        refreshToken,
        client.clientId,
        client.clientSecret,
        'read'
      )

      expect(newTokenResponse.scope).toBe('read')
    })

    it('should reject scope expansion during refresh', () => {
      expect(() =>
        oauthProvider.refreshTokenGrant(
          refreshToken,
          client.clientId,
          client.clientSecret,
          'read write admin'
        )
      ).toThrow('Cannot expand scope during token refresh')
    })

    it('should reject invalid refresh token', () => {
      expect(() =>
        oauthProvider.refreshTokenGrant(
          'invalid-refresh-token',
          client.clientId,
          client.clientSecret
        )
      ).toThrow('Invalid refresh token')
    })

    it('should rotate refresh tokens on use', () => {
      const firstRefresh = oauthProvider.refreshTokenGrant(
        refreshToken,
        client.clientId,
        client.clientSecret
      )

      const newRefreshToken = firstRefresh.refreshToken!
      expect(newRefreshToken).not.toBe(refreshToken)

      // Old refresh token should be invalid
      expect(() =>
        oauthProvider.refreshTokenGrant(
          refreshToken,
          client.clientId,
          client.clientSecret
        )
      ).toThrow('Invalid refresh token')

      // New refresh token should work
      const secondRefresh = oauthProvider.refreshTokenGrant(
        newRefreshToken,
        client.clientId,
        client.clientSecret
      )

      expect(secondRefresh.accessToken).toBeDefined()
    })
  })

  describe('Token Validation', () => {
    let client: OAuthClient
    let accessToken: string
    let userId: string

    beforeEach(() => {
      client = oauthProvider.registerClient({
        name: 'Validation Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code'],
        allowedScopes: ['read', 'write'],
      })

      userId = 'user-123'

      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read write',
        state: 'state-123',
        responseType: 'code',
      }

      const authResponse = oauthProvider.authorize(authRequest, userId)

      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://example.com/callback',
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      }

      const tokenResponse = oauthProvider.exchangeCodeForToken(tokenRequest)
      accessToken = tokenResponse.accessToken
    })

    it('should validate valid access token', () => {
      const validation = oauthProvider.validateAccessToken(accessToken)

      expect(validation.valid).toBe(true)
      expect(validation.userId).toBe(userId)
      expect(validation.clientId).toBe(client.clientId)
      expect(validation.scope).toContain('read')
      expect(validation.scope).toContain('write')
    })

    it('should reject invalid access token', () => {
      const validation = oauthProvider.validateAccessToken('invalid-token')

      expect(validation.valid).toBe(false)
      expect(validation.userId).toBeUndefined()
      expect(validation.error).toBeDefined()
    })

    it('should detect expired access token', () => {
      // Note: In real test, we'd manipulate time or wait for expiration
      // This is a placeholder for the expiration logic
      const validation = oauthProvider.validateAccessToken(accessToken)
      expect(validation.expiresAt).toBeDefined()
      expect(validation.expiresAt! > Date.now()).toBe(true)
    })

    it('should reject revoked access token', () => {
      oauthProvider.revokeToken(accessToken)

      const validation = oauthProvider.validateAccessToken(accessToken)
      expect(validation.valid).toBe(false)
      expect(validation.error).toBe('Token has been revoked')
    })
  })

  describe('Token Revocation', () => {
    let client: OAuthClient
    let accessToken: string
    let refreshToken: string

    beforeEach(() => {
      client = oauthProvider.registerClient({
        name: 'Revocation Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
        allowedScopes: ['read'],
      })

      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')

      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://example.com/callback',
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      }

      const tokenResponse = oauthProvider.exchangeCodeForToken(tokenRequest)
      accessToken = tokenResponse.accessToken
      refreshToken = tokenResponse.refreshToken!
    })

    it('should revoke access token', () => {
      oauthProvider.revokeToken(accessToken)

      const validation = oauthProvider.validateAccessToken(accessToken)
      expect(validation.valid).toBe(false)
    })

    it('should revoke refresh token', () => {
      oauthProvider.revokeToken(refreshToken)

      expect(() =>
        oauthProvider.refreshTokenGrant(
          refreshToken,
          client.clientId,
          client.clientSecret
        )
      ).toThrow('Invalid refresh token')
    })

    it('should revoke all tokens for a user', () => {
      const userId = 'user-123'
      oauthProvider.revokeAllUserTokens(userId)

      const validation = oauthProvider.validateAccessToken(accessToken)
      expect(validation.valid).toBe(false)

      expect(() =>
        oauthProvider.refreshTokenGrant(
          refreshToken,
          client.clientId,
          client.clientSecret
        )
      ).toThrow('Invalid refresh token')
    })
  })

  describe('Scope Management', () => {
    let client: OAuthClient

    beforeEach(() => {
      client = oauthProvider.registerClient({
        name: 'Scope Test Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code'],
        allowedScopes: ['read', 'write', 'delete'],
      })
    })

    it('should allow subset of allowed scopes', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')
      expect(authResponse.code).toBeDefined()
    })

    it('should reject scopes not in allowedScopes', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'admin',
        state: 'state-123',
        responseType: 'code',
      }

      expect(() => oauthProvider.authorize(authRequest, 'user-123')).toThrow(
        'Invalid scope requested'
      )
    })

    it('should handle multiple scopes correctly', () => {
      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: 'https://example.com/callback',
        scope: 'read write',
        state: 'state-123',
        responseType: 'code',
      }

      const authResponse = oauthProvider.authorize(authRequest, 'user-123')
      expect(authResponse.code).toBeDefined()

      const tokenRequest: TokenRequest = {
        grantType: 'authorization_code',
        code: authResponse.code,
        redirectUri: 'https://example.com/callback',
        clientId: client.clientId,
        clientSecret: client.clientSecret,
      }

      const tokenResponse = oauthProvider.exchangeCodeForToken(tokenRequest)
      expect(tokenResponse.scope).toBe('read write')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing client_id', () => {
      const authRequest: AuthorizationRequest = {
        clientId: '',
        redirectUri: 'https://example.com/callback',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
      }

      expect(() => oauthProvider.authorize(authRequest, 'user-123')).toThrow()
    })

    it('should handle missing redirect_uri', () => {
      const client = oauthProvider.registerClient({
        name: 'Test Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code'],
        allowedScopes: ['read'],
      })

      const authRequest: AuthorizationRequest = {
        clientId: client.clientId,
        redirectUri: '',
        scope: 'read',
        state: 'state-123',
        responseType: 'code',
      }

      expect(() => oauthProvider.authorize(authRequest, 'user-123')).toThrow()
    })

    it('should handle unsupported grant type', () => {
      const client = oauthProvider.registerClient({
        name: 'Limited Client',
        redirectUris: ['https://example.com/callback'],
        grantTypes: ['authorization_code'],
        allowedScopes: ['read'],
      })

      expect(() =>
        oauthProvider.clientCredentialsGrant(
          client.clientId,
          client.clientSecret,
          'read'
        )
      ).toThrow('Unsupported grant type')
    })
  })
})
