/**
 * useAuth Hook
 * Custom hook for accessing authentication context
 */

import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import type { AuthContextValue } from '../types/auth'

/**
 * Hook to access authentication context
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user } = useAuth()
  return user
}

/**
 * Hook to require authentication
 * Can be used at component level to ensure user is authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()

  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && !isLoading,
  }
}
