/**
 * Protected Route Component
 * Restricts access to authenticated users only
 */

import { Navigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || <LoadingScreen />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Store the attempted location for redirect after login
    return <Navigate to="/login" search={{ redirect: location.pathname }} replace />
  }

  // Render children if authenticated
  return <>{children}</>
}

/**
 * Default loading screen component
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Guest Route Component
 * Redirects to dashboard if user is already authenticated
 * Useful for login/register pages
 */
interface GuestRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function GuestRoute({ children, redirectTo = '/dashboard' }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingScreen />
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Render children if not authenticated
  return <>{children}</>
}
