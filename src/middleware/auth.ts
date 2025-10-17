/**
 * Authentication Middleware
 * Provides route-level authentication guards and automatic redirects
 */

import { redirect } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { tokenStorage } from '../utils/tokenStorage'
import type { AuthTokens } from '../types/auth'

/**
 * Route configuration for authentication
 */
export interface AuthRouteConfig {
  /** Routes that require authentication */
  protectedRoutes: string[]
  /** Routes that should redirect to dashboard if authenticated */
  guestOnlyRoutes: string[]
  /** Default redirect path for unauthenticated users */
  loginPath: string
  /** Default redirect path for authenticated users */
  defaultAuthenticatedPath: string
}

/**
 * Default authentication route configuration
 */
export const defaultAuthConfig: AuthRouteConfig = {
  protectedRoutes: ['/dashboard'],
  guestOnlyRoutes: ['/login'],
  loginPath: '/login',
  defaultAuthenticatedPath: '/dashboard',
}

/**
 * Check if user is authenticated by verifying token existence and validity
 */
export function isAuthenticated(): boolean {
  const tokens = tokenStorage.getTokens()

  if (!tokens || !tokens.accessToken) {
    return false
  }

  // Check if token is expired
  const now = Date.now()
  if (tokens.expiresAt && tokens.expiresAt < now) {
    // Token expired, clear storage
    tokenStorage.clearTokens()
    return false
  }

  return true
}

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string, config: AuthRouteConfig = defaultAuthConfig): boolean {
  return config.protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * Check if a route is guest-only (should redirect authenticated users)
 */
export function isGuestOnlyRoute(pathname: string, config: AuthRouteConfig = defaultAuthConfig): boolean {
  return config.guestOnlyRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * Authentication middleware for protected routes
 * Use this in route's beforeLoad function to enforce authentication
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: requireAuth,
 *   component: DashboardPage,
 * })
 * ```
 */
export function requireAuth({ location }: { location: { pathname: string; search: Record<string, unknown> } }) {
  const authenticated = isAuthenticated()

  if (!authenticated) {
    // Store the attempted location for redirect after login
    throw redirect({
      to: defaultAuthConfig.loginPath,
      search: {
        redirect: location.pathname,
      },
    })
  }
}

/**
 * Guest-only middleware for routes that should only be accessible to unauthenticated users
 * Redirects authenticated users to dashboard
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/login')({
 *   beforeLoad: guestOnly,
 *   component: LoginPage,
 * })
 * ```
 */
export function guestOnly({ location }: { location: { pathname: string; search: Record<string, unknown> } }) {
  const authenticated = isAuthenticated()

  if (authenticated) {
    // Redirect to dashboard if already authenticated
    const redirectTo = (location.search?.redirect as string) || defaultAuthConfig.defaultAuthenticatedPath
    throw redirect({
      to: redirectTo,
    })
  }
}

/**
 * Create a custom authentication guard with specific configuration
 * Useful when you need custom behavior for specific routes
 *
 * @example
 * ```ts
 * const requireAdmin = createAuthGuard({
 *   onUnauthorized: ({ location }) => {
 *     throw redirect({ to: '/login', search: { redirect: location.pathname } })
 *   },
 *   validate: () => {
 *     const tokens = tokenStorage.getTokens()
 *     return tokens?.user?.role === 'admin'
 *   }
 * })
 * ```
 */
export function createAuthGuard(options: {
  validate: () => boolean
  onUnauthorized: (context: { location: { pathname: string; search: Record<string, unknown> } }) => void
}) {
  return (context: { location: { pathname: string; search: Record<string, unknown> } }) => {
    if (!options.validate()) {
      options.onUnauthorized(context)
    }
  }
}

/**
 * Higher-order function to combine multiple guards
 * Guards are executed in order, and all must pass
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/admin')({
 *   beforeLoad: combineGuards([requireAuth, requireAdmin]),
 *   component: AdminPage,
 * })
 * ```
 */
export function combineGuards(
  guards: Array<(context: { location: { pathname: string; search: Record<string, unknown> } }) => void>
) {
  return (context: { location: { pathname: string; search: Record<string, unknown> } }) => {
    for (const guard of guards) {
      guard(context)
    }
  }
}

/**
 * Utility to get redirect path after login
 * Extracts the redirect parameter from URL search params
 */
export function getRedirectPath(search: Record<string, unknown>): string {
  const redirect = search?.redirect as string
  return redirect && typeof redirect === 'string' ? redirect : defaultAuthConfig.defaultAuthenticatedPath
}

/**
 * Route guard utility for programmatic navigation
 * Can be used outside of route configuration
 *
 * @example
 * ```ts
 * const canAccess = checkRouteAccess('/dashboard')
 * if (!canAccess) {
 *   navigate({ to: '/login' })
 * }
 * ```
 */
export function checkRouteAccess(pathname: string, config: AuthRouteConfig = defaultAuthConfig): {
  canAccess: boolean
  redirectTo?: string
  reason?: 'not-authenticated' | 'already-authenticated'
} {
  const authenticated = isAuthenticated()

  // Check if route requires authentication
  if (isProtectedRoute(pathname, config)) {
    if (!authenticated) {
      return {
        canAccess: false,
        redirectTo: config.loginPath,
        reason: 'not-authenticated',
      }
    }
  }

  // Check if route is guest-only
  if (isGuestOnlyRoute(pathname, config)) {
    if (authenticated) {
      return {
        canAccess: false,
        redirectTo: config.defaultAuthenticatedPath,
        reason: 'already-authenticated',
      }
    }
  }

  return { canAccess: true }
}

/**
 * Export all guards and utilities
 */
export const authMiddleware = {
  requireAuth,
  guestOnly,
  isAuthenticated,
  isProtectedRoute,
  isGuestOnlyRoute,
  createAuthGuard,
  combineGuards,
  getRedirectPath,
  checkRouteAccess,
  config: defaultAuthConfig,
}

export default authMiddleware
