/**
 * Collection name constants for RavenDB
 * Centralizes all collection names to maintain consistency
 */

/**
 * Core system collections
 */
export const CORE_COLLECTIONS = {
  TENANTS: 'tenants',
  PARTNERS: 'partners',
  TENANT_CONFIGS: 'tenant-configs',
  SYSTEM_INDEXES: 'system-indexes',
} as const;

/**
 * Authentication and authorization collections
 */
export const AUTH_COLLECTIONS = {
  STACK_AUTH_USERS: 'stack-auth-users',
  STACK_AUTH_TEAMS: 'stack-auth-teams',
  AUTH_SESSIONS: 'auth-sessions',
} as const;

/**
 * Billing and subscription collections
 */
export const BILLING_COLLECTIONS = {
  BILLING_ACCOUNTS: 'billing-accounts',
  SUBSCRIPTIONS: 'subscriptions',
  INVOICES: 'invoices',
  PAYMENT_METHODS: 'payment-methods',
} as const;

/**
 * Multi-tenancy collections
 */
export const TENANT_COLLECTIONS = {
  MEMBERSHIPS: 'memberships',
  USAGE_LOGS: 'usage-logs',
  AUDIT_LOGS: 'audit-logs',
  NOTIFICATIONS: 'notifications',
} as const;

/**
 * Recruitment domain collections
 */
export const RECRUITMENT_COLLECTIONS = {
  COMPANIES: 'companies',
  JOBS: 'jobs',
  CANDIDATES: 'candidates',
  APPLICATIONS: 'applications',
  SOURCES: 'sources',
} as const;

/**
 * Evaluation domain collections
 */
export const EVALUATION_COLLECTIONS = {
  EVALUATION_GUIDELINES: 'evaluation-guidelines',
  EVALUATION_STAGES: 'evaluation-stages',
  SKILLS: 'skills',
  SCORECARDS: 'scorecards',
  ASSESSMENTS: 'assessments',
} as const;

/**
 * KSA (Knowledge, Skills, Abilities) collections
 */
export const KSA_COLLECTIONS = {
  KSA_GUIDELINES: 'ksa-guidelines',
  KSA_TYPES: 'ksa-types',
  KSA_EVALUATIONS: 'ksa-evaluations',
  COMPETENCIES: 'competencies',
} as const;

/**
 * Analytics and reporting collections
 */
export const ANALYTICS_COLLECTIONS = {
  REPORTS: 'reports',
  METRICS: 'metrics',
  TRENDS: 'trends',
  DASHBOARDS: 'dashboards',
  INSIGHTS: 'insights',
} as const;

/**
 * All collections combined
 */
export const ALL_COLLECTIONS = {
  ...CORE_COLLECTIONS,
  ...AUTH_COLLECTIONS,
  ...BILLING_COLLECTIONS,
  ...TENANT_COLLECTIONS,
  ...RECRUITMENT_COLLECTIONS,
  ...EVALUATION_COLLECTIONS,
  ...KSA_COLLECTIONS,
  ...ANALYTICS_COLLECTIONS,
} as const;

/**
 * Collection type definitions
 */
export type CollectionName = typeof ALL_COLLECTIONS[keyof typeof ALL_COLLECTIONS];

/**
 * Collection groups for easier access
 */
export const COLLECTION_GROUPS = {
  CORE: Object.values(CORE_COLLECTIONS),
  AUTH: Object.values(AUTH_COLLECTIONS),
  BILLING: Object.values(BILLING_COLLECTIONS),
  TENANT: Object.values(TENANT_COLLECTIONS),
  RECRUITMENT: Object.values(RECRUITMENT_COLLECTIONS),
  EVALUATION: Object.values(EVALUATION_COLLECTIONS),
  KSA: Object.values(KSA_COLLECTIONS),
  ANALYTICS: Object.values(ANALYTICS_COLLECTIONS),
} as const;

/**
 * Default TTL (time to live) settings for collections (in days)
 * Configure automatic document expiration
 */
export const COLLECTION_TTL = {
  [AUTH_COLLECTIONS.AUTH_SESSIONS]: 7,         // Sessions expire after 7 days
  [TENANT_COLLECTIONS.NOTIFICATIONS]: 30,       // Notifications expire after 30 days
  [ANALYTICS_COLLECTIONS.METRICS]: 365,         // Keep metrics for a year
  [ANALYTICS_COLLECTIONS.INSIGHTS]: 180,        // Keep insights for 6 months
} as const;

/**
 * Index requirements for collections
 * Which collections require indexes for optimal performance
 */
export const COLLECTION_INDEX_REQUIREMENTS = {
  [AUTH_COLLECTIONS.STACK_AUTH_USERS]: [
    'ByStackAuthId',
    'ByEmail',
    'ByTenantAndRole',
  ],
  [AUTH_COLLECTIONS.STACK_AUTH_TEAMS]: [
    'ByTenantId',
    'ByStackAuthId',
  ],
  [RECRUITMENT_COLLECTIONS.JOBS]: [
    'ByCompany',
    'ByStatus',
    'ByLocation',
  ],
  [RECRUITMENT_COLLECTIONS.CANDIDATES]: [
    'BySkills',
    'ByStatus',
    'ByLocation',
  ],
} as const;