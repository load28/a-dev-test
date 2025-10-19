/**
 * Social Login Implementation
 * Google, GitHub, Microsoft OAuth clients with account linking and profile synchronization
 */

import crypto from 'crypto'

/**
 * Social Login Providers
 */
export enum SocialProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
}

/**
 * OAuth Provider Configuration
 */
export interface OAuthProviderConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
}

/**
 * User Profile from Social Provider
 */
export interface SocialUserProfile {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  picture?: string
  emailVerified?: boolean
  locale?: string
  provider: SocialProvider
  rawProfile: Record<string, any>
}

/**
 * Social Account Link
 */
export interface SocialAccountLink {
  userId: string
  provider: SocialProvider
  providerId: string
  email: string
  profile: SocialUserProfile
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  linkedAt: number
  lastSyncedAt: number
}

/**
 * OAuth State for CSRF Protection
 */
export interface OAuthState {
  state: string
  codeVerifier: string
  provider: SocialProvider
  redirectUri: string
  expiresAt: number
  createdAt: number
}

/**
 * OAuth Token Response
 */
export interface OAuthTokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType: string
  scope?: string
  idToken?: string
}

/**
 * Account Linking Options
 */
export interface AccountLinkingOptions {
  allowMultipleAccounts: boolean
  requireEmailMatch: boolean
  autoLinkByEmail: boolean
  syncProfileOnLogin: boolean
}

/**
 * Profile Sync Options
 */
export interface ProfileSyncOptions {
  syncName: boolean
  syncEmail: boolean
  syncPicture: boolean
  syncOnLogin: boolean
  syncInterval?: number // in milliseconds
}

/**
 * Base OAuth Client Interface
 */
export interface IOAuthClient {
  getAuthorizationUrl(state: string, codeVerifier: string): string
  exchangeCodeForToken(code: string, codeVerifier: string): Promise<OAuthTokenResponse>
  getUserProfile(accessToken: string): Promise<SocialUserProfile>
  refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>
  revokeToken(token: string): Promise<boolean>
}

/**
 * Google OAuth Client
 */
export class GoogleOAuthClient implements IOAuthClient {
  private config: OAuthProviderConfig

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.config = {
      clientId,
      clientSecret,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    }
  }

  /**
   * Generate authorization URL with PKCE
   */
  getAuthorizationUrl(state: string, codeVerifier: string): string {
    const codeChallenge = this.generateCodeChallenge(codeVerifier)

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent screen to get refresh token
    })

    return `${this.config.authorizationUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<OAuthTokenResponse> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to exchange code for token: ${error}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
      idToken: data.id_token,
    }
  }

  /**
   * Get user profile from Google
   */
  async getUserProfile(accessToken: string): Promise<SocialUserProfile> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile from Google')
    }

    const data = await response.json()

    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      firstName: data.given_name,
      lastName: data.family_name,
      picture: data.picture,
      emailVerified: data.email_verified,
      locale: data.locale,
      provider: SocialProvider.GOOGLE,
      rawProfile: data,
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh Google access token')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    }
  }

  /**
   * Revoke token
   */
  async revokeToken(token: string): Promise<boolean> {
    const response = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
      }),
    })

    return response.ok
  }

  /**
   * Generate PKCE code challenge
   */
  private generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url')
  }
}

/**
 * GitHub OAuth Client
 */
export class GitHubOAuthClient implements IOAuthClient {
  private config: OAuthProviderConfig

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.config = {
      clientId,
      clientSecret,
      redirectUri,
      scopes: ['read:user', 'user:email'],
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
    }
  }

  /**
   * Generate authorization URL
   * Note: GitHub doesn't support PKCE, but we accept the parameter for interface consistency
   */
  getAuthorizationUrl(state: string, _codeVerifier: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state,
      allow_signup: 'true',
    })

    return `${this.config.authorizationUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string, _codeVerifier: string): Promise<OAuthTokenResponse> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to exchange code for token: ${error}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`)
    }

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      scope: data.scope,
    }
  }

  /**
   * Get user profile from GitHub
   */
  async getUserProfile(accessToken: string): Promise<SocialUserProfile> {
    // Get user info
    const userResponse = await fetch(this.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user profile from GitHub')
    }

    const userData = await userResponse.json()

    // Get primary email if not public
    let email = userData.email
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (emailResponse.ok) {
        const emails = await emailResponse.json()
        const primaryEmail = emails.find((e: any) => e.primary)
        if (primaryEmail) {
          email = primaryEmail.email
        }
      }
    }

    return {
      id: String(userData.id),
      email: email || '',
      name: userData.name || userData.login,
      picture: userData.avatar_url,
      emailVerified: email ? true : false,
      provider: SocialProvider.GITHUB,
      rawProfile: userData,
    }
  }

  /**
   * Refresh access token
   * Note: GitHub tokens don't expire, so this is a no-op
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    throw new Error('GitHub tokens do not support refresh')
  }

  /**
   * Revoke token
   */
  async revokeToken(token: string): Promise<boolean> {
    const response = await fetch(
      `https://api.github.com/applications/${this.config.clientId}/token`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          access_token: token,
        }),
      }
    )

    return response.ok || response.status === 404
  }
}

