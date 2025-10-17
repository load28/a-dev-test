/**
 * Authentication Context
 * Enterprise-grade authentication state management
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import type { AuthContextValue, AuthState, User, AuthTokens } from '../types/auth'
import { AuthError } from '../types/auth'
import { authService } from '../services/authService'
import { mockAuthService } from '../services/mockAuthService'
import { tokenStorage } from '../utils/tokenStorage'
import { USE_MOCK_AUTH } from '../config/auth.config'

// Select service based on configuration
const service = USE_MOCK_AUTH ? mockAuthService : authService

// Initial authentication state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Auth action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_REFRESH'; payload: { accessToken: string; expiresAt: number } }
  | { type: 'CLEAR_ERROR' }

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      }
    case 'AUTH_REFRESH':
      return {
        ...state,
        tokens: state.tokens
          ? {
              ...state.tokens,
              accessToken: action.payload.accessToken,
              expiresAt: action.payload.expiresAt,
            }
          : null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Create context with undefined default (will be provided by provider)
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication Provider Component
 * Manages global authentication state and operations
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const refreshTimeoutRef = useRef<number | null>(null)

  /**
   * Schedule automatic token refresh
   */
  const scheduleTokenRefresh = useCallback((expiresAt: number) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    // Calculate when to refresh (5 minutes before expiration)
    const now = Date.now()
    const timeUntilRefresh = expiresAt - now - 5 * 60 * 1000

    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = window.setTimeout(() => {
        refreshAuth()
      }, timeUntilRefresh)
    }
  }, [])

  /**
   * Login with Google credential
   */
  const login = useCallback(async (credential: string) => {
    dispatch({ type: 'AUTH_START' })

    try {
      const response = await service.loginWithGoogle(credential)

      // Store tokens and user data
      tokenStorage.setTokens(response.tokens)
      tokenStorage.setUser(response.user)

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens: response.tokens,
        },
      })

      // Schedule token refresh
      scheduleTokenRefresh(response.tokens.expiresAt)
    } catch (error) {
      const message =
        error instanceof AuthError ? error.message : 'Failed to login. Please try again.'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }, [scheduleTokenRefresh])

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      const accessToken = tokenStorage.getAccessToken()
      if (accessToken) {
        await service.logout(accessToken)
      }
    } finally {
      // Clear tokens and user data
      tokenStorage.clear()

      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }, [])

  /**
   * Refresh authentication token
   */
  const refreshAuth = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()

    if (!refreshToken) {
      await logout()
      return
    }

    try {
      const response = await service.refreshToken(refreshToken)

      // Update access token
      tokenStorage.updateAccessToken(response.accessToken, response.expiresAt)

      dispatch({
        type: 'AUTH_REFRESH',
        payload: {
          accessToken: response.accessToken,
          expiresAt: response.expiresAt,
        },
      })

      // Schedule next refresh
      scheduleTokenRefresh(response.expiresAt)
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
    }
  }, [logout, scheduleTokenRefresh])

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const tokens = tokenStorage.getTokens()
      const user = tokenStorage.getUser<User>()

      if (!tokens || !user) {
        dispatch({ type: 'AUTH_LOGOUT' })
        return
      }

      // Check if token is expired
      if (tokenStorage.isTokenExpired()) {
        await refreshAuth()
        return
      }

      // Verify token with backend
      try {
        const verifiedUser = await service.verifyToken(tokens.accessToken)

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: verifiedUser,
            tokens,
          },
        })

        // Schedule token refresh
        scheduleTokenRefresh(tokens.expiresAt)
      } catch (error) {
        console.error('Token verification failed:', error)
        await logout()
      }
    }

    initAuth()

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  /**
   * Memoized context value
   */
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshAuth,
      clearError,
    }),
    [state, login, logout, refreshAuth, clearError]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
