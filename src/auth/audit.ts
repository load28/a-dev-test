/**
 * Authentication Audit Logging System
 *
 * Features:
 * - Comprehensive event logging (login, logout, permission changes)
 * - Anomaly detection
 * - Log encryption
 * - Long-term storage and rotation
 */

import crypto from 'crypto';

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_REVOKED = 'SESSION_REVOKED',

  // Authorization Events
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Account Events
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',

  // Security Events
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_CHALLENGE_SUCCESS = 'MFA_CHALLENGE_SUCCESS',
  MFA_CHALLENGE_FAILURE = 'MFA_CHALLENGE_FAILURE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Token Events
  TOKEN_ISSUED = 'TOKEN_ISSUED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditEventMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  device?: {
    type?: string;
    os?: string;
    browser?: string;
  };
  sessionId?: string;
  requestId?: string;
  additionalData?: Record<string, any>;
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  username?: string;
  email?: string;
  success: boolean;
  message: string;
  metadata: AuditEventMetadata;
  resourceId?: string;
  resourceType?: string;
  previousValue?: any;
  newValue?: any;
}

export interface EncryptedAuditLog {
  id: string;
  encryptedData: string;
  iv: string;
  authTag: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
}

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  confidence: number;
  reasons: string[];
  riskScore: number;
}

export interface AuditLogQuery {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  eventTypes?: AuditEventType[];
  severity?: AuditSeverity[];
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditLogStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  successRate: number;
  uniqueUsers: number;
  suspiciousActivities: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// Configuration
// ============================================================================

export interface AuditConfig {
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotationIntervalDays: number;
  };
  storage: {
    retentionDays: number;
    archiveAfterDays: number;
    compressionEnabled: boolean;
  };
  anomalyDetection: {
    enabled: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    maxFailedLoginAttempts: number;
    unusualLocationThreshold: number;
    rapidLoginThreshold: number;
  };
  alerting: {
    enabled: boolean;
    criticalEventNotification: boolean;
    anomalyNotification: boolean;
  };
}

const DEFAULT_CONFIG: AuditConfig = {
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    keyRotationIntervalDays: 90,
  },
  storage: {
    retentionDays: 365,
    archiveAfterDays: 90,
    compressionEnabled: true,
  },
  anomalyDetection: {
    enabled: true,
    sensitivityLevel: 'medium',
    maxFailedLoginAttempts: 5,
    unusualLocationThreshold: 0.8,
    rapidLoginThreshold: 3,
  },
  alerting: {
    enabled: true,
    criticalEventNotification: true,
    anomalyNotification: true,
  },
};

// ============================================================================
// Encryption Service
// ============================================================================

class EncryptionService {
  private encryptionKey: Buffer;
  private algorithm: string;

  constructor(config: AuditConfig) {
    this.algorithm = config.encryption.algorithm;
    this.encryptionKey = this.getOrGenerateEncryptionKey();
  }

  private getOrGenerateEncryptionKey(): Buffer {
    // In production, retrieve from secure key management service (e.g., AWS KMS, Azure Key Vault)
    const envKey = process.env.AUDIT_LOG_ENCRYPTION_KEY;

    if (envKey) {
      return Buffer.from(envKey, 'hex');
    }

    // Generate a new key (for development only)
    console.warn('Generating new encryption key. In production, use a secure key management service.');
    return crypto.randomBytes(32);
  }

  public encrypt(data: AuditEvent): EncryptedAuditLog {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

    const jsonData = JSON.stringify(data);
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = (cipher as any).getAuthTag().toString('hex');

    return {
      id: data.id,
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag,
      timestamp: data.timestamp,
      eventType: data.eventType,
      userId: data.userId,
    };
  }

  public decrypt(encryptedLog: EncryptedAuditLog): AuditEvent {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(encryptedLog.iv, 'hex')
    );

    (decipher as any).setAuthTag(Buffer.from(encryptedLog.authTag, 'hex'));

    let decrypted = decipher.update(encryptedLog.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  public rotateKey(): void {
    // In production, implement key rotation with re-encryption of existing logs
    console.log('Key rotation initiated. Implement secure key rotation logic.');
    this.encryptionKey = crypto.randomBytes(32);
  }
}

// ============================================================================
// Anomaly Detection Service
// ============================================================================

class AnomalyDetectionService {
  private config: AuditConfig;
  private userBehaviorProfiles: Map<string, UserBehaviorProfile>;

  constructor(config: AuditConfig) {
    this.config = config;
    this.userBehaviorProfiles = new Map();
  }

  public async detectAnomalies(event: AuditEvent): Promise<AnomalyDetectionResult> {
    if (!this.config.anomalyDetection.enabled) {
      return {
        isAnomalous: false,
        confidence: 0,
        reasons: [],
        riskScore: 0,
      };
    }

    const reasons: string[] = [];
    let riskScore = 0;

    // Check for failed login attempts
    if (event.eventType === AuditEventType.LOGIN_FAILURE) {
      const recentFailures = await this.getRecentFailedLogins(event.userId || event.email);
      if (recentFailures >= this.config.anomalyDetection.maxFailedLoginAttempts) {
        reasons.push(`Excessive failed login attempts: ${recentFailures}`);
        riskScore += 30;
      }
    }

    // Check for unusual location
    if (event.metadata.location && event.userId) {
      const isUnusualLocation = await this.isUnusualLocation(event.userId, event.metadata.location);
      if (isUnusualLocation) {
        reasons.push('Login from unusual location');
        riskScore += 25;
      }
    }

    // Check for rapid login attempts
    if (event.eventType === AuditEventType.LOGIN_SUCCESS && event.userId) {
      const rapidLogins = await this.checkRapidLogins(event.userId);
      if (rapidLogins) {
        reasons.push('Rapid login attempts detected');
        riskScore += 20;
      }
    }

    // Check for unusual time of day
    const isUnusualTime = this.isUnusualTimeOfDay(event);
    if (isUnusualTime && event.userId) {
      reasons.push('Activity at unusual time of day');
      riskScore += 15;
    }

    // Check for suspicious event patterns
    if (event.userId) {
      const suspiciousPattern = await this.detectSuspiciousPattern(event);
      if (suspiciousPattern) {
        reasons.push('Suspicious activity pattern detected');
        riskScore += 35;
      }
    }

    // Check for privilege escalation attempts
    if (event.eventType === AuditEventType.PERMISSION_GRANTED ||
        event.eventType === AuditEventType.ROLE_CHANGED) {
      if (this.isPrivilegeEscalation(event)) {
        reasons.push('Potential privilege escalation detected');
        riskScore += 40;
      }
    }

    const sensitivity = this.getSensitivityThreshold();
    const isAnomalous = riskScore >= sensitivity;
    const confidence = Math.min(riskScore / 100, 1);

    return {
      isAnomalous,
      confidence,
      reasons,
      riskScore,
    };
  }

  private async getRecentFailedLogins(identifier?: string): Promise<number> {
    if (!identifier) return 0;

    // In production, query the audit log storage
    // For now, return a simulated value
    return 0;
  }

  private async isUnusualLocation(
    userId: string,
    location: NonNullable<AuditEventMetadata['location']>
  ): Promise<boolean> {
    const profile = this.userBehaviorProfiles.get(userId);
    if (!profile || !profile.commonLocations.length) {
      return false;
    }

    // Check if location is significantly different from common locations
    // In production, implement geolocation distance calculation
    return false;
  }

  private async checkRapidLogins(userId: string): Promise<boolean> {
    // In production, check for multiple logins in short time window
    return false;
  }

  private isUnusualTimeOfDay(event: AuditEvent): boolean {
    const hour = event.timestamp.getHours();

    // Define unusual hours (e.g., 2 AM - 5 AM)
    return hour >= 2 && hour <= 5;
  }

  private async detectSuspiciousPattern(event: AuditEvent): Promise<boolean> {
    // Implement pattern detection logic
    // Example: rapid succession of permission changes, multiple failed MFA attempts
    return false;
  }

  private isPrivilegeEscalation(event: AuditEvent): boolean {
    if (!event.previousValue || !event.newValue) {
      return false;
    }

    // Check if new permissions are significantly higher than previous
    // In production, implement role hierarchy comparison
    return false;
  }

  private getSensitivityThreshold(): number {
    switch (this.config.anomalyDetection.sensitivityLevel) {
      case 'low':
        return 60;
      case 'medium':
        return 40;
      case 'high':
        return 25;
      default:
        return 40;
    }
  }

