import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

/**
 * MFA 방식 타입
 */
export enum MFAMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  BACKUP_CODE = 'backup_code'
}

/**
 * TOTP 시크릿 생성 결과
 */
export interface TOTPSecret {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

/**
 * OTP 검증 결과
 */
export interface OTPVerification {
  valid: boolean;
  delta?: number;
}

/**
 * 백업 코드
 */
export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

/**
 * MFA 서비스 클래스
 */
export class MFAService {
  private readonly otpWindow = 1; // TOTP 검증 윈도우 (± 30초)
  private readonly otpExpiryMinutes = 5; // SMS/Email OTP 만료 시간
  private readonly backupCodeCount = 10; // 백업 코드 개수
  private readonly backupCodeLength = 8; // 백업 코드 길이

  /**
   * TOTP 시크릿 생성 (Google Authenticator용)
   * @param userEmail 사용자 이메일
   * @param issuer 발급자 이름 (앱 이름)
   * @returns TOTP 시크릿 정보
   */
  async generateTOTPSecret(userEmail: string, issuer: string = 'MyApp'): Promise<TOTPSecret> {
    // TOTP 시크릿 생성
    const secret = speakeasy.generateSecret({
      name: `${issuer} (${userEmail})`,
      issuer: issuer,
      length: 32
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate TOTP secret');
    }

    // QR 코드 생성
    const qrCodeDataUrl = await this.generateQRCode(secret.otpauth_url);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCodeDataUrl
    };
  }

  /**
   * TOTP 코드 검증
   * @param secret TOTP 시크릿
   * @param token 사용자가 입력한 6자리 코드
   * @returns 검증 결과
   */
  verifyTOTP(secret: string, token: string): OTPVerification {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: this.otpWindow
    });

