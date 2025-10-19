import { useState, useEffect } from 'react'
import { User } from '@/types/auth'

interface UserDetailProps {
  userId?: string
  initialData?: User | null
  onError?: (error: Error) => void
  onUserLoad?: (user: User) => void
}

interface UserDetailState {
  user: User | null
  loading: boolean
  error: Error | null
}

/**
 * Mock API call to fetch user details
 * In production, replace this with actual API endpoint
 */
const fetchUserFromApi = async (userId: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Mock user data - replace with actual API call
  // const response = await fetch(`/api/users/${userId}`)
  // if (!response.ok) throw new Error('Failed to fetch user')
  // return response.json()

  // Simulate random error for testing error handling
  if (Math.random() < 0.1) {
    throw new Error('Network error: Failed to fetch user data')
  }

  const mockUser: User = {
    id: userId,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    picture: `https://i.pravatar.cc/150?img=${userId.length % 70}`,
    givenName: 'John',
    familyName: 'Doe',
    locale: 'ko',
    emailVerified: userId.length % 2 === 0
  }

  return mockUser
}

export function UserDetail({
  userId,
  initialData = null,
  onError,
  onUserLoad
}: UserDetailProps) {
  const [state, setState] = useState<UserDetailState>({
    user: initialData,
    loading: !initialData && !!userId,
    error: null
  })

  useEffect(() => {
    // If initial data is provided, use it
    if (initialData) {
      setState({ user: initialData, loading: false, error: null })
      onUserLoad?.(initialData)
      return
    }

    // No userId provided, nothing to fetch
    if (!userId) {
      setState({ user: null, loading: false, error: null })
      return
    }

    // Fetch user data from API
    const loadUserData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const userData = await fetchUserFromApi(userId)
        setState({ user: userData, loading: false, error: null })
        onUserLoad?.(userData)
      } catch (error) {
        const err = error instanceof Error
          ? error
          : new Error('Failed to load user details')
        setState({ user: null, loading: false, error: err })
        onError?.(err)
      }
    }

    loadUserData()
  }, [userId, initialData, onError, onUserLoad])

  // Loading state
  if (state.loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-400"></div>

            <div className="p-8">
              {/* Avatar skeleton */}
              <div className="flex items-start gap-6 -mt-20">
                <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white flex-shrink-0"></div>
                <div className="flex-1 mt-16 space-y-3">
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>

              {/* Details skeleton */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-5 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
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
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center max-w-md mx-auto">
            {/* Error icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-red-600"
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

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load User Details
            </h2>
            <p className="text-gray-600 mb-6">{state.error.message}</p>

            <button
              onClick={() => {
                if (userId) {
                  setState(prev => ({ ...prev, loading: true, error: null }))
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-lg">No user selected</p>
            <p className="text-sm text-gray-400 mt-1">Please select a user to view details</p>
          </div>
        </div>
      </div>
    )
  }

  // Success state - Display user details
  const { user } = state

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with gradient background */}
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
        </div>

        {/* Profile content */}
        <div className="px-8 pb-8">
          {/* Profile header */}
          <div className="flex flex-col md:flex-row items-start gap-6 -mt-20">
            {/* Profile image */}
            <div className="relative flex-shrink-0">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={`${user.name}'s profile`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=random`
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Verified badge */}
              {user.emailVerified && (
                <div
                  className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
                  title="Verified User"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex-1 mt-0 md:mt-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {user.name}
              </h1>
              {(user.givenName || user.familyName) && (
                <p className="text-lg text-gray-500">
                  {user.givenName} {user.familyName}
                </p>
              )}
            </div>
          </div>

          {/* User details grid */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Email Address</p>
                    <p className="text-gray-900 font-medium truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* User ID */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-1">User ID</p>
                    <p className="text-gray-900 font-mono text-sm truncate">{user.id}</p>
                  </div>
                </div>
              </div>

              {/* Locale */}
              {user.locale && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Language / Locale</p>
                      <p className="text-gray-900 font-medium">{user.locale.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className={`p-4 rounded-lg border hover:shadow-md transition-shadow ${
                user.emailVerified
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow ${
                    user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}>
                    {user.emailVerified ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                      user.emailVerified ? 'text-emerald-700' : 'text-amber-700'
                    }`}>Verification Status</p>
                    <p className={`font-semibold ${
                      user.emailVerified ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">First Name:</span>
                <span className="font-medium text-gray-900">{user.givenName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Last Name:</span>
                <span className="font-medium text-gray-900">{user.familyName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Account Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Profile Visibility:</span>
                <span className="font-medium text-gray-900">Public</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetail
