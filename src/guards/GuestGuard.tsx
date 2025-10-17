/**
 * Guest Guard Component
 * Protects routes by checking authentication status
 * - Unauthenticated users: redirected to /guest-booking
 * - Authenticated users: can access the protected content
 */

import { type ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface GuestGuardProps {
  children: ReactNode
}

/**
 * GuestGuard Component
 * Redirects unauthenticated users to guest booking page
 * Allows authenticated users to access protected content
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Wait for authentication state to be determined
    if (isLoading) {
      return
    }

    // If user is not authenticated, redirect to guest booking page
    if (!isAuthenticated) {
      // Save the attempted location for potential redirect after login
      navigate('/guest-booking', {
        replace: true,
        state: { from: location.pathname },
      })
    }
  }, [isAuthenticated, isLoading, navigate, location])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // User is authenticated, render protected content
  return <>{children}</>
}
