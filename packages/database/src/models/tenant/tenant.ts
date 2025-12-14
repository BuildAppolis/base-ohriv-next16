/**
 * Tenant domain models
 * Contains Tenant, Partner, and related configuration documents
 */

import {
  RavenDocument,
  TenantScopedDocument,
  AuditableDocument,
  SoftDelete
} from '../core/base';
import {
  TenantPlan,
  TenantStatus,
  BillingCycle,
  PaymentMethod,
  PartnerBusinessType
} from '../enums/system';
import { UserRole } from '../enums/user';

/**
 * Tenant Document - Represents a single tenant organization
 * Each tenant gets their own isolated database, but we also store tenant metadata
 * in a central management database for multi-tenant operations.
 */
export interface TenantDocument extends RavenDocument, AuditableDocument {
  collection: "tenants";

  // Core tenant information
  tenantId: string;         // Unique tenant identifier
  name: string;             // Organization name
  plan: TenantPlan;
  status: TenantStatus;

  // Database information
  databaseName: string;     // The actual RavenDB database name (e.g., "tenant-123")
  databaseUrl?: string;     // Custom database URL for enterprise customers

  // Owner and administration
  ownerUserId: string;       // Primary tenant owner
  ownerEmail: string;       // Owner's email (for quick reference)
  ownerName: string;        // Owner's full name

  // Limits and settings
  companyLimit: number;     // Max number of companies allowed
  userLimit: number;        // Max number of users allowed
  storageLimitGB: number;   // Storage limit in GB

  // Configuration
  settings: {
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      customDomain?: string;
    };
    sso?: {
      enabled: boolean;
      provider?: "saml" | "oidc" | "azure-ad" | "google";
      config?: Record<string, any>;
    };
    security?: {
      requireMfa: boolean;
      sessionTimeoutMinutes: number;
      passwordPolicy: {
        minLength: number;
        requireSpecialChars: boolean;
        requireNumbers: boolean;
      };
    };
    features: {
      aiEvaluation: boolean;
      advancedAnalytics: boolean;
      customWorkflows: boolean;
      apiAccess: boolean;
    };
  };

  // Metadata
  lastLoginAt?: string;     // Last tenant activity
  trialEndsAt?: string;     // Trial expiration date

  // Usage statistics
  usageStats: {
    companiesCount: number;
    usersCount: number;
    storageUsedGB: number;
    evaluationsCount: number;
    lastCalculated: string;
  };

  // Billing and subscription
  billing?: {
    planPrice: number;
    billingCycle: BillingCycle;
    nextBillingDate: string;
    paymentMethod: PaymentMethod;
    subscriptionId?: string;
  };

  // Partner/reseller information
  partnerId?: string;       // If tenant is managed by a partner
  resellerId?: string;       // If tenant is using a reseller
  resellerCommission?: number; // Commission percentage
}

/**
 * Partner Document - Partner/reseller organization
 */
export interface PartnerDocument extends RavenDocument, AuditableDocument, SoftDelete {
  collection: "partners";

  // Core partner information
  partnerId: string;
  name: string;
  status: "active" | "suspended" | "pending";

  // Tenant relationship
  ownTenantId: string;       // Partner's own tenant ID
  customerTenantIds: string[]; // Tenants managed by this partner

  // Business details
  businessType: PartnerBusinessType;
  contactInfo: {
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };

  // Financial
  revSharePercent: number;   // Revenue share percentage
  commissionStructure: {
    signupBonus?: number;
    monthlyRecurring?: number;
    customRates?: Record<string, number>;
  };

  // Capabilities and certifications
  capabilities: string[];    // e.g., ["implementation", "training", "support"]
  certifications: string[];  // e.g., ["hipaa_compliant", "iso27001"]

  // Branding and customization
  branding?: {
    logoUrl?: string;
    customDomain?: string;
    whiteLabelOptions: string[];
  };

  // Performance tracking
  performanceMetrics: {
    customersCount: number;
    totalRevenue: number;
    satisfactionScore: number;
    lastUpdated: string;
  };
}

/**
 * Tenant Configuration Document - Stores tenant-specific configurations
 */
export interface TenantConfigDocument extends TenantScopedDocument, AuditableDocument {
  collection: "tenant-configs";

  configType: "workflow" | "evaluation" | "ai" | "integration" | "system";

  // Configuration data (flexible structure based on configType)
  config: Record<string, any>;

  // Versioning
  version: number;
  isActive: boolean;

  // Change tracking
  changeHistory: {
    version: number;
    changedAt: string;
    changedBy: string;
    changes: Record<string, { old: any; new: any }>;
  }[];
}