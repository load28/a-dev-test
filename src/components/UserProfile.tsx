import { useState, useEffect } from 'react'
import { User } from '@/types/auth'

interface UserProfileProps {
  userId?: string
  initialData?: User | null
  onError?: (error: Error) => void
}

interface UserProfileState {
  user: User | null
  loading: boolean
  error: Error | null
}

export function UserProfile({
  userId,
  initialData = null,
  onError
}: UserProfileProps) {
  const [state, setState] = useState<UserProfileState>({
    user: initialData,
    loading: !initialData,
    error: null
  })

  useEffect(() => {
    // If initial data is provided, no need to fetch
    if (initialData) {
      setState({ user: initialData, loading: false, error: null })
      return
    }

    // Simulate data fetching (replace with actual API call)
    const fetchUserProfile = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/users/${userId}`)
        // const data = await response.json()

        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock data for demonstration
        const mockUser: User = {
          id: userId || '1',
          email: 'user@example.com',
          name: 'John Doe',
          picture: 'https://via.placeholder.com/150',
          givenName: 'John',
          familyName: 'Doe',
          locale: 'en',
          emailVerified: true
        }

        setState({ user: mockUser, loading: false, error: null })
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load user profile')
        setState({ user: null, loading: false, error: err })
        onError?.(err)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId, initialData, onError])

  // Loading state
  if (state.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile image skeleton */}
              <div className="w-32 h-32 bg-gray-300 rounded-full flex-shrink-0"></div>

              {/* Content skeleton */}
              <div className="flex-1 w-full space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto md:mx-0"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto md:mx-0"></div>
                <div className="space-y-3 pt-4">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (state.error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Profile
            </h3>
            <p className="text-gray-600 mb-6">{state.error.message}</p>
            <button
              onClick={() => {
                setState(prev => ({ ...prev, loading: true, error: null }))
                // Retry logic would trigger useEffect
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No user data
  if (!state.user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
          <div className="text-center text-gray-600">
            <p>No user data available</p>
          </div>
        </div>
      </div>
    )
  }

  // Success state - Display user profile
  const { user } = state

  return (
    <div className="flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with gradient background */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Profile content */}
        <div className="px-6 sm:px-8 pb-8">
          {/* Profile image - overlapping the header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 gap-6">
            <div className="relative">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={`${user.name}'s profile`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=random`
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Verified badge */}
              {user.emailVerified && (
                <div
                  className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                  title="Verified"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* User name and title */}
            <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0 sm:mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user.name}
              </h1>
              {(user.givenName || user.familyName) && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.givenName} {user.familyName}
                </p>
              )}
            </div>
          </div>

          {/* User details */}
          <div className="mt-8 space-y-4">
            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-gray-900 font-mono text-sm truncate">{user.id}</p>
                </div>
              </div>
            </div>

            {/* Locale */}
            {user.locale && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Locale</p>
                    <p className="text-gray-900 font-medium">{user.locale.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Verification status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  user.emailVerified ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {user.emailVerified ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Email Verification</p>
                  <p className={`font-medium ${
                    user.emailVerified ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
