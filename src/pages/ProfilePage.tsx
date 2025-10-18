/**
 * Profile Page Component
 * Complete user profile management page with photo, nickname, and password sections
 */

import { useState, useEffect } from 'react'
import { ProfilePhoto } from '../components/ProfilePhoto'
import { NicknameSection } from '../components/NicknameSection'
import { PasswordSection } from '../components/PasswordSection'
import {
  fetchUserProfile,
  updateNickname,
  updatePassword,
  uploadProfilePhoto,
} from '../services/profileService'
import type { UserProfile, UpdatePasswordRequest } from '../types/profile'
import { ProfileError } from '../types/profile'

/**
 * ProfilePage Component
 * Integrates all profile management features with loading and error states
 */
export function ProfilePage() {
  // State management
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  /**
   * Load user profile data
   */
  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchUserProfile()
      setProfile(data)
    } catch (err) {
      const errorMessage = err instanceof ProfileError
        ? err.message
        : '프로필 정보를 불러오는데 실패했습니다.'
      setError(errorMessage)
      console.error('Failed to load profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refresh profile data
   */
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      const data = await fetchUserProfile()
      setProfile(data)
    } catch (err) {
      const errorMessage = err instanceof ProfileError
        ? err.message
        : '프로필 정보를 새로고침하는데 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }

  /**
   * Handle photo upload
   */
  const handlePhotoUpload = async (file: File) => {
    try {
      const response = await uploadProfilePhoto(file)

      // Update profile with new photo URL
      if (profile) {
        setProfile({
          ...profile,
          photoUrl: response.photoUrl,
          updatedAt: response.updatedAt,
        })
      }
    } catch (err) {
      // Error is handled by ProfilePhoto component
      throw err
    }
  }

  /**
   * Handle nickname update
   */
  const handleNicknameUpdate = async (nickname: string) => {
    try {
      const updatedProfile = await updateNickname({ nickname })
      setProfile(updatedProfile)
    } catch (err) {
      // Error is handled by NicknameSection component
      throw err
    }
  }

  /**
   * Handle password update
   */
  const handlePasswordUpdate = async (data: UpdatePasswordRequest) => {
    try {
      await updatePassword(data)
      // Password update successful - component will show success message
    } catch (err) {
      // Error is handled by PasswordSection component
      throw err
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button
              onClick={loadProfile}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프로필 설정</h1>
              <p className="mt-2 text-gray-600">
                프로필 사진, 닉네임, 비밀번호를 관리하세요
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="새로고침"
            >
              <svg
                className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? '새로고침 중...' : '새로고침'}
            </button>
          </div>

          {/* Profile info bar */}
          {profile && (
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">이메일:</span>{' '}
                  <span className="font-medium text-gray-900">{profile.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">마지막 수정:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {new Date(profile.updatedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global error message */}
        {error && profile && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main content grid */}
        {profile && (
          <div className="space-y-6">
            {/* Profile Photo Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="h-5 w-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                프로필 사진
              </h2>
              <ProfilePhoto
                currentPhotoUrl={profile.photoUrl}
                onUpload={handlePhotoUpload}
                maxSizeInMB={5}
                className="profile-photo-section"
              />
            </div>

            {/* Nickname Section */}
            <NicknameSection
              profile={profile}
              onUpdate={handleNicknameUpdate}
              isLoading={isRefreshing}
            />

            {/* Password Section */}
            <PasswordSection
              onSave={handlePasswordUpdate}
              isLoading={isRefreshing}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>계정 ID: {profile?.id}</p>
          <p className="mt-1">
            가입일: {profile && new Date(profile.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
