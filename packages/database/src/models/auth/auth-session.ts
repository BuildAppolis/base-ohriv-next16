import { RavenDocument, TenantScopedDocument } from '../core';

/**
 * Authentication Session Document
 * Tracks active authentication sessions for security and audit purposes
 */
export interface AuthSessionDocument extends
  RavenDocument,
  TenantScopedDocument {
  collection: 'auth-sessions';

  /** Session token identifier */
  sessionId: string;

  /** Associated user ID */
  userId: string;

  /** Stack Auth user ID */
  stackAuthUserId: string;

  /** Stack Auth team ID */
  stackAuthTeamId: string;

  /** Tenant ID for the session */
  tenantId: string;

  /** Company ID if session is company-scoped */
  companyId?: string;

  /** Session token (JWT or reference) */
  token: string;

  /** Refresh token if applicable */
  refreshToken?: string;

  /** Session expiration time */
  expiresAt: string;

  /** Device information */
  device?: {
    userAgent: string;
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os?: string;
    browser?: string;
    browserVersion?: string;
    trusted?: boolean;
  };

  /** Location information */
  location?: {
    ipAddress: string;
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };

  /** Authentication method used */
  authMethod: 'email' | 'oauth' | 'sso' | 'passkey' | 'impersonation';

  /** OAuth provider if applicable */
  authProvider?: string;

  /** Session status */
  status: 'active' | 'expired' | 'revoked' | 'suspicious';

  /** Session creation time */
  createdAt: string;

  /** Last activity timestamp */
  lastActivityAt: string;

  /** Number of times the session was used */
  usageCount: number;

  /** Security flags */
  security?: {
    requiresMfa?: boolean;
    mfaVerified?: boolean;
    riskScore?: number;
    anomalies?: Array<{
      type: string;
      detectedAt: string;
      description: string;
    }>;
  };

  /** Session metadata */
  metadata?: {
    source: 'web' | 'mobile' | 'api' | 'cli';
    version?: string;
    platform?: string;
    initialUrl?: string;
  };

  /** Revocation information if revoked */
  revokedAt?: string;

  /** Revoked by user ID */
  revokedBy?: string;

  /** Revocation reason */
  revocationReason?: string;
}