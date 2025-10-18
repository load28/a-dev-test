import React, { useState, useRef, ChangeEvent } from 'react'
import { UpdatePhotoRequest, ProfileError, ProfileErrorCode } from '../types/profile'

interface ProfilePhotoProps {
  currentPhotoUrl?: string
  onUpload: (file: File) => Promise<void>
  maxSizeInMB?: number
  allowedFormats?: string[]
  className?: string
}

const DEFAULT_MAX_SIZE_MB = 5
const DEFAULT_ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  currentPhotoUrl,
  onUpload,
  maxSizeInMB = DEFAULT_MAX_SIZE_MB,
  allowedFormats = DEFAULT_ALLOWED_FORMATS,
  className = '',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): void => {
    // Check file format
    if (!allowedFormats.includes(file.type)) {
      throw new ProfileError(
        `Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`,
        ProfileErrorCode.INVALID_PHOTO_FORMAT
      )
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      throw new ProfileError(
        `File too large. Maximum size: ${maxSizeInMB}MB`,
        ProfileErrorCode.PHOTO_TOO_LARGE
      )
    }
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      validateFile(file)

      // Create preview URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setSelectedFile(file)
    } catch (err) {
      if (err instanceof ProfileError) {
        setError(err.message)
      } else {
        setError('Failed to select file')
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = async (): Promise<void> => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError(null)
      await onUpload(selectedFile)
      // Reset selected file after successful upload
      setSelectedFile(null)
    } catch (err) {
      if (err instanceof ProfileError) {
        setError(err.message)
      } else {
        setError('Failed to upload photo')
      }
      // Revert preview to current photo on error
      setPreviewUrl(currentPhotoUrl)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = (): void => {
    fileInputRef.current?.click()
  }

  const getInitials = (): string => {
    // Simple default avatar with generic initials
    return '?'
  }

  return (
    <div className={`profile-photo-container ${className}`}>
      <div className="profile-photo-wrapper">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="profile-photo-image"
            onError={() => {
              // Fallback to default avatar on image load error
              setPreviewUrl(undefined)
            }}
          />
        ) : (
          <div className="profile-photo-default" aria-label="Default avatar">
            <span className="profile-photo-initials">{getInitials()}</span>
          </div>
        )}
      </div>

      <div className="profile-photo-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedFormats.join(',')}
          onChange={handleFileSelect}
          className="profile-photo-input"
          aria-label="Select profile photo"
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={handleButtonClick}
          className="profile-photo-button profile-photo-button-select"
          disabled={isUploading}
          aria-label="Choose photo"
        >
          Choose Photo
        </button>

        {selectedFile && (
          <button
            type="button"
            onClick={handleUploadClick}
            className="profile-photo-button profile-photo-button-upload"
            disabled={isUploading}
            aria-label="Upload photo"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>

      {selectedFile && !isUploading && (
        <div className="profile-photo-info">
          <span className="profile-photo-filename">{selectedFile.name}</span>
          <span className="profile-photo-filesize">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </span>
        </div>
      )}

      {error && (
        <div className="profile-photo-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

export default ProfilePhoto
