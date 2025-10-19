import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

/**
 * Password Policy Configuration
 */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength?: number;
  expiryDays?: number;
  preventReuse?: number; // number of previous passwords to check
}

/**
 * Password Strength Result
 */
export interface PasswordStrengthResult {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isValid: boolean;
}

/**
 * Hash Algorithm Type
 */
export enum HashAlgorithm {
  ARGON2 = 'argon2',
  BCRYPT = 'bcrypt',
}

/**
 * Default Password Policy
 */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  expiryDays: 90,
  preventReuse: 5,
};

/**
 * Argon2 Configuration (OWASP recommended)
 */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id, // Most secure variant
  memoryCost: 19456, // 19 MiB
  timeCost: 2, // 2 iterations
  parallelism: 1, // 1 thread
};

/**
 * bcrypt Configuration
 */
const BCRYPT_ROUNDS = 12;

/**
 * Special characters for password validation
 */
const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

/**
 * Common weak passwords to blacklist
 */
const WEAK_PASSWORDS = [
  'password',
  'Password123',
  '12345678',
  'qwerty',
  'admin',
  'letmein',
  'welcome',
];

/**
 * Generate a cryptographically secure salt
 * @param length - Length of salt in bytes (default: 32)
 * @returns Hex-encoded salt string
 */
export function generateSalt(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash password using Argon2id
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPasswordArgon2(password: string): Promise<string> {
  try {
    return await argon2.hash(password, ARGON2_OPTIONS);
  } catch (error) {
    throw new Error(`Failed to hash password with Argon2: ${error}`);
  }
}

/**
 * Verify password against Argon2 hash
 * @param hash - Stored hash
 * @param password - Plain text password to verify
 * @returns True if password matches
 */
export async function verifyPasswordArgon2(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    throw new Error(`Failed to verify password with Argon2: ${error}`);
  }
}

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @param rounds - Cost factor (default: 12)
 * @returns Hashed password
 */
export async function hashPasswordBcrypt(
  password: string,
  rounds: number = BCRYPT_ROUNDS
): Promise<string> {
  try {
    return await bcrypt.hash(password, rounds);
  } catch (error) {
    throw new Error(`Failed to hash password with bcrypt: ${error}`);
  }
}

/**
 * Verify password against bcrypt hash
 * @param hash - Stored hash
 * @param password - Plain text password to verify
 * @returns True if password matches
 */
