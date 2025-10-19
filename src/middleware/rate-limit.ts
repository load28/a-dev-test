/**
 * Rate Limiting Middleware
 *
 * 기능:
 * - IP 기반 요청 제한
 * - 계정별 로그인 시도 제한
 * - CAPTCHA 통합
 * - 자동 계정 잠금
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  locked?: boolean;
  lockedUntil?: number;
}

interface RateLimitConfig {
  // IP 기반 제한 설정
  ipWindowMs: number;           // IP 기반 시간 윈도우 (밀리초)
  ipMaxRequests: number;        // IP당 최대 요청 수

  // 계정 기반 제한 설정
  accountWindowMs: number;      // 계정 기반 시간 윈도우 (밀리초)
  accountMaxAttempts: number;   // 계정당 최대 로그인 시도 횟수

  // 계정 잠금 설정
  lockoutDurationMs: number;    // 계정 잠금 시간 (밀리초)
  lockoutThreshold: number;     // 잠금이 발생하는 실패 횟수

  // CAPTCHA 설정
  captchaThreshold: number;     // CAPTCHA 요구 임계값
  enableCaptcha: boolean;       // CAPTCHA 활성화 여부
}

// 기본 설정
const DEFAULT_CONFIG: RateLimitConfig = {
  ipWindowMs: 15 * 60 * 1000,           // 15분
  ipMaxRequests: 100,                    // IP당 15분에 100회

  accountWindowMs: 15 * 60 * 1000,      // 15분
  accountMaxAttempts: 5,                 // 계정당 15분에 5회 실패

  lockoutDurationMs: 30 * 60 * 1000,    // 30분 잠금
  lockoutThreshold: 5,                   // 5회 실패시 잠금

  captchaThreshold: 3,                   // 3회 실패시 CAPTCHA
  enableCaptcha: true,
};

/**
 * Rate Limiter 클래스
 * 메모리 기반 rate limiting 구현 (프로덕션에서는 Redis 등 사용 권장)
 */
export class RateLimiter {
  private ipStore: Map<string, RateLimitEntry> = new Map();
  private accountStore: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  /**
   * 주기적으로 만료된 항목 정리
   */
  private startCleanup(): void {
    // 5분마다 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * 만료된 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();

    // IP 스토어 정리
    for (const [key, entry] of this.ipStore.entries()) {
      if (now - entry.lastAttempt > this.config.ipWindowMs) {
        this.ipStore.delete(key);
      }
    }

    // 계정 스토어 정리
    for (const [key, entry] of this.accountStore.entries()) {
      if (entry.locked && entry.lockedUntil && now > entry.lockedUntil) {
        // 잠금 해제
        this.accountStore.delete(key);
      } else if (!entry.locked && now - entry.lastAttempt > this.config.accountWindowMs) {
        this.accountStore.delete(key);
      }
    }
  }

  /**
   * IP 기반 요청 제한 확인
   */
  checkIpLimit(ip: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    requiresCaptcha: boolean;
  } {
    const now = Date.now();
    const entry = this.ipStore.get(ip);

    if (!entry) {
      this.ipStore.set(ip, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });

      return {
        allowed: true,
        remaining: this.config.ipMaxRequests - 1,
        resetTime: now + this.config.ipWindowMs,
        requiresCaptcha: false,
      };
    }

    // 시간 윈도우가 지났으면 리셋
    if (now - entry.firstAttempt > this.config.ipWindowMs) {
      this.ipStore.set(ip, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });

      return {
        allowed: true,
        remaining: this.config.ipMaxRequests - 1,
        resetTime: now + this.config.ipWindowMs,
        requiresCaptcha: false,
      };
    }

    // 요청 수 증가
    entry.count++;
    entry.lastAttempt = now;
    this.ipStore.set(ip, entry);

    const remaining = Math.max(0, this.config.ipMaxRequests - entry.count);
    const allowed = entry.count <= this.config.ipMaxRequests;

    return {
      allowed,
      remaining,
      resetTime: entry.firstAttempt + this.config.ipWindowMs,
      requiresCaptcha: entry.count > this.config.ipMaxRequests * 0.8, // 80% 도달시 CAPTCHA 권장
    };
  }

  /**
   * 계정 기반 로그인 시도 제한 확인
   */
  checkAccountLimit(accountId: string): {
    allowed: boolean;
    remaining: number;
    locked: boolean;
    lockedUntil?: number;
    requiresCaptcha: boolean;
  } {
    const now = Date.now();
    const entry = this.accountStore.get(accountId);

    if (!entry) {
      return {
        allowed: true,
        remaining: this.config.accountMaxAttempts - 1,
        locked: false,
        requiresCaptcha: false,
      };
    }

    // 계정이 잠겨있는지 확인
    if (entry.locked && entry.lockedUntil) {
      if (now < entry.lockedUntil) {
        return {
          allowed: false,
          remaining: 0,
          locked: true,
          lockedUntil: entry.lockedUntil,
          requiresCaptcha: true,
        };
      } else {
        // 잠금 해제
        this.accountStore.delete(accountId);
        return {
          allowed: true,
          remaining: this.config.accountMaxAttempts - 1,
          locked: false,
          requiresCaptcha: false,
        };
      }
    }

    // 시간 윈도우가 지났으면 리셋
    if (now - entry.firstAttempt > this.config.accountWindowMs) {
      this.accountStore.delete(accountId);
      return {
        allowed: true,
        remaining: this.config.accountMaxAttempts - 1,
        locked: false,
        requiresCaptcha: false,
      };
    }

    const remaining = Math.max(0, this.config.accountMaxAttempts - entry.count);
    const allowed = entry.count < this.config.accountMaxAttempts;
    const requiresCaptcha = this.config.enableCaptcha &&
                           entry.count >= this.config.captchaThreshold;

    return {
      allowed,
      remaining,
      locked: false,
      requiresCaptcha,
    };
  }

  /**
   * 로그인 실패 기록
   */
  recordLoginFailure(accountId: string): {
    locked: boolean;
    lockedUntil?: number;
    requiresCaptcha: boolean;
    attempts: number;
  } {
    const now = Date.now();
    const entry = this.accountStore.get(accountId);

    if (!entry) {
      this.accountStore.set(accountId, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });

      return {
        locked: false,
        requiresCaptcha: this.config.enableCaptcha && 1 >= this.config.captchaThreshold,
        attempts: 1,
      };
    }

    // 시간 윈도우가 지났으면 리셋
    if (now - entry.firstAttempt > this.config.accountWindowMs) {
      this.accountStore.set(accountId, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });

      return {
        locked: false,
        requiresCaptcha: this.config.enableCaptcha && 1 >= this.config.captchaThreshold,
        attempts: 1,
      };
    }

    // 실패 횟수 증가
    entry.count++;
    entry.lastAttempt = now;

    // 잠금 임계값 도달 확인
    if (entry.count >= this.config.lockoutThreshold) {
      const lockedUntil = now + this.config.lockoutDurationMs;
      entry.locked = true;
      entry.lockedUntil = lockedUntil;
      this.accountStore.set(accountId, entry);

      return {
        locked: true,
        lockedUntil,
        requiresCaptcha: true,
        attempts: entry.count,
      };
    }

    this.accountStore.set(accountId, entry);

    return {
      locked: false,
      requiresCaptcha: this.config.enableCaptcha &&
                       entry.count >= this.config.captchaThreshold,
      attempts: entry.count,
    };
  }

  /**
   * 로그인 성공 시 계정 기록 초기화
   */
  recordLoginSuccess(accountId: string): void {
    this.accountStore.delete(accountId);
  }

  /**
   * 수동 계정 잠금
   */
  lockAccount(accountId: string, durationMs?: number): void {
    const now = Date.now();
    const duration = durationMs || this.config.lockoutDurationMs;
    const entry = this.accountStore.get(accountId) || {
      count: this.config.lockoutThreshold,
      firstAttempt: now,
      lastAttempt: now,
    };

    entry.locked = true;
    entry.lockedUntil = now + duration;
    this.accountStore.set(accountId, entry);
  }

  /**
   * 수동 계정 잠금 해제
   */
  unlockAccount(accountId: string): void {
    this.accountStore.delete(accountId);
  }

  /**
   * 계정 상태 조회
   */
  getAccountStatus(accountId: string): {
    locked: boolean;
    attempts: number;
    lockedUntil?: number;
    requiresCaptcha: boolean;
  } {
    const entry = this.accountStore.get(accountId);

    if (!entry) {
      return {
        locked: false,
        attempts: 0,
        requiresCaptcha: false,
      };
    }

    const now = Date.now();

    // 잠금 시간 만료 확인
    if (entry.locked && entry.lockedUntil && now >= entry.lockedUntil) {
      this.accountStore.delete(accountId);
      return {
        locked: false,
        attempts: 0,
        requiresCaptcha: false,
      };
    }

    return {
      locked: entry.locked || false,
      attempts: entry.count,
      lockedUntil: entry.lockedUntil,
      requiresCaptcha: this.config.enableCaptcha &&
                       entry.count >= this.config.captchaThreshold,
    };
  }

  /**
   * IP 상태 조회
   */
  getIpStatus(ip: string): {
    requests: number;
    remaining: number;
    requiresCaptcha: boolean;
  } {
    const entry = this.ipStore.get(ip);

    if (!entry) {
      return {
        requests: 0,
        remaining: this.config.ipMaxRequests,
        requiresCaptcha: false,
      };
    }

    const now = Date.now();

    // 시간 윈도우 만료 확인
    if (now - entry.firstAttempt > this.config.ipWindowMs) {
      this.ipStore.delete(ip);
      return {
        requests: 0,
        remaining: this.config.ipMaxRequests,
        requiresCaptcha: false,
      };
    }

    return {
      requests: entry.count,
      remaining: Math.max(0, this.config.ipMaxRequests - entry.count),
      requiresCaptcha: entry.count > this.config.ipMaxRequests * 0.8,
    };
  }

  /**
   * 정리 작업 중지
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.ipStore.clear();
    this.accountStore.clear();
  }

  /**
   * 모든 데이터 초기화
   */
  reset(): void {
    this.ipStore.clear();
    this.accountStore.clear();
  }
}