    return {
      valid: verified !== undefined && verified !== false,
      delta: typeof verified === 'number' ? verified : undefined
    };
  }

  /**
   * 현재 TOTP 코드 생성 (테스트용)
   * @param secret TOTP 시크릿
   * @returns 현재 6자리 코드
   */
  generateCurrentTOTP(secret: string): string {
    return speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
  }

  /**
   * SMS/Email OTP 생성
   * @param length OTP 길이 (기본 6자리)
   * @returns 생성된 OTP 코드
   */
  async generateOTP(length: number = 6): Promise<string> {
    const buffer = await randomBytes(length);
    const otp = Array.from(buffer)
      .map(byte => byte % 10)
      .join('')
      .slice(0, length);

    return otp.padStart(length, '0');
  }

  /**
   * OTP 검증 (SMS/Email용)
   * @param storedOTP 저장된 OTP
   * @param inputOTP 사용자가 입력한 OTP
   * @param createdAt OTP 생성 시간
   * @returns 검증 결과
   */
  verifyOTP(storedOTP: string, inputOTP: string, createdAt: Date): OTPVerification {
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    // OTP 만료 확인
    if (diffMinutes > this.otpExpiryMinutes) {
      return { valid: false };
    }

    // OTP 일치 확인
    const valid = storedOTP === inputOTP;
    return { valid };
  }

  /**
   * 백업 코드 생성
   * @param count 생성할 백업 코드 개수
   * @returns 백업 코드 배열
   */
  async generateBackupCodes(count?: number): Promise<BackupCode[]> {
    const codeCount = count || this.backupCodeCount;
    const codes: BackupCode[] = [];

    for (let i = 0; i < codeCount; i++) {
      const buffer = await randomBytes(this.backupCodeLength);
      const code = buffer.toString('hex').toUpperCase().slice(0, this.backupCodeLength);

      // 4자리씩 구분하여 읽기 쉽게 포맷팅
      const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;

      codes.push({
        code: formattedCode,
        used: false
      });
    }

    return codes;
  }

  /**
   * 백업 코드 검증
   * @param backupCodes 저장된 백업 코드 목록
   * @param inputCode 사용자가 입력한 백업 코드
   * @returns 검증 결과 및 사용된 코드 인덱스
   */
  verifyBackupCode(
    backupCodes: BackupCode[],
    inputCode: string
  ): { valid: boolean; usedIndex?: number } {
    // 입력된 코드 정규화 (공백, 하이픈 제거 및 대문자 변환)
    const normalizedInput = inputCode.replace(/[\s-]/g, '').toUpperCase();

    for (let i = 0; i < backupCodes.length; i++) {
      const backupCode = backupCodes[i];
      const normalizedStored = backupCode.code.replace(/[\s-]/g, '').toUpperCase();

      // 사용되지 않은 코드이면서 입력 코드와 일치하는 경우
      if (!backupCode.used && normalizedStored === normalizedInput) {
        return { valid: true, usedIndex: i };
      }
    }

    return { valid: false };
  }

  /**
   * 백업 코드 사용 처리
   * @param backupCodes 백업 코드 목록
   * @param index 사용할 코드의 인덱스
   * @returns 업데이트된 백업 코드 목록
   */
  markBackupCodeAsUsed(backupCodes: BackupCode[], index: number): BackupCode[] {
    if (index < 0 || index >= backupCodes.length) {
      throw new Error('Invalid backup code index');
    }

    const updatedCodes = [...backupCodes];
    updatedCodes[index] = {
      ...updatedCodes[index],
      used: true,
      usedAt: new Date()
    };

    return updatedCodes;
  }

  /**
   * 사용 가능한 백업 코드 개수 확인
   * @param backupCodes 백업 코드 목록
   * @returns 사용 가능한 코드 개수
   */
  getAvailableBackupCodesCount(backupCodes: BackupCode[]): number {
    return backupCodes.filter(code => !code.used).length;
  }

  /**
   * QR 코드 생성
   * @param data QR 코드에 인코딩할 데이터
   * @returns Data URL 형식의 QR 코드 이미지
   */
  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 1
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * SMS OTP 해시 생성 (저장용)
   * @param otp OTP 코드
   * @returns 해시된 OTP
   */
  hashOTP(otp: string): string {
    return crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
  }

  /**
   * MFA 설정 검증 (초기 설정 시)
   * @param method MFA 방식
   * @param secret 시크릿 또는 OTP
   * @param token 사용자가 입력한 토큰
   * @param createdAt OTP 생성 시간 (TOTP가 아닌 경우)
   * @returns 검증 결과
   */
  verifyMFASetup(
    method: MFAMethod,
    secret: string,
    token: string,
    createdAt?: Date
  ): OTPVerification {
    switch (method) {
      case MFAMethod.TOTP:
        return this.verifyTOTP(secret, token);

      case MFAMethod.SMS:
      case MFAMethod.EMAIL:
        if (!createdAt) {
          throw new Error('createdAt is required for SMS/Email OTP verification');
        }
        return this.verifyOTP(secret, token, createdAt);

      default:
        throw new Error(`Unsupported MFA method: ${method}`);
    }
  }

  /**
   * MFA 토큰 생성
   * @param method MFA 방식
   * @param secret TOTP 시크릿 (TOTP인 경우)
   * @returns 생성된 토큰
   */
  async generateMFAToken(method: MFAMethod, secret?: string): Promise<string> {
    switch (method) {
      case MFAMethod.TOTP:
        if (!secret) {
          throw new Error('Secret is required for TOTP generation');
        }
        return this.generateCurrentTOTP(secret);

      case MFAMethod.SMS:
      case MFAMethod.EMAIL:
        return this.generateOTP(6);

      default:
        throw new Error(`Unsupported MFA method: ${method}`);
    }
  }
}

/**
 * 싱글톤 MFA 서비스 인스턴스
 */
export const mfaService = new MFAService();

/**
 * MFA 활성화 상태
 */
export interface MFAStatus {
  enabled: boolean;
  methods: MFAMethod[];
  backupCodesAvailable: number;
}

/**
 * MFA 설정 데이터
 */
export interface MFASettings {
  totpSecret?: string;
  totpEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  phoneNumber?: string;
  backupCodes: BackupCode[];
}
