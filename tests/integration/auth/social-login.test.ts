import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  GoogleOAuthClient,
  GitHubOAuthClient,
  MicrosoftOAuthClient,
  SocialLoginService,
} from '../../../src/auth/social'
import type {
  SocialProvider,
  SocialProfile,
  LinkedAccount,
} from '../../../src/auth/social'

/**
 * Social Login Integration Tests
 *
 * Tests the complete social authentication flows including:
 * - Google OAuth 2.0 with PKCE
 * - GitHub OAuth 2.0
 * - Microsoft OAuth 2.0 with PKCE
 * - Account linking and unlinking
 * - Profile synchronization
 * - Token refresh and revocation
 */
describe('Social Login Integration Tests', () => {
  describe('Google OAuth Client', () => {
    let googleClient: GoogleOAuthClient

    beforeEach(() => {
      googleClient = new GoogleOAuthClient({
        clientId: 'test-google-client-id',
        clientSecret: 'test-google-client-secret',
        redirectUri: 'https://example.com/auth/google/callback',
      })
    })

    it('should generate authorization URL with PKCE', () => {
      const { url, codeVerifier } = googleClient.getAuthorizationUrl({
        scope: 'openid profile email',
        state: 'random-state-123',
      })

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth')
      expect(url).toContain('client_id=test-google-client-id')
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fauth%2Fgoogle%2Fcallback')
      expect(url).toContain('response_type=code')
      expect(url).toContain('scope=openid+profile+email')
      expect(url).toContain('state=random-state-123')
      expect(url).toContain('code_challenge=')
      expect(url).toContain('code_challenge_method=S256')
      expect(codeVerifier).toBeDefined()
      expect(codeVerifier.length).toBeGreaterThan(40)
    })

    it('should generate authorization URL with custom parameters', () => {
      const { url } = googleClient.getAuthorizationUrl({
        scope: 'openid profile email',
        state: 'state-123',
        prompt: 'consent',
        accessType: 'offline',
      })

      expect(url).toContain('prompt=consent')
      expect(url).toContain('access_type=offline')
    })

    it('should exchange authorization code for tokens', async () => {
      // Mock the token exchange endpoint
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'google-access-token-123',
          refresh_token: 'google-refresh-token-456',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'openid profile email',
          id_token: 'google-id-token-789',
        }),
      })

      const tokens = await googleClient.exchangeCodeForToken({
        code: 'auth-code-123',
        codeVerifier: 'test-code-verifier',
      })

      expect(tokens.accessToken).toBe('google-access-token-123')
      expect(tokens.refreshToken).toBe('google-refresh-token-456')
      expect(tokens.expiresIn).toBe(3600)
      expect(tokens.tokenType).toBe('Bearer')
      expect(tokens.scope).toBe('openid profile email')
      expect(tokens.idToken).toBe('google-id-token-789')
    })

    it('should fetch user profile', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          sub: 'google-user-123',
          email: 'user@example.com',
          email_verified: true,
          name: 'John Doe',
          given_name: 'John',
          family_name: 'Doe',
          picture: 'https://example.com/photo.jpg',
          locale: 'en',
        }),
      })

      const profile = await googleClient.getUserProfile('google-access-token-123')

      expect(profile.provider).toBe('google')
      expect(profile.providerId).toBe('google-user-123')
      expect(profile.email).toBe('user@example.com')
      expect(profile.emailVerified).toBe(true)
      expect(profile.name).toBe('John Doe')
      expect(profile.firstName).toBe('John')
      expect(profile.lastName).toBe('Doe')
      expect(profile.picture).toBe('https://example.com/photo.jpg')
    })

    it('should refresh access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-google-access-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'openid profile email',
        }),
      })

      const tokens = await googleClient.refreshToken('google-refresh-token-456')

      expect(tokens.accessToken).toBe('new-google-access-token')
      expect(tokens.expiresIn).toBe(3600)
    })

    it('should revoke token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
      })

      await expect(
        googleClient.revokeToken('google-access-token-123')
      ).resolves.not.toThrow()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('revoke'),
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should handle token exchange errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code',
        }),
      })

      await expect(
        googleClient.exchangeCodeForToken({
          code: 'invalid-code',
          codeVerifier: 'test-verifier',
        })
      ).rejects.toThrow('Invalid authorization code')
    })
  })

  describe('GitHub OAuth Client', () => {
    let githubClient: GitHubOAuthClient

    beforeEach(() => {
      githubClient = new GitHubOAuthClient({
        clientId: 'test-github-client-id',
        clientSecret: 'test-github-client-secret',
        redirectUri: 'https://example.com/auth/github/callback',
      })
    })

    it('should generate authorization URL without PKCE', () => {
      const { url, codeVerifier } = githubClient.getAuthorizationUrl({
        scope: 'read:user user:email',
        state: 'random-state-123',
      })

      expect(url).toContain('https://github.com/login/oauth/authorize')
      expect(url).toContain('client_id=test-github-client-id')
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fauth%2Fgithub%2Fcallback')
      expect(url).toContain('scope=read%3Auser+user%3Aemail')
      expect(url).toContain('state=random-state-123')
      expect(url).not.toContain('code_challenge')
      expect(codeVerifier).toBeUndefined()
    })

    it('should exchange authorization code for tokens', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'github-access-token-123',
          token_type: 'bearer',
          scope: 'read:user,user:email',
        }),
      })

      const tokens = await githubClient.exchangeCodeForToken({
        code: 'auth-code-123',
      })

      expect(tokens.accessToken).toBe('github-access-token-123')
      expect(tokens.tokenType).toBe('bearer')
      expect(tokens.scope).toBe('read:user,user:email')
      expect(tokens.refreshToken).toBeUndefined() // GitHub doesn't support refresh tokens
    })

    it('should fetch user profile', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 12345,
          login: 'johndoe',
          name: 'John Doe',
          email: 'john@example.com',
          avatar_url: 'https://github.com/avatar.jpg',
          bio: 'Software Developer',
          location: 'San Francisco',
          company: 'Example Corp',
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            email: 'john@example.com',
            primary: true,
            verified: true,
          },
        ]),
      })

      const profile = await githubClient.getUserProfile('github-access-token-123')

      expect(profile.provider).toBe('github')
      expect(profile.providerId).toBe('12345')
      expect(profile.email).toBe('john@example.com')
      expect(profile.emailVerified).toBe(true)
      expect(profile.name).toBe('John Doe')
      expect(profile.username).toBe('johndoe')
      expect(profile.picture).toBe('https://github.com/avatar.jpg')
    })

    it('should not support token refresh', async () => {
      await expect(
        githubClient.refreshToken('any-token')
      ).rejects.toThrow('GitHub does not support token refresh')
    })

    it('should revoke token via deletion', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      })

      await expect(
        githubClient.revokeToken('github-access-token-123')
      ).resolves.not.toThrow()
    })
  })

  describe('Microsoft OAuth Client', () => {
    let microsoftClient: MicrosoftOAuthClient

    beforeEach(() => {
      microsoftClient = new MicrosoftOAuthClient({
        clientId: 'test-microsoft-client-id',
        clientSecret: 'test-microsoft-client-secret',
        redirectUri: 'https://example.com/auth/microsoft/callback',
        tenant: 'common',
      })
    })

    it('should generate authorization URL with PKCE and tenant', () => {
      const { url, codeVerifier } = microsoftClient.getAuthorizationUrl({
        scope: 'openid profile email User.Read',
        state: 'random-state-123',
      })

      expect(url).toContain('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
      expect(url).toContain('client_id=test-microsoft-client-id')
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fauth%2Fmicrosoft%2Fcallback')
      expect(url).toContain('scope=openid+profile+email+User.Read')
      expect(url).toContain('state=random-state-123')
      expect(url).toContain('code_challenge=')
      expect(url).toContain('code_challenge_method=S256')
      expect(codeVerifier).toBeDefined()
    })

    it('should support custom tenant configuration', () => {
      const tenantClient = new MicrosoftOAuthClient({
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        redirectUri: 'https://example.com/callback',
        tenant: 'contoso.onmicrosoft.com',
      })

      const { url } = tenantClient.getAuthorizationUrl({
        scope: 'openid',
        state: 'state-123',
      })

      expect(url).toContain('login.microsoftonline.com/contoso.onmicrosoft.com')
    })

    it('should exchange authorization code for tokens', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'microsoft-access-token-123',
          refresh_token: 'microsoft-refresh-token-456',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'openid profile email User.Read',
          id_token: 'microsoft-id-token-789',
        }),
      })

      const tokens = await microsoftClient.exchangeCodeForToken({
        code: 'auth-code-123',
        codeVerifier: 'test-code-verifier',
      })

      expect(tokens.accessToken).toBe('microsoft-access-token-123')
      expect(tokens.refreshToken).toBe('microsoft-refresh-token-456')
      expect(tokens.expiresIn).toBe(3600)
      expect(tokens.idToken).toBe('microsoft-id-token-789')
    })

    it('should fetch user profile from Microsoft Graph', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'microsoft-user-123',
          userPrincipalName: 'john@contoso.com',
          mail: 'john@contoso.com',
          displayName: 'John Doe',
          givenName: 'John',
          surname: 'Doe',
          jobTitle: 'Software Engineer',
          officeLocation: 'Seattle',
        }),
      })

      const profile = await microsoftClient.getUserProfile('microsoft-access-token-123')

      expect(profile.provider).toBe('microsoft')
      expect(profile.providerId).toBe('microsoft-user-123')
      expect(profile.email).toBe('john@contoso.com')
      expect(profile.name).toBe('John Doe')
      expect(profile.firstName).toBe('John')
      expect(profile.lastName).toBe('Doe')
    })

    it('should refresh access token', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-microsoft-access-token',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      })

      const tokens = await microsoftClient.refreshToken('microsoft-refresh-token-456')

      expect(tokens.accessToken).toBe('new-microsoft-access-token')
      expect(tokens.expiresIn).toBe(3600)
    })
  })

  describe('Social Login Service', () => {
    let socialService: SocialLoginService
    let googleClient: GoogleOAuthClient
    let githubClient: GitHubOAuthClient
    let microsoftClient: MicrosoftOAuthClient

    beforeEach(() => {
      googleClient = new GoogleOAuthClient({
        clientId: 'test-google-client-id',
        clientSecret: 'test-google-client-secret',
        redirectUri: 'https://example.com/auth/google/callback',
      })

      githubClient = new GitHubOAuthClient({
        clientId: 'test-github-client-id',
        clientSecret: 'test-github-client-secret',
        redirectUri: 'https://example.com/auth/github/callback',
      })

      microsoftClient = new MicrosoftOAuthClient({
        clientId: 'test-microsoft-client-id',
        clientSecret: 'test-microsoft-client-secret',
        redirectUri: 'https://example.com/auth/microsoft/callback',
      })

      socialService = new SocialLoginService({
        providers: {
          google: googleClient,
          github: githubClient,
          microsoft: microsoftClient,
        },
        accountLinkingStrategy: 'single',
      })
    })

    describe('Account Linking', () => {
      it('should link a social account to a user', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
          picture: 'https://example.com/photo.jpg',
        }

        const linkedAccount = await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        })

        expect(linkedAccount.userId).toBe('user-123')
        expect(linkedAccount.provider).toBe('google')
        expect(linkedAccount.providerId).toBe('google-user-123')
        expect(linkedAccount.email).toBe('user@example.com')
        expect(linkedAccount.accessToken).toBe('access-token')
        expect(linkedAccount.refreshToken).toBe('refresh-token')
      })

      it('should prevent duplicate account linking with single strategy', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'access-token-1',
          expiresIn: 3600,
        })

        // Try to link same account to different user
        await expect(
          socialService.linkAccount('user-456', mockProfile, {
            accessToken: 'access-token-2',
            expiresIn: 3600,
          })
        ).rejects.toThrow('Social account already linked to another user')
      })

      it('should allow multiple accounts with multiple linking strategy', async () => {
        const multiService = new SocialLoginService({
          providers: { google: googleClient },
          accountLinkingStrategy: 'multiple',
        })

        const profile1: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user1@example.com',
          emailVerified: true,
          name: 'User One',
        }

        const profile2: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-456',
          email: 'user2@example.com',
          emailVerified: true,
          name: 'User Two',
        }

        await multiService.linkAccount('user-123', profile1, {
          accessToken: 'token-1',
          expiresIn: 3600,
        })

        await expect(
          multiService.linkAccount('user-123', profile2, {
            accessToken: 'token-2',
            expiresIn: 3600,
          })
        ).resolves.toBeDefined()
      })

      it('should unlink a social account', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'access-token',
          expiresIn: 3600,
        })

        await socialService.unlinkAccount('user-123', 'google')

        const linkedAccounts = socialService.getLinkedAccounts('user-123')
        expect(linkedAccounts).toHaveLength(0)
      })

      it('should retrieve all linked accounts for a user', async () => {
        const googleProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        const githubProfile: SocialProfile = {
          provider: 'github',
          providerId: '12345',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
          username: 'johndoe',
        }

        await socialService.linkAccount('user-123', googleProfile, {
          accessToken: 'google-token',
          expiresIn: 3600,
        })

        await socialService.linkAccount('user-123', githubProfile, {
          accessToken: 'github-token',
          expiresIn: 3600,
        })

        const linkedAccounts = socialService.getLinkedAccounts('user-123')
        expect(linkedAccounts).toHaveLength(2)
        expect(linkedAccounts[0].provider).toBe('google')
        expect(linkedAccounts[1].provider).toBe('github')
      })

      it('should find user by social account', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'access-token',
          expiresIn: 3600,
        })

        const userId = socialService.findUserByProvider('google', 'google-user-123')
        expect(userId).toBe('user-123')
      })
    })

    describe('Profile Synchronization', () => {
      it('should sync profile from social provider', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
          picture: 'https://example.com/photo.jpg',
        }

        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        })

        // Mock updated profile from provider
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            sub: 'google-user-123',
            email: 'newemail@example.com',
            email_verified: true,
            name: 'John Updated Doe',
            picture: 'https://example.com/new-photo.jpg',
          }),
        })

        const updatedProfile = await socialService.syncProfile('user-123', 'google')

        expect(updatedProfile.email).toBe('newemail@example.com')
        expect(updatedProfile.name).toBe('John Updated Doe')
        expect(updatedProfile.picture).toBe('https://example.com/new-photo.jpg')
      })

      it('should refresh token before syncing if expired', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        // Link with short expiry
        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'old-access-token',
          refreshToken: 'refresh-token',
          expiresIn: 1, // 1 second
        })

        // Wait for token to expire
        await new Promise((resolve) => setTimeout(resolve, 1100))

        // Mock token refresh
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              access_token: 'new-access-token',
              expires_in: 3600,
            }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              sub: 'google-user-123',
              email: 'user@example.com',
              email_verified: true,
              name: 'John Doe',
            }),
          })

        await socialService.syncProfile('user-123', 'google')

        expect(fetch).toHaveBeenCalledTimes(2)
      })
    })

    describe('Token Management', () => {
      it('should get valid access token', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        })

        const token = await socialService.getAccessToken('user-123', 'google')
        expect(token).toBe('access-token')
      })

      it('should refresh expired access token', async () => {
        const mockProfile: SocialProfile = {
          provider: 'google',
          providerId: 'google-user-123',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'old-access-token',
          refreshToken: 'refresh-token',
          expiresIn: 1,
        })

        // Wait for expiration
        await new Promise((resolve) => setTimeout(resolve, 1100))

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            access_token: 'new-access-token',
            expires_in: 3600,
          }),
        })

        const token = await socialService.getAccessToken('user-123', 'google')
        expect(token).toBe('new-access-token')
      })

      it('should throw error if refresh token is missing', async () => {
        const mockProfile: SocialProfile = {
          provider: 'github',
          providerId: '12345',
          email: 'user@example.com',
          emailVerified: true,
          name: 'John Doe',
        }

        await socialService.linkAccount('user-123', mockProfile, {
          accessToken: 'github-token',
          expiresIn: 1,
        })

        await new Promise((resolve) => setTimeout(resolve, 1100))

        await expect(
          socialService.getAccessToken('user-123', 'github')
        ).rejects.toThrow('Token expired and no refresh token available')
      })
    })

    describe('Complete Social Login Flow', () => {
      it('should complete end-to-end Google login flow', async () => {
        // Step 1: Generate authorization URL
        const { url, codeVerifier } = googleClient.getAuthorizationUrl({
          scope: 'openid profile email',
          state: 'random-state',
        })

        expect(url).toContain('accounts.google.com')
        expect(codeVerifier).toBeDefined()

        // Step 2: Exchange code for tokens
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              access_token: 'google-access-token',
              refresh_token: 'google-refresh-token',
              expires_in: 3600,
              id_token: 'google-id-token',
            }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              sub: 'google-user-123',
              email: 'user@example.com',
              email_verified: true,
              name: 'John Doe',
              picture: 'https://example.com/photo.jpg',
            }),
          })

        const tokens = await googleClient.exchangeCodeForToken({
          code: 'auth-code',
          codeVerifier,
        })

        // Step 3: Get user profile
        const profile = await googleClient.getUserProfile(tokens.accessToken)

        // Step 4: Link account
        const linkedAccount = await socialService.linkAccount('user-123', profile, tokens)

        expect(linkedAccount.provider).toBe('google')
        expect(linkedAccount.email).toBe('user@example.com')
        expect(linkedAccount.accessToken).toBe('google-access-token')
      })
    })
  })
})