// 싱글톤 인스턴스
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Rate Limiter 인스턴스 가져오기
 */
export function getRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter(config);
  }
  return rateLimiterInstance;
}

/**
 * Rate Limiter 인스턴스 재설정
 */
export function resetRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
  if (rateLimiterInstance) {
    rateLimiterInstance.destroy();
  }
  rateLimiterInstance = new RateLimiter(config);
  return rateLimiterInstance;
}

/**
 * CAPTCHA 검증 헬퍼 함수
 * 실제 구현에서는 Google reCAPTCHA, hCaptcha 등의 서비스와 연동
 */
export interface CaptchaValidationResult {
  success: boolean;
  score?: number; // reCAPTCHA v3의 경우
  errors?: string[];
}

/**
 * CAPTCHA 토큰 검증
 * @param token CAPTCHA 토큰
 * @param secretKey CAPTCHA 비밀 키
 */
export async function validateCaptcha(
  token: string,
  secretKey?: string
): Promise<CaptchaValidationResult> {
  // 실제 구현에서는 CAPTCHA 서비스 API를 호출
  // 예: Google reCAPTCHA verification API

  if (!token) {
    return {
      success: false,
      errors: ['CAPTCHA token is required'],
    };
  }

  // 개발/테스트 환경을 위한 더미 구현
  if (token === 'test-captcha-token' || process.env.NODE_ENV === 'test') {
    return {
      success: true,
      score: 0.9,
    };
  }

  // TODO: 실제 CAPTCHA 서비스 API 호출 구현
  // Example for Google reCAPTCHA:
  // const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: `secret=${secretKey}&response=${token}`
  // });
  // const data = await response.json();
  // return { success: data.success, score: data.score, errors: data['error-codes'] };

  return {
    success: false,
    errors: ['CAPTCHA validation not implemented'],
  };
}

/**
 * IP 주소 추출 헬퍼 함수
 */
export function getClientIp(request: Request): string {
  // X-Forwarded-For 헤더에서 IP 추출 (프록시/로드밸런서 사용시)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // X-Real-IP 헤더 확인
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 기본값 (브라우저 환경에서는 실제 IP를 얻을 수 없음)
  return 'unknown';
}

export type { RateLimitConfig, RateLimitEntry };
