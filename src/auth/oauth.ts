/**
 * OAuth 2.0 Provider Implementation
 * Enterprise-grade OAuth provider with Authorization Code Flow, Client Credentials Flow, and PKCE support
 */

import crypto from 'crypto'

/**
 * OAuth Grant Types
 */
export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  CLIENT_CREDENTIALS = 'client_credentials',
  REFRESH_TOKEN = 'refresh_token',
}

/**
 * OAuth Response Types
 */
export enum ResponseType {
  CODE = 'code',
  TOKEN = 'token', // Implicit flow (not recommended)
}

/**
 * OAuth Scopes
 */
export enum OAuthScope {
  OPENID = 'openid',
  PROFILE = 'profile',
  EMAIL = 'email',
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

/**
 * OAuth Client Types
 */
export enum ClientType {
  CONFIDENTIAL = 'confidential', // Can keep credentials secret (backend apps)
  PUBLIC = 'public', // Cannot keep credentials secret (SPAs, mobile apps)
}

/**
 * OAuth Client Configuration
 */
export interface OAuthClient {
  clientId: string
  clientSecret?: string // Only for confidential clients
  clientType: ClientType
  name: string
  description?: string
  redirectUris: string[]
  allowedScopes: OAuthScope[]
  allowedGrantTypes: GrantType[]
  requirePkce: boolean // Force PKCE for public clients
  requireConsent: boolean
  trusted: boolean // Skip consent for trusted first-party apps
  createdAt: number
  updatedAt: number
}

/**
 * Authorization Request
 */
export interface AuthorizationRequest {
  responseType: ResponseType
  clientId: string
  redirectUri: string
  scope: string // Space-separated list of scopes
  state: string // CSRF protection
  codeChallenge?: string // PKCE code challenge
  codeChallengeMethod?: 'S256' | 'plain' // PKCE challenge method
  nonce?: string // For OpenID Connect
}

/**
 * Authorization Code
 */
export interface AuthorizationCode {
  code: string
  clientId: string
  userId: string
  redirectUri: string
  scope: string[]
  expiresAt: number
  codeChallenge?: string
  codeChallengeMethod?: 'S256' | 'plain'
  used: boolean
  createdAt: number
}

/**
 * Token Request
 */
export interface TokenRequest {
  grantType: GrantType
  code?: string // For authorization_code
  redirectUri?: string // For authorization_code
  codeVerifier?: string // For PKCE
  clientId: string
  clientSecret?: string
  refreshToken?: string // For refresh_token
  scope?: string // For client_credentials
}

/**
 * Token Response
 */
export interface TokenResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  refreshToken?: string
  scope: string
  idToken?: string // For OpenID Connect
}

/**
 * Access Token
 */
export interface AccessToken {
  token: string
  clientId: string
  userId?: string // Optional for client_credentials flow
  scope: string[]
  expiresAt: number
  createdAt: number
}

/**
 * Refresh Token
 */
export interface RefreshToken {
  token: string
  clientId: string
  userId: string
  scope: string[]
  expiresAt: number
  createdAt: number
}

/**
 * Consent Decision
 */
export interface ConsentDecision {
  userId: string
  clientId: string
  scope: string[]
  approved: boolean
  expiresAt: number
  createdAt: number
}

/**
 * OAuth Error Types
 */
export enum OAuthError {
  INVALID_REQUEST = 'invalid_request',
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
  INVALID_SCOPE = 'invalid_scope',
  ACCESS_DENIED = 'access_denied',
  SERVER_ERROR = 'server_error',
}

/**
 * OAuth Error Response
 */
export interface OAuthErrorResponse {
  error: OAuthError
  errorDescription?: string
  errorUri?: string
  state?: string
}

/**
 * OAuth Provider Class
 */
export class OAuthProvider {
  private clients: Map<string, OAuthClient> = new Map()
  private authorizationCodes: Map<string, AuthorizationCode> = new Map()
  private accessTokens: Map<string, AccessToken> = new Map()
  private refreshTokens: Map<string, RefreshToken> = new Map()
  private consents: Map<string, ConsentDecision> = new Map()

  // Configuration
  private readonly authorizationCodeTTL = 10 * 60 * 1000 // 10 minutes
  private readonly accessTokenTTL = 60 * 60 * 1000 // 1 hour
  private readonly refreshTokenTTL = 30 * 24 * 60 * 60 * 1000 // 30 days

