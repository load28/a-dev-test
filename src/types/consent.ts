/**
 * Cookie consent types for GDPR/privacy compliance
 */

export interface ConsentPreferences {
  necessary: boolean // Always true - required for site functionality
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export interface ConsentState {
  preferences: ConsentPreferences | null
  timestamp: number | null
  hasConsented: boolean
  isLoading: boolean
}

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
}
