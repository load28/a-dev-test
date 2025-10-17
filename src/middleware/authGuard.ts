/**
 * Authentication Guard Middleware
 * Protects routes by checking authentication status and redirecting unauthorized users
 */

import { redirect } from '@tanstack/react-router'
import { tokenStorage } from '../utils/tokenStorage'
import type { AuthTokens } from '../types/auth'

/**
 * Auth Guard Options
 */
export interface AuthGuardOptions {
  /**
   * Redirect path for unauthenticated users
   * @default '/login'
   */
  redirectTo?: string

  /**
   * Whether to include the current path as redirect parameter
   * @default true
   */
  includeRedirectParam?: boolean

  /**
   * Custom authentication check function
   * If provided, this will be used instead of the default token check
   */
  customAuthCheck?: () => boolean | Promise<boolean>
}

/**
 * Check if user is authenticated by verifying tokens
 * @returns true if user has valid tokens
 */
export function isAuthenticated(): boolean {
  const tokens = tokenStorage.getTokens()

  if (!tokens) {
    return false
  }

  // Check if token is expired
  if (tokenStorage.isTokenExpired()) {
    return false
  }

  return true
}

/**
 * Check if user has valid tokens and user data
 * @returns true if user is fully authenticated with valid session
 */
export function hasValidSession(): boolean {
  const tokens = tokenStorage.getTokens()
  const user = tokenStorage.getUser()

  if (!tokens || !user) {
    return false
  }

  // Check if token is expired
  if (tokenStorage.isTokenExpired()) {
    return false
  }

  return true
}

/**
 * Auth Guard Middleware
 * Use this in route configuration to protect routes
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: authGuard(),
 *   component: DashboardPage,
 * })
 * ```
 *
 * @example With custom options
 * ```ts
 * export const Route = createFileRoute('/admin')({
 *   beforeLoad: authGuard({ redirectTo: '/login', includeRedirectParam: true }),
 *   component: AdminPage,
 * })
 * ```
 */
export function authGuard(options: AuthGuardOptions = {}) {
  const {
    redirectTo = '/login',
    includeRedirectParam = true,
    customAuthCheck,
  } = options

  return async ({ location }: { location: { pathname: string; search: Record<string, unknown> } }) => {
    // Use custom auth check if provided
    const authenticated = customAuthCheck
      ? await customAuthCheck()
      : hasValidSession()

    if (!authenticated) {
      // Build redirect URL with optional redirect parameter
      const searchParams: Record<string, unknown> = {}

      if (includeRedirectParam) {
        searchParams.redirect = location.pathname
      }

      // Throw redirect to login page
      throw redirect({
        to: redirectTo,
        search: searchParams,
      })
    }

    // User is authenticated, allow access
    return undefined
  }
}

/**
 * Guest Guard Middleware
 * Redirects authenticated users away from guest-only pages (e.g., login, register)
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/login')({
 *   beforeLoad: guestGuard(),
 *   component: LoginPage,
 * })
 * ```
 *
 * @param redirectTo - Where to redirect authenticated users (default: '/dashboard')
 */
export function guestGuard(redirectTo: string = '/dashboard') {
  return async () => {
    const authenticated = hasValidSession()

    if (authenticated) {
      // User is authenticated, redirect to dashboard or specified page
      throw redirect({
        to: redirectTo,
      })
    }

    // User is not authenticated, allow access to guest page
    return undefined
  }
}

/**
 * Role-based Auth Guard
 * Checks if user has required role(s) before allowing access
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/admin')({
 *   beforeLoad: roleGuard(['admin']),
 *   component: AdminPage,
 * })
 * ```
 *
 * @param requiredRoles - Array of required role names
 * @param options - Additional guard options
 */
export function roleGuard(
  requiredRoles: string[],
  options: AuthGuardOptions = {}
) {
  const { redirectTo = '/dashboard' } = options

  return async ({ location }: { location: { pathname: string } }) => {
    // First check if user is authenticated
    if (!hasValidSession()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname },
      })
    }

    // Get user data and check roles
    const user = tokenStorage.getUser<{ roles?: string[] }>()
    const userRoles = user?.roles || []

    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to dashboard
      throw redirect({
        to: redirectTo,
      })
    }

    return undefined
  }
}

/**
 * Permission-based Auth Guard
 * Checks if user has required permission(s) before allowing access
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/users/edit')({
 *   beforeLoad: permissionGuard(['users.edit']),
 *   component: EditUserPage,
 * })
 * ```
 *
 * @param requiredPermissions - Array of required permission names
 * @param options - Additional guard options
 */
export function permissionGuard(
  requiredPermissions: string[],
  options: AuthGuardOptions = {}
) {
  const { redirectTo = '/dashboard' } = options

  return async ({ location }: { location: { pathname: string } }) => {
    // First check if user is authenticated
    if (!hasValidSession()) {
      throw redirect({
        to: '/login',
        search: { redirect: location.pathname },
      })
    }

    // Get user data and check permissions
    const user = tokenStorage.getUser<{ permissions?: string[] }>()
    const userPermissions = user?.permissions || []

    const hasRequiredPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )

    if (!hasRequiredPermission) {
      // User doesn't have required permission, redirect to dashboard
      throw redirect({
        to: redirectTo,
      })
    }

    return undefined
  }
}

/**
 * Composite Auth Guard
 * Combines multiple auth checks
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/admin/users')({
 *   beforeLoad: compositeGuard([
 *     authGuard(),
 *     roleGuard(['admin']),
 *     permissionGuard(['users.manage'])
 *   ]),
 *   component: AdminUsersPage,
 * })
 * ```
 */
export function compositeGuard(guards: Array<ReturnType<typeof authGuard>>) {
  return async (context: { location: { pathname: string; search: Record<string, unknown> } }) => {
    for (const guard of guards) {
      await guard(context)
    }
    return undefined
  }
}

/**
 * Utility: Clear authentication data
 * Useful for logout operations or when tokens become invalid
 */
export function clearAuth(): void {
  tokenStorage.clear()
}

/**
 * Utility: Get authentication status
 * Returns comprehensive authentication information
 */
export function getAuthStatus(): {
  isAuthenticated: boolean
  hasValidSession: boolean
  tokens: AuthTokens | null
  user: unknown | null
  isExpired: boolean
} {
  const tokens = tokenStorage.getTokens()
  const user = tokenStorage.getUser()
  const isExpired = tokenStorage.isTokenExpired()

  return {
    isAuthenticated: isAuthenticated(),
    hasValidSession: hasValidSession(),
    tokens,
    user,
    isExpired,
  }
}
