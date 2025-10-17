/**
 * Login Page
 * Enterprise-grade login UI with Google OAuth
 */

import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import { GuestRoute } from '../components/auth/ProtectedRoute'
import { guestOnly } from '../middleware/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: guestOnly,
  component: LoginPage,
})

function LoginPage() {
  return (
    <GuestRoute>
      <LoginContent />
    </GuestRoute>
  )
}

function LoginContent() {
  const { login, error, isLoading, clearError } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' })
  const redirectPath = (search as { redirect?: string })?.redirect || '/dashboard'

  // Clear error on mount
  useEffect(() => {
    clearError()
  }, [clearError])

  /**
   * Handle successful Google login
   */
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('No credential received from Google')
      return
    }

    try {
      await login(credentialResponse.credential)
      // Redirect to the intended page or dashboard
      navigate({ to: redirectPath })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  /**
   * Handle Google login error
   */
  const handleGoogleError = () => {
    console.error('Google login failed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="inline-flex text-red-400 hover:text-red-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Login Button */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full flex justify-center">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Signing in...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                width="300"
              />
            )}
          </div>

          {/* Divider */}
          <div className="w-full flex items-center justify-center">
            <div className="border-t border-gray-300 flex-grow mr-3"></div>
            <span className="text-gray-500 text-sm">Secure Authentication</span>
            <div className="border-t border-gray-300 flex-grow ml-3"></div>
          </div>

          {/* Info */}
          <div className="text-center text-xs text-gray-500">
            <p>By signing in, you agree to our</p>
            <p>
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center items-center space-x-2 text-gray-500 text-xs">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Enterprise-grade security</span>
        </div>
      </div>
    </div>
  )
}
