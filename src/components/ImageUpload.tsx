import React, { useState, useRef, ChangeEvent } from 'react';

interface ImageUploadProps {
  onImageSelect?: (base64Image: string, file: File) => void;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif']
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): string | null => {
    // 파일 타입 검증
    if (!acceptedFormats.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. 허용된 형식: ${acceptedFormats.join(', ')}`;
    }

    // 파일 크기 검증 (MB를 바이트로 변환)
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `파일 크기가 너무 큽니다. 최대 크기: ${maxSizeInMB}MB`;
    }

    return null;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to Base64'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // 초기화
    setError(null);
    setPreview(null);
    setSelectedFile(null);

    if (!file) {
      return;
    }

    // 이미지 검증
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Base64로 변환
      const base64String = await convertToBase64(file);

      // 상태 업데이트
      setPreview(base64String);
      setSelectedFile(file);

      // 부모 컴포넌트에 알림
      if (onImageSelect) {
        onImageSelect(base64String, file);
      }
    } catch (err) {
      setError('이미지 처리 중 오류가 발생했습니다.');
      console.error('Image processing error:', err);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label="이미지 파일 선택"
      />

      <div className="upload-section">
        {!preview ? (
          <button
            type="button"
            onClick={handleButtonClick}
            className="upload-button"
          >
            이미지 선택
          </button>
        ) : (
          <div className="preview-section">
            <img
              src={preview}
              alt="선택된 이미지 미리보기"
              className="image-preview"
              style={{ maxWidth: '300px', maxHeight: '300px' }}
            />
            <div className="image-info">
              <p>파일명: {selectedFile?.name}</p>
              <p>크기: {((selectedFile?.size || 0) / 1024).toFixed(2)} KB</p>
              <p>타입: {selectedFile?.type}</p>
            </div>
            <div className="button-group">
              <button
                type="button"
                onClick={handleButtonClick}
                className="change-button"
              >
                이미지 변경
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-button"
              >
                이미지 제거
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="upload-info">
        <p>허용된 형식: JPEG, PNG, GIF</p>
        <p>최대 크기: {maxSizeInMB}MB</p>
      </div>
    </div>
  );
};

export default ImageUpload;