export async function verifyPasswordBcrypt(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Failed to verify password with bcrypt: ${error}`);
  }
}

/**
 * Hash password using specified algorithm
 * @param password - Plain text password
 * @param algorithm - Hash algorithm to use (default: Argon2)
 * @returns Hashed password
 */
export async function hashPassword(
  password: string,
  algorithm: HashAlgorithm = HashAlgorithm.ARGON2
): Promise<string> {
  if (algorithm === HashAlgorithm.BCRYPT) {
    return hashPasswordBcrypt(password);
  }
  return hashPasswordArgon2(password);
}

/**
 * Verify password against hash using specified algorithm
 * @param hash - Stored hash
 * @param password - Plain text password to verify
 * @param algorithm - Hash algorithm to use (default: Argon2)
 * @returns True if password matches
 */
export async function verifyPassword(
  hash: string,
  password: string,
  algorithm: HashAlgorithm = HashAlgorithm.ARGON2
): Promise<boolean> {
  if (algorithm === HashAlgorithm.BCRYPT) {
    return verifyPasswordBcrypt(hash, password);
  }
  return verifyPasswordArgon2(hash, password);
}

/**
 * Check if password meets policy requirements
 * @param password - Password to validate
 * @param policy - Password policy to enforce (default: DEFAULT_PASSWORD_POLICY)
 * @returns Object with validation result and error messages
 */
export function validatePasswordPolicy(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  // Check maximum length
  if (policy.maxLength && password.length > policy.maxLength) {
    errors.push(`Password must not exceed ${policy.maxLength} characters`);
  }

  // Check uppercase requirement
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check lowercase requirement
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check numbers requirement
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check special characters requirement
  if (policy.requireSpecialChars && !SPECIAL_CHARS.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength score
 * @param password - Password to analyze
 * @returns Password strength result with score and feedback
 */
export function calculatePasswordStrength(
  password: string
): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];

  // Check if password is in weak password list
  if (WEAK_PASSWORDS.some((weak) => password.toLowerCase().includes(weak))) {
    return {
      score: 0,
      feedback: ['Password is too common and easily guessable'],
      isValid: false,
    };
  }

  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety scoring
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add both uppercase and lowercase letters');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }

  if (SPECIAL_CHARS.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters');
  }

  // Pattern detection (sequential or repeated characters)
  if (/(.)\1{2,}/.test(password)) {
    score--;
    feedback.push('Avoid repeated characters');
  }

  if (/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    score--;
    feedback.push('Avoid sequential characters');
  }

  // Normalize score to 0-4 range
  score = Math.max(0, Math.min(4, score));

  let isValid = false;
  if (score === 0) {
    feedback.unshift('Very weak password');
  } else if (score === 1) {
    feedback.unshift('Weak password');
  } else if (score === 2) {
    feedback.unshift('Fair password');
    isValid = true;
  } else if (score === 3) {
    feedback.unshift('Strong password');
    isValid = true;
  } else {
    feedback.unshift('Very strong password');
    isValid = true;
  }

  return {
    score,
    feedback,
    isValid,
  };
}

/**
 * Validate password against both policy and strength requirements
 * @param password - Password to validate
 * @param policy - Password policy to enforce
 * @returns Combined validation result
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): { isValid: boolean; errors: string[]; strength: PasswordStrengthResult } {
  const policyResult = validatePasswordPolicy(password, policy);
  const strength = calculatePasswordStrength(password);

  return {
    isValid: policyResult.isValid && strength.isValid,
    errors: [...policyResult.errors, ...strength.feedback],
    strength,
  };
}

/**
 * Check if password has expired
 * @param passwordCreatedAt - Date when password was created
 * @param expiryDays - Number of days until password expires
 * @returns True if password has expired
 */
export function isPasswordExpired(
  passwordCreatedAt: Date,
  expiryDays: number = DEFAULT_PASSWORD_POLICY.expiryDays!
): boolean {
  const now = new Date();
  const expiryDate = new Date(passwordCreatedAt);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return now > expiryDate;
}

/**
 * Get days until password expires
 * @param passwordCreatedAt - Date when password was created
 * @param expiryDays - Number of days until password expires
 * @returns Days remaining (negative if expired)
 */
export function getDaysUntilExpiry(
  passwordCreatedAt: Date,
  expiryDays: number = DEFAULT_PASSWORD_POLICY.expiryDays!
): number {
  const now = new Date();
  const expiryDate = new Date(passwordCreatedAt);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if password was used previously
 * @param newPassword - New password to check
 * @param previousHashes - Array of previous password hashes
 * @param algorithm - Hash algorithm used
 * @returns True if password was used before
 */
export async function isPasswordReused(
  newPassword: string,
  previousHashes: string[],
  algorithm: HashAlgorithm = HashAlgorithm.ARGON2
): Promise<boolean> {
  for (const hash of previousHashes) {
    try {
      const isMatch = await verifyPassword(hash, newPassword, algorithm);
      if (isMatch) {
        return true;
      }
    } catch (error) {
      // Continue checking other hashes if one fails
      continue;
    }
  }
  return false;
}

/**
 * Check if Argon2 hash needs rehashing (algorithm parameters changed)
 * @param hash - Stored hash
 * @returns True if hash needs to be updated
 */
export function needsRehash(hash: string): boolean {
  try {
    return argon2.needsRehash(hash, ARGON2_OPTIONS);
  } catch (error) {
    return false;
  }
}
