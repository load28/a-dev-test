/**
 * Profile Service
 * Mock API service for profile management
 */

import type {
  UserProfile,
  UpdateNicknameRequest,
  UpdatePasswordRequest,
  UpdatePhotoResponse,
} from '../types/profile'
import { ProfileError, ProfileErrorCode } from '../types/profile'

// Mock user database (in-memory storage)
let mockUserProfile: UserProfile = {
  id: 'user-123',
  email: 'user@example.com',
  nickname: '사용자123',
  photoUrl: 'https://via.placeholder.com/150',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
}

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetch user profile
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  await delay(500) // Simulate network delay

  // Simulate random network error (5% chance)
  if (Math.random() < 0.05) {
    throw new ProfileError('네트워크 오류가 발생했습니다.', ProfileErrorCode.NETWORK_ERROR)
  }

  return { ...mockUserProfile }
}

/**
 * Update user nickname
 */
export async function updateNickname(data: UpdateNicknameRequest): Promise<UserProfile> {
  await delay(800) // Simulate network delay

  const { nickname } = data

  // Validate nickname
  if (!nickname || nickname.trim().length === 0) {
    throw new ProfileError('닉네임을 입력해주세요.', ProfileErrorCode.INVALID_NICKNAME)
  }

  const trimmedNickname = nickname.trim()

  if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
    throw new ProfileError(
      '닉네임은 2-20자 사이여야 합니다.',
      ProfileErrorCode.INVALID_NICKNAME
    )
  }

  // Simulate nickname already exists error (10% chance)
  if (Math.random() < 0.1) {
    throw new ProfileError(
      '이미 사용 중인 닉네임입니다.',
      ProfileErrorCode.NICKNAME_ALREADY_EXISTS
    )
  }

  // Update mock user profile
  mockUserProfile = {
    ...mockUserProfile,
    nickname: trimmedNickname,
    updatedAt: new Date().toISOString(),
  }

  return { ...mockUserProfile }
}

/**
 * Update user password
 */
export async function updatePassword(data: UpdatePasswordRequest): Promise<void> {
  await delay(1000) // Simulate network delay

  const { currentPassword, newPassword } = data

  // Simulate incorrect current password (15% chance)
  if (Math.random() < 0.15) {
    throw new ProfileError(
      '현재 비밀번호가 올바르지 않습니다.',
      ProfileErrorCode.CURRENT_PASSWORD_INCORRECT
    )
  }

  // Validate passwords
  if (!currentPassword || !newPassword) {
    throw new ProfileError('비밀번호를 입력해주세요.', ProfileErrorCode.INVALID_PASSWORD)
  }

  if (newPassword.length < 8) {
    throw new ProfileError(
      '새 비밀번호는 최소 8자 이상이어야 합니다.',
      ProfileErrorCode.PASSWORD_TOO_WEAK
    )
  }

  if (currentPassword === newPassword) {
    throw new ProfileError(
      '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
      ProfileErrorCode.INVALID_PASSWORD
    )
  }

  // Update timestamp
  mockUserProfile = {
    ...mockUserProfile,
    updatedAt: new Date().toISOString(),
  }

  // Password update successful (no return value)
}

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(file: File): Promise<UpdatePhotoResponse> {
  await delay(1500) // Simulate file upload delay

  // Validate file
  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedFormats.includes(file.type)) {
    throw new ProfileError(
      '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 지원)',
      ProfileErrorCode.INVALID_PHOTO_FORMAT
    )
  }

  const maxSizeInBytes = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSizeInBytes) {
    throw new ProfileError(
      '파일 크기가 너무 큽니다. (최대 5MB)',
      ProfileErrorCode.PHOTO_TOO_LARGE
    )
  }

  // Simulate upload failure (5% chance)
  if (Math.random() < 0.05) {
    throw new ProfileError('파일 업로드에 실패했습니다.', ProfileErrorCode.UPLOAD_FAILED)
  }

  // Create mock photo URL (in real app, this would be from server)
  const photoUrl = URL.createObjectURL(file)
  const updatedAt = new Date().toISOString()

  // Update mock user profile
  mockUserProfile = {
    ...mockUserProfile,
    photoUrl,
    updatedAt,
  }

  return {
    photoUrl,
    updatedAt,
  }
}

/**
 * Delete profile photo
 */
export async function deleteProfilePhoto(): Promise<void> {
  await delay(500) // Simulate network delay

  // Update mock user profile
  mockUserProfile = {
    ...mockUserProfile,
    photoUrl: undefined,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Reset mock data (for testing purposes)
 */
export function resetMockData(): void {
  mockUserProfile = {
    id: 'user-123',
    email: 'user@example.com',
    nickname: '사용자123',
    photoUrl: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
