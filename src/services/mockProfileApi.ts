/**
 * Mock Profile API Service
 * Provides mock implementations for profile-related API calls
 * Uses localStorage for data persistence
 */

// Types
export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export interface UpdateNicknameResponse {
  success: boolean;
  profile: UserProfile;
  message?: string;
}

export interface UploadPhotoRequest {
  photo: File | Blob;
}

export interface UploadPhotoResponse {
  success: boolean;
  photoUrl: string;
  profile: UserProfile;
  message?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface GetProfileResponse {
  success: boolean;
  profile: UserProfile;
  message?: string;
}

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'mock_user_profile',
  PHOTOS: 'mock_user_photos',
  PASSWORD: 'mock_user_password',
};

// Default profile data
const DEFAULT_PROFILE: UserProfile = {
  id: '1',
  email: 'user@example.com',
  nickname: 'User',
  photoUrl: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Initialize profile data in localStorage if not exists
 */
const initializeProfile = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PASSWORD)) {
    // Default password: "password123"
    localStorage.setItem(STORAGE_KEYS.PASSWORD, 'password123');
  }
};

/**
 * Get current user profile
 */
const getProfile = async (): Promise<GetProfileResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      initializeProfile();

      const profileData = localStorage.getItem(STORAGE_KEYS.PROFILE);

      if (profileData) {
        const profile = JSON.parse(profileData) as UserProfile;
        resolve({
          success: true,
          profile,
        });
      } else {
        resolve({
          success: false,
          profile: DEFAULT_PROFILE,
          message: 'Profile not found',
        });
      }
    }, 300); // Simulate network delay
  });
};

/**
 * Update user nickname
 */
const updateNickname = async (
  request: UpdateNicknameRequest
): Promise<UpdateNicknameResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      initializeProfile();

      const { nickname } = request;

      // Validation
      if (!nickname || nickname.trim().length === 0) {
        reject({
          success: false,
          message: 'Nickname cannot be empty',
        });
        return;
      }

      if (nickname.length < 2 || nickname.length > 20) {
        reject({
          success: false,
          message: 'Nickname must be between 2 and 20 characters',
        });
        return;
      }

      const profileData = localStorage.getItem(STORAGE_KEYS.PROFILE);

      if (profileData) {
        const profile = JSON.parse(profileData) as UserProfile;
        const updatedProfile: UserProfile = {
          ...profile,
          nickname: nickname.trim(),
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));

        resolve({
          success: true,
          profile: updatedProfile,
          message: 'Nickname updated successfully',
        });
      } else {
        reject({
          success: false,
          message: 'Profile not found',
        });
      }
    }, 500); // Simulate network delay
  });
};

/**
 * Upload profile photo
 * Converts file to base64 and stores it
 */
const uploadPhoto = async (
  request: UploadPhotoRequest
): Promise<UploadPhotoResponse> => {
  return new Promise((resolve, reject) => {
    initializeProfile();

    const { photo } = request;

    // Validation
    if (!photo) {
      reject({
        success: false,
        message: 'No photo provided',
      });
      return;
    }

    // Check file size (max 5MB)
    if (photo.size > 5 * 1024 * 1024) {
      reject({
        success: false,
        message: 'Photo size must be less than 5MB',
      });
      return;
    }

    // Check file type
    if (!photo.type.startsWith('image/')) {
      reject({
        success: false,
        message: 'File must be an image',
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();

    reader.onload = () => {
      setTimeout(() => {
        const base64Photo = reader.result as string;

        const profileData = localStorage.getItem(STORAGE_KEYS.PROFILE);

        if (profileData) {
          const profile = JSON.parse(profileData) as UserProfile;
          const updatedProfile: UserProfile = {
            ...profile,
            photoUrl: base64Photo,
            updatedAt: new Date().toISOString(),
          };

          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));

          // Store photo separately for history (optional)
          const photos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PHOTOS) || '[]');
          photos.push({
            url: base64Photo,
            uploadedAt: new Date().toISOString(),
          });
          localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));

          resolve({
            success: true,
            photoUrl: base64Photo,
            profile: updatedProfile,
            message: 'Photo uploaded successfully',
          });
        } else {
          reject({
            success: false,
            message: 'Profile not found',
          });
        }
      }, 800); // Simulate upload delay
    };

    reader.onerror = () => {
      reject({
        success: false,
        message: 'Failed to read photo file',
      });
    };

    reader.readAsDataURL(photo);
  });
};

/**
 * Change user password
 */
const changePassword = async (
  request: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      initializeProfile();

      const { currentPassword, newPassword } = request;

      // Validation
      if (!currentPassword || !newPassword) {
        reject({
          success: false,
          message: 'Both current and new password are required',
        });
        return;
      }

      if (newPassword.length < 8) {
        reject({
          success: false,
          message: 'New password must be at least 8 characters long',
        });
        return;
      }

      // Check password strength
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        reject({
          success: false,
          message: 'Password must contain uppercase, lowercase, and numbers',
        });
        return;
      }

      const storedPassword = localStorage.getItem(STORAGE_KEYS.PASSWORD);

      if (storedPassword !== currentPassword) {
        reject({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      // Update password
      localStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);

      // Update profile timestamp
      const profileData = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (profileData) {
        const profile = JSON.parse(profileData) as UserProfile;
        profile.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      }

      resolve({
        success: true,
        message: 'Password changed successfully',
      });
    }, 600); // Simulate network delay
  });
};

/**
 * Reset profile to default (for testing)
 */
const resetProfile = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.PHOTOS);
  localStorage.removeItem(STORAGE_KEYS.PASSWORD);
  initializeProfile();
};

// Export all functions
export const mockProfileApi = {
  getProfile,
  updateNickname,
  uploadPhoto,
  changePassword,
  resetProfile,
};

export default mockProfileApi;
