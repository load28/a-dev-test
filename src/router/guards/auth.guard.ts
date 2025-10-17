/**
 * Authentication Guard
 * Route guard for protecting routes that require authentication
 * Automatically redirects unauthenticated users to the landing page
 */

import { redirect } from '@tanstack/react-router'
import type { LoaderFunctionArgs } from '@tanstack/react-router'
import { getStoredTokens } from '../../utils/tokenStorage'

/**
 * Check if user is authenticated by verifying token existence and expiration
 */
function isAuthenticated(): boolean {
  const tokens = getStoredTokens()

  if (!tokens || !tokens.accessToken) {
    return false
  }

  // Check if token is expired
  const now = Date.now()
  if (tokens.expiresAt && tokens.expiresAt <= now) {
    return false
  }

  return true
}

/**
 * Authentication guard for protected routes
 * Use this in the beforeLoad option of TanStack Router routes
 *
 * @example
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: authGuard,
 *   component: DashboardPage,
 * })
 */
export function authGuard({ location }: LoaderFunctionArgs) {
  const authenticated = isAuthenticated()

  if (!authenticated) {
    // Redirect to landing page (index) with the attempted location for post-login redirect
    throw redirect({
      to: '/',
      search: {
        redirect: location.href,
      },
    })
  }

  return { authenticated: true }
}

/**
 * Guest guard for routes that should only be accessible to non-authenticated users
 * Redirects authenticated users to dashboard
 * Useful for login/register pages
 *
 * @example
 * export const Route = createFileRoute('/login')({
 *   beforeLoad: guestGuard,
 *   component: LoginPage,
 * })
 */
export function guestGuard(_args: LoaderFunctionArgs) {
  const authenticated = isAuthenticated()

  if (authenticated) {
    // Redirect to dashboard if already authenticated
    throw redirect({
      to: '/dashboard',
    })
  }

  return { authenticated: false }
}

/**
 * Optional authentication guard
 * Allows access regardless of authentication status but passes auth state to route
 * Useful for routes that have different behavior based on auth state
 *
 * @example
 * export const Route = createFileRoute('/profile')({
 *   beforeLoad: optionalAuthGuard,
 *   component: ProfilePage,
 * })
 */
export function optionalAuthGuard(_args: LoaderFunctionArgs) {
  const authenticated = isAuthenticated()
  return { authenticated }
}
