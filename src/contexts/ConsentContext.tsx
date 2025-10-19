/**
 * ConsentContext - Global state management for cookie consent
 * Follows the same pattern as AuthContext with reducer-based state management
 */

import { createContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { ConsentPreferences, ConsentState } from '../types/consent'
import { DEFAULT_CONSENT_PREFERENCES } from '../types/consent'
import { consentStorage } from '../utils/consentStorage'

// Action types
type ConsentAction =
  | { type: 'CONSENT_LOADED'; payload: { preferences: ConsentPreferences; timestamp: number } }
  | { type: 'CONSENT_UPDATED'; payload: ConsentPreferences }
  | { type: 'CONSENT_CLEARED' }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' }

// Context value interface
interface ConsentContextValue extends ConsentState {
  acceptAll: () => void
  rejectAll: () => void
  updatePreferences: (preferences: ConsentPreferences) => void
  clearConsent: () => void
  showBanner: boolean
}

const initialState: ConsentState = {
  preferences: null,
  timestamp: null,
  hasConsented: false,
  isLoading: true,
}

// Reducer
function consentReducer(state: ConsentState, action: ConsentAction): ConsentState {
  switch (action.type) {
    case 'LOADING_START':
      return { ...state, isLoading: true }

    case 'LOADING_END':
      return { ...state, isLoading: false }

    case 'CONSENT_LOADED':
      return {
        ...state,
        preferences: action.payload.preferences,
        timestamp: action.payload.timestamp,
        hasConsented: true,
        isLoading: false,
      }

    case 'CONSENT_UPDATED':
      return {
        ...state,
        preferences: action.payload,
        timestamp: Date.now(),
        hasConsented: true,
      }

    case 'CONSENT_CLEARED':
      return {
        ...state,
        preferences: null,
        timestamp: null,
        hasConsented: false,
      }

    default:
      return state
  }
}

// Create context
export const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

// Provider component
interface ConsentProviderProps {
  children: ReactNode
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  const [state, dispatch] = useReducer(consentReducer, initialState)

  // Load consent from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'LOADING_START' })

    const storedConsent = consentStorage.getConsent()
    if (storedConsent) {
      dispatch({
        type: 'CONSENT_LOADED',
        payload: {
          preferences: storedConsent.preferences,
          timestamp: storedConsent.timestamp,
        },
      })
    } else {
      dispatch({ type: 'LOADING_END' })
    }
  }, [])

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const preferences: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    consentStorage.setConsent(preferences)
    dispatch({ type: 'CONSENT_UPDATED', payload: preferences })
  }, [])

  // Reject all non-necessary cookies
  const rejectAll = useCallback(() => {
    const preferences: ConsentPreferences = {
      ...DEFAULT_CONSENT_PREFERENCES,
    }
    consentStorage.setConsent(preferences)
    dispatch({ type: 'CONSENT_UPDATED', payload: preferences })
  }, [])

  // Update specific preferences
  const updatePreferences = useCallback((preferences: ConsentPreferences) => {
    // Ensure necessary cookies are always true
    const sanitizedPreferences = {
      ...preferences,
      necessary: true,
    }
    consentStorage.setConsent(sanitizedPreferences)
    dispatch({ type: 'CONSENT_UPDATED', payload: sanitizedPreferences })
  }, [])

  // Clear consent (for testing/debugging)
  const clearConsent = useCallback(() => {
    consentStorage.clearConsent()
    dispatch({ type: 'CONSENT_CLEARED' })
  }, [])

  // Show banner if user hasn't consented
  const showBanner = !state.hasConsented && !state.isLoading

  const value: ConsentContextValue = {
    ...state,
    acceptAll,
    rejectAll,
    updatePreferences,
    clearConsent,
    showBanner,
  }

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}
