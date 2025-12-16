import { RavenDocument, TenantScopedDocument, AuditableDocument } from '../core';

/**
 * Stack Auth Team Metadata stored in RavenDB
 * This document stores Stack Auth team information and links to Ohriv tenants
 */
export interface StackAuthTeamDocument extends
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument {
  collection: 'stack-auth-teams';

  /** Stack Auth team identifier */
  stackAuthTeamId: string;

  /** Team display name */
  displayName: string;

  /** Team slug (URL-friendly identifier) */
  teamSlug: string;

  /** Associated Ohriv tenant ID */
  ohrivTenantId: string;

  /** Team type */
  teamType: 'tenant' | 'company';

  /** For company teams, the parent tenant ID */
  parentTenantId?: string;

  /** For company teams, the company ID */
  companyId?: string;

  /** Team metadata from Stack Auth (serverMetadata) */
  serverMetadata?: {
    tenantMode?: 'staffing_agency' | 'single_company';
    maxCompanies?: number;
    allowCrossCompanyAccess?: boolean;
    defaultPermissions?: string[];
    settings?: {
      features?: string[];
      limits?: {
        users?: number;
        companies?: number;
        storage?: number;
      };
    };
  };

  /** Team metadata from Stack Auth (clientReadOnlyMetadata) */
  clientMetadata?: {
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
    settings?: {
      allowPublicProfiles?: boolean;
      allowInvites?: boolean;
      requireApproval?: boolean;
    };
  };

  /** Team members count */
  memberCount?: number;

  /** Active status */
  isActive: boolean;

  /** Created by user ID */
  createdById?: string;

  /** Team configuration */
  configuration?: {
    sso?: {
      enabled: boolean;
      providers?: string[];
      defaultRole?: string;
    };
    security?: {
      requireTwoFactor?: boolean;
      passwordPolicy?: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSymbols?: boolean;
      };
    };
    features?: {
      customRoles?: boolean;
      apiAccess?: boolean;
      auditLogs?: boolean;
    };
  };

  /** Usage statistics */
  usage?: {
    lastActive?: string;
    apiCalls?: number;
    storageUsed?: number;
  };
}