  public updateUserProfile(userId: string, event: AuditEvent): void {
    let profile = this.userBehaviorProfiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        commonLocations: [],
        typicalLoginTimes: [],
        commonDevices: [],
        lastActivity: event.timestamp,
      };
    }

    // Update profile with new event data
    if (event.metadata.location) {
      profile.commonLocations.push(event.metadata.location);
      // Keep only recent locations (e.g., last 10)
      if (profile.commonLocations.length > 10) {
        profile.commonLocations.shift();
      }
    }

    profile.lastActivity = event.timestamp;
    this.userBehaviorProfiles.set(userId, profile);
  }
}

interface UserBehaviorProfile {
  userId: string;
  commonLocations: Array<NonNullable<AuditEventMetadata['location']>>;
  typicalLoginTimes: number[];
  commonDevices: string[];
  lastActivity: Date;
}

// ============================================================================
// Storage Service
// ============================================================================

class AuditLogStorageService {
  private config: AuditConfig;
  private logs: Map<string, AuditEvent | EncryptedAuditLog>;
  private archivedLogs: Map<string, AuditEvent | EncryptedAuditLog>;

  constructor(config: AuditConfig) {
    this.config = config;
    this.logs = new Map();
    this.archivedLogs = new Map();
  }

  public async store(log: AuditEvent | EncryptedAuditLog): Promise<void> {
    this.logs.set(log.id, log);

    // In production, persist to database (e.g., PostgreSQL, MongoDB)
    // Consider using append-only storage for immutability
    await this.persistToDatabase(log);
  }

  public async query(query: AuditLogQuery): Promise<AuditEvent[]> {
    const results: AuditEvent[] = [];

    // In production, implement efficient database queries
    for (const log of this.logs.values()) {
      if (this.matchesQuery(log, query)) {
        results.push(log as AuditEvent);
      }
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return results.slice(offset, offset + limit);
  }

  public async archive(): Promise<void> {
    const now = new Date();
    const archiveThreshold = new Date(
      now.getTime() - this.config.storage.archiveAfterDays * 24 * 60 * 60 * 1000
    );

    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < archiveThreshold) {
        this.archivedLogs.set(id, log);
        this.logs.delete(id);

        // In production, move to cold storage (e.g., S3 Glacier)
        await this.moveToArchiveStorage(log);
      }
    }
  }

  public async cleanup(): Promise<void> {
    const now = new Date();
    const retentionThreshold = new Date(
      now.getTime() - this.config.storage.retentionDays * 24 * 60 * 60 * 1000
    );

    for (const [id, log] of this.archivedLogs.entries()) {
      if (log.timestamp < retentionThreshold) {
        this.archivedLogs.delete(id);

        // In production, delete from cold storage with proper audit trail
        await this.deleteFromArchive(id);
      }
    }
  }

  public async getStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<AuditLogStatistics> {
    const relevantLogs = Array.from(this.logs.values()).filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate
    ) as AuditEvent[];

    const eventsByType: Record<AuditEventType, number> = {} as any;
    const eventsBySeverity: Record<AuditSeverity, number> = {} as any;
    const uniqueUsers = new Set<string>();
    let successCount = 0;
    let suspiciousCount = 0;

    for (const log of relevantLogs) {
      eventsByType[log.eventType] = (eventsByType[log.eventType] || 0) + 1;
      eventsBySeverity[log.severity] = (eventsBySeverity[log.severity] || 0) + 1;

      if (log.userId) {
        uniqueUsers.add(log.userId);
      }

      if (log.success) {
        successCount++;
      }

      if (log.eventType === AuditEventType.SUSPICIOUS_ACTIVITY) {
        suspiciousCount++;
      }
    }

    return {
      totalEvents: relevantLogs.length,
      eventsByType,
      eventsBySeverity,
      successRate: relevantLogs.length > 0 ? successCount / relevantLogs.length : 0,
      uniqueUsers: uniqueUsers.size,
      suspiciousActivities: suspiciousCount,
      timeRange: {
        start: startDate,
        end: endDate,
      },
    };
  }

  private matchesQuery(log: AuditEvent | EncryptedAuditLog, query: AuditLogQuery): boolean {
    const auditLog = log as AuditEvent;

    if (query.startDate && log.timestamp < query.startDate) return false;
    if (query.endDate && log.timestamp > query.endDate) return false;
    if (query.userId && log.userId !== query.userId) return false;
    if (query.eventTypes && !query.eventTypes.includes(log.eventType)) return false;
    if (query.severity && !query.severity.includes(auditLog.severity)) return false;
    if (query.success !== undefined && auditLog.success !== query.success) return false;

    return true;
  }

  private async persistToDatabase(log: AuditEvent | EncryptedAuditLog): Promise<void> {
    // In production, implement database persistence
    // Example: await db.auditLogs.insert(log);
  }

  private async moveToArchiveStorage(log: AuditEvent | EncryptedAuditLog): Promise<void> {
    // In production, implement archive storage
    // Example: await s3.putObject({ Bucket: 'audit-archive', Key: log.id, Body: JSON.stringify(log) });
  }

  private async deleteFromArchive(logId: string): Promise<void> {
    // In production, implement archive deletion
    // Example: await s3.deleteObject({ Bucket: 'audit-archive', Key: logId });
  }
}

