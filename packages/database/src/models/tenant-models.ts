// RavenDB Document Models for Tenant Management
// These models define the structure of tenant-related documents

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
 * Tenant Document - Represents a single tenant organization
 * Each tenant gets their own isolated database, but we also store tenant metadata
 * in a central management database for multi-tenant operations.
 */
export interface TenantDocument extends RavenDocument {
  collection: "tenants";

  // Core tenant information
  tenantId: string;         // Unique tenant identifier
  name: string;             // Organization name
  plan: "free" | "standard" | "enterprise";
  status: "active" | "suspended" | "trial";

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
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
  createdBy: string;        // User ID who created tenant
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
    billingCycle: "monthly" | "yearly";
    nextBillingDate: string;
    paymentMethod: "card" | "invoice" | "po";
    subscriptionId?: string;
  };

  // Partner/reseller information
  partnerId?: string;       // If tenant is managed by a partner
  resellerId?: string;       // If tenant is using a reseller
  resellerCommission?: number; // Commission percentage
}

/**
 * User Document - User account information
 * Stored in the tenant's database for tenant-specific user data
 * and in a central database for authentication
 */
export interface UserDocument extends RavenDocument {
  collection: "users";

  // Core user information
  userId: string;           // Unique user identifier
  email: string;             // Email (unique within tenant)
  name: string;              // Full name
  firstName?: string;       // Extracted from name
  lastName?: string;        // Extracted from name

  // Authentication
  status: "active" | "invited" | "disabled" | "suspended";
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
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };

  // Permissions and roles
  permissions: string[];    // Specific permissions (for fine-grained access)
  defaultRole: "owner" | "admin" | "recruiter" | "interviewer" | "viewer";

  // Preferences
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: "light" | "dark" | "system";
    dateFormat: string;
    timeFormat: "12h" | "24h";
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastActiveAt?: string;

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
  role: "owner" | "admin" | "recruiter" | "interviewer" | "viewer" | "partner_manager";
  scopes: string[];          // Additional permissions/overrides
  invitedBy: string;         // Who invited this user
  invitedAt: string;         // When invitation was sent
  acceptedAt?: string;       // When invitation was accepted
  isActive: boolean;         // Whether this membership is active
  expiresAt?: string;        // Membership expiration (for contractors)
}

/**
 * Partner Document - Partner/reseller organization
 */
export interface PartnerDocument extends RavenDocument {
  collection: "partners";

  // Core partner information
  partnerId: string;
  name: string;
  status: "active" | "suspended" | "pending";

  // Tenant relationship
  ownTenantId: string;       // Partner's own tenant ID
  customerTenantIds: string[]; // Tenants managed by this partner

  // Business details
  businessType: "reseller" | "consultant" | "implementation_partner";
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

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;

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
export interface TenantConfigDocument extends RavenDocument {
  collection: "tenant-configs";

  tenantId: string;
  configType: "workflow" | "evaluation" | "ai" | "integration" | "system";

  // Configuration data (flexible structure based on configType)
  config: Record<string, any>;

  // Versioning
  version: number;
  isActive: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  updatedBy: string;

  // Change tracking
  changeHistory: {
    version: number;
    changedAt: string;
    changedBy: string;
    changes: Record<string, { old: any; new: any }>;
  }[];
}