# 🚀 Ohriv Backend Architecture Schema
## Stack Auth × RavenDB × Stripe × Motia Integration

---

## 📋 **Table of Contents**

1. [Architecture Overview](#1-architecture-overview)
2. [Core Database Models](#2-core-database-models)
3. [Stack Auth Integration](#3-stack-auth-integration)
4. [Stripe Billing Integration](#4-stripe-billing-integration)
5. [Motia Backend Services](#5-motia-backend-services)
6. [API Endpoint Structure](#6-api-endpoint-structure)
7. [Key Workflows](#7-key-workflows)
8. [RavenDB Indexes](#8-ravendb-indexes)
9. [Validation Rules](#9-validation-rules)

---

## 1. Architecture Overview

### **System Components**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Stack Auth    │    │     Stripe      │
│   (Next.js)     │◄──►│   (Identity)    │◄──►│   (Payments)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ohriv API      │    │   RavenDB       │    │   Motia Flow    │
│   (Authorization)│◄──►│   (Database)    │◄──►│   (Orchestration)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow Architecture**

1. **Authentication Flow**: Frontend → Stack Auth → JWT Token → Ohriv API
2. **Authorization Flow**: API → Stack Auth Metadata → Permission Resolution → RavenDB
3. **Billing Flow**: Stripe Events → Webhooks → RavenDB → Subscription Updates
4. **Background Jobs**: Motia Workflows → Queue Processing → Database Updates

---

## 2. Core Database Models

### **Base Interfaces (Following Existing Patterns)**

```typescript
// Base interfaces from packages/database/src/models/core/base.ts
interface RavenDocument {
  id: string;           // "users/abc-123"
  etag?: string;
  changeVector?: string;
}

interface TenantScopedDocument extends RavenDocument {
  tenantId: string;
}

interface CompanyScopedDocument extends TenantScopedDocument {
  companyId: string;
}

interface AuditableDocument {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### **User Document (Enhanced for Stack Auth)**

```typescript
/**
 * User Document - Stores user profile and role information
 * Stack Auth handles authentication, this handles authorization data
 */
interface UserDocument extends RavenDocument, AuditableDocument {
  collection: "users";

  // Primary identifiers
  userId: string;              // Unique user identifier
  email: string;               // Primary email
  name: string;                // Full name

  // Stack Auth integration
  stackAuthUserId: string;     // "user_auth_abc123"
  stackAuthTeamId: string;     // "team_andela_xyz789"

  // System-level role (if any)
  systemRole?: SystemRole;     // Platform-wide permissions

  // Tenant membership (primary tenant)
  primaryTenantId: string;

  // Company assignments with roles
  companyAssignments: CompanyAssignment[];

  // Permission management
  permissionOverrides: PermissionOverride[];

  // User preferences
  preferences: {
    defaultCompanyId?: string;
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    timezone: string;
  };

  // Activity tracking
  lastLoginAt?: string;
  lastActiveAt?: string;

  // Status
  status: UserStatus;

  // Profile completion
  profileCompletion: {
    percentage: number;
    missingFields: string[];
  };
}

interface CompanyAssignment {
  companyId: string;           // "companies/microsoft-redmond"
  companyName: string;         // "Microsoft - Redmond"
  role: CompanyRole;           // "company:admin" | "company:member" etc.
  permissions?: string[];      // Additional custom permissions
  assignedAt: string;          // ISO timestamp
  assignedBy: string;          // User ID who assigned
  isActive: boolean;           // Whether this assignment is active
}

interface PermissionOverride {
  permission: string;          // "candidate.delete:all"
  granted: boolean;            // true = grant, false = deny
  scope?: string;              // Company ID or other scope
  reason?: string;             // Audit reason
  grantedBy: string;           // User ID who granted
  grantedAt: string;           // ISO timestamp
  expiresAt?: string;          // Temporary permissions
}
```

### **Tenant Document (Enhanced for Stack Auth)**

```typescript
/**
 * Tenant Document - Organization-level configuration
 * Maps 1:1 with Stack Auth Teams
 */
interface TenantDocument extends RavenDocument, AuditableDocument {
  collection: "tenants";

  // Core information
  tenantId: string;            // "tenant-andela"
  name: string;                // "Andela Talent Solutions"
  mode: TenantMode;            // "staffing_agency" | "single_company"

  // Stack Auth integration
  stackAuthTeamId: string;     // "team_andela_xyz789"

  // Owner information
  ownerUserId: string;
  ownerEmail: string;
  ownerName: string;

  // Limits and quotas
  limits: {
    maxCompanies: number;
    maxUsers: number;
    storageGB: number;
    evaluationsPerMonth: number;
  };

  // Billing configuration
  billing: {
    customerId?: string;       // Stripe customer ID
    subscriptionId?: string;   // Stripe subscription ID
    planId: string;            // Current plan
    status: "active" | "trialing" | "past_due" | "canceled";
    nextBillingDate?: string;
    defaultPaymentMethod?: string;
  };

  // Feature flags
  features: {
    aiEvaluation: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customWorkflows: boolean;
    multiCompany: boolean;
    sso: boolean;
  };

  // Usage statistics
  usage: {
    companiesCount: number;
    usersCount: number;
    storageUsedGB: number;
    evaluationsThisMonth: number;
    lastCalculated: string;
  };

  // Branding
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    customDomain?: string;
  };

  // Status
  status: TenantStatus;
  trialEndsAt?: string;
}
```

### **Company Document (With Individual Billing)**

```typescript
/**
 * Company Document - Client company within a tenant
 * Each company can have its own billing configuration
 */
interface CompanyDocument extends CompanyScopedDocument, AuditableDocument {
  collection: "companies";

  // Core information
  companyId: string;           // "companies/microsoft-redmond"
  name: string;                // "Microsoft - Redmond"
  displayName?: string;        // Display name for UI

  // Company details
  industry?: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  website?: string;
  location: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    timezone: string;
  };

  // Team structure
  teamStructure: {
    recruiters: number;
    hiringManagers: number;
    interviewers: number;
    admins: number;
  };

  // Billing configuration (overrides tenant defaults)
  billing?: {
    useTenantBilling: boolean; // Default: true
    customerId?: string;       // Individual Stripe customer ID
    subscriptionId?: string;   // Individual subscription ID
    customPricing?: {
      perRecruiter: number;
      perHiringManager: number;
      evaluationCredits: number;
    };
    billingContact?: {
      name: string;
      email: string;
      department: string;
    };
  };

  // Company settings
  settings: {
    requireApproval: {
      jobCreation: boolean;
      candidateOffers: boolean;
      evaluationResults: boolean;
    };
    defaultWorkflows: {
      jobPipeline: string[];
      evaluationStages: string[];
    };
    notifications: {
      newApplications: boolean;
      interviewReminders: boolean;
      evaluationComplete: boolean;
    };
  };

  // Status
  status: "active" | "inactive" | "suspended";

  // Metrics
  metrics: {
    activeJobs: number;
    totalCandidates: number;
    averageTimeToHire: number;
    fillRate: number;
    lastUpdated: string;
  };
}
```

### **Billing Models**

```typescript
/**
 * Billing Customer Document - Maps to Stripe customers
 */
interface BillingCustomerDocument extends RavenDocument, AuditableDocument {
  collection: "billing-customers";

  // Customer identifier
  customerId: string;          // Internal customer ID
  stripeCustomerId: string;     // Stripe customer ID

  // Customer type
  customerType: "tenant" | "company";

  // Owner information
  ownerId: string;              // Tenant or Company ID

  // Payment methods
  paymentMethods: PaymentMethod[];

  // Billing preferences
  preferences: {
    billingEmail: string;
    invoiceDelivery: "email" | "portal" | "both";
    paymentTerms: number;       // Days (e.g., 30)
    autoPay: boolean;
  };

  // Status
  status: "active" | "delinquent" | "suspended";
}

/**
 * Subscription Document - Active subscriptions
 */
interface SubscriptionDocument extends RavenDocument, AuditableDocument {
  collection: "subscriptions";

  // Subscription identifiers
  subscriptionId: string;      // Internal ID
  stripeSubscriptionId: string; // Stripe subscription ID

  // Customer reference
  customerId: string;          // Internal customer ID

  // Subscription details
  plan: SubscriptionPlan;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";

  // Dates
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  canceledAt?: string;

  // Pricing
  pricing: {
    baseAmount: number;         // In cents
    currency: string;           // "usd"
    interval: "month" | "year";
    quantity?: number;          // For per-seat pricing
    amountOverage?: number;     // Usage-based overage
  };

  // Usage metrics (if applicable)
  usage?: {
    current: number;
    limit: number;
    unit: string;
  };

  // Add-ons
  addOns: SubscriptionAddOn[];
}

interface SubscriptionAddOn {
  addOnId: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Invoice Document - Invoice history
 */
interface InvoiceDocument extends RavenDocument, AuditableDocument {
  collection: "invoices";

  // Invoice identifiers
  invoiceId: string;           // Internal ID
  stripeInvoiceId?: string;     // Stripe invoice ID

  // Customer reference
  customerId: string;

  // Invoice details
  number: string;              // e.g., "INV-2024-001"
  status: "draft" | "open" | "paid" | "void" | "uncollectible";

  // Amounts
  subtotal: number;            // In cents
  tax: number;
  total: number;
  currency: string;

  // Dates
  issueDate: string;
  dueDate: string;
  paidAt?: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Payment details
  payment?: {
    method: string;
    transactionId?: string;
    processor: "stripe";
  };
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: {
    start: string;
    end: string;
  };
}
```

### **Queue Documents for Background Processing**

```typescript
/**
 * Team Creation Queue - Handle automatic team creation
 */
interface TeamCreationQueueDocument extends RavenDocument, AuditableDocument {
  collection: "team-creation-queue";

  // Job identifier
  jobId: string;

  // Request details
  request: {
    tenantId: string;
    teamName: string;
    requestedBy: string;
    requestedAt: string;
  };

  // Processing status
  status: "pending" | "processing" | "completed" | "failed";

  // Stack Auth team details
  stackAuthTeamId?: string;

  // Processing timestamps
  processedAt?: string;
  completedAt?: string;

  // Error handling
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  // Retry configuration
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
}
```

---

## 3. Stack Auth Integration

### **Team Metadata Structure**

```typescript
/**
 * Team Metadata - Stored in Stack Auth team.serverMetadata
 * Maps Stack Auth team to Ohriv tenant
 */
interface StackAuthTeamMetadata {
  // Tenant mapping
  ohrivTenantId: string;       // "tenant-andela"

  // Tenant configuration
  tenantMode: "staffing_agency" | "single_company";
  maxCompanies: number;

  // Default settings
  settings: {
    allowCrossCompanyAccess: boolean;
    defaultPermissions: string[];
    requireApproval: boolean;
  };

  // Synchronization
  lastSyncAt: string;
  syncVersion: number;
}

// Example usage:
await stackServerApp.updateTeam({
  teamId: "team_andela_xyz789",
  serverMetadata: {
    ohrivTenantId: "tenant-andela",
    tenantMode: "staffing_agency",
    maxCompanies: 25,
    settings: {
      allowCrossCompanyAccess: true,
      defaultPermissions: [
        "company.view:*",
        "job.view:*",
        "candidate.view:*"
      ],
      requireApproval: false
    },
    lastSyncAt: new Date().toISOString(),
    syncVersion: 1
  }
});
```

### **User Metadata Structure**

```typescript
/**
 * User Metadata - Stored in Stack Auth user.serverMetadata
 * Contains Ohriv-specific roles and permissions
 */
interface StackAuthUserMetadata {
  // System role (if applicable)
  ohrivSystemRole?: SystemRole;

  // Primary tenant role
  ohrivTenantRole?: TenantRole;

  // Company assignments (multi-company support)
  ohrivCompanyRoles: CompanyRoleAssignment[];

  // Permission overrides
  permissionOverrides: PermissionOverride[];

  // User preferences
  preferences: {
    defaultCompanyId?: string;
    emailNotifications: boolean;
    theme: "light" | "dark";
  };

  // Synchronization
  lastSyncAt: string;
  syncVersion: number;
}

// Example usage:
await stackServerApp.updateUser({
  userId: "user_sarah_chen",
  serverMetadata: {
    ohrivSystemRole: undefined,
    ohrivTenantRole: "tenant:admin",
    ohrivCompanyRoles: [
      {
        companyId: "companies/microsoft-redmond",
        role: "company:admin",
        assignedAt: new Date().toISOString()
      },
      {
        companyId: "companies/tesla-palo-alto",
        role: "company:admin",
        assignedAt: new Date().toISOString()
      }
    ],
    permissionOverrides: [],
    preferences: {
      defaultCompanyId: "companies/microsoft-redmond",
      emailNotifications: true,
      theme: "light"
    },
    lastSyncAt: new Date().toISOString(),
    syncVersion: 1
  }
});
```

### **Client Read-Only Metadata**

```typescript
/**
 * Client Metadata - Stored in user.clientReadOnlyMetadata
 * Computed by backend for UI consumption
 */
interface StackAuthClientMetadata {
  // Tenant information
  tenantId: string;
  tenantName: string;

  // Company access
  accessibleCompanies: CompanyAccess[];

  // Computed permissions (cached)
  permissions: string[];

  // UI preferences
  ui: {
    selectedCompanies: string[];
    defaultView: "unified" | "company";
    sidebarCollapsed?: boolean;
  };

  // Last updated
  lastComputed: string;
}

interface CompanyAccess {
  companyId: string;
  companyName: string;
  role: CompanyRole;
  permissions: string[];
}

// Update client metadata after permission changes
await stackServerApp.updateUser({
  userId: user.id,
  clientReadOnlyMetadata: {
    tenantId: "tenant-andela",
    tenantName: "Andela Talent Solutions",
    accessibleCompanies: [
      {
        companyId: "companies/microsoft-redmond",
        companyName: "Microsoft - Redmond",
        role: "company:admin",
        permissions: ["company.*:assigned", "job.*:assigned"]
      }
    ],
    permissions: [
      "tenant.companies.*",
      "company.manage:*",
      "job.create:*"
    ],
    ui: {
      selectedCompanies: ["companies/microsoft-redmond"],
      defaultView: "unified"
    },
    lastComputed: new Date().toISOString()
  }
});
```

---

## 4. Stripe Billing Integration

### **Plan Configuration**

```typescript
/**
 * Stripe Plan Definitions
 */
interface StripePlans {
  tenant: {
    starter: {
      name: "Starter";
      price: 29900; // $299.00 per month
      features: [
        "Up to 5 companies",
        "Up to 20 users",
        "100 evaluations/month",
        "Basic analytics"
      ];
      limits: {
        companies: 5;
        users: 20;
        evaluations: 100;
        storageGB: 10;
      };
    };
    professional: {
      name: "Professional";
      price: 99900; // $999.00 per month
      features: [
        "Up to 25 companies",
        "Up to 100 users",
        "1000 evaluations/month",
        "Advanced analytics",
        "AI evaluation",
        "API access"
      ];
      limits: {
        companies: 25;
        users: 100;
        evaluations: 1000;
        storageGB: 100;
      };
    };
    enterprise: {
      name: "Enterprise";
      price: 299900; // $2,999.00 per month
      features: [
        "Unlimited companies",
        "Unlimited users",
        "Unlimited evaluations",
        "All features",
        "Custom workflows",
        "Dedicated support",
        "SLA guarantee"
      ];
      limits: {
        companies: -1; // Unlimited
        users: -1;
        evaluations: -1;
        storageGB: 1000;
      };
    };
  };

  company: {
    perSeat: {
      name: "Per Seat";
      basePrice: 4900; // $49.00 per seat per month
      description: "Billed per active user";
      tiers: [
        { min: 1, max: 10, multiplier: 1.0 },
        { min: 11, max: 50, multiplier: 0.9 },
        { min: 51, max: Infinity, multiplier: 0.8 }
      ];
    };
    evaluationCredits: {
      name: "Evaluation Credits";
      price: 100; // $1.00 per credit
      description: "One-time purchase of evaluation credits";
      packages: [
        { credits: 100, price: 9000 },    // $90 for 100 credits
        { credits: 500, price: 40000 },   // $400 for 500 credits
        { credits: 1000, price: 75000 }   // $750 for 1000 credits
      ];
    };
  };
}
```

### **Webhook Event Handling**

```typescript
/**
 * Stripe Webhook Event Processor
 */
class StripeWebhookProcessor {
  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event);
        break;

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await this.handleInvoicePayment(event);
        break;

      case 'customer.created':
      case 'customer.updated':
        await this.handleCustomerChange(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleSubscriptionChange(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;

    // Update subscription document
    await this.updateSubscriptionDocument(subscription);

    // Update tenant/company status
    await this.updateBillingStatus(subscription);

    // Send notifications
    await this.sendSubscriptionNotification(event.type, subscription);
  }

  private async handleInvoicePayment(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;

    // Create/update invoice document
    await this.updateInvoiceDocument(invoice);

    // Update payment status
    if (event.type === 'invoice.payment_succeeded') {
      await this.updatePaymentStatus(invoice.customer as string, 'current');
    } else {
      await this.updatePaymentStatus(invoice.customer as string, 'past_due');
    }
  }
}
```

---

## 5. Motia Backend Services

### **Service Layer Architecture**

```typescript
/**
 * Motia Service Configuration
 */
interface MotiaServiceConfig {
  services: {
    // Core services
    authService: AuthService;
    permissionService: PermissionService;
    billingService: BillingService;

    // Domain services
    userService: UserService;
    tenantService: TenantService;
    companyService: CompanyService;
    jobService: JobService;
    candidateService: CandidateService;
    evaluationService: EvaluationService;

    // Integration services
    stackAuthService: StackAuthService;
    stripeService: StripeService;
    notificationService: NotificationService;
    analyticsService: AnalyticsService;
  };

  workflows: {
    userRegistration: UserRegistrationWorkflow;
    tenantCreation: TenantCreationWorkflow;
    companySetup: CompanySetupWorkflow;
    billingManagement: BillingManagementWorkflow;
    teamCreation: TeamCreationWorkflow;
  };

  queues: {
    emailQueue: Queue;
    analyticsQueue: Queue;
    billingQueue: Queue;
    teamCreationQueue: Queue;
  };
}

/**
 * Example Service Implementation
 */
class UserService {
  constructor(
    private db: DocumentStore,
    private stackAuth: StackAuthService,
    private queue: QueueService
  ) {}

  async createUser(data: CreateUserRequest): Promise<UserDocument> {
    // 1. Create user in Stack Auth
    const stackAuthUser = await this.stackAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name
    });

    // 2. Create user document in RavenDB
    const user: UserDocument = {
      id: `users/${generateId()}`,
      collection: "users",
      userId: generateId(),
      email: data.email,
      name: data.name,
      stackAuthUserId: stackAuthUser.id,
      stackAuthTeamId: data.teamId,
      primaryTenantId: data.tenantId,
      companyAssignments: [],
      permissionOverrides: [],
      preferences: {
        theme: "system",
        emailNotifications: true,
        timezone: "UTC"
      },
      status: UserStatus.Active,
      profileCompletion: {
        percentage: 25,
        missingFields: ["phone", "role", "bio"]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: stackAuthUser.id
    };

    await this.db.store(user);

    // 3. Update Stack Auth user metadata
    await this.stackAuth.updateUserMetadata(stackAuthUser.id, {
      ohrivTenantRole: data.tenantRole,
      ohrivCompanyRoles: data.companyRoles || [],
      lastSyncAt: new Date().toISOString(),
      syncVersion: 1
    });

    // 4. Queue welcome email
    await this.queue.add('emailQueue', {
      type: 'welcome',
      userId: user.userId,
      email: user.email
    });

    return user;
  }
}
```

### **Event-Driven Workflows**

```typescript
/**
 * User Registration Workflow
 */
class UserRegistrationWorkflow extends Workflow {
  definition = {
    id: 'user-registration',
    version: '1.0.0',
    description: 'Handles new user registration and onboarding',

    steps: [
      {
        id: 'validate-input',
        name: 'Validate Input',
        service: 'userService',
        method: 'validateRegistration'
      },
      {
        id: 'create-stackauth-user',
        name: 'Create Stack Auth User',
        service: 'stackAuthService',
        method: 'createUser',
        retryPolicy: {
          maxAttempts: 3,
          backoff: 'exponential'
        }
      },
      {
        id: 'create-db-user',
        name: 'Create Database User',
        service: 'userService',
        method: 'createUser'
      },
      {
        id: 'assign-roles',
        name: 'Assign Initial Roles',
        service: 'permissionService',
        method: 'assignInitialRoles'
      },
      {
        id: 'send-welcome',
        name: 'Send Welcome Email',
        service: 'notificationService',
        method: 'sendWelcomeEmail',
        async: true
      },
      {
        id: 'track-analytics',
        name: 'Track Registration Event',
        service: 'analyticsService',
        method: 'trackUserRegistration',
        async: true,
        continueOnError: true
      }
    ],

    errorHandling: {
      'create-stackauth-user': {
        strategy: 'rollback',
        cleanup: ['cleanup-partial-user']
      }
    }
  };
}
```

### **Background Job Processing**

```typescript
/**
 * Team Creation Queue Processor
 */
class TeamCreationProcessor {
  async process(job: Job): Promise<void> {
    const { tenantId, teamName, requestedBy } = job.data;

    try {
      // 1. Create team in Stack Auth
      const team = await this.stackAuth.createTeam({
        name: teamName,
        displayName: teamName
      });

      // 2. Update team metadata
      await this.stackAuth.updateTeam(team.id, {
        serverMetadata: {
          ohrivTenantId: tenantId,
          tenantMode: "single_company", // Default, can be updated
          maxCompanies: 5, // Default limit
          settings: {
            allowCrossCompanyAccess: false,
            defaultPermissions: [
              "company.view:assigned",
              "job.view:assigned",
              "candidate.view:assigned"
            ]
          }
        }
      });

      // 3. Update tenant document
      await this.tenantService.updateTenant(tenantId, {
        stackAuthTeamId: team.id
      });

      // 4. Update queue document
      await this.updateJobStatus(job.id, {
        status: 'completed',
        stackAuthTeamId: team.id,
        completedAt: new Date().toISOString()
      });

    } catch (error) {
      // Handle error and retry
      await this.handleTeamCreationError(job, error);
    }
  }
}
```

---

## 6. API Endpoint Structure

### **Authentication Endpoints**

```typescript
// Stack Auth handles these, but we need proxy endpoints for metadata
/api/auth/login       → Redirects to Stack Auth
/api/auth/logout      → Clears session, redirects to Stack Auth
/api/auth/callback    → Handles OAuth callback, sets session
/api/auth/metadata    → Updates user metadata (internal use)
```

### **User Management Endpoints**

```typescript
GET    /api/users                    // List users (with pagination, filters)
POST   /api/users                    // Create new user
GET    /api/users/:id                // Get user details
PUT    /api/users/:id                // Update user
DELETE /api/users/:id                // Delete user
POST   /api/users/:id/assign-role    // Assign role to user
DELETE /api/users/:id/remove-role    // Remove role from user
POST   /api/users/:id/permissions    // Add permission override
DELETE /api/users/:id/permissions    // Remove permission override
```

### **Tenant Management Endpoints**

```typescript
GET    /api/tenants                  // List tenants (admin only)
POST   /api/tenants                  // Create new tenant
GET    /api/tenants/:id              // Get tenant details
PUT    /api/tenants/:id              // Update tenant
DELETE /api/tenants/:id              // Delete tenant
POST   /api/tenants/:id/upgrade      // Upgrade tenant plan
GET    /api/tenants/:id/usage        // Get usage statistics
POST   /api/tenants/:id/invite        // Invite users to tenant
```

### **Company Management Endpoints**

```typescript
GET    /api/companies                // List companies (tenant-scoped)
POST   /api/companies                // Create new company
GET    /api/companies/:id            // Get company details
PUT    /api/companies/:id            // Update company
DELETE /api/companies/:id            // Delete company
POST   /api/companies/:id/billing    // Update billing configuration
GET    /api/companies/:id/metrics    // Get company metrics
POST   /api/companies/:id/invite      // Invite users to company
```

### **Billing Endpoints**

```typescript
GET    /api/billing/plans            // Get available plans
POST   /api/billing/subscribe        // Subscribe to plan
PUT    /api/billing/subscription     // Update subscription
DELETE /api/billing/subscription     // Cancel subscription
GET    /api/billing/invoices          // Get invoice history
POST   /api/billing/payment-method    // Add payment method
DELETE /api/billing/payment-method/:id // Remove payment method
GET    /api/billing/usage            // Get current usage
```

### **Webhook Endpoints**

```typescript
POST   /api/webhooks/stripe           // Stripe webhook handler
POST   /api/webhooks/stackauth        // Stack Auth webhook handler (if available)
```

### **Internal API Endpoints**

```typescript
POST   /api/internal/sync-metadata   // Sync metadata with Stack Auth
POST   /api/internal/queue/team-create // Queue team creation
GET    /api/internal/health           // Health check
```

---

## 7. Key Workflows

### **User Registration Flow**

```
1. User signs up → Frontend
2. Create account → Stack Auth
3. Create user document → RavenDB
4. Assign default role → Permission Service
5. Update Stack Auth metadata → Metadata Service
6. Send welcome email → Notification Service
7. Track analytics → Analytics Service
```

### **Tenant Creation Flow**

```
1. Admin initiates tenant creation → Frontend
2. Validate tenant data → API
3. Create tenant document → RavenDB
4. Create Stripe customer → Billing Service
5. Create Stack Auth team → Stack Auth Service
6. Update team metadata → Metadata Service
7. Setup default permissions → Permission Service
8. Send confirmation → Notification Service
```

### **Company Setup Flow**

```
1. User creates company → Frontend
2. Validate company data → API
3. Create company document → RavenDB
4. Setup billing (individual/tenant) → Billing Service
5. Assign user as company admin → Permission Service
6. Create default workflows → Workflow Service
7. Send welcome email → Notification Service
```

### **Automatic Team Creation Process**

```
Trigger: First company creation for tenant

1. Queue team creation job → TeamCreationQueue
2. Create team in Stack Auth → StackAuth Service
3. Update team metadata → Metadata Service
4. Link team to tenant → Tenant Service
5. Update company assignments → User Service
6. Notify completion → Notification Service
```

---

## 8. RavenDB Indexes

### **User Indexes**

```typescript
// Users_ByEmail
{
  name: "Users/ByEmail",
  maps: "from user in docs.Users select new { user.email, user.userId }",
  fields: [
    { name: "Email", indexing: "Exact" },
    { name: "UserId", indexing: "Exact" }
  ]
}

// Users_ByTenantAndRole
{
  name: "Users/TenantAndRole",
  maps: `
    from user in docs.Users
    select new {
      user.tenantId,
      user.stackAuthTeamId,
      Roles = user.companyAssignments.Select(x => x.role)
    }
  `
}

// Users_ByStackAuth
{
  name: "Users/ByStackAuth",
  maps: "from user in docs.Users select new { user.stackAuthUserId, user.stackAuthTeamId }",
  fields: [
    { name: "StackAuthUserId", indexing: "Exact" },
    { name: "StackAuthTeamId", indexing: "Exact" }
  ]
}
```

### **Company Indexes**

```typescript
// Companies_ByTenant
{
  name: "Companies/ByTenant",
  maps: "from company in docs.Companies select new { company.tenantId, company.companyId, company.status }",
  fields: [
    { name: "TenantId", indexing: "Exact" },
    { name: "Status", indexing: "Exact" }
  ]
}

// Companies_ByUserAccess
{
  name: "Companies/ByUserAccess",
  maps: `
    from company in docs.Companies
    let userAssignments = company.companyAssignments.Where(x => x.userId == $userId)
    where userAssignments.Any()
    select new {
      company.companyId,
      company.tenantId,
      Roles = userAssignments.Select(x => x.role)
    }
  `,
  additionalSources: [ { alias: "$userId", type: "string" } ]
}
```

### **Billing Indexes**

```typescript
// Billing_Customers_ByOwner
{
  name: "Billing/CustomersByOwner",
  maps: "from customer in docs.BillingCustomers select new { customer.ownerId, customer.customerType }",
  fields: [
    { name: "OwnerId", indexing: "Exact" },
    { name: "CustomerType", indexing: "Exact" }
  ]
}

// Subscriptions_Active
{
  name: "Subscriptions/Active",
  maps: `
    from subscription in docs.Subscriptions
    where subscription.status in ("active", "trialing")
    select new {
      subscription.customerId,
      subscription.plan,
      subscription.currentPeriodEnd
    }
  `,
  indexes: [
    {
      name: "CurrentPeriodEnd",
      type: "DateTime",
      options: { sort: "Descending" }
    }
  ]
}
```

---

## 9. Validation Rules

### **User Validation**

```typescript
const userValidationRules = {
  email: {
    required: true,
    format: "email",
    unique: true
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  tenantId: {
    required: true,
    exists: "tenants"
  },
  stackAuthUserId: {
    required: true,
    unique: true
  },
  companyAssignments: {
    type: "array",
    maxItems: 50,
    items: {
      companyId: { required: true, exists: "companies" },
      role: { required: true, enum: CompanyRole },
      assignedBy: { required: true, exists: "users" }
    }
  }
};
```

### **Tenant Validation**

```typescript
const tenantValidationRules = {
  tenantId: {
    required: true,
    format: "^[a-z0-9-]+$",
    minLength: 3,
    maxLength: 50,
    unique: true
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 200
  },
  mode: {
    required: true,
    enum: ["staffing_agency", "single_company"]
  },
  limits: {
    maxCompanies: { min: 1, max: 1000 },
    maxUsers: { min: 1, max: 10000 },
    storageGB: { min: 1, max: 10000 }
  },
  stackAuthTeamId: {
    required: true,
    unique: true
  }
};
```

### **Company Validation**

```typescript
const companyValidationRules = {
  companyId: {
    required: true,
    format: "^[a-z0-9-]+$",
    minLength: 3,
    maxLength: 100,
    unique: true
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 200
  },
  tenantId: {
    required: true,
    exists: "tenants"
  },
  size: {
    enum: ["startup", "small", "medium", "large", "enterprise"]
  },
  billing: {
    optional: true,
    object: {
      useTenantBilling: { type: "boolean" },
      customerId: { format: "cus_.*" },
      customPricing: {
        perRecruiter: { min: 0, max: 100000 },
        perHiringManager: { min: 0, max: 100000 }
      }
    }
  }
};
```

---

## Summary

This backend architecture provides:

1. **Seamless Stack Auth Integration**
   - Team-based tenant mapping
   - User role management through metadata
   - Automatic permission resolution

2. **Flexible Billing Model**
   - Tenant-level default billing
   - Company-level individual billing
   - Stripe integration with webhooks

3. **Scalable Architecture**
   - Event-driven workflows with Motia
   - Background job processing
   - Efficient RavenDB indexes

4. **Security & Compliance**
   - Role-based access control
   - Permission inheritance
   - Audit trails for all operations

5. **Developer Experience**
   - Clear service boundaries
   - Well-defined workflows
   - Comprehensive validation rules

The system is designed to handle complex multi-tenant scenarios, particularly staffing agencies that need to manage multiple client companies with shared team pools, while maintaining clear billing separation and granular permission control.