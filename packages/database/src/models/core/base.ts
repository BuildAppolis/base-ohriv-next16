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