  /**
   * Register a new OAuth client
   */
  registerClient(client: Omit<OAuthClient, 'createdAt' | 'updatedAt'>): OAuthClient {
    const now = Date.now()
    const registeredClient: OAuthClient = {
      ...client,
      createdAt: now,
      updatedAt: now,
    }

    // Validate client configuration
    if (!client.clientId || client.clientId.length === 0) {
      throw new Error('Client ID is required')
    }

    if (client.clientType === ClientType.CONFIDENTIAL && !client.clientSecret) {
      throw new Error('Client secret is required for confidential clients')
    }

    if (client.redirectUris.length === 0) {
      throw new Error('At least one redirect URI is required')
    }

    // Public clients should require PKCE
    if (client.clientType === ClientType.PUBLIC && !client.requirePkce) {
      console.warn(`Public client ${client.clientId} should require PKCE`)
    }

    this.clients.set(client.clientId, registeredClient)
    return registeredClient
  }

  /**
   * Get OAuth client by ID
   */
  getClient(clientId: string): OAuthClient | undefined {
    return this.clients.get(clientId)
  }

  /**
   * Validate client credentials
   */
  validateClient(clientId: string, clientSecret?: string): boolean {
    const client = this.clients.get(clientId)
    if (!client) {
      return false
    }

    if (client.clientType === ClientType.CONFIDENTIAL) {
      return client.clientSecret === clientSecret
    }

    return true // Public clients don't need secret
  }

  /**
   * Handle authorization request (Step 1: Authorization Code Flow)
   */
  async authorize(request: AuthorizationRequest, userId: string): Promise<string | OAuthErrorResponse> {
    try {
      // Validate client
      const client = this.clients.get(request.clientId)
      if (!client) {
        return {
          error: OAuthError.INVALID_CLIENT,
          errorDescription: 'Invalid client ID',
        }
      }

      // Validate redirect URI
      if (!client.redirectUris.includes(request.redirectUri)) {
        return {
          error: OAuthError.INVALID_REQUEST,
          errorDescription: 'Invalid redirect URI',
        }
      }

      // Validate response type
      if (request.responseType !== ResponseType.CODE) {
        return {
          error: OAuthError.UNSUPPORTED_GRANT_TYPE,
          errorDescription: 'Only authorization code flow is supported',
          state: request.state,
        }
      }

      // Parse and validate scopes
      const requestedScopes = request.scope.split(' ').filter(Boolean) as OAuthScope[]
      const validScopes = this.validateScopes(requestedScopes, client.allowedScopes)

      if (validScopes.length === 0) {
        return {
          error: OAuthError.INVALID_SCOPE,
          errorDescription: 'No valid scopes requested',
          state: request.state,
        }
      }

      // Check PKCE requirement
      if (client.requirePkce && !request.codeChallenge) {
        return {
          error: OAuthError.INVALID_REQUEST,
          errorDescription: 'PKCE is required for this client',
          state: request.state,
        }
      }

      // Validate PKCE code challenge
      if (request.codeChallenge) {
        if (!request.codeChallengeMethod) {
          return {
            error: OAuthError.INVALID_REQUEST,
            errorDescription: 'Code challenge method is required',
            state: request.state,
          }
        }

        if (request.codeChallengeMethod !== 'S256' && request.codeChallengeMethod !== 'plain') {
          return {
            error: OAuthError.INVALID_REQUEST,
            errorDescription: 'Invalid code challenge method',
            state: request.state,
          }
        }
      }

      // Check if consent is required
      if (client.requireConsent && !client.trusted) {
        const consentKey = `${userId}:${client.clientId}`
        const existingConsent = this.consents.get(consentKey)

        if (!existingConsent || existingConsent.expiresAt < Date.now()) {
          // Return consent required - needs to be handled by UI
          throw new Error('CONSENT_REQUIRED')
        }

        // Check if consented scopes cover requested scopes
        const consentedScopes = existingConsent.scope
        const hasAllScopes = validScopes.every(scope => consentedScopes.includes(scope))

        if (!hasAllScopes) {
          throw new Error('CONSENT_REQUIRED')
        }
      }

      // Generate authorization code
      const authCode = this.generateAuthorizationCode(
        client.clientId,
        userId,
        request.redirectUri,
        validScopes,
        request.codeChallenge,
        request.codeChallengeMethod
      )

      return authCode
    } catch (error) {
      if (error instanceof Error && error.message === 'CONSENT_REQUIRED') {
        throw error
      }

      return {
        error: OAuthError.SERVER_ERROR,
        errorDescription: 'An error occurred processing the authorization request',
        state: request.state,
      }
    }
  }

