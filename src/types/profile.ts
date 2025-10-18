/**
 * Profile Types
 * Enterprise-grade type definitions for user profile management
 */

export interface UserProfile {
  id: string
  email: string
  nickname: string
  photoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateNicknameRequest {
  nickname: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdatePhotoRequest {
  photo: File
}

export interface UpdatePhotoResponse {
  photoUrl: string
  updatedAt: string
}

export interface ProfileApiResponse {
  profile: UserProfile
  message?: string
}

export enum ProfileErrorCode {
  INVALID_NICKNAME = 'INVALID_NICKNAME',
  NICKNAME_ALREADY_EXISTS = 'NICKNAME_ALREADY_EXISTS',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  CURRENT_PASSWORD_INCORRECT = 'CURRENT_PASSWORD_INCORRECT',
  INVALID_PHOTO_FORMAT = 'INVALID_PHOTO_FORMAT',
  PHOTO_TOO_LARGE = 'PHOTO_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
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
