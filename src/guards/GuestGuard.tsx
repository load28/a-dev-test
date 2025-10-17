/**
 * GuestGuard Component
 * Route guard that redirects authenticated users to the landing page
 * Only allows access to guest (non-authenticated) users
 */

import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface GuestGuardProps {
  children: ReactNode
}

/**
 * Guard component for guest-only routes (e.g., login, register)
 * Redirects authenticated users to the landing page
 * Shows loading state while checking authentication status
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state while authentication is being verified
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect authenticated users to landing page
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Allow guest users to access the protected content
  return <>{children}</>
}