  /**
   * Store user consent decision
   */
  storeConsent(userId: string, clientId: string, scope: string[], approved: boolean): void {
    const consentKey = `${userId}:${clientId}`
    const consent: ConsentDecision = {
      userId,
      clientId,
      scope,
      approved,
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      createdAt: Date.now(),
    }

    this.consents.set(consentKey, consent)
  }

  /**
   * Check if user has consented to scopes
   */
  hasConsent(userId: string, clientId: string, scopes: OAuthScope[]): boolean {
    const consentKey = `${userId}:${clientId}`
    const consent = this.consents.get(consentKey)

    if (!consent || !consent.approved || consent.expiresAt < Date.now()) {
      return false
    }

    return scopes.every(scope => consent.scope.includes(scope))
  }

  /**
   * Generate authorization code
   */
  private generateAuthorizationCode(
    clientId: string,
    userId: string,
    redirectUri: string,
    scope: OAuthScope[],
    codeChallenge?: string,
    codeChallengeMethod?: 'S256' | 'plain'
  ): string {
    const code = this.generateSecureToken(32)
    const now = Date.now()

    const authorizationCode: AuthorizationCode = {
      code,
      clientId,
      userId,
      redirectUri,
      scope,
      expiresAt: now + this.authorizationCodeTTL,
      codeChallenge,
      codeChallengeMethod,
      used: false,
      createdAt: now,
    }

    this.authorizationCodes.set(code, authorizationCode)

    // Clean up expired codes
    this.cleanupExpiredCodes()

    return code
  }

  /**
   * Exchange authorization code for tokens (Step 2: Authorization Code Flow)
   */
  async exchangeCodeForToken(request: TokenRequest): Promise<TokenResponse | OAuthErrorResponse> {
    try {
      if (request.grantType !== GrantType.AUTHORIZATION_CODE) {
        return {
          error: OAuthError.UNSUPPORTED_GRANT_TYPE,
          errorDescription: 'Grant type must be authorization_code',
        }
      }

      if (!request.code || !request.redirectUri) {
        return {
          error: OAuthError.INVALID_REQUEST,
          errorDescription: 'Code and redirect URI are required',
        }
      }

      // Validate client
      if (!this.validateClient(request.clientId, request.clientSecret)) {
        return {
          error: OAuthError.INVALID_CLIENT,
          errorDescription: 'Invalid client credentials',
        }
      }

      // Get authorization code
      const authCode = this.authorizationCodes.get(request.code)
      if (!authCode) {
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Invalid authorization code',
        }
      }

      // Validate authorization code
      if (authCode.used) {
        // Code reuse detected - revoke all tokens
        this.revokeTokensForCode(request.code)
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Authorization code already used',
        }
      }

