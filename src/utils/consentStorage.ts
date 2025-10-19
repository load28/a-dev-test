/**
 * Singleton service for managing cookie consent preferences in localStorage
 */

import type { ConsentPreferences } from '../types/consent'

const STORAGE_KEY = 'cookie_consent_preferences'

interface StoredConsent {
  preferences: ConsentPreferences
  timestamp: number
}

export class ConsentStorage {
  private static instance: ConsentStorage

  private constructor() {}

  static getInstance(): ConsentStorage {
    if (!ConsentStorage.instance) {
      ConsentStorage.instance = new ConsentStorage()
    }
    return ConsentStorage.instance
  }

  /**
   * Save consent preferences to localStorage
   */
  setConsent(preferences: ConsentPreferences): void {
    try {
      const data: StoredConsent = {
        preferences,
        timestamp: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save consent preferences:', error)
    }
  }

  /**
   * Get consent preferences from localStorage
   */
  getConsent(): StoredConsent | null {
    try {
      const item = localStorage.getItem(STORAGE_KEY)
      if (!item) return null

      const data: StoredConsent = JSON.parse(item)
      return data
    } catch (error) {
      console.error('Failed to retrieve consent preferences:', error)
      return null
    }
  }

  /**
   * Check if user has given consent
   */
  hasConsented(): boolean {
    return this.getConsent() !== null
  }

  /**
   * Clear consent preferences (for testing or reset)
   */
  clearConsent(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear consent preferences:', error)
    }
  }

  /**
   * Check if consent is still valid (optional - implement expiration if needed)
   * For example, you might want to re-ask for consent after 1 year
   */
  isConsentExpired(expirationMonths = 12): boolean {
    const consent = this.getConsent()
    if (!consent) return true

    const now = Date.now()
    const expirationMs = expirationMonths * 30 * 24 * 60 * 60 * 1000
    return now - consent.timestamp > expirationMs
  }
}

export const consentStorage = ConsentStorage.getInstance()