/**
 * Microsoft OAuth Client
 */
export class MicrosoftOAuthClient implements IOAuthClient {
  private config: OAuthProviderConfig
  private tenant: string

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    tenant: string = 'common'
  ) {
    this.tenant = tenant
    this.config = {
      clientId,
      clientSecret,
      redirectUri,
      scopes: ['openid', 'profile', 'email', 'User.Read'],
      authorizationUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    }
  }

  /**
   * Generate authorization URL with PKCE
   */
  getAuthorizationUrl(state: string, codeVerifier: string): string {
    const codeChallenge = this.generateCodeChallenge(codeVerifier)

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      response_mode: 'query',
    })

    return `${this.config.authorizationUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<OAuthTokenResponse> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to exchange code for token: ${error}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
      idToken: data.id_token,
    }
  }

  /**
   * Get user profile from Microsoft Graph
   */
  async getUserProfile(accessToken: string): Promise<SocialUserProfile> {
    const response = await fetch(this.config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user profile from Microsoft')
    }

    const data = await response.json()

    return {
      id: data.id,
      email: data.mail || data.userPrincipalName,
      name: data.displayName,
      firstName: data.givenName,
      lastName: data.surname,
      picture: undefined, // Need separate API call for photo
      emailVerified: true, // Microsoft accounts are verified
      locale: data.preferredLanguage,
      provider: SocialProvider.MICROSOFT,
      rawProfile: data,
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: this.config.scopes.join(' '),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh Microsoft access token')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    }
  }

  /**
   * Revoke token
   * Note: Microsoft doesn't provide a standard revoke endpoint
   */
  async revokeToken(_token: string): Promise<boolean> {
    // Microsoft recommends deleting tokens on the client side
    // Server-side revocation requires Azure AD admin APIs
    return true
  }

  /**
   * Generate PKCE code challenge
   */
  private generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url')
  }
}

/**
 * Social Login Service
 */
export class SocialLoginService {
  private clients: Map<SocialProvider, IOAuthClient> = new Map()
  private states: Map<string, OAuthState> = new Map()
  private accountLinks: Map<string, SocialAccountLink[]> = new Map() // userId -> links

  private accountLinkingOptions: AccountLinkingOptions = {
    allowMultipleAccounts: true,
    requireEmailMatch: false,
    autoLinkByEmail: true,
    syncProfileOnLogin: true,
  }

  private profileSyncOptions: ProfileSyncOptions = {
    syncName: true,
    syncEmail: false, // Don't override primary email
    syncPicture: true,
    syncOnLogin: true,
    syncInterval: 24 * 60 * 60 * 1000, // 24 hours
  }

  /**
   * Register OAuth client
   */
  registerClient(provider: SocialProvider, client: IOAuthClient): void {
    this.clients.set(provider, client)
  }

  /**
   * Configure account linking options
   */
  configureAccountLinking(options: Partial<AccountLinkingOptions>): void {
    this.accountLinkingOptions = {
      ...this.accountLinkingOptions,
      ...options,
    }
  }

  /**
   * Configure profile sync options
   */
  configureProfileSync(options: Partial<ProfileSyncOptions>): void {
    this.profileSyncOptions = {
      ...this.profileSyncOptions,
      ...options,
    }
  }

  /**
   * Generate authorization URL and state
   */
  getAuthorizationUrl(provider: SocialProvider, redirectUri: string): string {
    const client = this.clients.get(provider)
    if (!client) {
      throw new Error(`OAuth client not registered for provider: ${provider}`)
    }

    const state = this.generateSecureToken(32)
    const codeVerifier = this.generateSecureToken(64)

    const oauthState: OAuthState = {
      state,
      codeVerifier,
      provider,
      redirectUri,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      createdAt: Date.now(),
    }

    this.states.set(state, oauthState)

    // Clean up expired states
    this.cleanupExpiredStates()

    return client.getAuthorizationUrl(state, codeVerifier)
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    code: string,
    state: string
  ): Promise<{ profile: SocialUserProfile; tokens: OAuthTokenResponse }> {
    const oauthState = this.states.get(state)
    if (!oauthState) {
      throw new Error('Invalid or expired state')
    }

    if (oauthState.expiresAt < Date.now()) {
      this.states.delete(state)
      throw new Error('State expired')
    }

    const client = this.clients.get(oauthState.provider)
    if (!client) {
      throw new Error(`OAuth client not found for provider: ${oauthState.provider}`)
    }

    // Delete state to prevent reuse
    this.states.delete(state)

    // Exchange code for tokens
    const tokens = await client.exchangeCodeForToken(code, oauthState.codeVerifier)

    // Get user profile
    const profile = await client.getUserProfile(tokens.accessToken)

    return { profile, tokens }
  }

  /**
   * Link social account to user
   */
  async linkAccount(
    userId: string,
    provider: SocialProvider,
    profile: SocialUserProfile,
    tokens: OAuthTokenResponse
  ): Promise<SocialAccountLink> {
    // Check if account is already linked
    const existingLinks = this.accountLinks.get(userId) || []
    const existingLink = existingLinks.find(
      link => link.provider === provider && link.providerId === profile.id
    )

    if (existingLink) {
      // Update existing link
      existingLink.accessToken = tokens.accessToken
      existingLink.refreshToken = tokens.refreshToken
      existingLink.expiresAt = tokens.expiresIn
        ? Date.now() + tokens.expiresIn * 1000
        : undefined
      existingLink.lastSyncedAt = Date.now()
      existingLink.profile = profile

      return existingLink
    }

    // Check if provider account is linked to another user
    if (!this.accountLinkingOptions.allowMultipleAccounts) {
      for (const [otherUserId, links] of this.accountLinks.entries()) {
        if (otherUserId !== userId) {
          const duplicate = links.find(
            link => link.provider === provider && link.providerId === profile.id
          )
          if (duplicate) {
            throw new Error('This social account is already linked to another user')
          }
        }
      }
    }

    // Check email match if required
    if (this.accountLinkingOptions.requireEmailMatch) {
      // This check would need to be implemented by the caller
      // as we don't have access to the user's primary email here
    }

    // Create new link
    const link: SocialAccountLink = {
      userId,
      provider,
      providerId: profile.id,
      email: profile.email,
      profile,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : undefined,
      linkedAt: Date.now(),
      lastSyncedAt: Date.now(),
    }

    existingLinks.push(link)
    this.accountLinks.set(userId, existingLinks)

    return link
  }

  /**
   * Unlink social account from user
   */
  async unlinkAccount(userId: string, provider: SocialProvider): Promise<boolean> {
    const links = this.accountLinks.get(userId)
    if (!links) {
      return false
    }

    const linkIndex = links.findIndex(link => link.provider === provider)
    if (linkIndex === -1) {
      return false
    }

    const link = links[linkIndex]

    // Revoke token before unlinking
    const client = this.clients.get(provider)
    if (client) {
      try {
        await client.revokeToken(link.accessToken)
      } catch (error) {
        console.error(`Failed to revoke token for ${provider}:`, error)
      }
    }

    links.splice(linkIndex, 1)

    if (links.length === 0) {
      this.accountLinks.delete(userId)
    } else {
      this.accountLinks.set(userId, links)
    }

    return true
  }

  /**
   * Get linked accounts for user
   */
  getLinkedAccounts(userId: string): SocialAccountLink[] {
    return this.accountLinks.get(userId) || []
  }

  /**
   * Get linked account by provider
   */
  getLinkedAccount(userId: string, provider: SocialProvider): SocialAccountLink | undefined {
    const links = this.accountLinks.get(userId)
    return links?.find(link => link.provider === provider)
  }

  /**
   * Find user by social account
   */
  findUserBySocialAccount(provider: SocialProvider, providerId: string): string | undefined {
    for (const [userId, links] of this.accountLinks.entries()) {
      const link = links.find(
        l => l.provider === provider && l.providerId === providerId
      )
      if (link) {
        return userId
      }
    }
    return undefined
  }

  /**
   * Find user by email (for auto-linking)
   */
  findUserByEmail(email: string): string | undefined {
    // This would need to be implemented by integrating with your user store
    // For now, we search through linked accounts
    for (const [userId, links] of this.accountLinks.entries()) {
      const link = links.find(l => l.email.toLowerCase() === email.toLowerCase())
      if (link) {
        return userId
      }
    }
    return undefined
  }

  /**
   * Sync profile from social provider
   */
  async syncProfile(
    userId: string,
    provider: SocialProvider
  ): Promise<SocialUserProfile | null> {
    const link = this.getLinkedAccount(userId, provider)
    if (!link) {
      return null
    }

    // Check if token is expired
    if (link.expiresAt && link.expiresAt < Date.now()) {
      // Try to refresh token
      if (link.refreshToken) {
        const client = this.clients.get(provider)
        if (client) {
          try {
            const tokens = await client.refreshAccessToken(link.refreshToken)
            link.accessToken = tokens.accessToken
            link.refreshToken = tokens.refreshToken || link.refreshToken
            link.expiresAt = tokens.expiresIn
              ? Date.now() + tokens.expiresIn * 1000
              : undefined
          } catch (error) {
            console.error(`Failed to refresh token for ${provider}:`, error)
            return null
          }
        }
      } else {
        return null
      }
    }

    // Get fresh profile
    const client = this.clients.get(provider)
    if (!client) {
      return null
    }

    try {
      const profile = await client.getUserProfile(link.accessToken)

      // Update link
      link.profile = profile
      link.lastSyncedAt = Date.now()

      return profile
    } catch (error) {
      console.error(`Failed to sync profile from ${provider}:`, error)
      return null
    }
  }

  /**
   * Check if profile needs sync
   */
  needsProfileSync(userId: string, provider: SocialProvider): boolean {
    const link = this.getLinkedAccount(userId, provider)
    if (!link) {
      return false
    }

    if (!this.profileSyncOptions.syncInterval) {
      return false
    }

    const timeSinceLastSync = Date.now() - link.lastSyncedAt
    return timeSinceLastSync > this.profileSyncOptions.syncInterval
  }

  /**
   * Apply profile sync to user data
   */
  applySyncToUser(
    userData: { name?: string; email?: string; picture?: string },
    profile: SocialUserProfile
  ): { name?: string; email?: string; picture?: string } {
    const updates: { name?: string; email?: string; picture?: string } = {}

    if (this.profileSyncOptions.syncName && profile.name) {
      updates.name = profile.name
    }

    if (this.profileSyncOptions.syncEmail && profile.email) {
      updates.email = profile.email
    }

    if (this.profileSyncOptions.syncPicture && profile.picture) {
      updates.picture = profile.picture
    }

    return { ...userData, ...updates }
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(length: number): string {
    return crypto.randomBytes(length).toString('base64url')
  }

  /**
   * Clean up expired states
   */
  private cleanupExpiredStates(): void {
    const now = Date.now()
    for (const [state, oauthState] of this.states.entries()) {
      if (oauthState.expiresAt < now) {
        this.states.delete(state)
      }
    }
  }
}

/**
 * Singleton instance
 */
export const socialLoginService = new SocialLoginService()

/**
 * Helper function to create OAuth clients
 */
export function createOAuthClient(
  provider: SocialProvider,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  options?: { tenant?: string }
): IOAuthClient {
  switch (provider) {
    case SocialProvider.GOOGLE:
      return new GoogleOAuthClient(clientId, clientSecret, redirectUri)
    case SocialProvider.GITHUB:
      return new GitHubOAuthClient(clientId, clientSecret, redirectUri)
    case SocialProvider.MICROSOFT:
      return new MicrosoftOAuthClient(
        clientId,
        clientSecret,
        redirectUri,
        options?.tenant || 'common'
      )
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