      if (authCode.expiresAt < Date.now()) {
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Authorization code expired',
        }
      }

      if (authCode.clientId !== request.clientId) {
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Client ID mismatch',
        }
      }

      if (authCode.redirectUri !== request.redirectUri) {
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Redirect URI mismatch',
        }
      }

      // Validate PKCE if present
      if (authCode.codeChallenge) {
        if (!request.codeVerifier) {
          return {
            error: OAuthError.INVALID_REQUEST,
            errorDescription: 'Code verifier is required',
          }
        }

        const isValid = this.validatePkce(
          request.codeVerifier,
          authCode.codeChallenge,
          authCode.codeChallengeMethod!
        )

        if (!isValid) {
          return {
            error: OAuthError.INVALID_GRANT,
            errorDescription: 'Invalid code verifier',
          }
        }
      }

      // Mark code as used
      authCode.used = true
      this.authorizationCodes.set(request.code, authCode)

      // Generate tokens
      const accessToken = this.generateAccessToken(request.clientId, authCode.userId, authCode.scope)
      const refreshToken = this.generateRefreshToken(request.clientId, authCode.userId, authCode.scope)

      return {
        accessToken: accessToken.token,
        tokenType: 'Bearer',
        expiresIn: Math.floor((accessToken.expiresAt - Date.now()) / 1000),
        refreshToken: refreshToken.token,
        scope: authCode.scope.join(' '),
      }
    } catch (error) {
      return {
        error: OAuthError.SERVER_ERROR,
        errorDescription: 'An error occurred exchanging the authorization code',
      }
    }
  }

  /**
   * Client Credentials Flow (for machine-to-machine)
   */
  async clientCredentialsGrant(request: TokenRequest): Promise<TokenResponse | OAuthErrorResponse> {
    try {
      if (request.grantType !== GrantType.CLIENT_CREDENTIALS) {
        return {
          error: OAuthError.UNSUPPORTED_GRANT_TYPE,
          errorDescription: 'Grant type must be client_credentials',
        }
      }

      // Validate client
      const client = this.clients.get(request.clientId)
      if (!client) {
        return {
          error: OAuthError.INVALID_CLIENT,
          errorDescription: 'Invalid client ID',
        }
      }

      if (!this.validateClient(request.clientId, request.clientSecret)) {
        return {
          error: OAuthError.INVALID_CLIENT,
          errorDescription: 'Invalid client credentials',
        }
      }

      // Only confidential clients can use client credentials flow
      if (client.clientType !== ClientType.CONFIDENTIAL) {
        return {
          error: OAuthError.UNAUTHORIZED_CLIENT,
          errorDescription: 'Only confidential clients can use client credentials flow',
        }
      }

      // Check if grant type is allowed
      if (!client.allowedGrantTypes.includes(GrantType.CLIENT_CREDENTIALS)) {
        return {
          error: OAuthError.UNAUTHORIZED_CLIENT,
          errorDescription: 'Client credentials grant not allowed for this client',
        }
      }

      // Parse and validate scopes
      const requestedScopes = request.scope ? request.scope.split(' ').filter(Boolean) as OAuthScope[] : []
      const validScopes = this.validateScopes(requestedScopes, client.allowedScopes)

      if (requestedScopes.length > 0 && validScopes.length === 0) {
        return {
          error: OAuthError.INVALID_SCOPE,
          errorDescription: 'Invalid scope',
        }
      }

      // Generate access token (no refresh token for client credentials)
      const accessToken = this.generateAccessToken(request.clientId, undefined, validScopes)

      return {
        accessToken: accessToken.token,
        tokenType: 'Bearer',
        expiresIn: Math.floor((accessToken.expiresAt - Date.now()) / 1000),
        scope: validScopes.join(' '),
      }
    } catch (error) {
      return {
        error: OAuthError.SERVER_ERROR,
        errorDescription: 'An error occurred processing the client credentials grant',
      }
    }
  }

  /**
   * Refresh token grant
   */
  async refreshTokenGrant(request: TokenRequest): Promise<TokenResponse | OAuthErrorResponse> {
    try {
      if (request.grantType !== GrantType.REFRESH_TOKEN) {
        return {
          error: OAuthError.UNSUPPORTED_GRANT_TYPE,
          errorDescription: 'Grant type must be refresh_token',
        }
      }

      if (!request.refreshToken) {
        return {
          error: OAuthError.INVALID_REQUEST,
          errorDescription: 'Refresh token is required',
        }
      }

      // Validate client
      if (!this.validateClient(request.clientId, request.clientSecret)) {
        return {
          error: OAuthError.INVALID_CLIENT,
          errorDescription: 'Invalid client credentials',
        }
      }

      // Get refresh token
      const refreshToken = this.refreshTokens.get(request.refreshToken)
      if (!refreshToken) {
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Invalid refresh token',
        }
      }

      if (refreshToken.expiresAt < Date.now()) {
        this.refreshTokens.delete(request.refreshToken)
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Refresh token expired',
        }
      }

      if (refreshToken.clientId !== request.clientId) {
        return {
          error: OAuthError.INVALID_GRANT,
          errorDescription: 'Client ID mismatch',
        }
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(request.clientId, refreshToken.userId, refreshToken.scope)

      return {
        accessToken: accessToken.token,
        tokenType: 'Bearer',
        expiresIn: Math.floor((accessToken.expiresAt - Date.now()) / 1000),
        refreshToken: request.refreshToken, // Reuse refresh token
        scope: refreshToken.scope.join(' '),
      }
    } catch (error) {
      return {
        error: OAuthError.SERVER_ERROR,
        errorDescription: 'An error occurred refreshing the token',
      }
    }
  }

  /**
   * Validate access token
   */
  validateAccessToken(token: string): AccessToken | null {
    const accessToken = this.accessTokens.get(token)

    if (!accessToken) {
      return null
    }

    if (accessToken.expiresAt < Date.now()) {
      this.accessTokens.delete(token)
      return null
    }

    return accessToken
  }

  /**
   * Validate scopes
   */
  private validateScopes(requestedScopes: OAuthScope[], allowedScopes: OAuthScope[]): OAuthScope[] {
    return requestedScopes.filter(scope => allowedScopes.includes(scope))
  }

  /**
   * Validate PKCE code verifier
   */
  private validatePkce(codeVerifier: string, codeChallenge: string, method: 'S256' | 'plain'): boolean {
    if (method === 'plain') {
      return codeVerifier === codeChallenge
    }

    // S256
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
    return hash === codeChallenge
  }

  /**
   * Generate access token
   */
  private generateAccessToken(clientId: string, userId: string | undefined, scope: OAuthScope[]): AccessToken {
    const token = this.generateSecureToken(48)
    const now = Date.now()

    const accessToken: AccessToken = {
      token,
      clientId,
      userId,
      scope,
      expiresAt: now + this.accessTokenTTL,
      createdAt: now,
    }

    this.accessTokens.set(token, accessToken)

    // Clean up expired tokens
    this.cleanupExpiredTokens()

    return accessToken
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(clientId: string, userId: string, scope: OAuthScope[]): RefreshToken {
    const token = this.generateSecureToken(48)
    const now = Date.now()

    const refreshToken: RefreshToken = {
      token,
      clientId,
      userId,
      scope,
      expiresAt: now + this.refreshTokenTTL,
      createdAt: now,
    }

    this.refreshTokens.set(token, refreshToken)

    return refreshToken
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(length: number): string {
    return crypto.randomBytes(length).toString('base64url')
  }

  /**
   * Revoke tokens for authorization code (in case of code reuse)
   */
  private revokeTokensForCode(code: string): void {
    // In production, track which tokens were issued for which code
    // For now, just mark code as used
    const authCode = this.authorizationCodes.get(code)
    if (authCode) {
      authCode.used = true
      this.authorizationCodes.set(code, authCode)
    }
  }

  /**
   * Clean up expired authorization codes
   */
  private cleanupExpiredCodes(): void {
    const now = Date.now()
    for (const [code, authCode] of this.authorizationCodes.entries()) {
      if (authCode.expiresAt < now || authCode.used) {
        this.authorizationCodes.delete(code)
      }
    }
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now()

    for (const [token, accessToken] of this.accessTokens.entries()) {
      if (accessToken.expiresAt < now) {
        this.accessTokens.delete(token)
      }
    }

    for (const [token, refreshToken] of this.refreshTokens.entries()) {
      if (refreshToken.expiresAt < now) {
        this.refreshTokens.delete(token)
      }
    }
  }

  /**
   * Get scope descriptions for consent screen
   */
  getScopeDescriptions(scopes: OAuthScope[]): Map<OAuthScope, string> {
    const descriptions = new Map<OAuthScope, string>()

    for (const scope of scopes) {
      switch (scope) {
        case OAuthScope.OPENID:
          descriptions.set(scope, 'Authenticate your identity')
          break
        case OAuthScope.PROFILE:
          descriptions.set(scope, 'Access your profile information (name, picture)')
          break
        case OAuthScope.EMAIL:
          descriptions.set(scope, 'Access your email address')
          break
        case OAuthScope.READ:
          descriptions.set(scope, 'Read your data')
          break
        case OAuthScope.WRITE:
          descriptions.set(scope, 'Modify your data')
          break
        case OAuthScope.ADMIN:
          descriptions.set(scope, 'Full administrative access')
          break
        default:
          descriptions.set(scope, `Access: ${scope}`)
      }
    }

    return descriptions
  }

  /**
   * Revoke all tokens for a user-client combination
   */
  revokeUserClientTokens(userId: string, clientId: string): void {
    // Revoke access tokens
    for (const [token, accessToken] of this.accessTokens.entries()) {
      if (accessToken.userId === userId && accessToken.clientId === clientId) {
        this.accessTokens.delete(token)
      }
    }

    // Revoke refresh tokens
    for (const [token, refreshToken] of this.refreshTokens.entries()) {
      if (refreshToken.userId === userId && refreshToken.clientId === clientId) {
        this.refreshTokens.delete(token)
      }
    }

    // Revoke consent
    const consentKey = `${userId}:${clientId}`
    this.consents.delete(consentKey)
  }
}

/**
 * Singleton instance
 */
export const oauthProvider = new OAuthProvider()
