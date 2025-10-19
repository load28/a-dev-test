/**
 * Custom hook to access cookie consent context
 * Follows the same pattern as useAuth hook
 */

import { useContext } from 'react'
import { ConsentContext } from '../contexts/ConsentContext'

export function useConsent() {
  const context = useContext(ConsentContext)

  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }

  return context
}
