/**
 * User and membership models for tenant management
 */

import {
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument,
  ActivityTracking
} from '../core/base';
import { UserStatus, TenantRole, Theme, TimeFormat } from '../enums/user';
import { Address, ContactInfo } from '../core/common';

/**
 * User Document - User account information
 * Stored in the tenant's database for tenant-specific user data
 * and in a central database for authentication
 */
export interface UserDocument extends RavenDocument, AuditableDocument, ActivityTracking {
  collection: "users";

  // Core user information
  userId: string;           // Unique user identifier
  email: string;             // Email (unique within tenant)
  name: string;              // Full name
  firstName?: string;       // Extracted from name
  lastName?: string;        // Extracted from name

  // Authentication
  status: UserStatus;
  lastLoginAt?: string;      // Last login timestamp
  passwordHash?: string;    // Hashed password
  mfaSecret?: string;        // Multi-factor auth secret

  // Tenant relationships
  primaryTenantId: string;   // Primary tenant this user belongs to
  memberships: UserMembership[]; // All tenant memberships

  // Profile information
  profile: {
    avatarUrl?: string;
    bio?: string;
    timezone?: string;
    language?: string;
    phone?: string;
    location?: Address;
  };

  // Permissions and roles
  permissions: string[];    // Specific permissions (for fine-grained access)
  defaultRole: TenantRole;

  // Preferences
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: Theme;
    dateFormat: string;
    timeFormat: TimeFormat;
  };

  // Activity tracking
  loginHistory: {
    timestamp: string;
    ip: string;
    userAgent?: string;
    location?: string;
  }[];

  // Audit trail
  auditLog: {
    action: string;
    timestamp: string;
    userId: string;
    details?: Record<string, any>;
  }[];
}

/**
 * User Membership - Links users to tenants with specific roles
 */
export interface UserMembership {
  tenantId: string;
  userId: string;
  role: TenantRole;
  scopes: string[];          // Additional permissions/overrides
  invitedBy: string;         // Who invited this user
  invitedAt: string;         // When invitation was sent
  acceptedAt?: string;       // When invitation was accepted
  isActive: boolean;         // Whether this membership is active
  expiresAt?: string;        // Membership expiration (for contractors)
}