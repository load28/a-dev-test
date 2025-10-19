/**
 * Cookie Consent Banner Component
 * Displays a GDPR-compliant cookie consent dialog
 */

import { useState } from 'react'
import { useConsent } from '../../hooks/useConsent'
import type { ConsentPreferences } from '../../types/consent'

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, updatePreferences } = useConsent()
  const [showDetails, setShowDetails] = useState(false)
  const [customPreferences, setCustomPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  })

  // Don't render if banner shouldn't be shown
  if (!showBanner) {
    return null
  }

  const handleToggle = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return // Can't disable necessary cookies

    setCustomPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSavePreferences = () => {
    updatePreferences(customPreferences)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">쿠키 사용 동의</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {!showDetails ? (
            // Simple view
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                저희 웹사이트는 사용자 경험을 개선하고 서비스를 제공하기 위해 쿠키를 사용합니다.
                보안 정책에 따라 사이트 이용을 위해서는 쿠키 사용에 동의해야 합니다.
              </p>
              <button
                onClick={() => setShowDetails(true)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                자세히 보기
              </button>
            </div>
          ) : (
            // Detailed view with toggles
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                아래에서 각 쿠키 유형에 대한 설정을 선택할 수 있습니다.
              </p>

              {/* Necessary cookies - always on */}
              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">필수 쿠키</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      사이트의 기본 기능을 위해 필요합니다. (항상 활성화)
                    </p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <span className="text-sm font-medium text-gray-500">항상 활성화</span>
                  </div>
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">분석 쿠키</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      사이트 사용 패턴을 분석하여 서비스를 개선합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('analytics')}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      customPreferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle analytics cookies"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        customPreferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Marketing cookies */}
              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">마케팅 쿠키</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      맞춤형 광고 및 프로모션을 제공하는 데 사용됩니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('marketing')}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      customPreferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle marketing cookies"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        customPreferences.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Functional cookies */}
              <div className="rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">기능 쿠키</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      개인화된 설정 및 기능을 제공하는 데 사용됩니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle('functional')}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      customPreferences.functional ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle functional cookies"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        customPreferences.functional ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                간단히 보기
              </button>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {showDetails && (
              <button
                onClick={handleSavePreferences}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                선택 항목 저장
              </button>
            )}
            <button
              onClick={rejectAll}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              필수만 허용
            </button>
            <button
              onClick={acceptAll}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              모두 허용
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
