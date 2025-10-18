/**
 * Profile validation utilities
 * 프로필 관련 데이터 검증 유틸리티 함수들
 */

// 상수 정의
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 20;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const PASSWORD_MIN_LENGTH = 8;

// 검증 결과 타입
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// 비밀번호 강도 레벨
export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
}

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  suggestions: string[];
}

/**
 * 닉네임 유효성 검증
 * @param nickname - 검증할 닉네임
 * @returns ValidationResult
 */
export function validateNickname(nickname: string): ValidationResult {
  if (!nickname || nickname.trim().length === 0) {
    return {
      isValid: false,
      error: '닉네임을 입력해주세요.',
    };
  }

  const trimmedNickname = nickname.trim();

  if (trimmedNickname.length < NICKNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `닉네임은 최소 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다.`,
    };
  }

  if (trimmedNickname.length > NICKNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 가능합니다.`,
    };
  }

  // 특수문자 제한 (한글, 영문, 숫자, 공백만 허용)
  const nicknamePattern = /^[가-힣a-zA-Z0-9\s]+$/;
  if (!nicknamePattern.test(trimmedNickname)) {
    return {
      isValid: false,
      error: '닉네임은 한글, 영문, 숫자만 사용 가능합니다.',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * 이미지 파일 유효성 검증
 * @param file - 검증할 파일
 * @returns ValidationResult
 */
export function validateImageFile(file: File): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: '파일을 선택해주세요.',
    };
  }

  // 파일 타입 검증
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `지원하는 이미지 형식은 ${ALLOWED_IMAGE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}입니다.`,
    };
  }

  // 파일 크기 검증
  if (file.size > MAX_IMAGE_SIZE) {
    const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024);
    return {
      isValid: false,
      error: `이미지 크기는 최대 ${maxSizeMB}MB까지 가능합니다.`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * 이미지 URL 유효성 검증 (Base64 또는 URL)
 * @param imageUrl - 검증할 이미지 URL
 * @returns ValidationResult
 */
export function validateImageUrl(imageUrl: string): ValidationResult {
  if (!imageUrl || imageUrl.trim().length === 0) {
    return {
      isValid: false,
      error: '이미지 URL을 입력해주세요.',
    };
  }

  // Base64 형식 체크
  const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  if (base64Pattern.test(imageUrl)) {
    return {
      isValid: true,
    };
  }

  // HTTP/HTTPS URL 체크
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return {
        isValid: false,
        error: '유효한 이미지 URL이 아닙니다.',
      };
    }
    return {
      isValid: true,
    };
  } catch {
    return {
      isValid: false,
      error: '유효한 이미지 URL이 아닙니다.',
    };
  }
}

/**
 * 비밀번호 강도 체크
 * @param password - 검증할 비밀번호
 * @returns PasswordStrengthResult
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const suggestions: string[] = [];
  let score = 0;

  // 길이 체크 (0-30점)
  if (password.length >= PASSWORD_MIN_LENGTH) {
    score += 10;
  } else {
    suggestions.push(`비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`);
  }

  if (password.length >= 12) {
    score += 10;
  }

  if (password.length >= 16) {
    score += 10;
  }

  // 소문자 포함 (0-15점)
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('소문자를 포함하세요.');
  }

  // 대문자 포함 (0-15점)
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('대문자를 포함하세요.');
  }

  // 숫자 포함 (0-15점)
  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('숫자를 포함하세요.');
  }

  // 특수문자 포함 (0-15점)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
  } else {
    suggestions.push('특수문자를 포함하세요.');
  }

  // 연속된 문자 체크 (감점 -10점)
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 10);
    suggestions.push('연속된 동일 문자는 피하세요.');
  }

  // 순차적인 문자 체크 (감점 -10점)
  const sequentialPattern = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
  if (sequentialPattern.test(password)) {
    score = Math.max(0, score - 10);
    suggestions.push('순차적인 문자는 피하세요.');
  }

  // 강도 결정
  let strength: PasswordStrength;
  if (score >= 80) {
    strength = PasswordStrength.STRONG;
  } else if (score >= 50) {
    strength = PasswordStrength.MEDIUM;
  } else {
    strength = PasswordStrength.WEAK;
  }

  return {
    strength,
    score: Math.min(100, Math.max(0, score)),
    suggestions,
  };
}

/**
 * 비밀번호 유효성 검증 (기본 검증만)
 * @param password - 검증할 비밀번호
 * @returns ValidationResult
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return {
      isValid: false,
      error: '비밀번호를 입력해주세요.',
    };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
    };
  }

  // 기본 강도 체크 (최소 2가지 조합 필요)
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const criteriaCount = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (criteriaCount < 2) {
    return {
      isValid: false,
      error: '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상을 조합해야 합니다.',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * 비밀번호 확인 검증
 * @param password - 비밀번호
 * @param confirmPassword - 확인 비밀번호
 * @returns ValidationResult
 */
export function validatePasswordConfirm(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword || confirmPassword.length === 0) {
    return {
      isValid: false,
      error: '비밀번호 확인을 입력해주세요.',
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: '비밀번호가 일치하지 않습니다.',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * 이메일 유효성 검증
 * @param email - 검증할 이메일
 * @returns ValidationResult
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: '이메일을 입력해주세요.',
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return {
      isValid: false,
      error: '유효한 이메일 주소를 입력해주세요.',
    };
  }

  return {
    isValid: true,
  };
}

// 상수 export
export const VALIDATION_CONSTANTS = {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
  PASSWORD_MIN_LENGTH,
} as const;
