/**
 * Nickname Section Component
 * Displays and manages user nickname with edit functionality
 */

import { useState } from 'react'
import { Edit2, Check, X, AlertCircle } from 'lucide-react'
import type { UserProfile } from '../types/profile'

interface NicknameSectionProps {
  profile: UserProfile
  onUpdate: (nickname: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Validates nickname according to business rules
 */
function validateNickname(nickname: string): string | null {
  if (!nickname || nickname.trim().length === 0) {
    return '닉네임을 입력해주세요.'
  }

  const trimmedNickname = nickname.trim()

  if (trimmedNickname.length < 2) {
    return '닉네임은 최소 2자 이상이어야 합니다.'
  }

  if (trimmedNickname.length > 20) {
    return '닉네임은 최대 20자까지 입력 가능합니다.'
  }

  // Only allow alphanumeric, Korean, and underscore characters
  const validPattern = /^[a-zA-Z0-9가-힣_]+$/
  if (!validPattern.test(trimmedNickname)) {
    return '닉네임은 영문, 한글, 숫자, 언더스코어(_)만 사용할 수 있습니다.'
  }

  return null
}

/**
 * NicknameSection Component
 * Provides nickname display with inline editing functionality
 */
export function NicknameSection({ profile, onUpdate, isLoading = false }: NicknameSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(profile.nickname)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
    setNickname(profile.nickname)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setNickname(profile.nickname)
    setError(null)
  }

  const handleSave = async () => {
    // Validate nickname
    const validationError = validateNickname(nickname)
    if (validationError) {
      setError(validationError)
      return
    }

    const trimmedNickname = nickname.trim()

    // Check if nickname has changed
    if (trimmedNickname === profile.nickname) {
      setIsEditing(false)
      setError(null)
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      await onUpdate(trimmedNickname)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '닉네임 변경에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const isDisabled = isLoading || isSaving

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            닉네임
          </label>

          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isDisabled}
                  autoFocus
                  className={`
                    flex-1 px-3 py-2 border rounded-md shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                    ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
                  `}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                />

                <button
                  onClick={handleSave}
                  disabled={isDisabled}
                  className="
                    p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    transition-colors duration-200
                  "
                  title="저장"
                >
                  <Check size={18} />
                </button>

                <button
                  onClick={handleCancel}
                  disabled={isDisabled}
                  className="
                    p-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200
                    disabled:bg-gray-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                  "
                  title="취소"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-gray-500">
                2-20자, 영문/한글/숫자/언더스코어(_)만 사용 가능합니다.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-lg font-semibold text-gray-900">
                {profile.nickname}
              </p>
              <button
                onClick={handleEdit}
                disabled={isDisabled}
                className="
                  p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50
                  rounded-md transition-colors duration-200
                  disabled:text-gray-300 disabled:cursor-not-allowed
                "
                title="수정"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isSaving && (
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>저장 중...</span>
        </div>
      )}
    </div>
  )
}