// ============================================================================
// Main Audit Logger
// ============================================================================

export class AuditLogger {
  private config: AuditConfig;
  private encryptionService: EncryptionService;
  private anomalyDetectionService: AnomalyDetectionService;
  private storageService: AuditLogStorageService;
  private alertCallbacks: Array<(event: AuditEvent, anomaly?: AnomalyDetectionResult) => void>;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.encryptionService = new EncryptionService(this.config);
    this.anomalyDetectionService = new AnomalyDetectionService(this.config);
    this.storageService = new AuditLogStorageService(this.config);
    this.alertCallbacks = [];
  }

  /**
   * Log an authentication event
   */
  public async logEvent(
    eventType: AuditEventType,
    data: Partial<AuditEvent>
  ): Promise<void> {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType,
      severity: this.determineSeverity(eventType),
      success: data.success ?? true,
      message: data.message || this.getDefaultMessage(eventType),
      metadata: data.metadata || {},
      ...data,
    };

    // Detect anomalies
    const anomalyResult = await this.anomalyDetectionService.detectAnomalies(event);

    if (anomalyResult.isAnomalous) {
      event.severity = AuditSeverity.CRITICAL;
      event.metadata.additionalData = {
        ...event.metadata.additionalData,
        anomalyDetection: anomalyResult,
      };

      // Log suspicious activity event
      await this.logEvent(AuditEventType.SUSPICIOUS_ACTIVITY, {
        userId: event.userId,
        message: `Anomalous activity detected: ${anomalyResult.reasons.join(', ')}`,
        metadata: event.metadata,
        success: false,
      });
    }

    // Update user behavior profile
    if (event.userId) {
      this.anomalyDetectionService.updateUserProfile(event.userId, event);
    }

    // Encrypt if enabled
    let logToStore: AuditEvent | EncryptedAuditLog = event;
    if (this.config.encryption.enabled) {
      logToStore = this.encryptionService.encrypt(event);
    }

    // Store the log
    await this.storageService.store(logToStore);

    // Trigger alerts if needed
    if (this.config.alerting.enabled) {
      this.triggerAlerts(event, anomalyResult);
    }

    // Console logging for development
    this.consoleLog(event, anomalyResult);
  }

  /**
   * Log successful login
   */
  public async logLoginSuccess(
    userId: string,
    username: string,
    metadata: AuditEventMetadata
  ): Promise<void> {
    await this.logEvent(AuditEventType.LOGIN_SUCCESS, {
      userId,
      username,
      success: true,
      message: `User ${username} logged in successfully`,
      metadata,
    });
  }

  /**
   * Log failed login
   */
  public async logLoginFailure(
    username: string,
    reason: string,
    metadata: AuditEventMetadata
  ): Promise<void> {
    await this.logEvent(AuditEventType.LOGIN_FAILURE, {
      username,
      success: false,
      message: `Failed login attempt for ${username}: ${reason}`,
      metadata,
    });
  }

  /**
   * Log logout
   */
  public async logLogout(
    userId: string,
    username: string,
    metadata: AuditEventMetadata
  ): Promise<void> {
    await this.logEvent(AuditEventType.LOGOUT, {
      userId,
      username,
      success: true,
      message: `User ${username} logged out`,
      metadata,
    });
  }

  /**
   * Log permission change
   */
  public async logPermissionChange(
    userId: string,
    username: string,
    changeType: 'granted' | 'revoked',
    permission: string,
    metadata: AuditEventMetadata
  ): Promise<void> {
    const eventType = changeType === 'granted'
      ? AuditEventType.PERMISSION_GRANTED
      : AuditEventType.PERMISSION_REVOKED;

    await this.logEvent(eventType, {
      userId,
      username,
      success: true,
      message: `Permission ${permission} ${changeType} for user ${username}`,
      metadata,
      resourceType: 'permission',
      resourceId: permission,
    });
  }

  /**
   * Log role change
   */
  public async logRoleChange(
    userId: string,
    username: string,
    previousRole: string,
    newRole: string,
    metadata: AuditEventMetadata
  ): Promise<void> {
    await this.logEvent(AuditEventType.ROLE_CHANGED, {
      userId,
      username,
      success: true,
      message: `User ${username} role changed from ${previousRole} to ${newRole}`,
      metadata,
      previousValue: previousRole,
      newValue: newRole,
    });
  }

  /**
   * Query audit logs
   */
  public async queryLogs(query: AuditLogQuery): Promise<AuditEvent[]> {
    return this.storageService.query(query);
  }

  /**
   * Get audit log statistics
   */
  public async getStatistics(startDate: Date, endDate: Date): Promise<AuditLogStatistics> {
    return this.storageService.getStatistics(startDate, endDate);
  }

  /**
   * Register alert callback
   */
  public onAlert(callback: (event: AuditEvent, anomaly?: AnomalyDetectionResult) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Perform maintenance tasks (archiving, cleanup)
   */
  public async performMaintenance(): Promise<void> {
    await this.storageService.archive();
    await this.storageService.cleanup();
  }

  /**
   * Rotate encryption keys
   */
  public rotateEncryptionKey(): void {
    this.encryptionService.rotateKey();
  }

  private determineSeverity(eventType: AuditEventType): AuditSeverity {
    const criticalEvents = [
      AuditEventType.ACCOUNT_DELETED,
      AuditEventType.ACCOUNT_LOCKED,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.ROLE_CHANGED,
    ];

    const warningEvents = [
      AuditEventType.LOGIN_FAILURE,
      AuditEventType.ACCESS_DENIED,
      AuditEventType.MFA_CHALLENGE_FAILURE,
      AuditEventType.RATE_LIMIT_EXCEEDED,
      AuditEventType.PASSWORD_RESET_REQUESTED,
    ];

    if (criticalEvents.includes(eventType)) {
      return AuditSeverity.CRITICAL;
    } else if (warningEvents.includes(eventType)) {
      return AuditSeverity.WARNING;
    }

    return AuditSeverity.INFO;
  }

  private getDefaultMessage(eventType: AuditEventType): string {
    const messages: Record<AuditEventType, string> = {
      [AuditEventType.LOGIN_SUCCESS]: 'User logged in successfully',
      [AuditEventType.LOGIN_FAILURE]: 'Failed login attempt',
      [AuditEventType.LOGOUT]: 'User logged out',
      [AuditEventType.SESSION_CREATED]: 'Session created',
      [AuditEventType.SESSION_EXPIRED]: 'Session expired',
      [AuditEventType.SESSION_REVOKED]: 'Session revoked',
      [AuditEventType.PERMISSION_GRANTED]: 'Permission granted',
      [AuditEventType.PERMISSION_REVOKED]: 'Permission revoked',
      [AuditEventType.ROLE_CHANGED]: 'User role changed',
      [AuditEventType.ACCESS_DENIED]: 'Access denied',
      [AuditEventType.ACCOUNT_CREATED]: 'Account created',
      [AuditEventType.ACCOUNT_DELETED]: 'Account deleted',
      [AuditEventType.ACCOUNT_LOCKED]: 'Account locked',
      [AuditEventType.ACCOUNT_UNLOCKED]: 'Account unlocked',
      [AuditEventType.PASSWORD_CHANGED]: 'Password changed',
      [AuditEventType.PASSWORD_RESET_REQUESTED]: 'Password reset requested',
      [AuditEventType.PASSWORD_RESET_COMPLETED]: 'Password reset completed',
      [AuditEventType.MFA_ENABLED]: 'MFA enabled',
      [AuditEventType.MFA_DISABLED]: 'MFA disabled',
      [AuditEventType.MFA_CHALLENGE_SUCCESS]: 'MFA challenge succeeded',
      [AuditEventType.MFA_CHALLENGE_FAILURE]: 'MFA challenge failed',
      [AuditEventType.SUSPICIOUS_ACTIVITY]: 'Suspicious activity detected',
      [AuditEventType.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
      [AuditEventType.TOKEN_ISSUED]: 'Token issued',
      [AuditEventType.TOKEN_REFRESHED]: 'Token refreshed',
      [AuditEventType.TOKEN_REVOKED]: 'Token revoked',
      [AuditEventType.TOKEN_EXPIRED]: 'Token expired',
    };

    return messages[eventType] || 'Audit event logged';
  }

  private triggerAlerts(event: AuditEvent, anomaly?: AnomalyDetectionResult): void {
    const shouldAlert =
      (event.severity === AuditSeverity.CRITICAL && this.config.alerting.criticalEventNotification) ||
      (anomaly?.isAnomalous && this.config.alerting.anomalyNotification);

    if (shouldAlert) {
      this.alertCallbacks.forEach(callback => callback(event, anomaly));
    }
  }

  private consoleLog(event: AuditEvent, anomaly?: AnomalyDetectionResult): void {
    const logLevel = event.severity === AuditSeverity.CRITICAL ? 'error' :
                     event.severity === AuditSeverity.WARNING ? 'warn' : 'info';

    const logData = {
      timestamp: event.timestamp.toISOString(),
      eventType: event.eventType,
      severity: event.severity,
      userId: event.userId,
      username: event.username,
      message: event.message,
      success: event.success,
      anomaly: anomaly?.isAnomalous ? {
        riskScore: anomaly.riskScore,
        reasons: anomaly.reasons,
      } : undefined,
    };

    console[logLevel]('[AUDIT]', JSON.stringify(logData, null, 2));
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

let auditLoggerInstance: AuditLogger | null = null;

export function getAuditLogger(config?: Partial<AuditConfig>): AuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger(config);
  }
  return auditLoggerInstance;
}

export function resetAuditLogger(): void {
  auditLoggerInstance = null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract metadata from HTTP request
 */
export function extractMetadataFromRequest(request: any): AuditEventMetadata {
  return {
    ipAddress: request.ip || request.connection?.remoteAddress,
    userAgent: request.headers?.['user-agent'],
    sessionId: request.sessionID || request.session?.id,
    requestId: request.id || request.headers?.['x-request-id'],
    device: {
      type: detectDeviceType(request.headers?.['user-agent']),
      os: detectOS(request.headers?.['user-agent']),
      browser: detectBrowser(request.headers?.['user-agent']),
    },
  };
}

function detectDeviceType(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function detectOS(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/ios/i.test(userAgent)) return 'iOS';
  return 'unknown';
}

function detectBrowser(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  return 'unknown';
}

/**
 * Export audit logs to various formats
 */
export async function exportAuditLogs(
  logs: AuditEvent[],
  format: 'json' | 'csv' | 'pdf'
): Promise<string | Buffer> {
  switch (format) {
    case 'json':
      return JSON.stringify(logs, null, 2);

    case 'csv':
      return convertToCSV(logs);

    case 'pdf':
      // In production, use a PDF generation library
      throw new Error('PDF export not implemented');

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function convertToCSV(logs: AuditEvent[]): string {
  if (logs.length === 0) return '';

  const headers = [
    'ID',
    'Timestamp',
    'Event Type',
    'Severity',
    'User ID',
    'Username',
    'Success',
    'Message',
    'IP Address',
  ];

  const rows = logs.map(log => [
    log.id,
    log.timestamp.toISOString(),
    log.eventType,
    log.severity,
    log.userId || '',
    log.username || '',
    log.success.toString(),
    log.message,
    log.metadata.ipAddress || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}
