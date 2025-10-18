/**
 * Profile Types
 * Enterprise-grade type definitions for user profile management
 */

export interface Profile {
  id: string
  email: string
  name: string
  picture?: string
  givenName?: string
  familyName?: string
  locale?: string
  phoneNumber?: string
  bio?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  name?: string
  givenName?: string
  familyName?: string
  phoneNumber?: string
  bio?: string
  locale?: string
  picture?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  isUpdating: boolean
}

export interface ProfileContextValue extends ProfileState {
  fetchProfile: () => Promise<void>
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  changePassword: (data: ChangePasswordRequest) => Promise<void>
  clearError: () => void
}

export interface UpdateProfileResponse {
  profile: Profile
  message: string
}

export interface ChangePasswordResponse {
  message: string
  success: boolean
}

export enum ProfileErrorCode {
  INVALID_DATA = 'INVALID_DATA',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  INCORRECT_CURRENT_PASSWORD = 'INCORRECT_CURRENT_PASSWORD',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ProfileError extends Error {
  code: ProfileErrorCode

  constructor(message: string, code: ProfileErrorCode = ProfileErrorCode.UNKNOWN_ERROR) {
    super(message)
    this.name = 'ProfileError'
    this.code = code
  }
}
