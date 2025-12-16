/**
 * Core base interfaces and types for all RavenDB documents
 * These are the foundational types that all other documents extend
 */

/**
 * Base interface for all RavenDB documents
 * RavenDB automatically handles these fields but we define them for TypeScript
 */
export interface RavenDocument {
  id: string;           // RavenDB document ID (e.g., "tenants/123-A")
  etag?: string;        // Entity tag for optimistic concurrency
  changeVector?: string; // For change tracking
}

/**
 * Base interface for tenant-scoped documents
 * Most documents belong to a specific tenant
 */
export interface TenantScopedDocument extends RavenDocument {
  tenantId: string;     // Which tenant owns this document
}

/**
 * Base interface for company-scoped documents
 * Documents that belong to a specific company within a tenant
 */
export interface CompanyScopedDocument extends TenantScopedDocument {
  companyId: string;    // Which company within tenant owns this document
}

/**
 * Base interface for auditable entities
 * Tracks creation and modification history
 */
export interface AuditableDocument {
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
  createdBy: string;    // User ID who created the document
}

/**
 * Base interface for documents with activity tracking
 */
export interface ActivityTracking {
  lastActiveAt?: string;    // Last activity timestamp
}

/**
 * Base interface for documents with soft delete support
 */
export interface SoftDelete {
  isDeleted?: boolean;      // Soft delete flag
  deletedAt?: string;       // When deleted (if soft deleted)
  deletedBy?: string;       // Who deleted it
}

/**
 * Base interface for versioned documents
 */
export interface VersionedDocument {
  version: number;          // Document version
  isActive: boolean;        // Whether this version is active
}

/**
 * Base interface for Stack Auth integrated documents
 * Documents that are synchronized with Stack Auth
 */
export interface StackAuthIntegratedDocument {
  /** Stack Auth user ID if applicable */
  stackAuthUserId?: string;

  /** Stack Auth team ID if applicable */
  stackAuthTeamId?: string;

  /** Last synchronization timestamp */
  stackAuthLastSyncAt?: string;

  /** Synchronization status */
  stackAuthSyncStatus?: 'active' | 'pending' | 'error';

  /** Metadata from Stack Auth */
  stackAuthMetadata?: Record<string, any>;
}

/**
 * Base interface for Stripe integrated documents
 * Documents that are linked to Stripe billing/account data
 */
export interface StripeIntegratedDocument {
  /** Stripe customer ID if applicable */
  stripeCustomerId?: string;

  /** Stripe account ID for connected accounts */
  stripeAccountId?: string;

  /** Stripe subscription ID if applicable */
  stripeSubscriptionId?: string;

  /** Stripe product ID if applicable */
  stripeProductId?: string;

  /** Stripe price ID if applicable */
  stripePriceId?: string;

  /** Last webhook event processed */
  lastWebhookEvent?: string;

  /** Last webhook processed timestamp */
  lastWebhookAt?: string;

  /** Metadata stored in Stripe */
  stripeMetadata?: Record<string, string>;
}

/**
 * Base interface for multi-tenant billing documents
 * Documents that track billing at both tenant and company level
 */
export interface MultiTenantBillingDocument {
  /** Tenant-level billing account ID */
  tenantBillingAccountId?: string;

  /** Company-specific billing account ID if separate */
  companyBillingAccountId?: string;

  /** Billing allocation percentage */
  billingAllocation?: number;

  /** Cost center for billing allocation */
  costCenterId?: string;

  /** Billing tags for allocation */
  billingTags?: string[];
}