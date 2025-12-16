import { RavenDocument, TenantScopedDocument, AuditableDocument } from '../core';

/**
 * Stack Auth User Metadata stored in RavenDB
 * This document stores Stack Auth user information and metadata
 */
export interface StackAuthUserDocument extends
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument {
  collection: 'stack-auth-users';

  /** Stack Auth user identifier */
  stackAuthUserId: string;

  /** Stack Auth team identifier */
  stackAuthTeamId: string;

  /** User email address */
  email: string;

  /** User display name */
  displayName?: string;

  /** Profile image URL */
  imageUrl?: string;

  /** User's primary tenant ID */
  primaryTenantId: string;

  /** System-wide role (platform_owner, super_admin, partner_manager, standard_user) */
  systemRole?: string;

  /** Active status in Stack Auth */
  isActive: boolean;

  /** Email verified status */
  emailVerified: boolean;

  /** Last authentication timestamp */
  lastAuthAt?: string;

  /** User metadata from Stack Auth (clientReadOnlyMetadata) */
  clientMetadata?: {
    preferences?: Record<string, any>;
    uiSettings?: {
      theme?: 'light' | 'dark' | 'system';
      language?: string;
      timezone?: string;
    };
    notifications?: {
      email?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
  };

  /** User metadata from Stack Auth (serverMetadata) */
  serverMetadata?: {
    roles?: string[];
    permissions?: string[];
    accessLevel?: string;
    department?: string;
    title?: string;
    managerId?: string;
    employeeId?: string;
  };

  /** Two-factor authentication status */
  twoFactorEnabled?: boolean;

  /** Authentication methods */
  authMethods?: Array<{
    type: 'email' | 'oauth' | 'sso' | 'passkey';
    provider?: string;
    isPrimary: boolean;
    createdAt: string;
  }>;

  /** Session information */
  activeSessions?: Array<{
    sessionId: string;
    device: string;
    browser?: string;
    location?: string;
    ipAddress: string;
    lastActive: string;
  }>;

  /** Linked company assignments */
  companyAssignments?: Array<{
    companyId: string;
    companyName: string;
    roles: string[];
    isDefault?: boolean;
    assignedAt: string;
  }>;
}